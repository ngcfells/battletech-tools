import { describe, expect, it, vi } from "vitest";
import { BattleMech } from "../classes/battlemech";
import { SSW_KNOWN_MISSING_ITEMS } from "../classes/ssw-corpus-checks";
import { IEquipmentItem } from "../data/data-interfaces";
import { getEquipmentCatalogDefinitions, getEquipmentTier } from "../data/equipment-registry";
import { sswMechs } from "../data/ssw/sswMechs";
import { findCatalogMatches, findImportedEquipment } from "./importedEquipment";

describe("findImportedEquipment", () => {
    it("matches a record by its own name or tag before any alias", () => {
        expect(findImportedEquipment("Medium Laser", "is")?.item.tag).toBe("medium-laser");
        expect(findImportedEquipment("medium-laser", "is")?.catalog).toBe("is");
    });

    it("matches another tool's spelling through altNames", () => {
        // SSW writes launcher sizes with a hyphen; the records list that spelling in altNames.
        expect(findImportedEquipment("LRM-10", "is")?.item.name).toBe("LRM 10");
        expect(findImportedEquipment("Ammo (SRM-6)", "is")?.item.isAmmo).toBe(true);
    });

    it("looks in the faction's catalog, so a Clan design's plain names mean Clan equipment", () => {
        const match = findImportedEquipment("LRM-10", "clan");
        expect(match?.catalog).toBe("clan");
        // Not the Star League (Clan-built) launcher that once carried the "LRM-10" alias.
        expect(match?.item.tag).toBe("clan-lrm-10");
        expect(findImportedEquipment("Streak LRM-10", "clan")?.item.tag).toBe("streak-lrm-10");
    });

    it("checks the universal catalog before the faction's aliases", () => {
        // Universal records are listed in the Clan files too; they resolve to the universal record.
        expect(findImportedEquipment("Fluid Gun", "clan")?.catalog).toBe("universal");
        expect(findImportedEquipment("Thumper", "clan")?.item.tag).toBe("thumper-artillery");
    });

    it("falls back to the other faction only for Mixed Tech designs", () => {
        // IO p. 95: the Enhanced ER PPC is Clan tech; SSW files some mixed designs' copies as Inner Sphere.
        expect(findImportedEquipment("Enhanced ER PPC", "is")).toBeNull();
        expect(findImportedEquipment("Enhanced ER PPC", "is", true)?.catalog).toBe("clan");
    });

    it("returns null for a name no catalog lists", () => {
        expect(findImportedEquipment("Not A Real Weapon", "is", true)).toBeNull();
    });

    it("finds a record by any of its identifiers, case-insensitively", () => {
        expect(findCatalogMatches("lrm 10", "is")[0]?.tag).toBe("lrm-10");
        expect(findCatalogMatches("Rivet Gun", "universal")[0]?.tag).toBe("nail-gun");
        expect(findCatalogMatches("Rivet Gun", "universal", true)).toEqual([]);
    });
});

describe("equipment catalogs", () => {
    // Within one catalog, an identifier must mean one record, or an import picks whichever is listed first.
    it("gives no two records in a catalog the same name or tag", () => {
        const duplicates: string[] = [];
        for (const definition of getEquipmentCatalogDefinitions()) {
            const seen = new Map<string, string>();
            for (const item of definition.equipment) {
                for (const identifier of [item.name, item.tag]) {
                    const key = identifier.toLowerCase();
                    const other = seen.get(key);
                    if (other !== undefined && other !== item.tag) {
                        duplicates.push(`${definition.id}: "${identifier}" (${other}, ${item.tag})`);
                    }
                    seen.set(key, item.tag);
                }
            }
        }
        expect(duplicates).toEqual([]);
    });

    // An alias naming another record (the Clan Rotary AC/5 once answered to "CLUltraAC2", MegaMek's Clan Ultra
    // AC/2) can only mislead: the own-name pass finds that record first, so the alias is wrong or dead.
    // IS and Clan records share a file but sit in separate lookup tiers, where a Clan record may answer to the IS name.
    it("never lists another record's name or tag in the same tier as an alias", () => {
        const misleading: string[] = [];
        for (const definition of getEquipmentCatalogDefinitions()) {
            const primary = new Map<string, string>();
            const tierKey = (item: IEquipmentItem, identifier: string) => `${getEquipmentTier(definition, item)}|${identifier.toLowerCase()}`;
            for (const item of definition.equipment) {
                primary.set(tierKey(item, item.name), item.tag);
                primary.set(tierKey(item, item.tag), item.tag);
            }
            for (const item of definition.equipment) {
                for (const alias of item.altNames ?? []) {
                    const owner = primary.get(tierKey(item, alias));
                    if (owner !== undefined && owner !== item.tag) {
                        misleading.push(`${definition.id}: ${item.tag} lists "${alias}", the ${owner} record's own name`);
                    }
                }
            }
        }
        expect(misleading).toEqual([]);
    });

    it("never gives two records in the same tier the same alias", () => {
        const shared: string[] = [];
        for (const definition of getEquipmentCatalogDefinitions()) {
            const owners = new Map<string, string>();
            for (const item of definition.equipment) {
                for (const alias of new Set((item.altNames ?? []).map((name) => name.toLowerCase()))) {
                    const key = `${getEquipmentTier(definition, item)}|${alias}`;
                    const other = owners.get(key);
                    if (other !== undefined && other !== item.tag) {
                        shared.push(`${definition.id}: "${alias}" (${other}, ${item.tag})`);
                    }
                    owners.set(key, item.tag);
                }
            }
        }
        expect(shared).toEqual([]);
    });

    it("finds MegaMek's Clan Ultra AC/2 as the Clan Ultra AC/2", () => {
        expect(findImportedEquipment("CLUltraAC2", "clan")?.item.tag).toBe("clan-autocannon-uac-2");
        expect(findImportedEquipment("CLRotaryAC5", "clan")?.item.tag).toBe("clan-autocannon-rac-5");
        expect(findImportedEquipment("CLRotaryAC2", "clan")?.item.tag).toBe("clan-autocannon-rac-2");
        // The Clan LB-X, Ultra AC and HAG rows each answered to the next size up's MegaMek name.
        for (const [name, tag] of [
            ["CLLBXAC2", "clan-autocannon-lbx-2"], ["CLLBXAC5", "clan-autocannon-lbx-5"],
            ["CLLBXAC10", "clan-autocannon-lbx-10"], ["CLLBXAC20", "clan-autocannon-lbx-20"],
            ["CLUltraAC5", "clan-autocannon-uac-5"], ["CLUltraAC10", "clan-autocannon-uac-10"],
            ["CLUltraAC20", "clan-autocannon-uac-20"],
        ]) {
            expect(findImportedEquipment(name, "clan")?.item.tag, name).toBe(tag);
        }
        for (const size of [20, 30, 40]) {
            expect(findImportedEquipment(`CLHAG${size}`, "clan")?.item.name, `CLHAG${size}`).toBe(`Hyper-Assault Gauss (HAG) ${size}`);
        }
    });
});

describe("SSW import", () => {
    // The corpus shards (ssw-corpus-1..4.test.ts) allow these errors and no others; each must still happen, so the
    // list is shortened when a missing canon record is added.
    it.each(SSW_KNOWN_MISSING_ITEMS)("still raises %s on the bundled designs that use it", (error) => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(console, "log").mockImplementation(() => {});
        const name = /'(.*)'/.exec(error)![1];
        const designs = sswMechs.filter((xml) => xml.includes(name));
        expect(designs.length).toBeGreaterThan(0);
        const raised = designs.some((xml) => {
            const mech = new BattleMech();
            mech.importSSWXML(xml);
            return mech.sswImportErrors.includes(error);
        });
        expect(raised).toBe(true);
        vi.restoreAllMocks();
    });
});

describe("MegaMek's ISCASE", () => {
    // It was listed on the Guardian ECM Suite (#43).
    it("names CASE, not the Guardian ECM Suite", () => {
        expect(findImportedEquipment("ISCASE", "is")?.item.tag).toBe("case");
    });
});
