import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { BattleMech } from "./battlemech";

// A Mixed Tech 'Mech's structure, armor and heat sinks may each be Inner Sphere or Clan, with their own slot
// counts (Clan Endo-Steel and Ferro-Fibrous 7, Clan double heat sinks 2 each). They had the chassis's (#43).
const slotsTagged = (mech: BattleMech, tag: string) =>
    mech.getUnallocatedCriticals().filter((item) => item.tag === tag).reduce((total, item) => total + (item.crits ?? 1), 0);

function mixedMech(): BattleMech {
    const mech = new BattleMech();
    mech.setTech("mis");
    mech.setTonnage(55);
    mech.setWalkSpeed(5);
    mech.setInternalStructureType("endo-steel");
    mech.setArmorType("ferro-fibrous");
    mech.setHeatSinksType("double");
    mech.setAdditionalHeatSinks(6);
    return mech;
}

describe("a Mixed Tech 'Mech's component tech bases", () => {
    it("default to the Inner Sphere versions on an Inner Sphere chassis", () => {
        const mech = mixedMech();
        expect(slotsTagged(mech, "endo-steel")).toBe(14);
        expect(slotsTagged(mech, "ferro-fibrous")).toBe(14);
        expect(mech.getHeatSinkTechBase()).toBe("is");
    });

    it("take the Clan versions' slots when set to Clan", () => {
        const mech = mixedMech();
        expect(mech.setStructureTechBase("clan")).toBe("clan");
        expect(mech.setArmorTechBase("clan")).toBe("clan");
        expect(mech.setHeatSinkTechBase("clan")).toBe("clan");
        expect(slotsTagged(mech, "endo-steel")).toBe(7);
        expect(slotsTagged(mech, "ferro-fibrous")).toBe(7);
        const heatSinks = mech.getUnallocatedCriticals().filter((item) => item.tag === "heat-sink");
        expect(heatSinks.length).toBeGreaterThan(0);
        expect(heatSinks.every((item) => item.crits === 2)).toBe(true);
    });

    it("keep their tech bases through a save and load", () => {
        const mech = mixedMech();
        mech.setStructureTechBase("clan");
        mech.setArmorTechBase("clan");
        mech.setHeatSinkTechBase("clan");
        const reloaded = new BattleMech(mech.exportJSON());
        expect(reloaded.getStructureTechBase()).toBe("clan");
        expect(reloaded.getArmorTechBase()).toBe("clan");
        expect(reloaded.getHeatSinkTechBase()).toBe("clan");
        expect(slotsTagged(reloaded, "endo-steel") + 0).toBe(slotsTagged(mech, "endo-steel"));
    });

    it("are ignored on a 'Mech that isn't Mixed Tech", () => {
        const mech = new BattleMech();
        mech.setTech("is");
        mech.setInternalStructureType("endo-steel");
        mech.setStructureTechBase("clan");
        expect(mech.getStructureTechBase()).toBe("is");
        expect(slotsTagged(mech, "endo-steel")).toBe(14);
    });
});

describe("SSW import of a Mixed Tech 'Mech", () => {
    it("uses each component's own tech base, so every item lands where the file puts it: Pulverizer PUL-3R", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const mech = new BattleMech();
        mech.importSSWXML(readFileSync("src/utils/__fixtures__/pulverizer-pul-3r.ssw", "utf8"));
        expect(mech.getArmorTechBase()).toBe("clan"); // <armor techbase="1">: Clan Ferro-Fibrous, 7 slots
        expect(mech.getStructureTechBase()).toBe("is"); // <structure techbase="0">
        expect(mech.getUnallocatedCriticals().map((item) => item.tag)).toEqual([]);
    });
});

describe("SSW import of armor with fixed slots", () => {
    it("puts each location's Stealth Armor slots where the file does, leaving the equipment its slots: Sha Yu SYU-2B", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        const mech = new BattleMech();
        mech.importSSWXML(readFileSync("src/utils/__fixtures__/sha-yu-syu-2b.ssw", "utf8"));
        expect(mech.getUnallocatedCriticals().map((item) => item.tag)).toEqual([]);
        // <location index="8">LA</location> and 9; <location index="10">LT</location> and 11.
        expect(mech.getCriticals().leftArm[8]?.tag).toBe("stealth-basic");
        expect(mech.getCriticals().rightTorso[10]?.tag).toBe("stealth-basic");
    });
});

