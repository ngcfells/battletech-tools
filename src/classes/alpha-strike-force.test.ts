import { describe, expect, it } from "vitest";
import AlphaStrikeForce from "./alpha-strike-force";
import { AlphaStrikeUnit } from "./alpha-strike-unit";

const groundUnit = (points: number): AlphaStrikeUnit => {
    const unit = new AlphaStrikeUnit();
    unit.move = [{ move: 8, currentMove: 8, type: "" }];
    unit.basePoints = points;
    return unit;
};

describe("the Alpha Strike force's member count", () => {
    it("counts every member of a group, not as many as there are groups", () => {
        const force = new AlphaStrikeForce();
        force.addToGroup(groundUnit(20));
        force.addToGroup(groundUnit(30));
        force.addToGroup(groundUnit(25));
        force.getActiveMembers();
        expect(force.activeMembers).toBe(3);
        expect(force.membersLabel).toBe(" (3/3)");
    });
});

describe("a unit added to an Alpha Strike force", () => {
    it("takes the force's design quirks switch at once", () => {
        const force = new AlphaStrikeForce();
        force.quirksInPlay = true;
        const unit = groundUnit(20);
        force.addToGroup(unit);
        expect(unit.quirksInPlay).toBe(true);
    });
});
