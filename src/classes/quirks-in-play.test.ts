import { describe, expect, it } from "vitest";
import AlphaStrikeForce, { IASForceExport } from "./alpha-strike-force";
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
