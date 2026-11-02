import { getBattleArmorScaleExplosionDamage } from "./battle-armor-scale-equipment";
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
    /** The damage is divided by this, by protection, rounding down. */
    damageDivisor?: Partial<Record<AmmoExplosionProtection, number>>;
    /** The least damage left after the divisor (aerospace: 1, TW p.161). */
    minDamage?: number;
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
        building: { scope: "all", pilotDamage: 0, damageDivisor: { case: 10 }, cite: "TO:AR p.118" },
        // CASE II reduces a fighter's explosion to 1 point (TO:AUE p.111); small craft cannot mount it.
        fighter: { scope: "bin", pilotDamage: 1, damageDivisor: { none: 10, case: 20 }, minDamage: 1, cap: { "case-ii": 1 }, cite: "TW p.161, TO:AUE p.111" },
        "small-craft": { scope: "bin", pilotDamage: 1, damageDivisor: { none: 10 }, minDamage: 1, cite: "TW p.161" },
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
 * weapon aboard to fire it cannot be valued and is left out. Battle-armor-scale ammunition does 20 a quarter-ton left
 * (Ghosts of Obeedah p.54) and an extended fuel tank 40 a ton (TM p.244). Undefined when the edition has no ruling
 * for the unit type. The unit applies the damage to its own locations.
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
    for (const bin of bins) {
        if (bin.variableFormula === "extended-fuel-tank") baseDamage += 40 * bin.weight;
        const weapon = bin.isAmmo && bin.explosive ? binWeapon(bin) : undefined;
        if (!weapon) continue;
        const shots = Math.max(0, shotsLeft(bin));
        baseDamage += bin.battleArmorScale ? getBattleArmorScaleExplosionDamage(shots * (bin.kgPerShot ?? 0) / 1000) : shots * getAmmoDamagePerShot(weapon);
    }
    let damage = baseDamage;
    const divisor = rules.damageDivisor?.[protection] ?? rules.damageDivisor?.none;
    if (divisor && damage > 0) damage = Math.max(rules.minDamage ?? 0, Math.floor(damage / divisor));
    damage = Math.min(damage, rules.cap?.[protection] ?? Infinity);
    const log = rules.pilotDamage > 0 ? [`The ${unitType === "mech" ? "MechWarrior" : "pilot"} takes ${rules.pilotDamage} damage (${rules.cite})`] : [];
    return { rules, baseDamage, damage, log };
}

/**
 * A failed heat Avoid Roll's explosion (TW p.161): the bin with the most destructive ammunition per shot explodes,
 * and the rest of that weapon's ammunition is destroyed with no more damage. `spent` is every bin lost. Gauss and
 * other inert ammunition never explode. Undefined when no explosive ammunition is left. The unit applies the damage
 * to its SI and the pilot damage to its pilot or crew.
 */
export function getHeatAmmoExplosion(
    editionTag: string | undefined,
    unitType: RulesEditionUnitType,
    bins: IEquipmentItem[],
    binWeapon: (bin: IEquipmentItem) => IEquipmentItem | undefined,
    shotsLeft: (bin: IEquipmentItem) => number,
    protection: AmmoExplosionProtection = "none",
): (IAmmoExplosion & { bin: IEquipmentItem; spent: IEquipmentItem[] }) | undefined {
    const live = bins.filter((bin) => bin.isAmmo && bin.explosive && shotsLeft(bin) > 0 && binWeapon(bin));
    const bin = live.reduce<IEquipmentItem | undefined>((best, item) => !best || getAmmoDamagePerShot(binWeapon(item)!) > getAmmoDamagePerShot(binWeapon(best)!) ? item : best, undefined);
    const explosion = bin && getAmmoExplosion(editionTag, unitType, [bin], binWeapon, shotsLeft, protection);
    if (!explosion) return undefined;
    const log = [`${bin!.name} explodes: ${explosion.damage} damage to the Structural Integrity (${explosion.rules.cite})`, ...explosion.log];
    if (explosion.rules.pilotDamage > 0) log.push("Make a Consciousness Roll (TW p.41)");
    return { ...explosion, log, bin: bin!, spent: live.filter((item) => binWeapon(item) === binWeapon(bin!)) };
}
