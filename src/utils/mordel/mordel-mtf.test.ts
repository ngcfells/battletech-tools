import { describe, expect, it } from "vitest";
import { IMordelDetail, IMordelEquipment } from "./mordel-types";
import { ACTUATOR_CAUTION, importMordelMech, mordelToMtf } from "./mordel-mtf";

// The canon Dola DOL-1A2 as mordel.net details it (fluff left out). Canon or made-up units only.
const item = (id: number, name: string, location: string | null, slots = 1, over: Partial<IMordelEquipment> = {}): IMordelEquipment =>
    ({ id, name, location, technology: "Inner Sphere", slots, facing: "Front", ...over });
const loc = (code: string, armor: number, rear: number | null = null) => ({ location: code, code, armor, rear_armor: rear, structure: 0 });

const dola = (over: Partial<IMordelDetail> = {}): IMordelDetail => ({
    unit_type: "BattleMech", unit_type_short: "bm", id: 23454, name: "Dola DOL-1A2 \"Yoh Ti Ts'ang\"", canon: true,
    tech_base: "Inner Sphere", mixed_tech: false, year: 3083, rules_level: "Advanced", tons: 30, battle_value: 826,
    point_value: 22, updated: null, omni: false, configuration: "Biped", role: "Scout",
    name_parts: { name: "Dola", alternate_name: null, model: "DOL-1A2 \"Yoh Ti Ts'ang\"" },
    sources: [{ title: "Record Sheets: Dark Age" }],
    movement: { walk: 8, run: 12, jump: 8, mechanical_jump_booster: 0 },
    engine: { type: "XL", technology: "Inner Sphere", rating: 240 },
    heat_sinks: { type: "Double", technology: "Inner Sphere", count: 10 },
    structure: { type: "Standard", technology: "Inner Sphere" },
    armor: { type: "Heavy Ferro-Fibrous", technology: "Inner Sphere", points: 99 },
    gyro: { type: "Standard" }, cockpit: { type: "Standard" }, myomer: { type: "Standard" },
    locations: [loc("H", 9), loc("CT", 14, 6), loc("LT", 10, 4), loc("RT", 10, 4), loc("LA", 10), loc("RA", 10), loc("LL", 11), loc("RL", 11)],
    equipment: [
        item(51, "Double Heat Sink", "LA", 3), item(68, "ER Medium Laser", "LA"), item(67, "ER Medium Laser", "LA"),
        ...[46, 47, 44, 48].map((id) => item(id, "Jump Jet", "LT")), item(97, "TAG", "H"), item(98, "Small Vibroblade", "RA"),
        ...[43, 49, 45, 50].map((id) => item(id, "Jump Jet", "RT")),
    ],
    ...over,
});

describe("mordelToMtf", () => {
    it("lays out the fixed parts, the equipment and the armor slots the way MegaMek does", () => {
        const { text, notes } = mordelToMtf(dola());
        expect(notes).toEqual([]);
        expect(text).toContain("Engine:240 XL Engine(IS)");
        expect(text).toContain("Armor:Heavy Ferro-Fibrous (IS)");
        expect(text).toContain("RTC Armor:6");
        const leftArm = text.split("Left Arm:\n")[1].split("\n").slice(0, 8);
        expect(leftArm.slice(0, 4)).toEqual(["Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator"]);
        expect(leftArm.slice(4, 7)).toEqual(Array(3).fill(leftArm[4]));
        expect(text.match(/IS Heavy Ferro-Fibrous/g)).toHaveLength(21);
    });
});

describe("importMordelMech", () => {
    it("builds the Dola with mordel.net's Battle Value", () => {
        const { mech, issues, bvOk, ourBV } = importMordelMech(dola());
        expect(issues).toEqual([]);
        expect(mech).not.toBeNull();
        expect(ourBV).toBe(826);
        expect(bvOk).toBe(true);
    }, 30000);

    it("builds an OmniMech base with no fixed equipment", () => {
        const { mech, issues } = importMordelMech(dola({ omni: true, equipment: [] }));
        expect(mech).not.toBeNull();
        expect(issues.filter((issue) => !/Unallocated|^- /.test(issue))).toEqual([]);
    }, 30000);

    it("reads a Clan item as the Clan record when the Inner Sphere one has the same name", () => {
        const detail = dola({ tech_base: "Clan" });
        detail.equipment = [...detail.equipment!, item(901, "Streak SRM 4", "CT", 1, { technology: "Clan" })];
        const { mech } = importMordelMech(detail);
        expect(mech!.getInstalledEquipment().map((entry) => entry.tag)).toContain("clan-streak-srm-4");
    }, 30000);

    it("writes a bin of half a ton's shots as a half-ton bin", () => {
        const detail = dola();
        detail.equipment = [...detail.equipment!, item(902, "Machine Gun", "CT"), item(903, "Machine Gun (Ammo 100)", "CT")];
        const { text } = mordelToMtf(detail);
        expect(text).toContain("IS Machine Gun Ammo - Half");
        const { mech } = importMordelMech(detail);
        const bin = mech!.getInstalledEquipment().find((entry) => /machine-gun/i.test(entry.tag) && entry.isAmmo);
        expect(bin?.weight).toBe(0.5);
    }, 30000);

    it("writes the heat sinks' own tech base, and cautions that arm actuators are guessed", () => {
        const detail = dola({ heat_sinks: { type: "Double", technology: "Clan", count: 10 } });
        const { text, cautions } = mordelToMtf(detail);
        expect(text).toContain("Heat Sinks:10 Clan Double");
        expect(cautions).toEqual([ACTUATOR_CAUTION]);
    });

    it("names a gyro it does not know", () => {
        expect(mordelToMtf(dola({ gyro: { type: "Made-up" } })).notes).toContain("Gyro 'Made-up' is laid out as a standard one");
    });

    it("names an item it does not know, and does not claim the Battle Value matches", () => {
        const detail = dola();
        detail.equipment = [...detail.equipment!, item(900, "Made-up Plasma Spoon", "CT")];
        const { issues, bvOk } = importMordelMech(detail);
        expect(issues.join("\n")).toContain("Made-up Plasma Spoon");
        expect(bvOk).toBe(false);
    }, 30000);
});
