import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { BattleMech } from "./battlemech";

// Battle Value of SSW designs against the BV2 SSW wrote in each file (#46).
function importFixture(name: string): BattleMech {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const mech = new BattleMech();
    mech.importSSWXML(readFileSync(`src/utils/__fixtures__/${name}.ssw`, "utf8"));
    return mech;
}
const tags = (mech: BattleMech) => mech.getInstalledEquipment().map((item) => item.tag);

describe("SSW Battle Value (#46)", () => {
    it("reads SSW's Triple-Strength Myomer enhancement, 1 more Walking MP for BV: Raider JL-1", () => {
        const mech = importFixture("raider-jl-1");
        expect(mech.getMyomerType().tag).toBe("tsm");
        expect(mech.getBattleValue()).toBe(817);
    });

    it("counts no explosive slot for the B-Pod: Bloodhound B3-HND", () => {
        expect(importFixture("bloodhound-b3-hnd").getBattleValue()).toBe(1006);
    });

    it("reads MASC from SSW's enhancement, and Hardened Armor costs 1 Running MP: Amarok 2", () => {
        const mech = importFixture("amarok-2");
        expect(tags(mech)).toContain("clan-masc");
        expect(mech.getArmorType()).toBe("hardened");
        expect(mech.getWalkSpeed()).toBe(4);
        expect(mech.getRunSpeed()).toBe(5);
        // MASC and a Supercharger: 4 x 2.5 = 10, less 1 for Hardened Armor (TO:AUE p.93).
        expect(mech.getBVRunSpeed()).toBe(9);
        expect(mech.getBattleValue()).toBe(3351);
    });

    it("counts Narc pods as explosive ammunition: Archer ARC-5S", () => {
        const mech = importFixture("archer-arc-5s");
        expect(mech.getInstalledEquipment().find((item) => item.tag === "ammo-is-narc-standard")?.explosive).toBe(true);
        expect(mech.getBattleValue()).toBe(1353);
    });

    it("installs the machine guns of SSW's MG Array items: Flea FLE-19", () => {
        const mech = importFixture("flea-fle-19");
        expect(tags(mech).filter((tag) => tag === "machine-gun-light")).toHaveLength(8);
        expect(mech.getUnallocatedCriticals()).toEqual([]);
        expect(mech.getBattleValue()).toBe(381);
    });

    it("counts Modular Armor's points and ignores its speed penalty: Trebuchet TBT-XK7", () => {
        const mech = importFixture("trebuchet-tbt-xk7");
        expect(mech.hasActiveModularArmor()).toBe(true);
        // In play the packs cost 1 Walking and Jumping MP; Battle Value ignores that (TO:AUE p.192).
        expect(mech.getWalkSpeed()).toBe(4);
        expect(mech.getBVJumpSpeed()).toBe(5);
        expect(mech.getBattleValue()).toBe(1549);
    });

    it("doubles the heat of Clan Ultra autocannons: Hunchback IIC", () => {
        expect(importFixture("hunchback-iic").getBattleValue()).toBe(1679);
    });

    it("reads SSW's Clan CASE on an Inner Sphere-base Mixed Tech design: Archer C", () => {
        const mech = importFixture("archer-c");
        expect(mech.hasClanCASE()).toBe(true);
        expect(mech.getBattleValue()).toBe(1883);

        const copy = new BattleMech();
        copy.importJSON(mech.exportJSON());
        expect(copy.hasClanCASE()).toBe(true);
        expect(copy.getBattleValue()).toBe(1883);

        mech.setClanCASE(false);
        // Four slots of LRM ammo in the side torsos, -15 each, x 1.2 Defensive Factor.
        expect(mech.getBattleValue()).toBe(1883 - 72);
    });

    it("reads each patchwork location's armor type: Victor VTR-9K2 St.James", () => {
        const mech = importFixture("victor-vtr-9k2-st-james");
        expect(mech.isPatchworkArmor()).toBe(true);
        expect(mech.getPatchworkArmorType("head").tag).toBe("standard");
        expect(mech.getPatchworkArmorType("leftArm").tag).toBe("ferro-fibrous");
        expect(mech.getPatchworkArmorType("rightLeg").tag).toBe("ferro-fibrous");
        expect(mech.getTotalArmor()).toBe(244);
        expect(mech.sswImportErrors).toEqual([]);
        expect(mech.getBattleValue()).toBe(2006);
    });

    it("takes 0.8 of a drone's weapon BV and 0.95 of its total, with no cockpit modifier (TO:AUE p.192): Celerity CLR-04-R", () => {
        const mech = importFixture("celerity-clr-04-r");
        expect(mech.hasDroneOperatingSystem()).toBe(true);
        // Defensive 75 + Offensive (TSEMP One-Shot 98 x 0.8 + 15 tons) x 3.44 = 396.30; x 0.95, the Small Cockpit's 0.95 not applied.
        expect(mech.getBattleValue()).toBe(376);
    });
});
