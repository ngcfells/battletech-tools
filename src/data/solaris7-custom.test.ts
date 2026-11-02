import { describe, expect, it } from "vitest";
import { BattleMech } from "../classes/battlemech";
import { ammoCustom } from "./ammo-custom";
import { ballisticCustom } from "./ballistic-custom";
import { energyCustom } from "./energy-custom";
import { getCompatibleAmmo, getEquipmentRulesLevel, getWeaponShotsPerTon } from "./equipment-registry";
import { mechCustomArmorTypes } from "./mech-custom-armor-types";
import { CUSTOM_HOMEBREW_RULES_LEVEL, MUNCHKIN_RULES_LEVEL } from "./rules-level-options";

// Solaris7 forum equipment (#301). Balance rulings: the IS Heavy Laser trades with the Heavy PPC and Binary Laser Cannon,
// so it is Custom Homebrew; both railguns and the nanotube armor outclass every canon item of their kind, so Munchkin.
const find = (list: { tag: string }[], tag: string) => {
    const found = list.find((item) => item.tag === tag);
    if (!found) throw new Error(`no record ${tag}`);
    return found;
};

describe("Solaris7 forum equipment (#301)", () => {
    it("IS Heavy Laser (Captain): 9 tons, 5 slots, 16 damage, 16 heat, 5/10/15, Custom Homebrew", () => {
        const laser = find(energyCustom, "custom-is-heavy-laser-solaris7") as typeof energyCustom[number];
        expect(laser).toMatchObject({ techBase: "is", catalog: "custom", weight: 9, damage: 16, heat: 16, accuracyModifier: 0, explosive: true });
        expect(laser.range).toEqual({ min: 0, short: 5, medium: 10, long: 15 });
        expect(laser.space.battlemech).toBe(5);
        expect(getEquipmentRulesLevel(laser)).toBe(CUSTOM_HOMEBREW_RULES_LEVEL);
        expect(laser.notes).toContain("25 damage to the location");
        // Not printed: the Binary Laser Cannon's (TO:AUE p.131) cost, dates and tech rating; BV scaled from its 18.5 a point.
        expect(laser).toMatchObject({ cbills: 200000, battleValue: 296, introduced: 3077, techRating: "d" });
        expect(laser.book).toBe("http://solaris7.com/thread/lostech-custom-weapons/");
    });

    it("Railgun (Nightstalker666): 20 tons, 8 slots, 25 damage, 12 heat, 16 shots a ton, Munchkin", () => {
        const gun = find(ballisticCustom, "custom-railgun-nightstalker666") as typeof ballisticCustom[number];
        const ammo = find(ammoCustom, "ammo-custom-railgun-nightstalker666-standard") as typeof ammoCustom[number];
        expect(gun).toMatchObject({ weight: 20, damage: 25, heat: 12, cbills: 2500000, battleValue: 660 });
        expect(gun.range).toEqual({ min: 6, short: 12, medium: 25, long: 39, extreme: 50 });
        expect(gun.space.battlemech).toBe(8);
        expect(ammo).toMatchObject({ roundsPerTon: 16, cbills: 400000, battleValue: 83, explosive: true });
        expect(getCompatibleAmmo(gun, ammo)).toBe(true);
        expect(getWeaponShotsPerTon(gun, ammo)).toBe(16);
        expect(getEquipmentRulesLevel(gun)).toBe(MUNCHKIN_RULES_LEVEL);
        expect(getEquipmentRulesLevel(ammo)).toBe(MUNCHKIN_RULES_LEVEL);
        expect(gun.notes).toContain("armor-piercing");
    });

    it("Railgun (Captain): 30 tons, 22 slots taking one whole side, 50 damage, 2 shots a ton, Munchkin", () => {
        const gun = find(ballisticCustom, "custom-railgun-captain") as typeof ballisticCustom[number];
        const ammo = find(ammoCustom, "ammo-custom-railgun-captain-standard") as typeof ammoCustom[number];
        expect(gun).toMatchObject({ weight: 30, damage: 50, heat: 5, explosive: true, spreadSlots: true, spreadLocations: "one-side" });
        expect(gun.range).toEqual({ min: 10, short: 11, medium: 22, long: 33 });
        expect(gun.space).toMatchObject({ battlemech: 22, protomech: -1, combatVehicle: 1, supportVehicle: 22, aerospaceFighter: 1 });
        expect(ammo).toMatchObject({ roundsPerTon: 2, battleValue: 154 });
        expect(gun.battleValue).toBe(1230);
        expect(getWeaponShotsPerTon(gun, ammo)).toBe(2);
        expect(getEquipmentRulesLevel(gun)).toBe(MUNCHKIN_RULES_LEVEL);
        expect(gun.notes).toContain("60-point");

        // The whole side (user ruling 2026-11-02): all 12 slots of a side torso and the 10 its arm has left without the
        // lower arm and hand actuators. Never the center torso, and never both sides.
        const mech = new BattleMech();
        mech.setTonnage(100);
        mech.setWalkSpeed(3);
        mech.removeLowerArmActuator("la");
        expect(mech.addEquipmentFromTag("custom-railgun-captain", "is", "", false, undefined, "", false, [], undefined, undefined, -1, "", true)).not.toBeNull();
        const criticals = mech.getCriticals() as unknown as Record<string, ({ tag?: string } | null)[]>;
        const area: Record<string, string> = { ct: "centerTorso", lt: "leftTorso", rt: "rightTorso", la: "leftArm", ra: "rightArm" };
        const place = (loc: string) => {
            const index = mech.unallocatedCriticals.findIndex((slot) => slot?.tag === "custom-railgun-captain");
            return mech.moveCritical("un", index, loc, criticals[area[loc]].findIndex((slot) => !slot));
        };
        expect(place("ct")).toBe(false);
        for (let slot = 0; slot < 12; slot++) expect(place("lt")).toBe(true);
        expect(place("rt")).toBe(false);
        expect(place("ra")).toBe(false);
        for (let slot = 0; slot < 10; slot++) expect(place("la")).toBe(true);
        expect(mech.unallocatedCriticals.filter((slot) => slot?.tag === "custom-railgun-captain")).toEqual([]);
        expect(mech.getChassisEquipmentViolations().filter((text) => text.includes("Railgun"))).toEqual([]);
    });

    it("Nanotube armor: 24 points a ton, no slots, 75,000 C-bills a ton, Munchkin, and a 'Mech using it needs Munchkin", () => {
        const armor = find(mechCustomArmorTypes, "custom-nanotube-armor") as typeof mechCustomArmorTypes[number];
        expect(armor.armorMultiplier).toEqual({ is: 24, clan: 24 });
        expect(armor.crits).toEqual({ is: 0, clan: 0 });
        expect(armor.costMultiplier).toBe(75000);
        expect(armor.rulesLevel).toBe(MUNCHKIN_RULES_LEVEL);
        expect(armor.unitTypes.battlemech).toBe(true);
        expect(armor.unitTypes.combatVehicle).toBe(false);

        const mech = new BattleMech();
        expect(mech.getRequiredRulesLevel()).toBeLessThan(MUNCHKIN_RULES_LEVEL);
        mech.setArmorType("custom-nanotube-armor");
        expect(mech.getRequiredRulesLevel()).toBe(MUNCHKIN_RULES_LEVEL);
    });
});
