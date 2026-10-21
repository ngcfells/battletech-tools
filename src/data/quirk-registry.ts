import { IAssignedQuirk, IQuirk, QuirkAttach, QuirkUnitType } from "./quirk-interfaces";
import { quirks } from "./quirks";
import { customQuirks } from "./quirks-custom";
import { getRecordOfferIssue } from "./rules-editions";
import { CUSTOM_HOMEBREW_RULES_LEVEL } from "./rules-level-options";

let localCustomQuirks: IQuirk[] = [];

/** Replaces this browser's custom quirk drafts (custom-content-local.ts). */
export function setLocalCustomQuirks(drafts: IQuirk[]): void {
    localCustomQuirks = [...drafts];
}

/** Every quirk: the official records, then the shared custom ones, then this browser's drafts. */
export function getQuirks(): IQuirk[] {
    return [...quirks, ...customQuirks, ...localCustomQuirks];
}

const key = (value: string): string => value.trim().toLowerCase();

/** The quirk answering to `tag`, by tag first, then by name or an alternate name, ignoring case. */
export function getQuirk(tag: string): IQuirk | undefined {
    const all = getQuirks();
    const wanted = key(tag);
    return all.find((quirk) => key(quirk.tag) === wanted)
        ?? all.find((quirk) => key(quirk.name) === wanted || quirk.altNames.some((name) => key(name) === wanted));
}

/** Why a quirk is not offered for this unit type, edition and rules level, or null when it is. */
export function getQuirkOfferIssue(
    quirk: IQuirk,
    unitType: QuirkUnitType,
    editionTag: string,
    rulesLevel: number,
): "unit-type" | "edition" | "level" | null {
    if (!quirk.unitTypes.includes(unitType)) {
        return "unit-type";
    }
    // Custom quirks, like custom equipment, are offered in every edition from the custom level up.
    const level = quirk.custom ? Math.max(quirk.rulesLevel, CUSTOM_HOMEBREW_RULES_LEVEL) : quirk.rulesLevel;
    if (level >= CUSTOM_HOMEBREW_RULES_LEVEL) {
        return level > rulesLevel ? "level" : null;
    }
    return getRecordOfferIssue({ ...quirk, rulesLevel: level }, editionTag, rulesLevel);
}

/** What an assigned quirk is attached to. */
export function getAssignedAttach(assigned: IAssignedQuirk): QuirkAttach {
    return assigned.equipmentUuid ? "weapon" : assigned.location ? "location" : "unit";
}

/**
 * The points an assigned quirk is worth: positive for a positive quirk, negative for a negative one. `maxDamage` is
 * the weapon's maximum damage for a weapon-scope `per` cost, or the maximum damage of all the unit's non-physical
 * weapons for a unit-scope one (CO p.225, p.230).
 */
export function getQuirkPoints(quirk: IQuirk, assigned: IAssignedQuirk, maxDamage: number): number {
    const sign = quirk.kind === "negative" ? -1 : 1;
    const { cost } = quirk;
    let points = 0;
    if (cost.per) {
        points = maxDamage <= 0 && cost.zeroDamagePoints !== undefined
            ? cost.zeroDamagePoints
            : Math.ceil(Math.max(maxDamage, 0) / cost.per.damage) * cost.per.points;
    } else if (cost.byAttach) {
        points = cost.byAttach[getAssignedAttach(assigned)] ?? 0;
    } else if (cost.fromParameter) {
        const value = Number(assigned.parameter);
        points = Number.isFinite(value) && value > 0 ? value : 0;
    } else if (cost.choices) {
        const options = quirk.parameter?.options;
        if (options && typeof assigned.parameter === "string") {
            points = cost.choices[options.indexOf(assigned.parameter)] ?? 0;
        } else {
            const value = Number(assigned.parameter);
            points = cost.choices.includes(value) ? value : cost.choices[0];
        }
    } else {
        points = cost.points ?? 0;
    }
    return points === 0 ? 0 : sign * points;
}
