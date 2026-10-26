import { BattleMech } from "../classes/battlemech";
import { generateUUID } from "./generateUUID";

// Bundled designs (#241): designs converted at build time from SSW (and later MegaMekLab) files, kept as small as
// they can be and imported only when one is opened. Each carries the few fields the lists and the Master Unit List
// search show, so nothing is imported to list them.

export type BundledDesignSource = "ssw" | "megamek" | "verified";

/** What the lists and the Master Unit List search show of a bundled design, so nothing is imported to list them. */
export interface IBundledDesignHeader {
    /** Place in the type's index; the design is in chunk floor(id / BUNDLED_CHUNK_SIZE). */
    id: number;
    /** Chassis and model, as the Master Unit List search matches them. */
    name: string;
    model: string;
    tons: number;
    bv: number;
    cost: number;
    /** SSW rules level (0 Introductory, 1 Standard, 2 Advanced, 3 Experimental, 4 Era Specific), for the rules filter. */
    rulesLevel: number;
    year: number;
    tech: string;
    /** Master Unit List id the design matched at build time, if any. */
    mulId?: number;
    /** Where the data comes from: a MegaMek design carries its credit until it is checked against its TRO. */
    source: BundledDesignSource;
    /** An OmniMech's configurations, each its own Master Unit List variant. */
    configs?: { name: string; bv: number }[];
}

export const BUNDLED_CHUNK_SIZE = 150;

// A UUID, alone or with a suffix such as a crit slot's ":7".
const UUID = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(:.*)?$/i;
const SHORT_ID = /^(#\d+)(:.*)?$/;
// Recomputed on import, or identity and timestamps a bundled copy should not carry.
const DERIVED = ["uuid", "lastUpdated", "battle_value", "c_bills", "as_value", "tech_label"];

const isEmpty = (value: unknown): boolean => value === false || value === "" || value === null
    || (Array.isArray(value) && value.length === 0)
    || (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0);

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Drops empty fields inside list entries and shortens UUIDs to "#n", the same id for the same UUID. */
function shrink(value: unknown, ids: Map<string, string>, inList: boolean): unknown {
    const uuid = typeof value === "string" ? UUID.exec(value) : null;
    if (uuid) {
        if (!ids.has(uuid[1])) ids.set(uuid[1], "#" + ids.size);
        return ids.get(uuid[1]) + (uuid[2] ?? "");
    }
    if (Array.isArray(value)) return value.map((item) => shrink(item, ids, true));
    if (value && typeof value === "object") {
        const out: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(value)) {
            if (inList && isEmpty(item)) continue;
            out[key] = shrink(item, ids, inList);
        }
        return out;
    }
    return value;
}

function grow(value: unknown, ids: Map<string, string>): unknown {
    const id = typeof value === "string" ? SHORT_ID.exec(value) : null;
    if (id) {
        if (!ids.has(id[1])) ids.set(id[1], generateUUID());
        return ids.get(id[1]) + (id[2] ?? "");
    }
    if (Array.isArray(value)) return value.map((item) => grow(item, ids));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, grow(item, ids)]));
    return value;
}

/**
 * A unit export reduced to what a fresh unit of the same type would not export anyway: top-level fields equal to
 * `blank`'s and the derived ones go, empty fields in list entries go, and UUIDs become short ids.
 */
export function compactDesign(design: Record<string, unknown>, blank: Record<string, unknown>): Record<string, unknown> {
    const kept = Object.fromEntries(Object.entries(design).filter(([key, value]) => !DERIVED.includes(key) && value !== undefined && !same(value, blank[key])));
    return shrink(kept, new Map(), false) as Record<string, unknown>;
}

/** The export compactDesign was made from, with fresh UUIDs, ready for the unit's importJSON. */
export function expandDesign(compact: Record<string, unknown>, blank: Record<string, unknown>): Record<string, unknown> {
    return { ...blank, ...(grow(compact, new Map()) as Record<string, unknown>) };
}

let blankMech: Record<string, unknown> | null = null;
const getBlankMech = () => blankMech ??= { ...(new BattleMech().export(true) as unknown as Record<string, unknown>) };

/**
 * A 'Mech's crit table entry for an installed item is rebuilt from the item, so only its place is kept; an item's
 * crit table location is dropped when it is the item's own, and a crit count when it matches the slots it fills.
 */
function thinMech(design: Record<string, unknown>): Record<string, unknown> {
    const equipment = ((design.equipment ?? []) as Record<string, unknown>[])
        .map((item) => item.allocationLocation === item.loc ? Object.fromEntries(Object.entries(item).filter(([key]) => key !== "allocationLocation")) : item);
    const installed = new Set(equipment.map((item) => item.uuid));
    const allocation = ((design.allocation ?? []) as Record<string, unknown>[])
        .map((slot) => installed.has(slot.uuid) ? Object.fromEntries(Object.entries(slot)
            .filter(([key]) => ["uuid", "loc", "slot", "rear", "size", "crits"].includes(key) && !(key === "crits" && slot.crits === slot.size))) : slot);
    return { ...design, equipment, allocation };
}

function thickenMech(design: Record<string, unknown>): Record<string, unknown> {
    const equipment = ((design.equipment ?? []) as Record<string, unknown>[]).map((item): Record<string, unknown> => ({ allocationLocation: item.loc, ...item }));
    const installed = new Set(equipment.map((item) => item.uuid));
    const allocation = ((design.allocation ?? []) as Record<string, unknown>[])
        .map((slot) => installed.has(slot.uuid) && slot.size !== undefined ? { crits: slot.size, ...slot } : slot);
    return { ...design, equipment, allocation };
}

export const compactMech = (mech: BattleMech): Record<string, unknown> =>
    compactDesign(thinMech(mech.export(true) as unknown as Record<string, unknown>), getBlankMech());

export const loadBundledMech = (design: Record<string, unknown>): BattleMech =>
    new BattleMech(JSON.stringify(thickenMech(expandDesign(design, getBlankMech()))));

/** A unit class the bundled designs of another type are made of: a JSON constructor and a play-free export. */
export interface IBundledUnitClass<T> {
    new (json?: string): T;
}

const blanks = new Map<unknown, Record<string, unknown>>();
const getBlank = <T extends { export(noInPlayVariables?: boolean): object }>(Unit: IBundledUnitClass<T>): Record<string, unknown> => {
    if (!blanks.has(Unit)) blanks.set(Unit, { ...(new Unit().export(true) as Record<string, unknown>) });
    return blanks.get(Unit)!;
};

export const compactUnit = <T extends { export(noInPlayVariables?: boolean): object }>(unit: T, Unit: IBundledUnitClass<T>): Record<string, unknown> =>
    compactDesign(unit.export(true) as Record<string, unknown>, getBlank(Unit));

export const loadBundledUnit = <T extends { export(noInPlayVariables?: boolean): object }>(design: Record<string, unknown>, Unit: IBundledUnitClass<T>): T =>
    new Unit(JSON.stringify(expandDesign(design, getBlank(Unit))));
