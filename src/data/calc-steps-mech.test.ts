import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { findCalcDefProblems } from "./calc-steps";
import { MECH_BV2_STEPS, MECH_BV2_WEAPON_CITES } from "./calc-steps-mech-bv2";
import { CALC_SOURCES } from "./calc-sources";

const ledger = fs.readFileSync(path.join(__dirname, "../../docs/superpowers/plans/2026-11-10-cited-bv-ledger.md"), "utf8");

describe("'Mech BV2 step definitions", () => {
    it("are clean: every citation names a known source and page, and every uncited step says why", () => {
        expect(findCalcDefProblems(MECH_BV2_STEPS)).toEqual([]);
    });

    it("have ids prefixed bv2. and one of the three sections", () => {
        const sections = ["Defensive Battle Rating", "Offensive Battle Rating", "Final Battle Value"];
        for (const [id, def] of Object.entries(MECH_BV2_STEPS)) {
            expect(id.startsWith("bv2."), id).toBe(true);
            expect(sections, id).toContain(def.section);
        }
    });

    it("cover the core TechManual steps", () => {
        for (const id of ["bv2.def.armor", "bv2.def.structure", "bv2.def.engine", "bv2.def.gyro", "bv2.def.equipment", "bv2.def.explosive.ammo",
            "bv2.def.factor", "bv2.off.heat.efficiency", "bv2.off.weapon", "bv2.off.ammo", "bv2.off.tonnage", "bv2.off.speed", "bv2.final.cockpit", "bv2.final.round"]) {
            expect(MECH_BV2_STEPS[id], id).toBeDefined();
        }
    });

    it("are each listed in the reading ledger", () => {
        for (const id of Object.keys(MECH_BV2_STEPS)) expect(ledger, id).toContain("`" + id + "`");
    });

    it("name a document for every source-missing step, and the ledger lists it for the owner", () => {
        for (const [id, def] of Object.entries(MECH_BV2_STEPS)) {
            if (def.status !== "source-missing") continue;
            expect(ledger, id).toContain(def.note!);
        }
    });

    it("weapon modifier citations name known sources", () => {
        for (const [name, cite] of Object.entries(MECH_BV2_WEAPON_CITES)) {
            expect(CALC_SOURCES[cite.source], name).toBeDefined();
            expect(cite.page.trim(), name).not.toBe("");
        }
    });
});
