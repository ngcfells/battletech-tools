import { describe, expect, it } from "vitest";
import { getAllCatalogs } from "./catalog-registry";
import type { ICatalogStanding } from "./data-interfaces";
import { isKnownEditionTag } from "./rules-editions";

// Every catalog carries the same standing (design 2026-10-24-catalog-consolidation §1).
const catalogs = getAllCatalogs();
const label = (id: string, record: ICatalogStanding) => `${id}: ${record.tag}`;
// An IS and a Clan record may share an old tag: lookups search the unit's own tech base first (getEquipmentListByTech).
const tagsOf = (record: ICatalogStanding) => [record.tag, ...(record.altTags ?? [])].map((tag) => `${record.techBase ?? ""}:${tag}`);
const duplicates = (tags: string[]) => tags.filter((tag, index) => tags.indexOf(tag) !== index);

// Rounds 3-5 move these onto the full core; the count only goes down.
const PENDING_CATALOGS = 22;

describe("catalog standing", () => {
    it("every catalog record has a tag and a name", () => {
        const failures = catalogs.flatMap(({ id, records }) => records
            .filter((record) => typeof record.tag !== "string" || !record.tag || typeof record.name !== "string" || !record.name)
            .map((record) => label(id, record)));
        expect(failures).toEqual([]);
    });

    it("tags are unique within each catalog and tech base, counting altTags", () => {
        const failures = catalogs.flatMap(({ id, records }) => duplicates(records.flatMap(tagsOf)).map((tag) => `${id}: ${tag}`));
        expect(failures).toEqual([]);
    });

    it("tags are unique across the equipment catalogs within each tech base, counting altTags", () => {
        const equipmentIds = new Set(catalogs.filter(({ records }) => records.some((record) => "isAmmo" in record)).map(({ id }) => id));
        const tags = catalogs.filter(({ id }) => equipmentIds.has(id) && !id.startsWith("battle-armor-scale")).flatMap(({ records }) => records.flatMap(tagsOf));
        expect(duplicates(tags)).toEqual([]);
    });

    it("every edition tag is known", () => {
        const failures = catalogs.flatMap(({ id, records }) => records.filter((record) => [
            ...(record.editions ?? []), ...Object.keys(record.editionStats ?? {}), ...Object.keys(record.apocryphalIn ?? {}),
            ...Object.keys(record.editionLevels ?? {}),
        ].some((tag) => !isKnownEditionTag(tag))).map((record) => label(id, record)));
        expect(failures).toEqual([]);
    });

    it("clanDates sit only on Inner Sphere or universal records", () => {
        const failures = catalogs.flatMap(({ id, records }) => records
            .filter((record) => record.techBase === "clan" && record.clanDates)
            .map((record) => label(id, record)));
        expect(failures).toEqual([]);
    });

    it("catalogs on the full core list editions and tech base", () => {
        const failures = catalogs.filter(({ custom, pendingStanding }) => !custom && !pendingStanding)
            .flatMap(({ id, records }) => records
                .filter((record) => (record.rulesLevel ?? 0) < 6)
                .filter((record) => !Array.isArray(record.editions) || !record.techBase)
                .map((record) => label(id, record)));
        expect(failures).toEqual([]);
    });

    it("the pending list only shrinks", () => {
        expect(catalogs.filter(({ pendingStanding }) => pendingStanding).length).toBeLessThanOrEqual(PENDING_CATALOGS);
    });
});
