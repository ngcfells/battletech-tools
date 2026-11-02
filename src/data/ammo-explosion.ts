import { IEquipmentItem } from "./data-interfaces";
import { DEFAULT_RULES_EDITION, RulesEditionUnitType } from "./rules-editions";

/** What protects the exploding location: nothing, CASE (or Clan CASE) or CASE II. */
export type AmmoExplosionProtection = "none" | "case" | "case-ii";

/** How an edition explodes one unit type's ammunition. Fields are added only where the books differ. */
export interface IAmmoExplosionRules {
    /** The bin hit explodes, or all the ammunition aboard (in a building, all in the hex). */
    scope: "bin" | "all";
    /** Damage to the MechWarrior or pilot, which CASE and CASE II do not prevent; 0 for none. */
    pilotDamage: number;
    /** Aerospace damage is divided by this, by protection, rounding down, at least 1 (TW p.161). */
    damageDivisor?: Partial<Record<AmmoExplosionProtection, number>>;
    /** The most damage reaching internal structure (or SI), by protection; the unit vents the rest. */
    cap?: Partial<Record<AmmoExplosionProtection, number>>;
    /**
     * Where damage over the cap goes, by protection, if the 'Mech location it stops in survives: up to this many points
     * of its armor (a torso's rear armor), "all" its armor, or "half" a limb's or the head's original armor, rounding
     * up (a torso's rear armor takes the excess). Without an entry the excess is lost.
     */
    excessToArmor?: Partial<Record<AmmoExplosionProtection, number | "all" | "half">>;
    cite: string;
}

export interface IAmmoExplosion {
    rules: IAmmoExplosionRules;
    /** Shots left times one shot's Damage Value. */
    baseDamage: number;
    /** What reaches internal structure (or SI) after the divisor and cap. */
    damage: number;
    log: string[];
}

/**
 * Every edition's ammunition explosion rules, by edition tag then unit type. An edition with no record for a
 * unit type plays by Total Warfare's; a unit type with no Total Warfare record has no ruling and never explodes.
 */
export const AMMO_EXPLOSION_RULES: Record<string, Partial<Record<RulesEditionUnitType, IAmmoExplosionRules>>> = {
    "total-warfare": {
        // CASE vents what is left after the location (TW p.125); CASE II lets 1 point through (TO:AUE p.111).
        mech: { scope: "bin", pilotDamage: 2, cap: { "case-ii": 1 }, excessToArmor: { "case-ii": "half" }, cite: "TW p.125, TO:AUE p.111" },
        vehicle: { scope: "all", pilotDamage: 0, cite: "TW p.194" },
        building: { scope: "all", pilotDamage: 0, cite: "TO:AR p.119" },
        // CASE II reduces a fighter's explosion to 1 point (TO:AUE p.111); small craft cannot mount it.
        fighter: { scope: "bin", pilotDamage: 1, damageDivisor: { none: 10, case: 20 }, cap: { "case-ii": 1 }, cite: "TW p.161, TO:AUE p.111" },
        "small-craft": { scope: "bin", pilotDamage: 1, damageDivisor: { none: 10 }, cite: "TW p.161" },
    },
    "core-rulebook": {
        // Excess over the cap blows out armor (CRB pp.96-97, 207); the MechWarrior takes 1 hit (CRB p.107).
        mech: {
            scope: "bin", pilotDamage: 1, cap: { none: 20, case: 10, "case-ii": 1 }, excessToArmor: { none: "all", case: 10, "case-ii": 10 },
            cite: "CRB pp.96, 107",
        },
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
    protection: AmmoExplosionProtection = "none",
): IAmmoExplosion | undefined {
    const rules = getAmmoExplosionRules(editionTag, unitType);
    if (!rules) return undefined;
    let baseDamage = 0;
    for (const bin of bins.filter((item) => item.isAmmo && item.explosive)) {
        const weapon = binWeapon(bin);
        if (weapon) baseDamage += Math.max(0, shotsLeft(bin)) * getAmmoDamagePerShot(weapon);
    }
    let damage = baseDamage;
    const divisor = rules.damageDivisor?.[protection] ?? rules.damageDivisor?.none;
    if (divisor && damage > 0) damage = Math.max(1, Math.floor(damage / divisor));
    damage = Math.min(damage, rules.cap?.[protection] ?? Infinity);
    const log = rules.pilotDamage > 0 ? [`The ${unitType === "mech" ? "MechWarrior" : "pilot"} takes ${rules.pilotDamage} damage (${rules.cite})`] : [];
    return { rules, baseDamage, damage, log };
}
