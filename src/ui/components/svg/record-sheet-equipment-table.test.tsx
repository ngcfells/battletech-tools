import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BattleMech } from "../../../classes/battlemech";
import RecordSheetEquipmentTable from "./record-sheet-equipment-table";

// The live sheet in Play Mode shows the same to-hit as the attack list, quirks included (quirks plan 3, final review).
describe("the in-play record sheet's to-hit numbers", () => {
    const accurateLaser = (): BattleMech => {
        const mech = new BattleMech();
        mech.setTonnage(50);
        mech.setWalkSpeed(4);
        mech.addEquipmentFromTag("medium-laser", "is", "rt", false, undefined, "a", false, [], undefined, undefined);
        const laser = mech.equipmentList[0];
        laser.target = "a";
        const target = mech.getTarget("a");
        if (target) target.range = 1;
        expect(mech.quirks.add({ tag: "quirk-accurate-weapon", equipmentUuid: laser.uuid })).toBeNull();
        return mech;
    };
    const toHit = (quirksInPlay: boolean): number => {
        const markup = renderToStaticMarkup(
            <svg><RecordSheetEquipmentTable mechData={accurateLaser()} inPlay={true} quirksInPlay={quirksInPlay} xLoc={0} yLoc={0} width={1215} height={645} /></svg>,
        );
        const match = markup.match(/>(\d+)\+</);
        expect(match).not.toBeNull();
        return Number(match![1]);
    };

    it("takes 1 off an Accurate Weapon's to-hit with the game's switch on, and not with it off", () => {
        expect(toHit(true)).toBe(toHit(false) - 1);
    });
});
