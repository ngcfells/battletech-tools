import { describe, expect, it, vi } from "vitest";
import { BattleMech } from "../classes/battlemech";
import { describeCriticals } from "../data/bundled-mechs-build";
import { sswTestFixtures } from "../data/ssw/sswTestFixtures";
import { compactDesign, compactMech, expandDesign, loadBundledMech } from "./bundled-designs";

describe("the compact design format (#241)", () => {
    it("gives back the same 'Mech: BV, cost, tonnage, crit table and equipment", () => {
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
        for (const [label, xml] of Object.entries(sswTestFixtures)) {
            const mech = new BattleMech();
            mech.importSSWXML(xml);
            const reload = loadBundledMech(compactMech(mech));
            expect(reload.getBattleValue(), label).toBe(mech.getBattleValue());
            expect(reload.getCBillCostNumeric(), label).toBe(mech.getCBillCostNumeric());
            expect(reload.getTonnage(), label).toBe(mech.getTonnage());
            expect(describeCriticals(reload), label).toBe(describeCriticals(mech));
            expect(reload.getInstalledEquipment().map((item) => item.tag), label).toEqual(mech.getInstalledEquipment().map((item) => item.tag));
            expect(reload.tro.export(), label).toEqual(mech.tro.export());
        }
        vi.restoreAllMocks();
    });

    it("keeps far less than a saved design", () => {
        const mech = new BattleMech();
        mech.importSSWXML(sswTestFixtures["Atlas AS7-D"]);
        expect(JSON.stringify(compactMech(mech)).length).toBeLessThan(mech.exportJSON().length / 3);
    });

    it("leaves out what a blank unit has and the derived fields, and gives fresh UUIDs back", () => {
        const blank = { name: "", tonnage: 20, list: [] as unknown[] };
        const design = { uuid: "0f8fad5b-d9cb-469f-a165-70867728950e", name: "Atlas", tonnage: 20, battle_value: 1897,
            list: [{ uuid: "7c9e6679-7425-40de-944b-e07fc1f90ae7", rear: false, loc: "ct" }, { uuid: "7c9e6679-7425-40de-944b-e07fc1f90ae7", note: "" }] };
        const compact = compactDesign(design, blank);
        expect(compact).toEqual({ name: "Atlas", list: [{ uuid: "#0", loc: "ct" }, { uuid: "#0" }] });
        const expanded = expandDesign(compact, blank) as { tonnage: number; list: { uuid: string }[] };
        expect(expanded.tonnage).toBe(20);
        expect(expanded.list[0].uuid).toMatch(/^[0-9a-f-]{36}$/);
        expect(expanded.list[0].uuid).not.toBe(design.list[0].uuid);
        expect(expanded.list[1].uuid).toBe(expanded.list[0].uuid);
    });
});
