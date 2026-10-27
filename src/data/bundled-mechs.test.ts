import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { BUNDLED_CHUNK_SIZE } from "../utils/bundled-designs";
import { buildBundledMechs, DEFAULT_MEGAMEK_DIR, DEFAULT_SSW_DIR, loadCanonMechs, writeBundledMechs } from "./bundled-mechs-build";
import { getBundledMechEntries, loadBundledMechDesign, loadBundledMechIndex } from "./bundled-mechs";

// The bundled 'Mechs (#241). Regenerate from the Skunk Werks and MegaMek files:
//   WRITE_BUNDLED_MECHS=1 npx vitest run src/data/bundled-mechs.test.ts
// The build imports every file, checks its BV against the Master Unit List (or the file) and its round trip through
// the compact format, and writes the designs that pass plus a report of the rest (bundled/mechs-report.md). A
// different submodel of a kept design is renamed by mordel.net's canon list (mordel/canon-mechs.csv, refreshed with
// ~/.claude/tools/mordel_canon_csv.py for BattleMech and IndustrialMech).
const dataDir = path.resolve(__dirname, "bundled");

// Pinned so a growing data set is a deliberate change.
const DESIGNS = 3552;
// The table format with values shared per chunk (#241 follow-up) took it from 18.4 MB to 8.7 MB, read a chunk at a time.
const MAX_BYTES = 9_000_000;

describe("bundled 'Mechs", () => {
    if (process.env.WRITE_BUNDLED_MECHS) {
        it("are rebuilt from the Skunk Werks and MegaMek files", () => {
            const build = buildBundledMechs(process.env.BUNDLED_SSW_DIR ?? DEFAULT_SSW_DIR, path.resolve(__dirname, "mul"),
                path.join(process.env.BUNDLED_MEGAMEK_DIR ?? DEFAULT_MEGAMEK_DIR, "meks"), loadCanonMechs(path.resolve(__dirname, "mordel", "canon-mechs.csv")));
            writeBundledMechs(build, dataDir);
            expect(build.headers.length).toBeGreaterThan(2500);
        }, 3_600_000);
        return;
    }

    it("list every design once, each in its chunk, at the pinned count and size", async () => {
        const headers = await loadBundledMechIndex();
        expect(headers).toHaveLength(DESIGNS);
        expect(headers.map((header) => header.id)).toEqual(headers.map((_header, index) => index));
        const files = fs.readdirSync(path.join(dataDir, "mechs"));
        expect(files).toHaveLength(Math.ceil(DESIGNS / BUNDLED_CHUNK_SIZE));
        const bytes = files.reduce((total, file) => total + fs.statSync(path.join(dataDir, "mechs", file)).size, fs.statSync(path.join(dataDir, "mechs-index.json")).size);
        expect(bytes).toBeLessThanOrEqual(MAX_BYTES);
        const keys = getBundledMechEntries(headers).map((entry) => (entry.chassis + " " + entry.model).toLowerCase());
        expect(new Set(keys).size).toBe(keys.length);
    });

    // Checked against the corrected MUL BV where the live MUL's is stale (#354).
    it("keep the IndustrialMechs whose live MUL BV is stale, at the corrected BV", async () => {
        const headers = await loadBundledMechIndex();
        const bv = (mulId: number) => headers.find((header) => header.mulId === mulId)?.bv;
        expect([103087, 107159, 108513, 100674, 106363].map(bv)).toEqual([352, 250, 350, 680, 826]);
        // #371: Nail/Rivet Gun ammo at 0 BV (TM p.317) and commercial armor at half (TM p.315).
        expect([102180, 101073, 100319].map(bv)).toEqual([1227, 1234, 73]);
        // MegaMek files with no cockpit line whose record sheets have a plain Industrial cockpit (no AFC).
        const byModel = (model: string) => headers.find((header) => header.model === model)?.bv;
        expect(["QUA-51T MilitiaMech", "HYN-4A SalvageMech", "HYN-4B SalvageMech"].map(byModel)).toEqual([670, 474, 398]);
    });

    // The build checked every design; a sample here catches an import or Battle Value change that needs a rebuild.
    it("load at the Battle Value, cost and tonnage they were built with (every 10th design)", async () => {
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
        const headers = await loadBundledMechIndex();
        const wrong: string[] = [];
        for (const header of headers.filter((_header, index) => index % 10 === 0)) {
            const mech = await loadBundledMechDesign(header);
            const got = { name: mech.getChassisName() + " " + mech.getModelName(), bv: mech.getBattleValue(), cost: mech.getCBillCostNumeric(), tons: mech.getTonnage() };
            const want = { name: header.name + " " + header.model, bv: header.bv, cost: header.cost, tons: header.tons };
            if (JSON.stringify(got) !== JSON.stringify(want)) wrong.push(`${want.name}: ${JSON.stringify(got)}`);
        }
        vi.restoreAllMocks();
        expect(wrong).toEqual([]);
    }, 300_000);
});
