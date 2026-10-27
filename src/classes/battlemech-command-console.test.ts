import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { BattleMech } from "./battlemech";
import { importBattleMechMtf } from "./battlemech-mtf";

// Cockpit Command Console (TO:AUE pp.112-113, #171): an Advanced add-on of 3 tons and 1 slot beside the cockpit,
// 500,000 C-bills. Not with a Torso-Mounted, QuadVee or tripod cockpit (p.112; IO:AE p.159). The console takes
// head slot 3, as MegaMek's addCommandConsole; on a Small Cockpit the second Sensors move down to slot 4.
const tags = (slots: ({ tag: string } | null | undefined)[]) => slots.map((slot) => slot?.tag ?? "");

function mech(tons: number = 70): BattleMech {
    const unit = new BattleMech();
    unit.setTech("is");
    unit.setEra("dark-ages");
    unit.setTonnage(tons);
    unit.setWalkSpeed(4);
    return unit;
}

describe("a Cockpit Command Console", () => {
    it("adds 3 tons, 500,000 C-bills and a head slot beside the cockpit, at Advanced rules", () => {
        const unit = mech();
        expect(unit.canMountCommandConsole()).toBe(true);
        const tons = unit.getCurrentTonnage();
        const cost = unit.getCBillCostNumeric();
        expect(unit.setCommandConsole(true)).toBe(true);
        expect(unit.getCurrentTonnage()).toBe(tons + 3);
        // 500,000 C-bills (TO:AUE p.219), times the 1 + 70/100 tonnage multiplier.
        expect(unit.getCBillCostNumeric() - cost).toBe(850000);
        expect(tags(unit.getCriticals().head)).toEqual(["life-support", "sensors", "cockpit", "command-console", "sensors", "life-support"]);
        expect(unit.getRequiredRulesLevel()).toBe(3);
    });

    it("moves a Small Cockpit's second Sensors down a slot", () => {
        const unit = mech();
        unit.setCockpitType("small");
        unit.setCommandConsole(true);
        expect(tags(unit.getCriticals().head)).toEqual(["life-support", "sensors", "cockpit", "command-console", "sensors", ""]);
    });

    it("is not offered with a Torso-Mounted Cockpit, on a QuadVee or on a tripod", () => {
        const torso = mech();
        torso.setCockpitType("torso-mounted");
        expect(torso.canMountCommandConsole()).toBe(false);
        expect(torso.setCommandConsole(true)).toBe(false);
        const console = mech();
        console.setCommandConsole(true);
        console.setCockpitType("torso-mounted");
        expect(console.hasCommandConsole()).toBe(false);
        const tripod = mech();
        tripod.setMechType("tripod");
        expect(tripod.canMountCommandConsole()).toBe(false);
    });

    it("survives a save and load", () => {
        const unit = mech();
        unit.setCommandConsole(true);
        const loaded = new BattleMech(unit.exportJSON());
        expect(loaded.hasCommandConsole()).toBe(true);
        expect(loaded.getCurrentTonnage()).toBe(unit.getCurrentTonnage());
    });

    it("imports from SSW at the file's BV2: Hatamoto-Godai HTM-30Z is 1,899", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const unit = new BattleMech();
        unit.importSSWXML(readFileSync("src/utils/__fixtures__/hatamoto-godai-htm-30z.ssw", "utf8"));
        expect(unit.sswImportErrors).toEqual([]);
        expect(unit.hasCommandConsole()).toBe(true);
        expect(unit.getUnallocatedCriticals()).toEqual([]);
        expect(unit.getBattleValue()).toBe(1899);
    });

    it("imports from MegaMek at the MUL BV: Atlas AS7-D-DC is 1,858", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const { mech: unit, issues } = importBattleMechMtf(readFileSync("src/utils/__fixtures__/atlas-as7-d-dc.mtf", "utf8"));
        expect(issues).toEqual([]);
        expect(unit?.sswImportErrors).toEqual([]);
        expect(unit?.hasCommandConsole()).toBe(true);
        expect(unit?.getBattleValue()).toBe(1858);
    });

    it("gives a MegaMek IndustrialMech with a console Advanced Fire Control, as MegaMek does: Kiso K-3N-KR4 is 954 (RS:3075)", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const { mech: unit, issues } = importBattleMechMtf(readFileSync("src/utils/__fixtures__/kiso-k-3n-kr4.mtf", "utf8"));
        expect(issues).toEqual([]);
        expect(unit?.hasCommandConsole()).toBe(true);
        expect(unit?.hasAdvancedFireControl()).toBe(true);
        expect(unit?.getBattleValue()).toBe(954);
    });
});
