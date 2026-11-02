import { IEquipmentItem } from "./data-interfaces";
import { DEFAULT_RULES_EDITION, getRulesEdition, RulesEditionUnitType } from "./rules-editions";

/** How an edition explodes one unit type's ammunition. Fields are added only where the books differ. */
export interface IAmmoExplosionRules {
    /** The bin hit explodes, or all the ammunition aboard (in a building, all in the hex). */
    scope: "bin" | "all";
    /** Damage to the MechWarrior or pilot; 0 for none. */
    pilotDamage: number;
    /** Aerospace damage is divided by this, rounding down, at least 1 (TW p.161). */
    damageDivisor?: number;
    /** The most damage reaching internal structure without CASE, with CASE and with CASE II; the rest blows out armor. */
    cap?: { none: number; case: number; caseII: number };
    cite: string;
    /** False where the rule was taken from MegaMek without the book's text to hand. */
    verified: boolean;
}

export interface IAmmoExplosion {
    rules: IAmmoExplosionRules;
    damage: number;
    log: string[];
}

/**
 * Every edition's ammunition explosion rules, by edition tag then unit type. An edition with no record for a
 * unit type plays by Total Warfare's; a unit type with no Total Warfare record has no ruling and never explodes.
 */
export const AMMO_EXPLOSION_RULES: Record<string, Partial<Record<RulesEditionUnitType, IAmmoExplosionRules>>> = {
    "total-warfare": {
        mech: { scope: "bin", pilotDamage: 2, cite: "TW p.125", verified: true },
        vehicle: { scope: "all", pilotDamage: 0, cite: "TW p.194", verified: true },
        building: { scope: "all", pilotDamage: 0, cite: "TO:AR p.119", verified: true },
        fighter: { scope: "bin", pilotDamage: 1, damageDivisor: 10, cite: "TW p.161", verified: true },
        "small-craft": { scope: "bin", pilotDamage: 1, damageDivisor: 10, cite: "TW p.161", verified: true },
    },
    // Taken from MegaMek's CoreRulesExplosions and CoreRulesPilot; the CRB pages are still to be checked.
    "core-rulebook": {
        mech: { scope: "bin", pilotDamage: 1, cap: { none: 20, case: 10, caseII: 1 }, cite: "CRB", verified: false },
    },
};

export function getAmmoExplosionRules(editionTag: string | undefined, unitType: RulesEditionUnitType): IAmmoExplosionRules | undefined {
    return AMMO_EXPLOSION_RULES[editionTag ?? DEFAULT_RULES_EDITION]?.[unitType] ?? AMMO_EXPLOSION_RULES[DEFAULT_RULES_EDITION][unitType];
}

/** The Damage Value of one shot, counting every missile (TW p.125). */
export function getAmmoDamagePerShot(weapon: IEquipmentItem): number {
    if (weapon.damageClusters && weapon.damagePerCluster) return weapon.damageClusters * weapon.damagePerCluster;
    if (typeof weapon.damage === "number") return weapon.damage;
    return weapon.damage?.short ?? 0;
}

/**
 * An ammunition explosion of `bins`: each explosive bin's shots left times one shot's Damage Value. A bin with no
 * weapon aboard to fire it cannot be valued and is left out. Undefined when the edition has no ruling for the unit
 * type. The unit applies the damage to its own locations.
 */
export function getAmmoExplosion(
    editionTag: string | undefined,
    unitType: RulesEditionUnitType,
    bins: IEquipmentItem[],
    binWeapon: (bin: IEquipmentItem) => IEquipmentItem | undefined,
    shotsLeft: (bin: IEquipmentItem) => number,
): IAmmoExplosion | undefined {
    const rules = getAmmoExplosionRules(editionTag, unitType);
    if (!rules) return undefined;
    let damage = 0;
    for (const bin of bins.filter((item) => item.isAmmo && item.explosive)) {
        const weapon = binWeapon(bin);
        if (weapon) damage += Math.max(0, shotsLeft(bin)) * getAmmoDamagePerShot(weapon);
    }
    if (rules.damageDivisor && damage > 0) damage = Math.max(1, Math.floor(damage / rules.damageDivisor));
    const log: string[] = [];
    if (rules.pilotDamage > 0) log.push(`The ${unitType === "mech" ? "MechWarrior" : "pilot"} takes ${rules.pilotDamage} damage (${rules.cite})`);
    if (!rules.verified) log.push(`(rules not verified for ${getRulesEdition(editionTag).name})`);
    return { rules, damage, log };
}
