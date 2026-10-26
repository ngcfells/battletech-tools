
/*
 * DISCLAIMER: This file processes gameplay data derived from the BattleTech universe. 
 * All official lore, trademarks, and intellectual property belong strictly to 
 * Catalyst Game Labs, Topps, and/or their respective corporate rights holders. 
 * Any original, fan-made content or custom homebrew data processed by this tool 
 * remains the exclusive property of its respective community creators, which,
 * where known, has been appropriately attributed.
 *
 * This open-source utility is a non-commercial fan project designed purely for 
 * tabletop gameplay assistance. Content processed by this file is not intended 
 * to challenge any copyright or trademark status, and this data is explicitly 
 * excluded from the software's underlying license (GNU GPLv3).
 */

import { RulesEditionUnitType } from "./rules-editions";

// Special Rulesets (#324): optional and homebrew rules that change how the game plays or how units are built. They
// are chosen first in the shared settings block, so each can set the minimum edition and narrow every list below it.
// Only rules that change gameplay or construction belong here, never a single custom item or unit type.

/** The settings block's steps after Special Rulesets, in order. */
export type GameSettingStep = "edition" | "rulesLevel" | "techBase" | "era";

/** Plural names for the unit types a ruleset can take away, for its notices. */
export const UNIT_TYPE_PLURALS: Record<RulesEditionUnitType, string> = {
    mech: "BattleMechs", vehicle: "Vehicles", fighter: "Fighters", "small-craft": "Small Craft", "capital-ship": "Capital Ships",
    infantry: "Infantry", "battle-armor": "Battle Armor", protomech: "ProtoMechs", building: "Buildings",
};

export interface ISpecialRuleset {
    id: string;
    name: string;
    description: string;
    /** Where the ruleset comes from, printed on every unit built with it. */
    source: { title: string; url?: string };
    /** Edition tag; editions before it are not offered. */
    minEdition?: string;
    minRulesLevel?: number;
    /** Tech option tags (see tech-options.ts) the ruleset takes away. */
    removesTechBases?: string[];
    /** Era tags the ruleset takes away. */
    removesEras?: string[];
    /** Unit types that do not exist under the ruleset: it cannot be ticked on one, and they are not offered. */
    removesUnitTypes?: RulesEditionUnitType[];
    /** What the ruleset changes; two rulesets that change the same thing cannot both be in use. */
    changes: string[];
}

export const btSpecialRulesets: ISpecialRuleset[] = [
    {
        id: "sample-no-clans",
        name: "Sample: The Clans never existed (alternate universe)",
        description: "A sample alternate universe in which the Clans never formed: no Clan or Mixed tech. A placeholder until real rulesets are added.",
        source: { title: "Sample ruleset (#324)" },
        removesTechBases: ["clan", "mclan", "mis"],
        // ProtoMechs are a Clan creation: they do not exist either (user ruling 2026-10-26).
        removesUnitTypes: ["protomech"],
        changes: ["techBases"],
    },
];

export function getSpecialRulesets(): ISpecialRuleset[] {
    return btSpecialRulesets;
}

export function findSpecialRuleset(id: string): ISpecialRuleset | undefined {
    return btSpecialRulesets.find((ruleset) => ruleset.id === id);
}

/** The ticked ruleset under which `unitType` does not exist, or undefined. */
export function getRulesetRemovingUnitType(tickedIds: string[], unitType: RulesEditionUnitType): ISpecialRuleset | undefined {
    return tickedIds.map(findSpecialRuleset).find((ruleset) => !!ruleset?.removesUnitTypes?.includes(unitType));
}

/** The ticked ruleset that clashes with `candidateId` (they change the same thing), or undefined. */
export function getRulesetConflict(tickedIds: string[], candidateId: string): ISpecialRuleset | undefined {
    const candidate = findSpecialRuleset(candidateId);
    if (!candidate) {
        return undefined;
    }
    return tickedIds
        .filter((id) => id !== candidateId)
        .map(findSpecialRuleset)
        .find((ticked) => !!ticked && ticked.changes.some((change) => candidate.changes.includes(change)));
}
