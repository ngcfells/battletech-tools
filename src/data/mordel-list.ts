// The mordel.net unit list: the shipped chunks (tools/mordel-sync/build-mordel-list.mjs), plus rows this device
// fetched since with the user's key, less units mordel.net no longer has.
import { fetchMordelListSince, IMordelCallOptions, TOP_UP_LIMIT } from "../utils/mordel/mordel-api";
import { IMordelListRow, mordelKeyOf } from "../utils/mordel/mordel-types";
import { untabulate } from "../utils/packed-json";

export const MORDEL_TOP_UP_STORAGE = "mordelListTopUp";
export const MORDEL_HIDDEN_STORAGE = "mordelHiddenUnits";

interface ITopUp { since: number; rows: IMordelListRow[] }

type ChunkLoaders = Record<string, () => Promise<unknown>>;
const chunks = import.meta.glob("./mordel/mordel_*.json", { eager: false, import: "default" }) as ChunkLoaders;

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
    for (const key of hiddenKeys()) byKey.delete(key);
    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Leaves a unit out of the list on this device: mordel.net answered that it is gone. */
export function hideMordelUnit(key: string): void {
    const keys = hiddenKeys();
    if (!keys.includes(key)) writeStorage(MORDEL_HIDDEN_STORAGE, [...keys, key]);
}

/**
 * Fetches the units changed since the shipped list (or the last top-up) and keeps them on this device. Returns how
 * many rows came back and whether there were more than one top-up keeps, in which case the app needs a newer list.
 */
export async function topUpMordelList(options: IMordelCallOptions = {}): Promise<{ fetched: number; tooMany: boolean }> {
    const saved = topUpOf();
    const since = saved?.since ?? Math.max(0, ...(await loadShipped()).map(stampOf));
    const { rows, serverTime } = await fetchMordelListSince(since, options);
    const tooMany = rows.length >= TOP_UP_LIMIT;
    const kept = [...merge(saved?.rows ?? [], rows).values()].sort((a, b) => stampOf(b) - stampOf(a)).slice(0, TOP_UP_LIMIT);
    // When the answer was cut short, keep the old starting point so the rows left out are asked for again.
    writeStorage(MORDEL_TOP_UP_STORAGE, { since: tooMany || serverTime == null ? since : serverTime, rows: kept });
    return { fetched: rows.length, tooMany };
}

/** For tests: forget the shipped rows read so far. */
export function resetMordelListCache(): void {
    shipped = null;
}
