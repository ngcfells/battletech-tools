import { QuirkList } from "../classes/quirk-list";
import { IAssignedQuirk, IQuirk, QuirkEffect, QuirkRangeBand } from "../data/quirk-interfaces";
import { getQuirk } from "../data/quirk-registry";

/** One effect of one active quirk, labelled for play; `effect` is null for a quirk with none ("not yet applied in play"). */
export interface IAppliedQuirkEffect {
    effect: QuirkEffect | null;
    quirkName: string;
    /** "Accurate Weapon (-1)", "Improved Targeting (Long) (-1)"; just the name for an effect without a modifier. */
    label: string;
    /** The weapon or bay the quirk is on, if any. */
    equipmentUuids?: string[];
    /** The assignment's parameter: a range band, a value. */
    parameter?: string | number;
}

/** What an attack is, for the to-hit effects that apply to it. */
export interface IQuirkAttackContext {
    weaponUuid?: string;
    rangeBand?: QuirkRangeBand;
    vsAirborne?: boolean;
    /** "weapon" when absent. */
    attack?: "weapon" | "punch" | "arm-physical" | "physical";
    attackerRanOrFlanked?: boolean;
}

const signed = (value: number): string => (value > 0 ? `+${value}` : `${value}`);

const capitalised = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const quirkTitle = (record: IQuirk, assigned: IAssignedQuirk): string =>
    record.parameter?.kind === "range-band" && typeof assigned.parameter === "string"
        ? `${record.name} (${capitalised(assigned.parameter)})` : record.name;

const effectModifier = (effect: QuirkEffect): number | undefined => "modifier" in effect ? effect.modifier : undefined;

const weaponsOf = (assigned: IAssignedQuirk): string[] | undefined =>
    assigned.bayUuids ?? (assigned.equipmentUuid ? [assigned.equipmentUuid] : undefined);

/** The effects of the quirks in force (see `QuirkList.getActive`), one entry per effect, in assignment order. */
export function getQuirkEffects(list: QuirkList, installedUuids: string[], year: number | undefined): IAppliedQuirkEffect[] {
    const applied: IAppliedQuirkEffect[] = [];
    for (const assigned of list.getActive(installedUuids, year)) {
        const record = getQuirk(assigned.tag);
        if (!record) {
            continue;
        }
        const title = quirkTitle(record, assigned);
        const equipmentUuids = weaponsOf(assigned);
        const effects: (QuirkEffect | null)[] = record.effects?.length ? record.effects : [null];
        for (const effect of effects) {
            const modifier = effect ? effectModifier(effect) : undefined;
            applied.push({
                effect,
                quirkName: record.name,
                label: modifier === undefined ? title : `${title} (${signed(modifier)})`,
                ...(equipmentUuids ? { equipmentUuids } : {}),
                ...(assigned.parameter !== undefined ? { parameter: assigned.parameter } : {}),
            });
        }
    }
    return applied;
}

/** The quirk to-hit modifier of one attack by the unit, with the label of each effect that counted. */
export function getQuirkToHit(list: QuirkList, installedUuids: string[], year: number | undefined, context: IQuirkAttackContext): { modifier: number; labels: string[] } {
    const attack = context.attack ?? "weapon";
    let modifier = 0;
    const labels: string[] = [];
    for (const applied of getQuirkEffects(list, installedUuids, year)) {
        const effect = applied.effect;
        if (effect?.type !== "to-hit" || (effect.attack ?? "weapon") !== attack) {
            continue;
        }
        if (effect.scope === "weapon" && !(context.weaponUuid && applied.equipmentUuids?.includes(context.weaponUuid))) {
            continue;
        }
        if (effect.vsAirborne && !context.vsAirborne) {
            continue;
        }
        if (effect.attackerRanOrFlanked && !context.attackerRanOrFlanked) {
            continue;
        }
        if (effect.rangeBand) {
            const band = effect.rangeBand === "parameter" ? (typeof applied.parameter === "string" ? applied.parameter.toLowerCase() : undefined) : effect.rangeBand;
            if (!context.rangeBand || band !== context.rangeBand) {
                continue;
            }
        }
        modifier += effect.modifier;
        labels.push(applied.label);
    }
    return { modifier, labels };
}

/** The change to the heat the unit builds up each turn (Combat Computer -4); the caller floors generated heat at 0. */
export function getQuirkHeatGenerated(list: QuirkList, installedUuids: string[], year: number | undefined): number {
    return getQuirkEffects(list, installedUuids, year)
        .reduce((sum, applied) => sum + (applied.effect?.type === "heat-generated" ? applied.effect.modifier : 0), 0);
}

/** A weapon's heat when fired, after its cooling jacket quirks, never below a quirk's minimum. */
export function getQuirkWeaponHeat(list: QuirkList, installedUuids: string[], year: number | undefined, weaponUuid: string, heat: number): number {
    let result = heat;
    let minimum = Number.NEGATIVE_INFINITY;
    for (const applied of getQuirkEffects(list, installedUuids, year)) {
        if (applied.effect?.type === "weapon-heat" && applied.equipmentUuids?.includes(weaponUuid)) {
            result += applied.effect.modifier;
            minimum = Math.max(minimum, applied.effect.minimum ?? Number.NEGATIVE_INFINITY);
        }
    }
    return Math.max(minimum, result);
}

/** The unit's largest Initiative effect, or null; a side takes the largest of its units', never the sum (CO p.225). */
export function getQuirkInitiative(list: QuirkList, installedUuids: string[], year: number | undefined): { modifier: number; label: string } | null {
    let best: { modifier: number; label: string } | null = null;
    for (const applied of getQuirkEffects(list, installedUuids, year)) {
        if (applied.effect?.type === "initiative" && (!best || applied.effect.modifier > best.modifier)) {
            best = { modifier: applied.effect.modifier, label: applied.label };
        }
    }
    return best;
}
