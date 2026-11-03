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
        const bv1 = mech.getPilotAdjustedBattleValue("master-rules").toLocaleString("en-US");
        expect(force.getBattleValueText()).toBe(`${bv1} (BV2: ${bv2})`);
        expect(force.groups[0].getBattleValueText(force.rulesEdition)).toBe(`${bv1} (BV2: ${bv2})`);
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

    it("adds each C3 network's share to its members before skill (BV v4.1 p.23; TO:AUE p.198; CRB p.220)", () => {
        const force = new BattleMechForce();
        const master = new Vehicle();
        master.addEquipmentFromTag("c3-computer-master", "body");
        const boosted = new Vehicle();
        boosted.addEquipmentFromTag("c3-boosted-slave", "body");
        const slave = new BattleMech();
        slave.addEquipmentByName("C3 Computer (Slave)", "is", "ct", false, null, undefined, []);
        const loner = new Vehicle();
        loner.addEquipmentFromTag("c3-computer-slave", "body");
        const plain = new Vehicle();
        force.groups[0].vehicles.push(master, boosted, loner, plain);
        force.newGroup();
        force.groups[1].members.push(slave);
        expect([master, boosted, slave, plain].map((unit) => unit.getBattleValueC3Type())).toEqual(["standard", "boosted", "standard", undefined]);

        // A network spans groups; a unit alone in its network, or one with no C3 system, adds nothing.
        for (const unit of [master, boosted, slave, plain]) force.setC3Network(unit.getUUID(), "A");
        force.setC3Network(loner.getUUID(), "B");
        const tw = "total-warfare";
        const network = master.getBattleValue(tw) + boosted.getBattleValue(tw) + slave.getBattleValue(tw);
        expect(Math.min(master.getBattleValue(tw), boosted.getBattleValue(tw), slave.getBattleValue(tw))).toBeGreaterThan(0);
        const twTotal = master.getPilotAdjustedBattleValue(tw, network * 0.05) + boosted.getPilotAdjustedBattleValue(tw, network * 0.07)
            + slave.getPilotAdjustedBattleValue(tw, network * 0.05) + loner.getPilotAdjustedBattleValue(tw) + plain.getPilotAdjustedBattleValue(tw);
        expect(force.getBattleValueText()).toBe(twTotal.toLocaleString("en-US"));

        // The Core Rulebook: a three-unit network adds 15 percent of each member's own BV, boosted 5 more.
        const crb = "core-rulebook";
        const crbTotal = master.getPilotAdjustedBattleValue(crb, master.getBattleValue(crb) * 0.15)
            + boosted.getPilotAdjustedBattleValue(crb, boosted.getBattleValue(crb) * 0.2)
            + slave.getPilotAdjustedBattleValue(crb, slave.getBattleValue(crb) * 0.15) + loner.getPilotAdjustedBattleValue(crb) + plain.getPilotAdjustedBattleValue(crb);
        expect(force.groups[0].getTotalBattleValue(crb, force.groups, force.c3Networks)
            + force.groups[1].getTotalBattleValue(crb, force.groups, force.c3Networks)).toBe(crbTotal);

        // Saved per unit: a removed unit's entry is dropped, and clearing a unit's network removes it.
        force.groups[0].vehicles.pop();
        force.setC3Network(loner.getUUID(), "");
        const saved = JSON.parse(JSON.stringify(force.export()));
        expect(saved.c3Networks).toEqual({ [master.getUUID()]: "A", [boosted.getUUID()]: "A", [slave.getUUID()]: "A" });
        expect(new BattleMechForce(saved).c3Networks).toEqual(saved.c3Networks);
        expect(new BattleMechForce().export().c3Networks).toBeUndefined();
    });
});
