import { describe, expect, it } from "vitest";
import { getEquipmentCatalogDefinitions } from "./equipment-registry";

// Catalog rework (project decision, 2026-10-06): catalogs are being regrouped by category, with Inner Sphere, Clan
// and universal entries in the same file. A record can then no longer take its tech base from the file it is in,
// so every record states it. Until the files move, the stated tech base has to agree with the catalog.
describe("Equipment tech base", () => {
    const definitions = getEquipmentCatalogDefinitions();

    it("is stated on every bundled equipment and ammunition record", () => {
        const missing = definitions.flatMap(definition => definition.equipment
            .filter(item => !["is", "clan", "universal"].includes(item.techBase as string))
            .map(item => `${definition.id}: ${item.tag}`));
        expect(missing).toEqual([]);
    });

    it("matches the catalog the record is in, for the Inner Sphere, Clan and universal catalogs", () => {
        const wrong = definitions.filter(definition => definition.techBase !== "custom").flatMap(definition => definition.equipment
            .filter(item => item.techBase !== definition.techBase)
            .map(item => `${definition.id}: ${item.tag} says ${item.techBase}`));
        expect(wrong).toEqual([]);
    });

    it("covers every catalog", () => {
        expect(definitions.length).toBeGreaterThan(0);
        expect(definitions.every(definition => definition.equipment.length > 0 || definition.techBase === "custom")).toBe(true);
    });
});
