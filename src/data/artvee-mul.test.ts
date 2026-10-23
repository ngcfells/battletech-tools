import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { IASMULUnit } from "../classes/alpha-strike-unit";
import { buildArtVeeMULRecords } from "./artvee-mul";
import { ARTVEE_SAMPLES } from "./artvee-samples";
import { loadMULListItems } from "./mul-list-items";
import { CUSTOM_MUL_FILE_PATH, mergeCustomMULEntries } from "./custom-mul";

// The sample ArtVees ride in the shared custom unit list. Regenerate after changing a sample:
//   WRITE_ARTVEE_MUL=1 npx vitest run src/data/artvee-mul.test.ts
const listPath = path.resolve(__dirname, "..", "..", CUSTOM_MUL_FILE_PATH);

describe("ArtVees in the custom unit list", () => {
    const built = buildArtVeeMULRecords();

    if (process.env.WRITE_ARTVEE_MUL) {
        fs.writeFileSync(listPath, mergeCustomMULEntries(fs.readFileSync(listPath, "utf8"), built));
    }

    it("carries every ArtVee sample with the stats the Vehicle Creator converts to", () => {
        const list: IASMULUnit[] = JSON.parse(fs.readFileSync(listPath, "utf8"));
        expect(built).toHaveLength(ARTVEE_SAMPLES.length);
        for (const record of built) {
            expect(list.find((entry) => entry.MulUnitKey === record.MulUnitKey)).toEqual(record);
        }
    });

    it("gives each one a real card: a vehicle with a point value, movement and an era", () => {
        for (const record of built) {
            expect(record.Type.Id).toBe(19);
            expect(record.BFPointValue).toBeGreaterThan(0);
            expect(record.BFMove).toMatch(/^\d+"[a-z]+/);
            expect(record.EraId).toBeGreaterThan(0);
        }
    });

    // The MUL prints minimal indirect fire as IF0* and leaves out a rear arc with no damage; it never shows IF0 or
    // REAR-/-/-, which the conversion gave the Archerfish and the rear-searchlight ArtVees.
    it("writes their specials the way the MUL does", () => {
        for (const record of built) {
            const codes = (record.BFAbilities ?? "").split(",");
            expect(codes).not.toContain("IF0");
            expect(codes.some((code) => /^REAR-(\/-)*$/.test(code))).toBe(false);
        }
        expect(built.find((record) => record.Name === "Archerfish ArtVee")?.BFAbilities?.split(",")).toContain("IF0*");
    });

    it("loads them only when Custom units is ticked", async () => {
        const key = built[0].MulUnitKey;
        expect((await loadMULListItems(["custom"])).some((unit) => unit.MulUnitKey === key)).toBe(true);
        expect((await loadMULListItems(["mul2", "mul1"])).some((unit) => unit.MulUnitKey === key)).toBe(false);
    }, 30_000);
});
