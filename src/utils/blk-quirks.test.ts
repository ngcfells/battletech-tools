import { describe, expect, it } from "vitest";
import { IQuirkTargets } from "../data/quirk-interfaces";
import { parseBlkFile } from "./blk-file";
import { blkWeaponFinder, readBlkQuirks } from "./blk-quirks";

const targets: IQuirkTargets = {
    locations: [{ tag: "nose", label: "Nose" }, { tag: "body", label: "Body" }],
    weapons: [{ uuid: "mg", label: "Light Machine Gun", maxDamage: 1 }],
    unitMaxDamage: 13,
    bays: [{ uuids: ["l1", "l2"], label: "Lasers (Nose)", maxDamage: 13 }],
};
const weaponAt = blkWeaponFinder([
    { name: "CLBALightMG", location: "body", uuid: "mg" },
    { name: "LargeLaser", location: "nose", uuid: "l1" },
    { name: "MediumLaser", location: "nose", uuid: "l2" },
], (abbr) => ({ squad: "body", nos: "nose" } as Record<string, string>)[abbr.toLowerCase()]);
const read = (text: string) => readBlkQuirks(parseBlkFile(text)!, { targets, weaponAt });

describe("readBlkQuirks", () => {
    it("reads unit quirks and weapon quirks from a BLK file", () => {
        const result = read([
            "<UnitType>", "BattleArmor", "</UnitType>",
            "<quirks>", "low_profile", "rugged_2", "imp_target_med", "</quirks>",
            "<weaponQuirks>", "accurate:Squad:1:CLBALightMG", "</weaponQuirks>",
        ].join("\n"));
        expect(result.issues).toEqual([]);
        expect(result.quirks).toEqual([
            { tag: "quirk-narrow-low-profile" },
            { tag: "quirk-rugged", parameter: 2 },
            { tag: "quirk-improved-targeting", parameter: "medium" },
            { tag: "quirk-accurate-weapon", equipmentUuid: "mg" },
        ]);
    });

    it("puts a weapon quirk on a bay weapon's whole bay", () => {
        expect(read("<weaponQuirks>\nstable_weapon:NOS:0:MediumLaser\n</weaponQuirks>").quirks).toEqual([{ tag: "quirk-stabilized-weapon", bayUuids: ["l1", "l2"] }]);
    });

    it("lists an unknown code in issues and keeps going", () => {
        const result = read("<quirks>\nanimalistic\nstable\n</quirks>\n<weaponQuirks>\nmisrepaired_weapon:Squad:1:CLBALightMG\nnot a line\n</weaponQuirks>");
        expect(result.quirks).toEqual([{ tag: "quirk-stable" }]);
        expect(result.issues).toEqual([
            "Quirk 'animalistic' is not one this builder knows: left off.",
            "Quirk 'misrepaired_weapon' is not one this builder knows: left off.",
            "Weapon quirk line 'not a line' could not be read: left off.",
        ]);
    });

    it("lists a weapon quirk whose weapon is not on the unit in issues", () => {
        const result = read("<weaponQuirks>\naccurate:NOS:3:ISPPC\naccurate:Squad:1:MediumLaser\n</weaponQuirks>");
        expect(result.quirks).toEqual([]);
        expect(result.issues).toEqual([
            "Accurate Weapon: no ISPPC in NOS on this unit, left off.",
            "Accurate Weapon: no MediumLaser in Squad on this unit, left off.",
        ]);
    });
});
