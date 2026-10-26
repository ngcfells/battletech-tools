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

import { IEras, IRulesLevelOption } from "./data-interfaces";
import { findEraByTag, fitTechToBases, getClosestEraForTech, getErasForTech } from "./era-options";
import { btRulesEditions, DEFAULT_RULES_EDITION, fitRulesLevel, getRulesEdition, getRulesLevelOptionsForEdition, getSelectableRulesEditions, IRulesEdition, RulesEditionUnitType } from "./rules-editions";
import { findSpecialRuleset, GameSettingStep, getRulesetConflict, ISpecialRuleset } from "./special-rulesets";
import { btTechOptions } from "./tech-options";

// The shared settings block (#324): Special Rulesets, Edition, Rules Level, Tech Base, Era, in that order. Each step
// offers only what the steps above allow, and a change only ever moves later steps. Reading the options never
// changes a stored value: an old save keeps what it has until the player edits a step.

export interface IGameSettings {
    rulesets: string[];
    edition: string;
    rulesLevel: number;
    techBase: string;
    era: string;
}

export interface IGameSettingOptions {
    editions: IRulesEdition[];
    rulesLevels: IRulesLevelOption[];
    techBases: string[];
    /** Empty when the edition has no eras (Battledroids). */
    eras: IEras[];
}

/** A later step's value that a change moved because its list no longer offered it. */
export interface IGameSettingMove {
    step: GameSettingStep;
    from: string | number;
    to: string | number;
}

export type GameSettingChange =
    | { step: "rulesets"; toggle: string }
    | { step: GameSettingStep; value: string | number };

const STEPS: GameSettingStep[] = ["edition", "rulesLevel", "techBase", "era"];
const STEP_LABELS: Record<GameSettingStep, string> = { edition: "Edition", rulesLevel: "Rules Level", techBase: "Tech Base", era: "Era" };

const editionOrder = (tag: string) => btRulesEditions.findIndex((edition) => edition.tag === tag);

const tickedRulesets = (settings: IGameSettings): ISpecialRuleset[] =>
    settings.rulesets.flatMap((id) => findSpecialRuleset(id) ?? []);

export function getGameSettingOptions(settings: IGameSettings, unitType: RulesEditionUnitType): IGameSettingOptions {
    const rulesets = tickedRulesets(settings);
    const minEdition = Math.max(-1, ...rulesets.map((ruleset) => ruleset.minEdition ? editionOrder(ruleset.minEdition) : -1));
    const minLevel = Math.max(-Infinity, ...rulesets.map((ruleset) => ruleset.minRulesLevel ?? -Infinity));
    const removedTech = rulesets.flatMap((ruleset) => ruleset.removesTechBases ?? []);
    const removedEras = rulesets.flatMap((ruleset) => ruleset.removesEras ?? []);
    return {
        editions: getSelectableRulesEditions(unitType).filter((edition) => editionOrder(edition.tag) >= minEdition),
        rulesLevels: getRulesLevelOptionsForEdition(settings.edition).filter((level) => level.id >= minLevel),
        techBases: btTechOptions.map((option) => option.tag).filter((tag) => !removedTech.includes(tag)),
        eras: getRulesEdition(settings.edition).noEras ? [] : getErasForTech(settings.techBase).filter((era) => !removedEras.includes(era.tag)),
    };
}

// The value a step moves to when its list no longer offers the current one.
function fitStep(step: GameSettingStep, settings: IGameSettings, options: IGameSettingOptions): string | number {
    switch (step) {
        case "edition": {
            if (options.editions.some((edition) => edition.tag === settings.edition)) {
                return settings.edition;
            }
            // The next offered edition after a known one; the default edition for one this version does not know.
            const stored = editionOrder(settings.edition);
            const later = stored >= 0 ? options.editions.find((edition) => editionOrder(edition.tag) >= stored) : undefined;
            const fallback = options.editions.find((edition) => edition.tag === DEFAULT_RULES_EDITION) ?? options.editions[0];
            return (later ?? fallback)?.tag ?? settings.edition;
        }
        case "rulesLevel":
            return fitRulesLevel(options.rulesLevels.map((level) => level.id), settings.rulesLevel);
        case "techBase":
            return fitTechToBases(settings.techBase, options.techBases);
        case "era": {
            if (options.eras.length === 0 || options.eras.some((era) => era.tag === settings.era)) {
                return settings.era;
            }
            const era = findEraByTag(settings.era);
            const closest = era ? getClosestEraForTech(era, settings.techBase) : options.eras[0];
            if (options.eras.includes(closest)) {
                return closest.tag;
            }
            // A ruleset took the closest era away: the offered era nearest in time.
            return [...options.eras].sort((a, b) => Math.abs(a.yearStart - closest.yearStart) - Math.abs(b.yearStart - closest.yearStart))[0].tag;
        }
    }
}

/**
 * Applies one change, then moves each later step whose value the new lists no longer offer, in step order. A ruleset
 * that clashes with one already ticked is refused and nothing changes; an id the registry does not know is ignored.
 */
export function changeGameSetting(
    settings: IGameSettings,
    change: GameSettingChange,
    unitType: RulesEditionUnitType,
): { settings: IGameSettings; moves: IGameSettingMove[]; refused?: ISpecialRuleset } {
    const next: IGameSettings = { ...settings, rulesets: [...settings.rulesets] };
    const values = next as unknown as Record<GameSettingStep, string | number>;
    let firstLater = 0;
    if (change.step === "rulesets") {
        if (next.rulesets.includes(change.toggle)) {
            next.rulesets = next.rulesets.filter((id) => id !== change.toggle);
        } else if (!findSpecialRuleset(change.toggle)) {
            return { settings, moves: [] };
        } else {
            const refused = getRulesetConflict(next.rulesets, change.toggle);
            if (refused) {
                return { settings, moves: [], refused };
            }
            next.rulesets.push(change.toggle);
        }
    } else {
        // A select hands over the rules level as text. The edited step itself is fitted too, in case it is not offered.
        values[change.step] = change.step === "rulesLevel" ? Number(change.value) : change.value;
        firstLater = STEPS.indexOf(change.step);
    }
    const moves: IGameSettingMove[] = [];
    for (const step of STEPS.slice(firstLater)) {
        const from = values[step];
        // The edited step's own fit is not a move the player needs telling about.
        const edited = change.step === step;
        const to = fitStep(step, next, getGameSettingOptions(next, unitType));
        if (to !== from) {
            values[step] = to;
            if (!edited) {
                moves.push({ step, from, to });
            }
        }
    }
    return { settings: next, moves };
}

/** "Era moved to Clan Invasion", for the notice under the settings block. Rules level names come from `editionTag`. */
export function describeGameSettingMove(move: IGameSettingMove, editionTag?: string): string {
    const to = move.step === "edition" ? getRulesEdition(String(move.to)).name
        : move.step === "rulesLevel" ? getRulesLevelOptionsForEdition(editionTag).find((level) => level.id === move.to)?.name ?? String(move.to)
        : move.step === "techBase" ? btTechOptions.find((option) => option.tag === move.to)?.name ?? String(move.to)
        : findEraByTag(String(move.to))?.name ?? String(move.to);
    return STEP_LABELS[move.step] + " moved to " + to;
}
