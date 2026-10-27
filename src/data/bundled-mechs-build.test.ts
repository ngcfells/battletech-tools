import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import type { IASMULUnit } from "../classes/alpha-strike-unit";
import { buildBundledMechs, findLooseMULMatch, getBundledStanding, getRenumberedModel, isOfficialMULRecord, loadCanonMechs } from "./bundled-mechs-build";

// #241: canon is what the live MUL or MUL 1.0 lists. These records stand in for the MUL's own spellings of 'Mechs
// that Skunk Werks names another way (found by a scan of the bundled designs without a MUL id).
const record = (Id: number, Name: string, Variant: string, Tonnage: number, BattleValue: number) => ({ Id, Name, Variant, Tonnage, BattleValue }) as unknown as IASMULUnit;
const MUL = [
    record(1, "Centurion", "CN9-YLW \"Yen-lo-wang\"", 50, 957),
    record(2, "Centurion", "CN9-YLW2 \"Yen-lo-wang\"", 50, 1415),
    record(3, "Panther", "PNT-8Z", 35, 741),
    record(4, "Scorpion", "SCP-1O", 55, 1098),
    record(5, "Powerman", "SC XVI HaulerMech", 35, 198),
    record(6, "Powerman", "SC XI LoaderMech", 35, 198),
    record(7, "Powerman", "SC XV HaulerMech", 35, 198),
    record(8, "Rock Hound", "AM-PRM-RH7 ProspectorMech", 40, 0),
    record(9, "Rock Hound", "AM-PRM-RH7C \"Rock Possum\" ProspectorMech", 40, 0),
    record(10, "Rifleman", "RFL-4D", 60, 1173),
    record(11, "Tian-zong", "TNZ-N2 (Jasminda)", 75, 1826),
    record(12, "Marauder", "MAD-7R", 75, 1832),
];

it("finds the MUL record a 'Mech's other spelling stands for", () => {
    const find = (chassis: string, model: string, tons: number, bv: number) => findLooseMULMatch(chassis, model, tons, bv, MUL)?.Id;
    expect(find("Centurion", "CN9-YLW \"Yen Lo Wang\"", 50, 957)).toBe(1);
    // The same code and nickname with another BV is the same 'Mech: the build then leaves it out for its BV.
    expect(find("Centurion", "CN9-YLW2 \"Yen Lo Wang\"", 50, 1435)).toBe(2);
    expect(find("Scorpion", "SCP-10", 55, 1098)).toBe(4);
    expect(find("Powerman Loadermech", "SC XV", 35, 198)).toBe(7);
    expect(find("Powerman Loadermech", "SC XVI", 35, 198)).toBe(5);
    expect(find("\"Rock Possum\" ProspectorMech", "AM-PRM-RH7", 40, 479)).toBe(9);
    expect(find("\"Rock Hound\" ProspectorMech", "AM-PRM-RH7", 40, 523)).toBe(8);
    expect(find("Tian-Zong", "TNZ-N3 (Jasminda)", 75, 1826)).toBe(11);
    // Same BV, other numbers: another 'Mech.
    expect(find("Panther", "PNT-9Rh", 35, 741)).toBeUndefined();
    expect(find("Marauder", "MAD-3D (Sanchez)", 75, 1832)).toBeUndefined();
    // A pilot's own 'Mech the MUL does not list.
    expect(find("Rifleman", "RFL-4D (Cyrus)", 60, 1428)).toBeUndefined();
});

// #241: a different submodel under a kept design's name and model takes a free canon designation, else the next number.
it("renames a different submodel to a free canon designation or the next number", () => {
    const canon = [{ name: "Archer ARC-5S", tons: 70, bv: 1500 }, { name: "Archer ARC-6S", tons: 70, bv: 1650 }, { name: "Bane 12", tons: 100, bv: 3000 }];
    const none = () => false;
    expect(getRenumberedModel("Archer", "ARC-5S", 70, 1650, ["ARC-5S"], canon, none)).toBe("ARC-6S");
    expect(getRenumberedModel("Archer", "ARC-5S", 70, 1650, ["ARC-5S"], canon, (model) => model === "ARC-6S")).toBe("ARC-5S 2");
    expect(getRenumberedModel("Archer", "ARC-5S", 70, 1400, ["ARC-5S", "ARC-5S 2"], canon, none)).toBe("ARC-5S 3");
    expect(getRenumberedModel("Bane", "2", 100, 2900, ["1", "2"], canon, none)).toBe("13");
    expect(getRenumberedModel("Archer", "ARC-5S", 70, 1400, ["ARC-5S"], canon, (model) => model === "ARC-5S 2")).toBe("ARC-5S 3");
});

it("reads mordel's canon list, quotes and all", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "canon-mechs-")), "canon.csv");
    fs.writeFileSync(file, 'name,tons,bv\n"""Battle Tripod"" R/H3L-2X",60,1972\r\n"Atlas AS7-D",100,1897\n');
    expect(loadCanonMechs(file)).toEqual([{ name: '"Battle Tripod" R/H3L-2X', tons: 60, bv: 1972 }, { name: "Atlas AS7-D", tons: 100, bv: 1897 }]);
});

it("keeps a design from an official record sheet canon off the MUL, and a worse standing its gear gives", () => {
    const level = (rulesLevel: number) => ({ getRequiredRulesLevel: () => rulesLevel });
    expect(getBundledStanding("Shrapnel/Starhawk.ssw", level(1))).toEqual({});
    expect(getBundledStanding("megamek/Force Manuals/Davion/x.mtf", level(1))).toEqual({});
    expect(getBundledStanding("MWDA/Blade BLD-7R.ssw", level(1))).toEqual({});
    expect(getBundledStanding("TRO 3025/Atlas AS7-D.ssw", level(1))).toEqual({});
    expect(getBundledStanding("Videogame (Apocryphal)/x.mtf", level(1))).toEqual({ standing: "apocryphal" });
    expect(getBundledStanding("Misc/x.ssw", level(6))).toEqual({ standing: "custom" });
    expect(isOfficialMULRecord({ MulSource: "custom" } as IASMULUnit)).toBe(false);
    expect(isOfficialMULRecord({ MulSource: "mul1" } as IASMULUnit)).toBe(true);
});

// MegaMek keeps an OmniMech configuration in a file of its own; it is compared with that configuration of the kept
// Skunk Werks OmniMech, not with its base (Dire Wolf A was once reported as a design with "different equipment").
it("takes MegaMek's one-configuration file for a duplicate of the kept OmniMech's configuration", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bundled-mechs-build-"));
    const ssw = path.join(root, "ssw"), megamek = path.join(root, "megamek", "3050U");
    fs.mkdirSync(ssw, { recursive: true });
    fs.mkdirSync(megamek, { recursive: true });
    fs.copyFileSync(path.resolve(__dirname, "../utils/__fixtures__/dire-wolf-omni.ssw"), path.join(ssw, "dire-wolf-omni.ssw"));
    fs.copyFileSync(path.resolve(__dirname, "../utils/__fixtures__/daishi-dire-wolf-a.mtf"), path.join(megamek, "Daishi (Dire Wolf) A.mtf"));
    try {
        const build = buildBundledMechs(ssw, path.resolve(__dirname, "mul"), path.join(root, "megamek"));
        expect(build.headers.map((header) => header.name)).toEqual(["Dire Wolf (Daishi)"]);
        expect(build.leftOut).toEqual([expect.objectContaining({ file: "megamek/3050U/Daishi (Dire Wolf) A.mtf", reason: expect.stringMatching(/^duplicate of a design already kept/) })]);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}, 120_000);
