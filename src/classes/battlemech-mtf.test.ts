import { describe, expect, it } from "vitest";
import { convertMtfToSSW, importBattleMechMtf, parseMtfFile } from "./battlemech-mtf";

// Synthetic MegaMek files: the shape of a MegaMekLab save, with made-up designs.
const location = (name: string, ...slots: string[]): string[] =>
    [`${name}:`, ...slots, ...Array(12 - slots.length).fill("-Empty-"), ""];
const fill = (count: number, slot: string): string[] => Array(count).fill(slot);
const armor = (points: number[]): string[] => ["LA", "RA", "LT", "RT", "CT", "HD", "LL", "RL", "RTL", "RTR", "RTC"]
    .map((loc, index) => `${loc} armor:${points[index]}`);

// A Clan striker: Clan XL engine, endo steel, ferro-fibrous, two Clan double heat sinks outside the engine, Artemis IV,
// environmental sealing in every location and Battlefists on both hands.
const striker = [
    "chassis:Test Striker", "model:TS-1C", "Config:Biped", "techbase:Clan", "era:3060", "rules level:2", "mass:35",
    "engine:315 XL (Clan) Engine", "structure:Clan Endo Steel", "myomer:Standard", "heat sinks:12 Clan Double",
    "walk mp:9", "jump mp:0", "armor:Ferro-Fibrous(Clan)", ...armor([8, 8, 10, 10, 13, 9, 10, 10, 3, 3, 4]),
    "quirk:battle_fists_la", "quirk:battle_fists_ra", "",
    ...location("Left Arm", "Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator", "CLSRM6", "CLArtemisIV",
        "Clan Endo Steel", "Environmental Sealing (Mech)", "Clan Ferro-Fibrous"),
    ...location("Right Arm", "Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator", "CLERMediumLaser",
        "Clan Endo Steel", "Environmental Sealing (Mech)", "Clan Ferro-Fibrous"),
    ...location("Left Torso", "Fusion Engine", "Fusion Engine", "Clan Ammo SRM-6", ...fill(2, "CLDoubleHeatSink"),
        ...fill(3, "Clan Ferro-Fibrous"), "Clan Endo Steel", "Environmental Sealing (Mech)"),
    ...location("Right Torso", "Fusion Engine", "Fusion Engine", "Clan Streak SRM 4 Ammo", ...fill(2, "CLDoubleHeatSink"),
        ...fill(2, "Clan Ferro-Fibrous"), ...fill(2, "Clan Endo Steel"), "Environmental Sealing (Mech)"),
    ...location("Center Torso", ...fill(3, "Fusion Engine"), ...fill(4, "Gyro"), ...fill(3, "Fusion Engine"), "CLStreakSRM4",
        "Environmental Sealing (Mech)"),
    ...location("Head", "Life Support", "Sensors", "Cockpit", "Environmental Sealing (Mech)", "Sensors", "Life Support"),
    ...location("Left Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator", "Clan Endo Steel",
        "Environmental Sealing (Mech)"),
    ...location("Right Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator", "Clan Endo Steel",
        "Environmental Sealing (Mech)"),
].join("\n");

// An Inner Sphere brawler: a variable-size hatchet and a three-slot IS double heat sink.
const brawler = [
    "chassis:Test Brawler", "model:TB-2", "Config:Biped", "techbase:Inner Sphere", "era:3058", "rules level:2", "mass:50",
    "engine:250 Fusion Engine", "structure:IS Standard", "myomer:Standard", "heat sinks:11 Double", "walk mp:5", "jump mp:0",
    "armor:Standard(Inner Sphere)", ...armor([14, 14, 18, 18, 22, 9, 18, 18, 5, 5, 6]), "",
    ...location("Left Arm", "Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator", ...fill(3, "Hatchet")),
    ...location("Right Arm", "Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator", "Medium Laser"),
    ...location("Left Torso", ...fill(3, "ISDoubleHeatSink"), "Medium Laser"),
    ...location("Right Torso", "Medium Laser"),
    ...location("Center Torso", ...fill(3, "Fusion Engine"), ...fill(4, "Gyro"), ...fill(3, "Fusion Engine")),
    ...location("Head", "Life Support", "Sensors", "Cockpit", "-Empty-", "Sensors", "Life Support"),
    ...location("Left Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
    ...location("Right Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
].join("\n");

// An Inner Sphere quad: MegaMek's leg names.
const quad = [
    "chassis:Test Walker", "model:TW-1", "Config:Quad", "techbase:Inner Sphere", "era:3025", "rules level:1", "mass:50",
    "engine:250 Fusion Engine", "structure:IS Standard", "myomer:Standard", "heat sinks:10 Single", "walk mp:5", "jump mp:0",
    "armor:Standard(Inner Sphere)", "FLL armor:12", "FRL armor:12", "LT armor:16", "RT armor:16", "CT armor:20", "HD armor:9",
    "RLL armor:12", "RRL armor:12", "RTL armor:4", "RTR armor:4", "RTC armor:5", "",
    ...location("Front Left Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
    ...location("Front Right Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
    ...location("Left Torso", "Large Laser", "Large Laser"),
    ...location("Right Torso", "Large Laser", "Large Laser"),
    ...location("Center Torso", ...fill(3, "Fusion Engine"), ...fill(4, "Gyro"), ...fill(3, "Fusion Engine")),
    ...location("Head", "Life Support", "Sensors", "Cockpit", "-Empty-", "Sensors", "Life Support"),
    ...location("Rear Left Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
    ...location("Rear Right Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
].join("\n");

describe("MegaMek 'Mech import", () => {
    it("rejects what is not a MegaMek 'Mech file", () => {
        expect(parseMtfFile("")).toBeNull();
        expect(parseMtfFile("Name:Nothing")).toBeNull();
        expect(importBattleMechMtf("no chassis here").mech).toBeNull();
    });

    it("reads a Clan 'Mech: tech base, Clan-only weapons, sinks, structure and armor slots, sealing and Artemis", () => {
        const { mech, issues, xml } = importBattleMechMtf(striker);
        expect(issues).toEqual([]);
        expect(mech?.getTech().tag).toBe("clan");
        expect(mech?.getInternalStructureType()).toBe("endo-steel");
        expect(mech?.getArmorType()).toBe("ferro-fibrous");
        const tags = mech!.getInstalledEquipment().map((item) => item.tag);
        // MegaMek's CLStreakSRM4 is the Clan launcher, not the Inner Sphere one.
        expect(tags).toContain("clan-streak-srm-4");
        expect(tags).not.toContain("streak-srm-4");
        expect(tags.filter((tag) => tag === "environmental-sealing")).toHaveLength(1);
        // Two Clan doubles take two slots each: one location per sink.
        expect(xml.match(/<heatsinks[^>]*>[\s\S]*?<\/heatsinks>/)?.[0].match(/<location /g)).toHaveLength(2);
        expect(xml).toContain(`fcsa4="TRUE"`);
        expect(mech!.getBattleValue()).toBeGreaterThan(0);
    });

    it("pays Battlefists on both hands once, naming no hand (CO p.225)", () => {
        const { mech } = importBattleMechMtf(striker);
        const fists = mech!.quirks.getAll().filter((quirk) => quirk.tag === "quirk-battlefists");
        expect(fists).toHaveLength(1);
        expect(fists[0].location).toBeUndefined();
    });

    it("reads a variable-size hatchet as one item and three-slot IS double heat sinks", () => {
        const { mech, issues, xml } = importBattleMechMtf(brawler);
        expect(issues).toEqual([]);
        expect(mech!.getInstalledEquipment().filter((item) => item.tag === "melee-hatchet")).toHaveLength(1);
        expect(xml.match(/<heatsinks[^>]*>[\s\S]*?<\/heatsinks>/)?.[0].match(/<location /g)).toHaveLength(1);
    });

    it("reads a quad's legs", () => {
        const file = parseMtfFile(quad)!;
        const { issues, quad: isQuad } = convertMtfToSSW(file);
        expect(issues).toEqual([]);
        expect(isQuad).toBe(true);
        const { mech, issues: imported } = importBattleMechMtf(quad);
        expect(imported).toEqual([]);
        expect(mech?.isQuad()).toBe(true);
        expect(mech!.getInstalledEquipment().filter((item) => item.tag === "large-laser")).toHaveLength(2);
    });

    it("keeps an OmniMech's pod items in its pods and the rest fixed (#112)", () => {
        const omni = brawler.replace("Config:Biped", "Config:Biped Omnimek").replace("Right Torso:\nMedium Laser", "Right Torso:\nMedium Laser (omnipod)");
        const { mech, issues } = importBattleMechMtf(omni);
        expect(issues).toEqual([]);
        expect(mech?.isOmnimech).toBe(true);
        const lasers = mech!.getInstalledEquipment().filter((item) => item.tag === "medium-laser");
        expect(lasers.map((item) => !!item.omniFixed).sort()).toEqual([false, true, true]);
        expect(lasers.find((item) => !item.omniFixed)?.location).toBe("rt");
    });

    it("leaves out what it cannot convert, saying why", () => {
        const lam = striker.replace("Config:Biped", "Config:LAM");
        expect(importBattleMechMtf(lam).issues.some((issue) => /LAM/.test(issue))).toBe(true);
        const unknown = striker.replace("CLERMediumLaser", "CLNoSuchGun");
        expect(importBattleMechMtf(unknown).issues).toContain("Cannot find any equipment named 'CLNoSuchGun'");
    });
});
