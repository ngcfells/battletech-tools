import { describe, expect, it } from "vitest";
import { IASMULUnit } from "../classes/alpha-strike-unit";
import { btSpecialRulesets } from "../data/special-rulesets";
import { getMULEraAliases, getMULEraIDs } from "./mulUtilities";
import { changeMULSearchFilters, filterMULByRulesets, isMULEraOffered, isMULTechOffered, isMULTypeOffered, newMULSearchFilters } from "./mulSearchFilters";

const NO_CLANS = "sample-no-clans";
const aliasId = (name: string) => getMULEraAliases().find((alias) => alias.label.startsWith(name))!.id;
const unit = (techId: number, typeId: number) => ({ Technology: { Id: techId }, Type: { Id: typeId } }) as unknown as IASMULUnit;

describe("MUL search rulesets (#324 round 4)", () => {
    it("offers every tech, type and era with no rulesets", () => {
        expect(["", "inner sphere", "clan"].every((tech) => isMULTechOffered(tech, []))).toBe(true);
        expect([0, 18, 23, 1701].every((type) => isMULTypeOffered(type, []))).toBe(true);
        expect([...getMULEraIDs(), ...getMULEraAliases().map((alias) => alias.id)].every((era) => isMULEraOffered(era, "", []))).toBe(true);
    });

    it("no-Clans removes Clan tech, the ProtoMech type and the Clan era aliases", () => {
        expect(isMULTechOffered("clan", [NO_CLANS])).toBe(false);
        expect(isMULTechOffered("inner sphere", [NO_CLANS])).toBe(true);
        expect(isMULTypeOffered(23, [NO_CLANS])).toBe(false);
        expect(isMULTypeOffered(18, [NO_CLANS])).toBe(true);
        expect(getMULEraAliases().some((alias) => isMULEraOffered(alias.id, "", [NO_CLANS]))).toBe(false);
        expect(getMULEraIDs().every((era) => isMULEraOffered(era, "", [NO_CLANS]))).toBe(true);
    });

    it("Clan tech offers no Age of War or Star League", () => {
        expect(isMULEraOffered(1, "clan", [])).toBe(false);
        expect(isMULEraOffered(10, "clan", [])).toBe(false);
        expect(isMULEraOffered(11, "clan", [])).toBe(true);
        expect(isMULEraOffered(13, "clan", [])).toBe(true);
    });

    it("Inner Sphere tech offers no Clan era aliases", () => {
        expect(isMULEraOffered(aliasId("Clan Golden Years"), "inner sphere", [])).toBe(false);
    });

    it("ticking no-Clans moves Tech, Type and Era with notices", () => {
        const start = newMULSearchFilters({ tech: "clan", type: 23, era: aliasId("Clan Golden Years") });
        const { filters, moves } = changeMULSearchFilters(start, { rulesets: [NO_CLANS] });
        expect(filters).toMatchObject({ rulesets: [NO_CLANS], tech: "", type: 0, era: 11 });
        expect(moves).toEqual(["Tech moved to All", "Type moved to All", "Era moved to Early Succession War"]);
    });

    it("picking Clan tech moves Star League to Early Succession War", () => {
        const { filters, moves } = changeMULSearchFilters(newMULSearchFilters({ era: 10 }), { tech: "clan" });
        expect(filters.era).toBe(11);
        expect(moves).toEqual(["Era moved to Early Succession War"]);
    });

    it("an unknown ruleset id is dropped", () => {
        expect(changeMULSearchFilters(newMULSearchFilters(), { rulesets: [NO_CLANS, "unknown-ruleset"] }).filters.rulesets).toEqual([NO_CLANS]);
    });

    it("a ruleset that clashes with one already ticked is dropped and named", () => {
        btSpecialRulesets.push({ id: "test-clash", name: "Test clash", description: "", source: { title: "test" }, changes: ["techBases"] });
        try {
            const { filters, moves } = changeMULSearchFilters(newMULSearchFilters({ rulesets: [NO_CLANS] }), { rulesets: [NO_CLANS, "test-clash"] });
            expect(filters.rulesets).toEqual([NO_CLANS]);
            expect(moves).toEqual(["Clashes with Sample: The Clans never existed (alternate universe)"]);
        } finally {
            btSpecialRulesets.splice(btSpecialRulesets.findIndex((ruleset) => ruleset.id === "test-clash"), 1);
        }
    });

    it("unticking does not move values back", () => {
        const ticked = changeMULSearchFilters(newMULSearchFilters({ tech: "clan", type: 23 }), { rulesets: [NO_CLANS] }).filters;
        const { filters, moves } = changeMULSearchFilters(ticked, { rulesets: [] });
        expect(filters).toMatchObject({ rulesets: [], tech: "", type: 0 });
        expect(moves).toEqual([]);
    });

    it("leaves the edited step itself alone and reports no move for it", () => {
        const { filters, moves } = changeMULSearchFilters(newMULSearchFilters({ rulesets: [NO_CLANS] }), { era: 10 });
        expect(filters.era).toBe(10);
        expect(moves).toEqual([]);
    });

    it("filterMULByRulesets drops Clan, Mixed and ProtoMech units, keeps Inner Sphere and Primitive", () => {
        const units = [unit(1, 18), unit(2, 18), unit(3, 19), unit(57, 18), unit(1, 23)];
        expect(filterMULByRulesets(units, [NO_CLANS])).toEqual([units[0], units[3]]);
        expect(filterMULByRulesets(units, [])).toEqual(units);
    });
});
