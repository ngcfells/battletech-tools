import { describe, expect, it } from "vitest";
import AerospaceFighter from "./aerospace-fighter";
import BattledroidsUnit from "./battledroids-unit";
import { BattleMech } from "./battlemech";
import { BattleMechForce } from "./battlemech-force";
import { BattleMechGroup } from "./battlemech-group";
import Vehicle from "./vehicle";

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

    it("adds the force's TAG-guided ammo to each TAG carrier before skill (BV v4.1 p.23; TO:AUE p.198)", () => {
        const force = new BattleMechForce();
        const spotter = new Vehicle();
        spotter.addEquipmentFromTag("is-tag", "front");
        spotter.addEquipmentFromTag("is-tag", "turret");
        const launcher = new Vehicle();
        launcher.addEquipmentFromTag("lrm-10", "front");
        launcher.addEquipmentFromTag("ammo-is-lrm-semi-guided", "body");
        launcher.addEquipmentFromTag("ammo-is-lrm-semi-guided", "body");
        const bomber = new AerospaceFighter();
        bomber.setExternalStore("ammo-is-bomb-arrow-iv-homing", 1);
        const rearSpotter = new BattleMech();
        rearSpotter.addEquipmentByName("TAG", "is", "rt", true, null, undefined, []);
        force.groups[0].members.push(rearSpotter);
        force.groups[0].vehicles.push(spotter, launcher);
        force.newGroup();
        force.groups[1].fighters.push(bomber);

        // Semi-guided LRM ammo takes its launcher's ammo BV (2 tons x 11); the homing bomb its own 30. TO:AUE adds
        // the bonus once per TAG carried; a unit whose only TAG is rear-mounted adds half.
        expect(spotter.getBattleValueTagShare()).toEqual({ times: 2, ammo: 0 });
        expect(launcher.getBattleValueTagShare()).toEqual({ times: 0, ammo: 22 });
        expect(bomber.getBattleValueTagShare()).toEqual({ times: 0, ammo: 30 });
        expect(rearSpotter.getBattleValueTagShare()).toEqual({ times: 0.5, ammo: 0 });
        expect(spotter.getBattleValueTagShare("core-rulebook").times).toBe(0);

        const tw = "total-warfare";
        const guided = 22 + 30;
        expect(spotter.getPilotAdjustedBattleValue(tw, 2 * guided)).toBe(spotter.getPilotAdjustedBattleValue(tw) + 2 * guided);
        const total = spotter.getPilotAdjustedBattleValue(tw, 2 * guided) + launcher.getPilotAdjustedBattleValue(tw)
            + rearSpotter.getPilotAdjustedBattleValue(tw, guided / 2) + bomber.getPilotAdjustedBattleValue(tw);
        expect(force.getBattleValueText()).toBe(total.toLocaleString("en-US"));
        expect(force.groups[0].getTotalBattleValue(tw, force.groups) + force.groups[1].getTotalBattleValue(tw, force.groups)).toBe(total);
        // A group on its own counts only the guided ammo in it.
        expect(force.groups[0].getTotalBattleValue(tw)).toBe(spotter.getPilotAdjustedBattleValue(tw, 2 * 22)
            + launcher.getPilotAdjustedBattleValue(tw) + rearSpotter.getPilotAdjustedBattleValue(tw, 11));
    });
});
