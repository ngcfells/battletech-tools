import { describe, expect, it } from "vitest";
import { BattleMech } from "./battlemech";

describe("hasXLEngine (issue 26)", () => {
    const withEngine = (tag: string, tech: "is" | "clan") => {
        const mech = new BattleMech();
        mech.setTech(tech);
        mech.setTonnage(50);
        mech.setWalkSpeed(4);
        mech.setEngineType(tag);
        return mech;
    };
    it("is true for the Inner Sphere XL only, not Light or Clan XL", () => {
        expect(withEngine("xl", "is").hasXLEngine()).toBe(true);
        expect(withEngine("light", "is").hasXLEngine()).toBe(false);
        expect(withEngine("clan_xl", "clan").hasXLEngine()).toBe(false);
        expect(withEngine("standard", "is").hasXLEngine()).toBe(false);
    });
});

describe("Clan artillery Battle Value (issue 38)", () => {
    const bv = (tech: "is" | "clan") => {
        const mech = new BattleMech();
        mech.setTech(tech);
        mech.setTonnage(100);
        mech.setWalkSpeed(3);
        mech.addEquipmentFromTag("long-tom-artillery", tech, "", false, undefined, "", false, [], undefined, undefined);
        return mech.getBattleValue();
    };
    it("a Clan 'Mech counts the Long Tom at 560, not 368", () => {
        expect(bv("clan")).toBeGreaterThan(bv("is"));
    });
});
