import { IEditionHistory } from "./data-interfaces";

/**
 * The unit types quirks are graded for: the six columns of Campaign Operations' quirk tables (CO p.228 on).
 * Their footnotes fold IndustrialMechs and OmniMechs into "mech", support vehicles into "vehicle", fixed-wing support
 * vehicles and airships into "fighter-small-craft", and satellites into "large-craft". ProtoMechs, infantry and
 * buildings have no column and take no quirks.
 */
export type QuirkUnitType = "mech" | "vehicle" | "battle-armor" | "fighter-small-craft" | "dropship" | "large-craft";

/** What a quirk is assigned to: the whole unit, one location, or one mounted weapon. */
export type QuirkAttach = "unit" | "location" | "weapon";

export interface IQuirkSource {
    book: string;
    page: number;
}

/**
 * A quirk's point cost, as printed. Exactly one of `points`, `choices` or `per`:
 *   - `points`: a fixed cost;
 *   - `choices`: the costs the player picks from (Rugged 1 or 2), or, for a quirk whose `parameter` lists options,
 *     the cost of each option in the same order (Improved Targeting by range band);
 *   - `per`: points per so much damage "or fraction thereof", of the weapon or of the unit's largest weapon.
 * `zeroDamagePoints` is the cost of a `per` quirk on a weapon that deals no damage.
 */
export interface IQuirkCost {
    points?: number;
    choices?: number[];
    per?: { points: number; damage: number; scope: "weapon" | "unit" };
    zeroDamagePoints?: number;
}

export interface IQuirk {
    tag: string;
    name: string;
    /** Other spellings used by the books, SSW and MegaMek; lookups match these too. */
    altNames: string[];
    kind: "positive" | "negative";
    cost: IQuirkCost;
    unitTypes: QuirkUnitType[];
    /** The footnote restrictions as printed (VTOL only, quads only...), shown to the player, not enforced. */
    restrictions?: string;
    attaches: QuirkAttach;
    parameter?: { kind: "range-band" | "value" | "locations"; options?: string[] };
    /** Tags of quirks a unit may not carry with this one. */
    excludes?: string[];
    /** One or two sentences in our own words; never the rulebook's text. */
    summary: string;
    sources: IQuirkSource[];
    editions: string[];
    editionLevels?: { [editionTag: string]: number };
    rulesLevel: number;
    apocryphalIn?: IEditionHistory["apocryphalIn"];
    custom?: true;
}

/** A quirk on a unit, as saved. */
export interface IAssignedQuirk {
    tag: string;
    parameter?: string | number;
    location?: string;
    equipmentUuid?: string;
    /** The years the assignment applies, inclusive; either end may be open. */
    fromYear?: number;
    toYear?: number;
}
