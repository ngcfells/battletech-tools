import { describe, expect, it } from "vitest";
import { BattleMech } from "./battlemech";

const tags = (mech: BattleMech) => mech.quirks.getAll().map((quirk) => quirk.tag);

describe("BattleMech.applyCanonQuirks", () => {
    it("adds the chassis' canon quirks once, keeping the player's own", () => {
        const mech = new BattleMech();
        mech.setModel("Atlas");
        expect(mech.quirks.add({ tag: "quirk-easy-to-pilot" })).toBeNull();
        expect(mech.applyCanonQuirks()).toEqual({ added: 4, notes: [] });
        expect(mech.applyCanonQuirks()?.added).toBe(0);
        expect(tags(mech)).toEqual(["quirk-easy-to-pilot", "quirk-battlefists", "quirk-command-mech", "quirk-distracting", "quirk-improved-communications"]);
    });

    it("returns null for a chassis the table does not list", () => {
        const mech = new BattleMech();
        mech.setModel("No Such 'Mech");
        expect(mech.hasCanonQuirks()).toBe(false);
        expect(mech.applyCanonQuirks()).toBeNull();
        expect(mech.quirks.getAll()).toEqual([]);
    });

    it("puts a weapon quirk on the named weapons in the named location only", () => {
        const mech = new BattleMech();
        mech.setModel("Avatar");
        const ct1 = mech.addEquipmentFromTag("medium-laser", "is", "ct", false, undefined, "", false, [], undefined, undefined)!;
        const ct2 = mech.addEquipmentFromTag("medium-laser", "is", "ct", false, undefined, "", false, [], undefined, undefined)!;
        mech.addEquipmentFromTag("medium-laser", "is", "ra", false, undefined, "", false, [], undefined, undefined);
        expect(mech.applyCanonQuirks()).toEqual({ added: 2, notes: [] });
        expect(mech.quirks.getAll()).toEqual([
            { tag: "quirk-stabilized-weapon", equipmentUuid: ct1.uuid },
            { tag: "quirk-stabilized-weapon", equipmentUuid: ct2.uuid },
        ]);
    });

    it("matches a Clan weapon and a Clan-only quirk on a Clan 'Mech", () => {
        const mech = new BattleMech();
        mech.setTech("clan");
        mech.setModel("Stag");
        const laser = mech.addEquipmentFromTag("clan-er-large-laser", "clan", "ra", false, undefined, "", false, [], undefined, undefined)!;
        const result = mech.applyCanonQuirks();
        expect(result?.notes).toEqual([]);
        expect(mech.quirks.getAll()).toContainEqual({ tag: "quirk-stabilized-weapon", equipmentUuid: laser.uuid });
        expect(tags(mech)).toContain("quirk-bad-reputation");
    });

    it("finds a Clan 'Mech by its other name", () => {
        const mech = new BattleMech();
        mech.setModel("Timber Wolf");
        expect(mech.hasCanonQuirks()).toBe(true);
    });
});
