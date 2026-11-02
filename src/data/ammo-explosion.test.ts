import { describe, expect, it } from "vitest";
import { getAmmoDamagePerShot, getAmmoExplosion, getAmmoExplosionRules } from "./ammo-explosion";
import { IEquipmentItem } from "./data-interfaces";

const ac20 = { name: "AC/20", damage: 20 } as IEquipmentItem;
const lrm20 = { name: "LRM 20", damageClusters: 20, damagePerCluster: 1 } as IEquipmentItem;
const bin = (shots: number, explosive = true) => ({ isAmmo: true, explosive, currentAmmo: shots }) as IEquipmentItem;
const weaponFor = (weapon: IEquipmentItem | undefined) => () => weapon;
const shots = (item: IEquipmentItem) => item.currentAmmo ?? 0;

describe("ammunition explosion rules", () => {
    it("explodes the bin hit on a Total Warfare 'Mech, the MechWarrior taking 2", () => {
        expect(getAmmoExplosionRules("total-warfare", "mech")).toMatchObject({ scope: "bin", pilotDamage: 2, verified: true });
    });

    it("explodes all the ammunition aboard a vehicle or in a building hex, hurting no pilot", () => {
        expect(getAmmoExplosionRules("total-warfare", "vehicle")).toMatchObject({ scope: "all", pilotDamage: 0 });
        expect(getAmmoExplosionRules("total-warfare", "building")).toMatchObject({ scope: "all", pilotDamage: 0 });
    });

    it("divides aerospace explosions by 10, the pilot taking 1", () => {
        for (const type of ["fighter", "small-craft"] as const) {
            expect(getAmmoExplosionRules("total-warfare", type)).toMatchObject({ scope: "bin", pilotDamage: 1, damageDivisor: 10 });
        }
    });

    it("caps a Core Rulebook 'Mech explosion at 20 / 10 / 1, the MechWarrior taking 1", () => {
        expect(getAmmoExplosionRules("core-rulebook", "mech")).toMatchObject({ pilotDamage: 1, cap: { none: 20, case: 10, caseII: 1 } });
    });

    it("falls back to Total Warfare for an edition with no record of its own", () => {
        expect(getAmmoExplosionRules("battlemech-manual", "mech")).toBe(getAmmoExplosionRules("total-warfare", "mech"));
        expect(getAmmoExplosionRules(undefined, "vehicle")).toBe(getAmmoExplosionRules("total-warfare", "vehicle"));
    });

    it("has no ruling, so no explosion, for infantry", () => {
        expect(getAmmoExplosionRules("total-warfare", "infantry")).toBeUndefined();
        expect(getAmmoExplosion("total-warfare", "infantry", [bin(5)], weaponFor(ac20), shots)).toBeUndefined();
    });
});

describe("ammunition explosion damage", () => {
    it("is one shot's Damage Value, counting every missile", () => {
        expect(getAmmoDamagePerShot(ac20)).toBe(20);
        expect(getAmmoDamagePerShot(lrm20)).toBe(20);
        expect(getAmmoDamagePerShot({ damage: { short: 4 } } as unknown as IEquipmentItem)).toBe(4);
    });

    it("totals the shots left in each explosive bin, skipping spent, inert and unfed ones", () => {
        expect(getAmmoExplosion("total-warfare", "mech", [bin(5)], weaponFor(ac20), shots)?.damage).toBe(100);
        expect(getAmmoExplosion("total-warfare", "vehicle", [bin(2), bin(3), bin(0), bin(9, false)], weaponFor(ac20), shots)?.damage).toBe(100);
        expect(getAmmoExplosion("total-warfare", "mech", [bin(5)], weaponFor(undefined), shots)?.damage).toBe(0);
    });

    it("divides aerospace damage by 10, rounding down, at least 1", () => {
        expect(getAmmoExplosion("total-warfare", "fighter", [bin(6)], weaponFor(lrm20), shots)?.damage).toBe(12);
        expect(getAmmoExplosion("total-warfare", "fighter", [bin(1)], weaponFor({ damage: 5 } as IEquipmentItem), shots)?.damage).toBe(1);
    });

    it("logs the pilot's damage, and notes rules not checked against the book", () => {
        expect(getAmmoExplosion("total-warfare", "mech", [bin(5)], weaponFor(ac20), shots)?.log).toEqual(["The MechWarrior takes 2 damage (TW p.125)"]);
        expect(getAmmoExplosion("total-warfare", "vehicle", [bin(5)], weaponFor(ac20), shots)?.log).toEqual([]);
        expect(getAmmoExplosion("core-rulebook", "mech", [bin(5)], weaponFor(ac20), shots)?.log).toContain("(rules not verified for BattleTech Core Rulebook)");
    });
});
