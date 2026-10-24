import { describe, expect, it } from "vitest";
import { buildClassicDesignIndex, findClassicDesign, getMULMatchKeys, isMULLargeAerospaceCraft } from "./classicMULMatch";

describe("getMULMatchKeys", () => {
    it("drops quotes, parentheses and HTML entities so MUL and Skunk Werks spellings meet", () => {
        expect(getMULMatchKeys("Catapult", 'CPLT-C1 (Jenny) "Butterbee"')).toEqual(["catapult cplt-c1 jenny butterbee"]);
        expect(getMULMatchKeys("Catapult", "CPLT-C1 (Jenny) &quot;Butterbee&quot;")).toEqual(["catapult cplt-c1 jenny butterbee"]);
        expect(getMULMatchKeys("Stalker", "STK-3F (Jamison)")).toEqual(getMULMatchKeys("Stalker", "STK-3F Jamison"));
    });

    it("gives a key for each name of a chassis with an alternate name in parentheses", () => {
        expect(getMULMatchKeys("Mad Cat (Timber Wolf)", "Prime")).toEqual([
            "mad cat timber wolf prime",
            "mad cat prime",
            "timber wolf prime",
        ]);
    });
});

describe("findClassicDesign", () => {
    const unit = (Name: string, Variant: string) => ({ Name, Variant });

    it("finds a design under either name of the chassis", () => {
        const index = buildClassicDesignIndex([{ chassis: "Timber Wolf", model: "Prime", design: "tw" }]);
        expect(findClassicDesign(unit("Mad Cat (Timber Wolf)", "Prime"), index)).toBe("tw");
    });

    it("prefers the entry given first, so saved designs win over bundled ones", () => {
        const index = buildClassicDesignIndex([
            { chassis: "Atlas", model: "AS7-D", design: "saved" },
            { chassis: "Atlas", model: "AS7-D", design: "bundled" },
        ]);
        expect(findClassicDesign(unit("Atlas", "AS7-D"), index)).toBe("saved");
    });

    it("returns null when no design matches", () => {
        const index = buildClassicDesignIndex([{ chassis: "Atlas", model: "AS7-D", design: "a" }]);
        expect(findClassicDesign(unit("Atlas", "AS7-K"), index)).toBeNull();
    });
});

describe("isMULLargeAerospaceCraft", () => {
    const unit = (type: { Id: number; Name: string }, tonnage: number, unitType?: string) => ({
        Type: { ...type, Image: null, SortOrder: 0 },
        Tonnage: tonnage,
        ...(unitType ? { Mul1Page: { Fields: { "Unit Type": unitType } } } : {}),
    }) as unknown as Parameters<typeof isMULLargeAerospaceCraft>[0];
    it("tells the live MUL's Aerospace Craft from its Fighter Craft", () => {
        expect(isMULLargeAerospaceCraft(unit({ Id: 17, Name: "Aerospace Craft" }, 200))).toBe(true);
        expect(isMULLargeAerospaceCraft(unit({ Id: 17, Name: "Aerospace Craft" }, 0))).toBe(true);
        expect(isMULLargeAerospaceCraft(unit({ Id: 17, Name: "Fighter Craft" }, 100))).toBe(false);
    });
    it("reads the older MUL's Unit Type, else the tonnage", () => {
        expect(isMULLargeAerospaceCraft(unit({ Id: 17, Name: "Aerospace" }, 0, "Aerospace - Small Craft"))).toBe(true);
        expect(isMULLargeAerospaceCraft(unit({ Id: 17, Name: "Aerospace" }, 50, "Aerospace - Aerospace Fighter"))).toBe(false);
        expect(isMULLargeAerospaceCraft(unit({ Id: 17, Name: "Aerospace" }, 3500))).toBe(true);
        expect(isMULLargeAerospaceCraft(unit({ Id: 17, Name: "Aerospace" }, 75))).toBe(false);
    });
    it("is never true outside type 17", () => {
        expect(isMULLargeAerospaceCraft(unit({ Id: 18, Name: "BattleMech" }, 200))).toBe(false);
    });
});
