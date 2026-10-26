import { describe, expect, it } from "vitest";
import { DEFAULT_RULES_EDITION } from "../data/rules-editions";
import { BattleMech } from "./battlemech";

// Each 'Mech design keeps its own game settings (#324 call 1); old saves fall back to the app-wide level (call 2).
describe("BattleMech game settings (#324)", () => {
    it("an old save has no level of its own: it shows the app-wide one and loading writes nothing", () => {
        const mech = new BattleMech(JSON.stringify(new BattleMech().export()));
        expect(mech.getRulesLevel(3)).toBe(3);
        expect(mech.export().rulesLevel).toBeUndefined();
        expect(mech.export().rulesets).toBeUndefined();
    });

    it("keeps its level and rulesets through a save", () => {
        const mech = new BattleMech();
        mech.applyGameSettings({ ...mech.getGameSettings(2), rulesLevel: 4, rulesets: ["sample-no-clans"] });
        const loaded = new BattleMech(JSON.stringify(mech.export()));
        expect(loaded.getRulesLevel(2)).toBe(4);
        expect(loaded.getRulesets()).toEqual(["sample-no-clans"]);
    });

    it("applies edition, tech base and era in that order", () => {
        const mech = new BattleMech();
        mech.applyGameSettings({ ...mech.getGameSettings(2), techBase: "clan", era: "clan-inv" });
        expect(mech.getTech().tag).toBe("clan");
        expect(mech.getEra().tag).toBe("clan-inv");
        expect(mech.getGameSettings(2)).toMatchObject({ techBase: "clan", era: "clan-inv", edition: DEFAULT_RULES_EDITION });
    });

    it("a switch to Battledroids and back restores the design and keeps the new level", () => {
        const mech = new BattleMech();
        const before = JSON.stringify({ ...mech.export(), rulesLevel: undefined });
        mech.applyGameSettings({ ...mech.getGameSettings(2), edition: "battledroids", rulesLevel: 0 });
        expect(mech.getRulesEdition()).toBe("battledroids");
        expect(mech.getRulesLevel(2)).toBe(0);
        mech.applyGameSettings({ ...mech.getGameSettings(2), edition: DEFAULT_RULES_EDITION, rulesLevel: 1 });
        expect(mech.getRulesLevel(2)).toBe(1);
        expect(JSON.stringify({ ...mech.export(), rulesLevel: undefined })).toBe(before);
    });
});
