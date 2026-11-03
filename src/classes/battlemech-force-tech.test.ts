import { describe, expect, it } from "vitest";
import BattledroidsUnit from "./battledroids-unit";
import { BattleMech } from "./battlemech";
import { BattleMechForce } from "./battlemech-force";
import { BattleMechGroup } from "./battlemech-group";

// The Tech line on the printed Classic BattleTech force (issue 18 roster review).
describe("Classic BattleTech force and group tech", () => {
    it("names a group of Battledroids units for their rulebook", () => {
        const group = new BattleMechGroup();
        group.battledroidsUnits.push(new BattledroidsUnit("scr-8n-scorpion"));
        expect(group.getTech()).toBe("Battledroids");
    });

    it("ignores an empty group instead of calling the force Mixed", () => {
        const force = new BattleMechForce();
        force.newGroup();
        force.groups[0].members.push(new BattleMech());
        force.newGroup();
        expect(force.getTech()).toBe(force.groups[0].getTech());
        expect(force.getTech()).not.toBe("Mixed");
    });
});

// The roster's rules edition (edition-aware BV plan, ruling 3): its Battle Values follow the edition being played.
describe("Classic BattleTech force rules edition", () => {
    it("totals Battle Value under the force's edition, and saves only an edition other than the default", () => {
        const force = new BattleMechForce();
        const mech = new BattleMech();
        force.groups[0].members.push(mech);
        const bv2 = mech.getPilotAdjustedBattleValue("total-warfare").toLocaleString("en-US");
        expect(force.getBattleValueText()).toBe(bv2);
        expect(force.export().rulesEdition).toBeUndefined();

        force.rulesEdition = "master-rules";
        expect(force.getBattleValueText()).toBe(`— (BV2: ${bv2})`);
        expect(force.groups[0].getBattleValueText(force.rulesEdition)).toBe(`— (BV2: ${bv2})`);
        expect(new BattleMechForce(JSON.parse(JSON.stringify(force.export()))).rulesEdition).toBe("master-rules");
        expect(new BattleMechForce({ ...force.export(), rulesEdition: "no-such-edition" }).rulesEdition).toBe("total-warfare");
    });
});
