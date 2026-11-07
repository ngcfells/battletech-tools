// The mordel.net unit list: the shipped chunks (tools/mordel-sync/build-mordel-list.mjs), plus rows this device
// fetched since with the user's key, less units mordel.net no longer has.
import { fetchMordelListSince, IMordelCallOptions, TOP_UP_LIMIT } from "../utils/mordel/mordel-api";
import { getMordelServer } from "../utils/mordel/mordel-key";
import { IMordelListRow, mordelKeyOf } from "../utils/mordel/mordel-types";
import { untabulate } from "../utils/packed-json";

export const MORDEL_TOP_UP_STORAGE = "mordelListTopUp";
export const MORDEL_HIDDEN_STORAGE = "mordelHiddenUnits";
/** Rows a device keeps from its top-ups. */
export const TOP_UP_KEEP = 10000;
/** How often the panel tops the list up: once a day. */
export const TOP_UP_EVERY_MS = 24 * 60 * 60 * 1000;

interface ITopUp { since: number; rows: IMordelListRow[]; checked?: number }

type ChunkLoaders = Record<string, () => Promise<unknown>>;
// Shipped with mordel.net's agreement (2026-11-07). Each chunk loads only when the list is first searched.
const chunks = import.meta.glob("./mordel/mordel_*.json", { eager: false, import: "default" }) as ChunkLoaders;

/** False when this build has no shipped list: search then finds only units this device topped up. */
export const mordelListShipped = (): boolean => Object.keys(chunks).length > 0;

let shipped: Promise<IMordelListRow[]> | null = null;

const readStorage = <T>(key: string, fallback: T): T => {
    try {
        const text = localStorage.getItem(key);
        return text ? JSON.parse(text) as T : fallback;
    } catch {
        return fallback;
    }
};

const writeStorage = (key: string, value: unknown): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Full or blocked storage: the list still works from the shipped rows.
    }
};

const stampOf = (row: IMordelListRow): number => row.updated ?? row.created ?? 0;

function loadShipped(): Promise<IMordelListRow[]> {
    shipped ??= Promise.all(Object.values(chunks).map(async (load) => untabulate(await load()) as IMordelListRow[]))
        .then((lists) => lists.flat());
    return shipped;
}

const topUpOf = (): ITopUp | null => {
    const saved = readStorage<ITopUp | null>(MORDEL_TOP_UP_STORAGE, null);
    return saved && Array.isArray(saved.rows) && typeof saved.since === "number" ? saved : null;
};

const hiddenKeys = (): string[] => {
    const saved = readStorage<unknown>(MORDEL_HIDDEN_STORAGE, []);
    return Array.isArray(saved) ? saved.filter((key): key is string => typeof key === "string") : [];
};

/** A sandbox answer hides a unit only while the sandbox is chosen: its keys carry the server's name. */
const hiddenKeyOf = (key: string): string => (getMordelServer() === "sandbox" ? `sandbox:${key}` : key);

/** Rows by "type/id", the newest change winning. */
function merge(...lists: IMordelListRow[][]): Map<string, IMordelListRow> {
    const byKey = new Map<string, IMordelListRow>();
    for (const row of lists.flat()) {
        const key = mordelKeyOf(row);
        const previous = byKey.get(key);
        if (!previous || stampOf(row) >= stampOf(previous)) byKey.set(key, row);
    }
    return byKey;
}

/** The whole list, sorted by name. */
export async function loadMordelList(): Promise<IMordelListRow[]> {
    const byKey = merge(await loadShipped(), topUpOf()?.rows ?? []);
    const hidden = new Set(hiddenKeys());
    for (const key of [...byKey.keys()]) if (hidden.has(hiddenKeyOf(key))) byKey.delete(key);
    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Leaves a unit out of the list on this device: mordel.net answered that it is gone. */
export function hideMordelUnit(key: string): void {
    const keys = hiddenKeys();
    const stored = hiddenKeyOf(key);
    if (!keys.includes(stored)) writeStorage(MORDEL_HIDDEN_STORAGE, [...keys, stored]);
}

/** True when the last top-up was a day ago or more, or there was none. */
export function mordelTopUpDue(now: number = Date.now()): boolean {
    return now - (topUpOf()?.checked ?? 0) >= TOP_UP_EVERY_MS;
}

/**
 * Fetches the units changed since the shipped list (or the last top-up) and keeps them on this device. Returns how
 * many rows came back and whether there were more than one call fetches; the next top-up then goes on from the
 * newest row fetched (pages come oldest first).
 */
export async function topUpMordelList(options: IMordelCallOptions = {}, now: number = Date.now()): Promise<{ fetched: number; tooMany: boolean }> {
    const saved = topUpOf();
    const since = saved?.since ?? Math.max(0, ...(await loadShipped()).map(stampOf));
    const { rows, serverTime } = await fetchMordelListSince(since, options);
    const tooMany = rows.length >= TOP_UP_LIMIT;
    const kept = [...merge(saved?.rows ?? [], rows).values()].sort((a, b) => stampOf(b) - stampOf(a)).slice(0, TOP_UP_KEEP);
    const newest = Math.max(since, ...rows.map(stampOf));
    // Cut short: go on one second before the newest row fetched, so rows of that same second are not skipped
    // (unless that would not move on at all).
    const next = tooMany ? (newest - 1 > since ? newest - 1 : newest) : serverTime ?? newest;
    writeStorage(MORDEL_TOP_UP_STORAGE, { since: next, rows: kept, checked: now });
    return { fetched: rows.length, tooMany };
}

/** For tests: forget the shipped rows read so far. */
export function resetMordelListCache(): void {
    shipped = null;
}
