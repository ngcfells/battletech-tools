import { IEquipmentItem } from "./data-interfaces";
import { getAmmoBattleValuePerTon } from "./equipment-registry";
import { DEFAULT_RULES_EDITION, RulesEditionUnitType, btRulesEditions, getRulesEdition } from "./rules-editions";

/**
 * Battle Value by rules edition: the scheme each edition uses for each unit type (BV1 from the Master Rules, BV2 from
 * the TechManual), and the skill multipliers. Research and rulings: docs/superpowers/plans/2026-11-03-edition-aware-bv.md.
 */

export type BattleValueScheme = "none" | "bv1" | "bv2";
/** Unit types with a Battle Value of their own (buildings have none here yet). */
export type BattleValueUnitType = Exclude<RulesEditionUnitType, "building">;

export interface IBattleValueRules {
    scheme: BattleValueScheme;
    /** Where the rules are printed, errata included. */
    source: string;
    /** BV1 not entered yet for this unit type: BV2 is worked out and shown alone. */
    pending?: true;
}

const NO_BATTLE_VALUE: IBattleValueRules = { scheme: "none", source: "No Battle Value system before the BattleTech Master Rules (1998)" };

const bv1 = (source: string): IBattleValueRules => ({ scheme: "bv1", source, pending: true });
// AT2 pp.53-54 and AT2R p.81 print the same steps; each reads its own edition's equipment BVs (plan, segment 2).
const AT2 = bv1("AeroTech 2 pp.53-54 (with BMR equipment BVs); AT2 errata 1.2 bomb BVs");
const AT2R = bv1("AeroTech 2, Revised Edition pp.81-82 (with BMR(R) equipment BVs)");
const BV2: IBattleValueRules = { scheme: "bv2", source: "TechManual pp.302-319, replaced by Battle Value v4.1 (2024) and TM errata v8.0 tables pp.315-319" };

/**
 * Battle Value rules by edition tag, then unit type. An edition not listed reads the newest edition before it that is
 * (the CBT box set reads BMR(R); the BattleMech Manual and Core Rulebook read Total Warfare); a unit type an edition
 * leaves out has no Battle Value in it.
 */
export const BV_RULES: Record<string, Partial<Record<BattleValueUnitType, IBattleValueRules>>> = {
    "master-rules": {
        mech: bv1("BattleTech Master Rules pp.139-145; FanPro BMR errata p.12"),
        vehicle: bv1("BattleTech Master Rules pp.141-142; FanPro BMR errata p.12"),
        fighter: AT2, "small-craft": AT2, "capital-ship": AT2,
        infantry: bv1("BattleTech Master Rules p.142 (table); FanPro BMR errata p.12"),
        "battle-armor": bv1("BattleTech Master Rules p.142 (table)"),
    },
    "master-rules-revised": {
        mech: bv1("BattleTech Master Rules, Revised Edition pp.152-159; Maximum Tech pp.90-92 (Level 3)"),
        vehicle: bv1("BattleTech Master Rules, Revised Edition pp.154-155; Maximum Tech p.92 (Level 3)"),
        fighter: AT2R, "small-craft": AT2R, "capital-ship": AT2R,
        protomech: bv1("BattleTech Master Rules, Revised Edition pp.155-156"),
        infantry: bv1("BattleTech Master Rules, Revised Edition pp.155-156 (table); Maximum Tech p.93 (Level 3)"),
        // Newer than, and replacing, the BMR(R) p.155 battle armor rows.
        "battle-armor": bv1("Classic BattleTech Companion pp.187-191"),
    },
    "total-warfare": {
        mech: BV2, vehicle: BV2, fighter: BV2, "small-craft": BV2, infantry: BV2, "battle-armor": BV2, protomech: BV2,
        "capital-ship": { scheme: "bv2", source: "Strategic Operations: Advanced Aerospace pp.148-149" },
    },
};

/** The newest edition at or before `edition` that `table` lists. An unknown edition reads the default edition's. */
const getListedEdition = (edition: string | undefined, table: Record<string, unknown>): string | undefined => {
    const at = btRulesEditions.indexOf(getRulesEdition(edition));
    return btRulesEditions.slice(0, at + 1).reverse().find((entry) => Object.prototype.hasOwnProperty.call(table, entry.tag))?.tag;
};

/** The Battle Value rules `unitType` follows under `edition`. An unknown edition reads the default edition's. */
export const getBattleValueRules = (edition: string | undefined, unitType: BattleValueUnitType): IBattleValueRules => {
    const listed = getListedEdition(edition, BV_RULES);
    return (listed && BV_RULES[listed][unitType]) || NO_BATTLE_VALUE;
};

/** A C3 network's BV: a share of the whole network's BV added to each member, or a percent of each member's own. */
export type BattleValueC3Rule =
    | { kind: "network"; percent: number; boostedPercent: number }
    | { kind: "per-unit"; twoUnits: number; perExtraUnit: number; cap: number; boostedFlat: number };

/** Battle force adjustments, applied in this order before skill (BV v4.1 p.23; TO:AUE p.198). */
export interface IBattleValueForceRules {
    source: string;
    /** Ammo whose tons in the force add their BV to each unit with TAG, Light TAG or a C3 master (half if rear-only). */
    tagAmmo?: string[];
    c3: BattleValueC3Rule;
    /** A fighter's external stores join its BV before skill. */
    externalStores?: true;
}

/**
 * Force adjustments by edition tag, read like `BV_RULES`. TO:AUE p.198 adds Arrow IV homing, Copperhead and
 * semi-guided mortar ammo to TAG, one bonus per TAG carried, and boosted C3 at 7 percent. The Core Rulebook p.220
 * lists only C3: +10% to each unit of a two-unit network, +5% per unit beyond, at most +40%, boosted +5% on top.
 */
export const BV_FORCE_RULES: Record<string, IBattleValueForceRules> = {
    "total-warfare": {
        source: "Battle Value v4.1 p.23 (TM p.315); TO:AUE p.198",
        // Air-launched Arrow IV homing bombs count too (user ruling, 2026-11-03).
        tagAmmo: ["ammo-is-lrm-semi-guided", "ammo-is-enhanced-lrm-semi-guided", "ammo-is-arrow-iv-homing", "ammo-clan-arrow-iv-homing",
            "ammo-long-tom-copperhead", "ammo-sniper-copperhead", "ammo-thumper-copperhead", "ammo-is-mech-mortar-guided",
            "ammo-is-bomb-arrow-iv-homing", "ammo-clan-bomb-arrow-iv-homing"],
        c3: { kind: "network", percent: 5, boostedPercent: 7 },
        externalStores: true,
    },
    "core-rulebook": {
        source: "BattleTech Core Rulebook p.220",
        c3: { kind: "per-unit", twoUnits: 10, perExtraUnit: 5, cap: 40, boostedFlat: 5 },
    },
};

/** The force adjustments under `edition`; none before the TechManual (BV1's come with 'Mech BV1). */
export const getBattleValueForceRules = (edition: string | undefined): IBattleValueForceRules | undefined => {
    const listed = getListedEdition(edition, BV_FORCE_RULES);
    return listed ? BV_FORCE_RULES[listed] : undefined;
};

/** TAG, Light TAG and C3 masters: each adds the force's TAG-guided ammo to its unit's BV (BV v4.1 p.23; TO:AUE p.198). */
const TAG_DESIGNATORS = ["is-tag", "prototype-tag", "clan-tag", "clan-light-tag", "c3-computer-master", "c3-boosted-master", "c3-emergency-master"];

/** A unit's part in its force's TAG adjustment: how many times it adds the force's guided ammo BV, and the BV of the guided ammo it carries. */
export interface IBattleValueTagShare { times: number; ammo: number }

/**
 * A unit's TAG share under `edition`: once for each designator it carries (TO:AUE p.198), half each when all are
 * rear-mounted (v4.1 p.23). Each ton of guided ammo counts its BV for the launcher it feeds (semi-guided LRM ammo
 * takes the launcher's); `stores` are a fighter's bombs, each counting its own BV (user ruling, 2026-11-03).
 */
export const getBattleValueTagShare = (edition: string | undefined, equipment: IEquipmentItem[], binWeapon: (bin: IEquipmentItem) => IEquipmentItem | null | undefined,
    stores: Array<{ item: IEquipmentItem | undefined; count: number }> = []): IBattleValueTagShare => {
    const tagAmmo = getBattleValueForceRules(edition)?.tagAmmo ?? [];
    const designators = tagAmmo.length > 0 ? equipment.filter((item) => !item.isAmmo && TAG_DESIGNATORS.includes(item.tag)) : [];
    const rearOnly = designators.every((item) => item.rear || item.location === "rear" || item.location === "aft");
    const bins = equipment.filter((item) => item.isAmmo && tagAmmo.includes(item.tag));
    return {
        times: designators.length * (rearOnly ? 0.5 : 1),
        ammo: bins.reduce((sum, bin) => sum + getAmmoBattleValuePerTon(binWeapon(bin) ?? null, bin) * (bin.weight || 0), 0)
            + stores.reduce((sum, store) => sum + (store.item && tagAmmo.includes(store.item.tag) ? (store.item.battleValue || 0) * store.count : 0), 0),
    };
};

/** C3 systems that join a network (TW p.131; TO:AUE p.110). C3i counts like standard C3 (CRB p.220). */
export type BattleValueC3Type = "standard" | "boosted";
const C3_SYSTEMS: Record<string, BattleValueC3Type> = {
    "c3-computer-master": "standard", "c3-computer-slave": "standard", "c3-emergency-master": "standard", "c3i-computer": "standard",
    "c3-boosted-master": "boosted", "c3-boosted-slave": "boosted",
};

/** The C3 system a unit networks with: boosted when it carries any boosted C3; undefined with none. */
export const getBattleValueC3Type = (equipment: IEquipmentItem[]): BattleValueC3Type | undefined => {
    const types = equipment.map((item) => C3_SYSTEMS[item.tag]).filter(Boolean);
    return types.includes("boosted") ? "boosted" : types[0];
};

/**
 * What a C3 network member adds before skill under `edition`: TM's percent of the network's total BV (`network`;
 * each member by its own C3 type, TO:AUE p.198), or the CRB's percent of its own (`own`), growing with the network's
 * `members` (p.220). A network of one adds nothing.
 */
export const getBattleValueC3Share = (edition: string | undefined, type: BattleValueC3Type | undefined, own: number, network: number, members: number): number => {
    const rule = getBattleValueForceRules(edition)?.c3;
    if (!rule || !type || members < 2) return 0;
    if (rule.kind === "network") return network * (type === "boosted" ? rule.boostedPercent : rule.percent) / 100;
    return own * (Math.min(rule.cap, rule.twoUnits + (members - 2) * rule.perExtraUnit) + (type === "boosted" ? rule.boostedFlat : 0)) / 100;
};

/** True once `edition` works out a BV1 of its own for `unitType` (its BV1 record is entered, not pending). */
const worksOutBv1 = (edition: string | undefined, unitType: BattleValueUnitType): boolean => {
    const rules = getBattleValueRules(edition, unitType);
    return rules.scheme === "bv1" && !rules.pending;
};

/** Does `edition` have a Battle Value system for `unitType`? The first is in the Master Rules (BV_RULES). */
export const editionHasBattleValue = (edition: string | undefined, unitType: BattleValueUnitType = "mech"): boolean =>
    getBattleValueRules(edition, unitType).scheme !== "none";

/**
 * The skill table edition that goes with the Battle Value `edition` works out for `unitType` (plan ruling 2): its own
 * (or the newest before it, as the box set reads BMR(R)'s) once its BV1 is entered, and the TechManual's for BV2.
 */
export const getBattleValueSkillEdition = (edition: string | undefined, unitType: BattleValueUnitType): string =>
    (worksOutBv1(edition, unitType) && getListedEdition(edition, SKILL_MULTIPLIERS_BY_EDITION)) || DEFAULT_RULES_EDITION;

/** Runs a unit's BV1 method under a BV1 edition once that unit type's BV1 is entered, and its BV2 method otherwise. */
export const getBattleValueFor = <T>(edition: string | undefined, unitType: BattleValueUnitType, methods: { bv1?: () => T; bv2: () => T }): T =>
    (worksOutBv1(edition, unitType) && methods.bv1 ? methods.bv1 : methods.bv2)();

/**
 * The one Battle Value text for every display (plan ruling 1): a BV2 edition shows its BV, a BV1 edition "1,234 (BV2:
 * 1,456)", and an edition with no Battle Value, or whose BV1 is not entered yet, "— (BV2: 1,456)". `battleValue` gives
 * the base or skill-adjusted BV under an edition, so each figure reads its own skill table (ruling 2). A force total
 * lists each unit type in it and shows a BV1 figure only once every one of them has one.
 */
export const formatBattleValue = (battleValue: (edition: string) => number, unitType: BattleValueUnitType | BattleValueUnitType[], edition: string | undefined): string => {
    const types = Array.isArray(unitType) ? unitType : [unitType];
    const tag = getRulesEdition(edition).tag;
    if (types.every((type) => getBattleValueRules(tag, type).scheme === "bv2")) return battleValue(tag).toLocaleString("en-US");
    const bv2 = battleValue(DEFAULT_RULES_EDITION).toLocaleString("en-US");
    return `${types.length > 0 && types.every((type) => worksOutBv1(tag, type)) ? battleValue(tag).toLocaleString("en-US") : "—"} (BV2: ${bv2})`;
};

/**
 * Battle Value skill multipliers, by rules edition. Every table here is indexed [Gunnery][Piloting]: rows are the
 * Gunnery Skill, columns the Piloting, Driving or Anti-'Mech Skill.
 *
 * - Battledroids to BattleTech, Fourth Edition (1984-1996) have no Battle Value system and so no table.
 *   BattleTech Compendium: The Rules of Warfare (1994) has none either (checked in its OCR text, 2026-10-17).
 * - Master Rules (1998, p.144) and Master Rules, Revised Edition (2001, p.158) print the same table for skills
 *   0 to 7.
 * - Total Warfare's table is the TechManual's (p.315). It has been printed three ways: the 2007 first printing
 *   (Gunnery 0 / Piloting 0 = 3.68), the Battle Value 2.1 revision of 2017 (2.80) and the corrected printings
 *   from 2020 on (2.42), which the replacement Battle Value pages v4.1 (2024) repeat. The newest is used.
 * - The Core Rulebook (2026, p.222) prints the TechManual's current table.
 */

/** How a unit type reads the table: which skill is its column, and which unit types are held to one column. */
export type SkillMultiplierUnitType =
    | "mech"
    | "vehicle"
    | "fighter"
    | "protomech"
    | "battle-armor"
    /** Foot, motorized and jump infantry: the column is the Anti-'Mech Skill. */
    | "infantry"
    | "mechanized-infantry";

export interface IEditionSkillMultipliers {
    /** Where the table is printed. */
    source: string;
    /** [Gunnery][Piloting / Driving / Anti-'Mech]. */
    table: number[][];
    /** Unit types that have no second skill in this edition and read the 5 column. */
    fixedColumnUnitTypes: SkillMultiplierUnitType[];
}

/** The column used by a unit type with no Piloting or Anti-'Mech Skill of its own. */
export const SKILL_MULTIPLIER_FIXED_COLUMN = 5;

// BV Skill Multipliers, BattleTech Master Rules p.144 and Master Rules, Revised Edition p.158.
const MASTER_RULES_TABLE: number[][] = [
    //            PILOTING: 0     1     2     3     4     5     6     7
    /* Gunnery 0 */        [2.05, 2.00, 1.95, 1.90, 1.85, 1.80, 1.75, 1.70],
    /* Gunnery 1 */        [1.85, 1.80, 1.75, 1.70, 1.65, 1.60, 1.55, 1.50],
    /* Gunnery 2 */        [1.65, 1.60, 1.55, 1.50, 1.45, 1.40, 1.35, 1.30],
    /* Gunnery 3 */        [1.45, 1.40, 1.35, 1.30, 1.25, 1.20, 1.15, 1.10],
    /* Gunnery 4 */        [1.25, 1.20, 1.15, 1.10, 1.05, 1.00, 0.95, 0.90],
    /* Gunnery 5 */        [1.15, 1.10, 1.05, 1.00, 0.95, 0.90, 0.85, 0.80],
    /* Gunnery 6 */        [1.05, 1.00, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70],
    /* Gunnery 7 */        [0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60],
];

// BV Skill Multiplier Table, TechManual p.315 (corrected printings from 2020; Battle Value pages v4.1, 2024) and
// Core Rulebook p.222.
const TECH_MANUAL_TABLE: number[][] = [
    //   PILOTING / ANTI-'MECH: 0     1     2     3     4     5     6     7     8
    /* Gunnery 0 */            [2.42, 2.31, 2.21, 2.10, 1.93, 1.75, 1.68, 1.59, 1.50],
    /* Gunnery 1 */            [2.21, 2.11, 2.02, 1.92, 1.76, 1.60, 1.54, 1.46, 1.38],
    /* Gunnery 2 */            [1.93, 1.85, 1.76, 1.68, 1.54, 1.40, 1.35, 1.28, 1.21],
    /* Gunnery 3 */            [1.66, 1.58, 1.51, 1.44, 1.32, 1.20, 1.16, 1.10, 1.04],
    /* Gunnery 4 */            [1.38, 1.32, 1.26, 1.20, 1.10, 1.00, 0.95, 0.90, 0.85],
    /* Gunnery 5 */            [1.31, 1.19, 1.13, 1.08, 0.99, 0.90, 0.86, 0.81, 0.77],
    /* Gunnery 6 */            [1.24, 1.12, 1.07, 1.02, 0.94, 0.85, 0.81, 0.77, 0.72],
    /* Gunnery 7 */            [1.17, 1.06, 1.01, 0.96, 0.88, 0.80, 0.76, 0.72, 0.68],
    /* Gunnery 8 */            [1.10, 0.99, 0.95, 0.90, 0.83, 0.75, 0.71, 0.68, 0.64],
];

/**
 * The table each rules edition uses, by edition tag. An edition that is not listed has no Battle Value skill
 * multipliers: its units' Battle Values are not adjusted for skill.
 */
export const SKILL_MULTIPLIERS_BY_EDITION: Record<string, IEditionSkillMultipliers> = {
    "master-rules": {
        source: "BattleTech Master Rules p.144",
        table: MASTER_RULES_TABLE,
        // "Infantry units have no Piloting Skill; simply use the 5 column of the table."
        fixedColumnUnitTypes: ["infantry", "mechanized-infantry", "battle-armor"],
    },
    "master-rules-revised": {
        source: "BattleTech Master Rules, Revised Edition p.158",
        table: MASTER_RULES_TABLE,
        // As Master Rules, and: "Because ProtoMech pilots have no Piloting Skill ... use the 5 column".
        fixedColumnUnitTypes: ["infantry", "mechanized-infantry", "battle-armor", "protomech"],
    },
    "total-warfare": {
        source: "TechManual p.315",
        table: TECH_MANUAL_TABLE,
        // ProtoMechs have no Piloting Skill; mechanized infantry adjust Gunnery only (TM p.314). Other infantry and
        // battle armor use their Anti-'Mech Skill as the column.
        fixedColumnUnitTypes: ["protomech", "mechanized-infantry"],
    },
    // The BattleMech Manual prints no table: Clan skills "must still be paid for in BV" and Battle Values come from
    // the Master Unit List (BMM p.9), which uses TechManual's. Canon is silent: TechManual's table is used (flagged).
    "battlemech-manual": {
        source: "TechManual p.315 (BattleMech Manual p.9 prints no table)",
        table: TECH_MANUAL_TABLE,
        fixedColumnUnitTypes: ["protomech", "mechanized-infantry"],
    },
    "core-rulebook": {
        source: "BattleTech Core Rulebook p.222",
        table: TECH_MANUAL_TABLE,
        fixedColumnUnitTypes: ["protomech", "mechanized-infantry"],
    },
};

/** The edition's table and how it is read, or null when the edition has no Battle Value skill multipliers. */
export const getEditionSkillMultipliers = (edition: string = DEFAULT_RULES_EDITION): IEditionSkillMultipliers | null => {
    return Object.prototype.hasOwnProperty.call(SKILL_MULTIPLIERS_BY_EDITION, edition) ? SKILL_MULTIPLIERS_BY_EDITION[edition] : null;
};

/** Editions, oldest first, that adjust Battle Value for skill. */
export const getEditionsWithSkillMultipliers = (): string[] =>
    btRulesEditions.map((edition) => edition.tag).filter((tag) => getEditionSkillMultipliers(tag) !== null);

/**
 * The Battle Value multiplier for a unit's skills under one rules edition. `piloting` is the unit's Piloting,
 * Driving or Anti-'Mech Skill; it is ignored for a unit type the edition holds to the 5 column. Null when the
 * edition has no table, or a skill lies outside it.
 */
export const getSkillMultiplier = (
    gunnery: number,
    piloting: number,
    unitType: SkillMultiplierUnitType = "mech",
    edition: string = DEFAULT_RULES_EDITION,
): number | null => {
    const multipliers = getEditionSkillMultipliers(edition);
    if (!multipliers) return null;
    const column = multipliers.fixedColumnUnitTypes.includes(unitType) ? SKILL_MULTIPLIER_FIXED_COLUMN : piloting;
    return multipliers.table[gunnery]?.[column] ?? null;
};
