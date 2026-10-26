import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { BUNDLED_CHUNK_SIZE } from "../utils/bundled-designs";
import { writeBundledDesigns } from "./bundled-mechs-build";
import { BLK_KINDS, buildBundledUnits, DEFAULT_MEGAMEK_DIR, getBlkRulesLevel, MEGAMEK_NOTICE } from "./bundled-units-build";
import { BundledUnitType, loadBundledIndex, loadBundledUnitDesign } from "./bundled-units";

// The bundled battle armor, ProtoMechs, Small Craft and DropShips, and Support Vehicles (#241 round 2). Regenerate
// from MegaMek's unit files (about a minute):
//   WRITE_BUNDLED_UNITS=1 npx vitest run src/data/bundled-units.test.ts
// Each file is imported, its BV checked against the Master Unit List and its round trip through the compact format;
// the designs that pass are written, with a report of the rest (bundled/<type>-report.md).
const dataDir = path.resolve(__dirname, "bundled");

// Pinned so a growing data set is a deliberate change.
const DESIGNS: Record<BundledUnitType, number> = { "battle-armor": 820, "protomechs": 62, "small-craft": 30, "support-vehicles": 5 };

describe("bundled units other than 'Mechs", () => {
    if (process.env.WRITE_BUNDLED_UNITS) {
        it("are rebuilt from MegaMek's unit files", () => {
            const builds = buildBundledUnits(process.env.BUNDLED_MEGAMEK_DIR ?? DEFAULT_MEGAMEK_DIR, path.resolve(__dirname, "mul"));
            for (const [type, build] of Object.entries(builds)) writeBundledDesigns(type, BLK_KINDS[type as BundledUnitType].title, MEGAMEK_NOTICE, build, dataDir);
            expect(builds["battle-armor"].headers.length).toBeGreaterThan(500);
        }, 3_600_000);
        return;
    }

    it("reads MegaMek's rules levels as Skunk Werks'", () => {
        expect(["IS Level 1", "IS Level 2", "Clan Level 3", "IS Level 4", "IS Level 5"].map(getBlkRulesLevel)).toEqual([0, 1, 2, 3, 4]);
        expect(["Mixed (IS Chassis)", "Mixed (Clan Chassis) Advanced", "Mixed (IS Chassis) Experimental"].map(getBlkRulesLevel)).toEqual([1, 2, 3]);
    });

    for (const type of Object.keys(DESIGNS) as BundledUnitType[]) {
        it(`${type}: every design listed once, in its chunk, and loading at the BV and cost it was built with`, async () => {
            vi.spyOn(console, "log").mockImplementation(() => {});
            vi.spyOn(console, "warn").mockImplementation(() => {});
            const headers = await loadBundledIndex(type);
            expect(headers).toHaveLength(DESIGNS[type]);
            expect(headers.map((header) => header.id)).toEqual(headers.map((_header, index) => index));
            expect(fs.readdirSync(path.join(dataDir, type))).toHaveLength(Math.ceil(DESIGNS[type] / BUNDLED_CHUNK_SIZE));
            expect(headers.every((header) => header.source === "megamek" && header.mulId)).toBe(true);
            const wrong: string[] = [];
            for (const header of headers) {
                const unit = await loadBundledUnitDesign(type, header);
                const got = { name: unit.getName(), bv: unit.getBattleValue(), cost: unit.getCBillCost() };
                if (JSON.stringify(got) !== JSON.stringify({ name: header.name, bv: header.bv, cost: header.cost })) wrong.push(`${header.name} ${header.model}: ${JSON.stringify(got)}`);
            }
            vi.restoreAllMocks();
            expect(wrong).toEqual([]);
        }, 300_000);
    }
});
