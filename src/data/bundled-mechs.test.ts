import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { BUNDLED_CHUNK_SIZE } from "../utils/bundled-designs";
import { buildBundledMechs, DEFAULT_MEGAMEK_DIR, DEFAULT_SSW_DIR, writeBundledMechs } from "./bundled-mechs-build";
import { getBundledMechEntries, loadBundledMechDesign, loadBundledMechIndex } from "./bundled-mechs";

// The bundled 'Mechs (#241). Regenerate from the Skunk Werks and MegaMek files:
//   WRITE_BUNDLED_MECHS=1 npx vitest run src/data/bundled-mechs.test.ts
// The build imports every file, checks its BV against the Master Unit List (or the file) and its round trip through
// the compact format, and writes the designs that pass plus a report of the rest (bundled/mechs-report.md).
const dataDir = path.resolve(__dirname, "bundled");

// Pinned so a growing data set is a deliberate change.
const DESIGNS = 3549;
// Round 3 added MegaMek's 'Mechs, whose TRO text is long: about 1.8 MB gzipped, read a chunk at a time.
const MAX_BYTES = 19_500_000;

describe("bundled 'Mechs", () => {
    if (process.env.WRITE_BUNDLED_MECHS) {
        it("are rebuilt from the Skunk Werks and MegaMek files", () => {
            const build = buildBundledMechs(process.env.BUNDLED_SSW_DIR ?? DEFAULT_SSW_DIR, path.resolve(__dirname, "mul"),
                path.join(process.env.BUNDLED_MEGAMEK_DIR ?? DEFAULT_MEGAMEK_DIR, "meks"));
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
