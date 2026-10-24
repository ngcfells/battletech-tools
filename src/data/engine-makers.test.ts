import { describe, expect, it } from "vitest";
import { getEngineTableMaker } from "./engine-makers";

// The Engine Table names a maker for every rating: BD p.23 ("Name"), BT2 p.37 ("Manufacturer").
describe("Engine Table makers", () => {
    it("names a maker for all 79 ratings in Battledroids and BattleTech, Second Edition", () => {
        for (const edition of ["battledroids", "battletech-2nd-edition"]) {
            for (let rating = 10; rating <= 400; rating += 5) {
                expect(getEngineTableMaker(edition, rating), `${edition} ${rating}`).toMatch(/^[A-Z]/);
            }
        }
    });

    it("matches the page: the worked example's Pitban 240 and the record listings' engines", () => {
        expect(getEngineTableMaker("battledroids", 240)).toBe("Pitban");
        expect(getEngineTableMaker("battledroids", 10)).toBe("Omni");
        expect(getEngineTableMaker("battledroids", 400)).toBe("LTV");
        // BT2 p.37 record listings: MAD-3R "300 Vlar", TDR-5S "260 Magna".
        expect(getEngineTableMaker("battletech-2nd-edition", 300)).toBe("Vlar");
        expect(getEngineTableMaker("battletech-2nd-edition", 260)).toBe("Magna");
    });

    it("corrects the Nisson misprint: BD at 195, BT2 at 195 and 200", () => {
        expect(getEngineTableMaker("battledroids", 195)).toBe("Nissan");
        expect(getEngineTableMaker("battletech-2nd-edition", 195)).toBe("Nissan");
        expect(getEngineTableMaker("battletech-2nd-edition", 200)).toBe("Nissan");
    });

    it("names none off the table or for an edition whose table is not entered", () => {
        expect(getEngineTableMaker("battledroids", 405)).toBeUndefined();
        expect(getEngineTableMaker("battledroids", 0)).toBeUndefined();
        // The Compendium's table names other makers (165 Vlar, 170 Magna); it is not entered, so nothing is inherited.
        expect(getEngineTableMaker("battletech-compendium", 240)).toBeUndefined();
        expect(getEngineTableMaker("total-warfare", 240)).toBeUndefined();
        expect(getEngineTableMaker(undefined, 240)).toBeUndefined();
    });
});
