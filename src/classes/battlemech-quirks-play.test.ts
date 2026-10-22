import { describe, expect, it } from "vitest";
import { getTargetToHitFromWeapon } from "../utils";
import { BattleMech } from "./battlemech";
import { BattleMechForce } from "./battlemech-force";

// Design quirks in Classic play (quirks design, plan 3): applied only with the game's "Use design quirks" switch on.
const SHORT_RANGE = { name: "Target", active: true, range: 1, movement: 0, otherMods: 0, jumped: false, primary: true, inRearArc: false };

const mechWith = (...tags: string[]): BattleMech => {
    const mech = new BattleMech();
    mech.setTonnage(50);
    mech.setWalkSpeed(4);
    for (const tag of tags) {
        mech.addEquipmentFromTag(tag, "is", "rt", false, undefined, "a", false, [], undefined, undefined);
    }
    return mech;
};

describe("quirk to-hit in the GATOR", () => {
    it("gives an Accurate medium laser one less to-hit, with the quirk named", () => {
        const mech = mechWith("medium-laser");
        const laser = mech.equipmentList[0];
        const plain = getTargetToHitFromWeapon(mech, 0, SHORT_RANGE, null, true).finalToHit;
        expect(mech.quirks.add({ tag: "quirk-accurate-weapon", equipmentUuid: laser.uuid })).toBeNull();
        const gator = getTargetToHitFromWeapon(mech, 0, SHORT_RANGE, null, true);
        expect(gator.finalToHit).toBe(plain - 1);
        expect(gator.otherModifiersExplanation).toContain("Accurate Weapon (-1)");
    });

    // Review Focus 3: switch off, or a save from before the switch.
    it("changes nothing with the switch off", () => {
        const mech = mechWith("medium-laser");
        const plain = getTargetToHitFromWeapon(mech, 0, SHORT_RANGE).finalToHit;
        mech.quirks.add({ tag: "quirk-accurate-weapon", equipmentUuid: mech.equipmentList[0].uuid });
        expect(getTargetToHitFromWeapon(mech, 0, SHORT_RANGE).finalToHit).toBe(plain);
        expect(getTargetToHitFromWeapon(mech, 0, SHORT_RANGE, null, false).otherModifiersExplanation ?? "").not.toContain("Accurate");
    });

    it("applies Improved Targeting only in its own range band", () => {
        const mech = mechWith("medium-laser");
        const long = { ...SHORT_RANGE, range: 9 };
        const plainShort = getTargetToHitFromWeapon(mech, 0, SHORT_RANGE, null, true).finalToHit;
        const plainLong = getTargetToHitFromWeapon(mech, 0, long, null, true).finalToHit;
        mech.quirks.add({ tag: "quirk-improved-targeting", parameter: "long" });
        expect(getTargetToHitFromWeapon(mech, 0, SHORT_RANGE, null, true).finalToHit).toBe(plainShort);
        expect(getTargetToHitFromWeapon(mech, 0, long, null, true).finalToHit).toBe(plainLong - 1);
    });

    it("leaves an out-of-range shot impossible", () => {
        const mech = mechWith("medium-laser");
        mech.quirks.add({ tag: "quirk-sensor-ghosts" });
        expect(getTargetToHitFromWeapon(mech, 0, { ...SHORT_RANGE, range: 30 }, null, true).finalToHit).toBe(-1);
    });
});

describe("Combat Computer heat", () => {
    // Review Focus 5: generated heat floors at 0 and never eats into dissipation.
    it("leaves 3 generated heat at 0, so only dissipation counts", () => {
        const mech = mechWith("small-laser", "small-laser");
        mech.currentMovementMode = "w";
        const dissipation = mech.getActiveHeatDissipation();
        expect(mech.getTurnHeatDifference(null, true)).toBe(3 - dissipation);
        mech.quirks.add({ tag: "quirk-combat-computer" });
        expect(mech.getTurnHeatDifference(null, true)).toBe(-dissipation);
        expect(mech.getTurnHeatDifference()).toBe(3 - dissipation);
    });
});

describe("the force's Heat Phase", () => {
    it("applies Combat Computer heat only with the game's switch on", () => {
        const heatAfterTurn = (quirksInPlay: boolean): number => {
            const force = new BattleMechForce();
            const mech = mechWith("medium-laser", "medium-laser", "medium-laser", "medium-laser", "medium-laser");
            mech.currentMovementMode = "r";
            mech.quirks.add({ tag: "quirk-combat-computer" });
            force.groups[0].members.push(mech);
            force.quirksInPlay = quirksInPlay;
            force.applyHeat();
            return mech.currentHeat;
        };
        expect(heatAfterTurn(false) - heatAfterTurn(true)).toBe(4);
    });
});
