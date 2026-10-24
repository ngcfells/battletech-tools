import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AlphaStrikeUnit, IASMULUnit } from "../classes/alpha-strike-unit";

// The shipped live MUL records (src/data/mul/live) once had no BFThreshold, Rules or ImageUrl (#48).
const liveDir = "src/data/mul/live";
const liveRecords: IASMULUnit[] = readdirSync(liveDir).filter((file) => file.endsWith(".json"))
    .flatMap((file) => JSON.parse(readFileSync(`${liveDir}/${file}`, "utf8")) as IASMULUnit[]);
const find = (name: string, variant: string) => liveRecords.find((record) => record.Name === name && record.Variant === variant)!;

describe("the shipped live MUL records", () => {
    it("give an aerospace fighter its armor threshold, out of its special abilities", () => {
        const unit = new AlphaStrikeUnit();
        unit.importMUL(find("Lucifer", "LCF-R16"));
        expect(unit.threshold).toBe(2);
        expect(unit.abilities).not.toContain("TH 2");
        expect(unit.abilities).toContain("VSTOL");
    });

    it("keep the rules level, TRO and image of the legacy record they replaced", () => {
        const record = find("Lucifer", "LCF-R16");
        expect(record.Rules).toBe("Standard");
        expect(record.ImageUrl).toMatch(/^https:\/\//);
        const unit = new AlphaStrikeUnit();
        unit.importMUL(record);
        expect(unit.imageURL).toBe(record.ImageUrl);
        expect(unit.rulesLevel).toBe(2);
    });

    it("leave no threshold in any record's abilities", () => {
        expect(liveRecords.filter((record) => /(^|,)\s*TH\s*\d/.test(record.BFAbilities ?? "")).map((record) => record.Name)).toEqual([]);
        expect(liveRecords.every((record) => typeof record.BFThreshold === "number")).toBe(true);
    });
});
