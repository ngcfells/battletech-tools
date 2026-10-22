import { describe, expect, it } from "vitest";
import AlphaStrikeForce, { IASForceExport } from "./alpha-strike-force";
import { BattleMech } from "./battlemech";
import { BattleMechForce, ICBTForceExport } from "./battlemech-force";

// "Use design quirks": a per-game switch, saved with the force, off by default (quirks design, plan 3).
describe("the Classic force's design quirks switch", () => {
    it("is off on a new force", () => {
        expect(new BattleMechForce().quirksInPlay).toBe(false);
    });

    it("saves and reloads the switch", () => {
        const force = new BattleMechForce();
        force.quirksInPlay = true;
        expect(new BattleMechForce(JSON.parse(JSON.stringify(force.export()))).quirksInPlay).toBe(true);
    });

    it("loads a force saved before the switch with it off", () => {
        const old = new BattleMechForce().export();
        delete (old as Partial<ICBTForceExport>).quirksInPlay;
        expect(new BattleMechForce(old).quirksInPlay).toBe(false);
    });
});

describe("the Alpha Strike force's design quirks switch", () => {
    it("is off on a new force", () => {
        expect(new AlphaStrikeForce().quirksInPlay).toBe(false);
    });

    it("saves and reloads the switch", () => {
        const force = new AlphaStrikeForce();
        force.quirksInPlay = true;
        expect(new AlphaStrikeForce(JSON.parse(JSON.stringify(force.export()))).quirksInPlay).toBe(true);
    });

    it("loads a force saved before the switch with it off", () => {
        const old = new AlphaStrikeForce().export();
        delete (old as Partial<IASForceExport>).quirksInPlay;
        expect(new AlphaStrikeForce(old).quirksInPlay).toBe(false);
    });
});

// A side's Initiative takes its largest quirk, never the sum (CO p.225).
describe("the Classic force's quirk Initiative", () => {
    const mechWithQuirk = (tag: string): BattleMech => {
        const mech = new BattleMech();
        mech.setTonnage(50);
        mech.setWalkSpeed(4);
        expect(mech.quirks.add({ tag })).toBeNull();
        return mech;
    };

    // Review Focus 4.
    it("gives +2 for a Command 'Mech and a Battle Computer, and +1 once the Battle Computer 'Mech is destroyed", () => {
        const force = new BattleMechForce();
        const battleComputer = mechWithQuirk("quirk-battle-computer");
        force.groups[0].members.push(mechWithQuirk("quirk-command-mech"), battleComputer);
        expect(force.getInitiativeModifier()).toEqual({ modifier: 2, label: "Battle Computer (+2)", title: "Battle Computer" });
        battleComputer.pilot.wounds = 6;
        expect(force.getInitiativeModifier()).toEqual({ modifier: 1, label: "Command 'Mech (+1)", title: "Command 'Mech" });
    });

    it("gives nothing for a side without an Initiative quirk", () => {
        const force = new BattleMechForce();
        force.groups[0].members.push(new BattleMech());
        expect(force.getInitiativeModifier()).toBeNull();
    });
});
