import { afterEach, describe, expect, it } from "vitest";
import { changeGameSetting, describeGameSettingMove, getGameSettingOptions, IGameSettings } from "./game-settings";
import { btSpecialRulesets } from "./special-rulesets";
import { DEFAULT_RULES_EDITION, getRulesLevelOptionsForEdition, getSelectableRulesEditions } from "./rules-editions";
import { findEraByTag, getClosestEraForTech, getErasForTech } from "./era-options";

const base: IGameSettings = { rulesets: [], edition: DEFAULT_RULES_EDITION, rulesLevel: 1, techBase: "clan", era: "clan-inv" };

describe("shared game settings (#324)", () => {
    afterEach(() => {
        const index = btSpecialRulesets.findIndex((ruleset) => ruleset.id === "test-techs");
        if (index >= 0) {
            btSpecialRulesets.splice(index, 1);
        }
    });

    it("offers no Clan or Mixed tech once the no-Clans universe is ticked, and moves the tech base and era down", () => {
        const result = changeGameSetting(base, { step: "rulesets", toggle: "sample-no-clans" }, "mech");
        expect(result.settings.rulesets).toEqual(["sample-no-clans"]);
        expect(result.settings.techBase).toBe("is");
        expect(result.moves.map((move) => move.step)).toEqual(["techBase"]);
        expect(getGameSettingOptions(result.settings, "mech").techBases).toEqual(["is"]);
    });

    it("never moves a step above the one changed", () => {
        const result = changeGameSetting(base, { step: "techBase", value: "is" }, "mech");
        expect(result.settings.edition).toBe(base.edition);
        expect(result.settings.rulesLevel).toBe(base.rulesLevel);
        expect(result.settings.techBase).toBe("is");
    });

    it("reports a chain of moves in step order", () => {
        const result = changeGameSetting({ ...base, techBase: "is", era: "star-league" }, { step: "techBase", value: "clan" }, "mech");
        const expected = getClosestEraForTech(findEraByTag("star-league")!, "clan");
        expect(expected.tag).not.toBe("star-league");
        expect(result.moves).toEqual([{ step: "era", from: "star-league", to: expected.tag }]);
        expect(describeGameSettingMove(result.moves[0])).toBe("Era moved to " + expected.name);
    });

    it("leaves a stored value alone until an edit", () => {
        const stored: IGameSettings = { ...base, rulesets: ["sample-no-clans"] };
        const before = structuredClone(stored);
        getGameSettingOptions(stored, "mech");
        expect(stored).toEqual(before);
    });

    it("unticking a ruleset moves nothing still valid", () => {
        const on = changeGameSetting(base, { step: "rulesets", toggle: "sample-no-clans" }, "mech");
        const off = changeGameSetting(on.settings, { step: "rulesets", toggle: "sample-no-clans" }, "mech");
        expect(off.settings.rulesets).toEqual([]);
        expect(off.moves).toEqual([]);
    });

    it("hides eras under an edition without them and keeps the stored era", () => {
        const noEras = getSelectableRulesEditions("mech").find((edition) => edition.noEras)!;
        const result = changeGameSetting(base, { step: "edition", value: noEras.tag }, "mech");
        expect(getGameSettingOptions(result.settings, "mech").eras).toEqual([]);
        expect(result.settings.era).toBe(base.era);
        expect(result.moves.map((move) => move.step)).not.toContain("era");
    });

    it("refuses a ruleset that clashes with one already ticked", () => {
        btSpecialRulesets.push({ id: "test-techs", name: "test", description: "", source: { title: "test" }, changes: ["techBases"] });
        const ticked: IGameSettings = { ...base, techBase: "is", rulesets: ["sample-no-clans"] };
        const result = changeGameSetting(ticked, { step: "rulesets", toggle: "test-techs" }, "mech");
        expect(result.refused?.id).toBe("sample-no-clans");
        expect(result.settings).toEqual(ticked);
        expect(result.moves).toEqual([]);
    });
    // Final review fixes.
    it("moves an unknown edition to the default edition, not the oldest", () => {
        const result = changeGameSetting({ ...base, edition: "edition-from-the-future" }, { step: "rulesets", toggle: "sample-no-clans" }, "mech");
        expect(result.settings.edition).toBe(DEFAULT_RULES_EDITION);
    });

    it("ignores a ruleset id the registry does not know", () => {
        const result = changeGameSetting(base, { step: "rulesets", toggle: "no-such-ruleset" }, "mech");
        expect(result.settings).toEqual(base);
        expect(result.moves).toEqual([]);
    });

    it("stores a rules level picked from a select as a number, with no move", () => {
        const result = changeGameSetting(base, { step: "rulesLevel", value: "3" }, "mech");
        expect(result.settings.rulesLevel).toBe(3);
        expect(result.moves).toEqual([]);
    });

    it("fits an edited value the lists do not offer", () => {
        const ticked: IGameSettings = { ...base, techBase: "is", rulesets: ["sample-no-clans"] };
        const result = changeGameSetting(ticked, { step: "techBase", value: "clan" }, "mech");
        expect(result.settings.techBase).toBe("is");
    });

    it("moves an unknown era to an era the tech base offers", () => {
        const result = changeGameSetting({ ...base, era: "no-such-era" }, { step: "techBase", value: "clan" }, "mech");
        expect(getErasForTech("clan").map((era) => era.tag)).toContain(result.settings.era);
    });

    it("moves the rules level when the edition does not list it, then reports each move in step order", () => {
        const battledroids = getSelectableRulesEditions("mech").find((edition) => edition.noEras)!;
        const result = changeGameSetting({ ...base, rulesLevel: 3 }, { step: "edition", value: battledroids.tag }, "mech");
        expect(result.moves.map((move) => move.step)).toEqual(["rulesLevel"]);
        expect(getRulesLevelOptionsForEdition(battledroids.tag).map((level) => level.id)).toContain(result.settings.rulesLevel);
    });

    it("drops editions before a ruleset's minimum edition", () => {
        btSpecialRulesets.push({ id: "test-techs", name: "test", description: "", source: { title: "test" }, minEdition: DEFAULT_RULES_EDITION, changes: ["edition"] });
        const tags = getGameSettingOptions({ ...base, rulesets: ["test-techs"] }, "mech").editions.map((edition) => edition.tag);
        expect(tags[0]).toBe(DEFAULT_RULES_EDITION);
        expect(tags).not.toContain("battledroids");
    });
});
