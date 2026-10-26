import { afterEach, describe, expect, it } from "vitest";
import { isKnownEditionTag } from "./rules-editions";
import { btSpecialRulesets, findSpecialRuleset, getRulesetConflict, ISpecialRuleset } from "./special-rulesets";

const testRuleset = (id: string, changes: string[]): ISpecialRuleset => ({ id, name: id, description: "", source: { title: "test" }, changes });

describe("Special Rulesets (#324)", () => {
    afterEach(() => {
        for (const id of ["test-heat", "test-techs"]) {
            const index = btSpecialRulesets.findIndex((ruleset) => ruleset.id === id);
            if (index >= 0) {
                btSpecialRulesets.splice(index, 1);
            }
        }
    });

    it("ships the sample no-Clans universe", () => {
        const sample = findSpecialRuleset("sample-no-clans")!;
        expect(sample.name).toBe("Sample: The Clans never existed (alternate universe)");
        expect(sample.removesTechBases).toEqual(["clan", "mclan", "mis"]);
        expect(sample.changes).toEqual(["techBases"]);
    });

    it("finds a clash on a shared change, and none with itself or unrelated rulesets", () => {
        btSpecialRulesets.push(testRuleset("test-heat", ["heat"]), testRuleset("test-techs", ["techBases"]));
        expect(getRulesetConflict(["sample-no-clans"], "test-techs")?.id).toBe("sample-no-clans");
        expect(getRulesetConflict(["sample-no-clans"], "test-heat")).toBeUndefined();
        expect(getRulesetConflict(["sample-no-clans"], "sample-no-clans")).toBeUndefined();
    });
    it("names only editions that exist as a minimum edition", () => {
        for (const ruleset of btSpecialRulesets.filter((item) => item.minEdition)) {
            expect(isKnownEditionTag(ruleset.minEdition!), ruleset.id).toBe(true);
        }
    });
});
