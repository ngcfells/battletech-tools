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

// A 150-ton superheavy (IO:AE pp.154-157): every item but the actuators in half its slots (a Gauss Rifle in 4),
// two tons of ammunition sharing one slot, and MegaMek's superheavy cockpit and gyro.
const superheavy = [
    "chassis:Test Colossus", "model:TC-X", "Config:Biped", "techbase:Inner Sphere", "era:3076", "rules level:3", "mass:150",
    "engine:300 Fusion Engine(IS)", "structure:IS Standard", "myomer:Standard", "cockpit:Superheavy Cockpit", "gyro:Superheavy Gyro",
    "heat sinks:10 Single", "walk mp:2", "jump mp:0", "armor:Standard (IS)", ...armor([30, 30, 30, 30, 40, 12, 40, 40, 10, 10, 10]), "",
    ...location("Left Arm", "Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator", ...fill(3, "ISLBXAC10")),
    ...location("Right Arm", "Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator", "Medium Laser"),
    ...location("Left Torso", ...fill(4, "ISGaussRifle"), "IS Gauss Ammo|IS Gauss Ammo"),
    ...location("Right Torso", "IS LB 10-X AC Ammo|IS LB 10-X Cluster Ammo"),
    ...location("Center Torso", ...fill(3, "Fusion Engine"), ...fill(2, "Gyro")),
    ...location("Head", "Life Support", "Sensors", "Cockpit", "-Empty-", "Sensors", "Life Support"),
    ...location("Left Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
    ...location("Right Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator"),
].join("\n");

// A tripod (IO:AE pp.128-130): a real Center Leg, its armor, and a laser mounted in it.
const tripod = brawler.replace("Config:Biped", "Config:Tripod").replace("walk mp:5", "walk mp:5\ncockpit:Tripod Cockpit")
    .replace("RL armor:18", "RL armor:18\nCL armor:16") + "\n"
    + location("Center Leg", "Hip", "Upper Leg Actuator", "Lower Leg Actuator", "Foot Actuator", "Medium Laser").join("\n");

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

    // mordel.net's MegaMek-format files (#241): "Standard (IS)" armor, TSM slots named "TSM", an empty Center Leg on a
    // biped, "Biped Omnimech", and a mixed-tech 'Mech's "Double" sinks whose Clan tech only the slot names give
    // (Jackalope JLP-NH).
    it("reads mordel.net's spellings", () => {
        const mordel = brawler.replace("armor:Standard(Inner Sphere)", "armor:Standard (IS)").replace("techbase:Inner Sphere", "techbase:Mixed (IS Chassis)").replace("myomer:Standard", "myomer:Triple-Strength")
            .replace(/ISDoubleHeatSink\nISDoubleHeatSink\nISDoubleHeatSink\n/, "CLDoubleHeatSink\nCLDoubleHeatSink\nTSM\n")
            .replace("Medium Laser" + "\n-Empty-".repeat(5), "Medium Laser" + "\nTSM".repeat(5)) + "\n" + location("Center Leg").join("\n");
        const { mech, issues, xml } = importBattleMechMtf(mordel);
        expect(issues).toEqual([]);
        expect(mech!.getArmorType()).toBe("standard");
        expect(xml.match(/<enhancement[^>]*>[\s\S]*?<\/enhancement>/)?.[0].match(/<location /g)).toHaveLength(6);
        expect(xml).toMatch(/<heatsinks number="11" techbase="1">/);
        expect(convertMtfToSSW(parseMtfFile(mordel.replace("Config:Biped", "Config:Biped Omnimech"))!).xml).toContain(`omnimech="TRUE"`);
    });

    it("reads Heavy Industrial armor as Standard armor (TM p.205)", () => {
        const { mech, issues } = importBattleMechMtf(brawler.replace("armor:Standard(Inner Sphere)", "armor:Heavy Industrial(Inner Sphere)"));
        expect(issues).toEqual([]);
        expect(mech!.getArmorType()).toBe("standard");
    });

    // MegaMek gives an IndustrialMech with Advanced Fire Control a BattleMech cockpit and writes no line for a
    // Standard one (its Mek.hasAdvancedFireControl); an Industrial cockpit is the one without (#371).
    it("reads an IndustrialMech's BattleMech cockpit as Advanced Fire Control", () => {
        const industrial = brawler.replace("structure:IS Standard", "structure:IS Industrial");
        expect(importBattleMechMtf(industrial).mech!.hasAdvancedFireControl()).toBe(true);
        expect(importBattleMechMtf(industrial.replace("structure:", "cockpit:Primitive Cockpit\nstructure:")).mech!.hasAdvancedFireControl()).toBe(true);
        expect(importBattleMechMtf(industrial.replace("structure:", "cockpit:Industrial Cockpit\nstructure:")).mech!.hasAdvancedFireControl()).toBe(false);
        expect(importBattleMechMtf(brawler).mech!.isIndustrialMech()).toBe(false);
    });

    // "BV is equal to a 10 point minefield" of its mines (TO:AUE p.195): 8 for standard ones (p.197), offensive (#371).
    it("counts a Vehicular Mine Dispenser as 8 offensive BV", () => {
        const mined = brawler.replace("Right Torso:\nMedium Laser\n-Empty-", "Right Torso:\nMedium Laser\nISVehicularMineDispenser");
        const { mech, issues } = importBattleMechMtf(mined);
        expect(issues).toEqual([]);
        expect(mech!.getInstalledEquipment().map((item) => item.tag)).toContain("vehicular-mine-dispenser");
        expect(Math.abs(mech!.getBattleValue() - importBattleMechMtf(brawler).mech!.getBattleValue() - 8 * 1.37)).toBeLessThan(1);
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

    it("counts pod heat sinks and pod jump jets in an OmniMech's pod tonnage", () => {
        // MegaMek's "base chassis heat sinks" is the engine's capacity (12 in a Dire Wolf's 300 XL): the pod ones are marked.
        const omni = brawler.replace("Config:Biped", "Config:Biped Omnimek").replace("heat sinks:11 Double", "heat sinks:11 Double\nbase chassis heat sinks:10")
            .replace("Left Torso:\nISDoubleHeatSink\nISDoubleHeatSink\nISDoubleHeatSink", "Left Torso:\n" + fill(3, "ISDoubleHeatSink (omnipod)").join("\n"))
            .replace("jump mp:0", "jump mp:2").replace("Right Torso:\nMedium Laser\n-Empty-\n-Empty-", "Right Torso:\nMedium Laser (omnipod)\nJump Jet\nJump Jet (omnipod)");
        const { mech, issues } = importBattleMechMtf(omni);
        expect(issues).toEqual([]);
        // The pod laser, one double heat sink and one half-ton jump jet.
        expect(mech!.getOmniConfigurationStats()[0].podTonnage).toBe(1 + 1 + 0.5);
    });

    it("reads a superheavy 'Mech: half-size slots and two tons of ammunition to a slot (IO:AE pp.155-157)", () => {
        const { mech, issues } = importBattleMechMtf(superheavy);
        expect(issues).toEqual([]);
        expect(mech!.isSuperheavy()).toBe(true);
        const tags = mech!.getInstalledEquipment().map((item) => item.tag);
        expect(tags.filter((tag) => tag === "standard-gauss-rifle")).toHaveLength(1);
        expect(tags.filter((tag) => tag === "autocannon-lbx-10")).toHaveLength(1);
        const ammo = mech!.getInstalledEquipment().filter((item) => item.isAmmo);
        expect(ammo.filter((item) => item.location === "lt")).toHaveLength(2);
        expect(ammo.filter((item) => item.location === "rt")).toHaveLength(2);
    });

    // A Radical Heat Sink System is equipment (IO:AE p.185), not heat sinks: the Ares ARS-V1D Hephaestus carries one.
    it("reads a Radical Heat Sink System as the system, not as heat sinks", () => {
        const radical = brawler.replace(location("Right Torso", "Medium Laser").join("\n"),
            location("Right Torso", "Medium Laser", ...fill(3, "Radical Heat Sink System")).join("\n"));
        const { mech, issues } = importBattleMechMtf(radical);
        expect(issues).toEqual([]);
        expect(mech!.getInstalledEquipment().filter((item) => item.tag === "radical-heat-sink-system")).toHaveLength(1);
        expect(mech!.getHeatSinks()).toBe(11);
    });

    // "For Superheavy 'Mechs, use the Superheavy Engine Type BV Modifier Table in place of the standard Battle Value
    // modifiers" (IO:AE pp.187-188): Inner Sphere XL 0.75 and Light 0.825, where a 'Mech takes 0.5 and 0.75.
    it.each([["XL", 0.75], ["Light", 0.825]])("rates a superheavy 'Mech's %s engine from the superheavy table (IO:AE p.188)", (engine, modifier) => {
        const engineSlots = fill(engine === "XL" ? 2 : 1, "Fusion Engine");
        const sided = superheavy.replace("300 Fusion Engine(IS)", `300 ${engine} Engine(IS)`)
            .replace(location("Left Torso", ...fill(4, "ISGaussRifle"), "IS Gauss Ammo|IS Gauss Ammo").join("\n"),
                location("Left Torso", ...engineSlots, ...fill(4, "ISGaussRifle"), "IS Gauss Ammo|IS Gauss Ammo").join("\n"))
            .replace(location("Right Torso", "IS LB 10-X AC Ammo|IS LB 10-X Cluster Ammo").join("\n"),
                location("Right Torso", ...engineSlots, "IS LB 10-X AC Ammo|IS LB 10-X Cluster Ammo").join("\n"));
        const { mech, issues } = importBattleMechMtf(sided);
        expect(issues).toEqual([]);
        expect(mech!.calcLogBV).toContain(`= ${modifier}x.`);
    });

    // "Treat the Superheavy 'Mech as a Clan 'Mech if the explosive components are in a location protected by any form
    // of CASE" (IO:AE p.188): CASE in an XL engine's side torso saves it.
    it("lets CASE protect a superheavy XL 'Mech's side torso ammunition (IO:AE p.188)", () => {
        const xl = superheavy.replace("300 Fusion Engine(IS)", "300 XL Engine(IS)")
            .replace(location("Left Torso", ...fill(4, "ISGaussRifle"), "IS Gauss Ammo|IS Gauss Ammo").join("\n"),
                location("Left Torso", ...fill(2, "Fusion Engine"), ...fill(4, "ISGaussRifle"), "IS Gauss Ammo|IS Gauss Ammo").join("\n"))
            .replace(location("Right Torso", "IS LB 10-X AC Ammo|IS LB 10-X Cluster Ammo").join("\n"),
                location("Right Torso", ...fill(2, "Fusion Engine"), "IS LB 10-X AC Ammo|IS LB 10-X Cluster Ammo", "ISCASE").join("\n"));
        const { mech, issues } = importBattleMechMtf(xl);
        expect(issues).toEqual([]);
        expect(mech!.calcLogBV).toContain("Explosive Ammo in rightTorso protected by CASE");
        expect(mech!.calcLogBV).not.toContain("Explosive Ammo Crit in rightTorso");
    });

    // "Superheavy 'Mechs may ignore the torso-only mounting restrictions applied to Heavy Gauss Rifles (standard and
    // improved), and may place these items in the arms" (IO:AE p.157): the Ares ARS-V1A Hera's right-arm rifle.
    it("mounts an Improved Heavy Gauss Rifle in a superheavy 'Mech's arm (IO:AE p.157)", () => {
        const armed = superheavy.replace([...fill(3, "ISLBXAC10"), ...fill(3, "-Empty-")].join("\n"), fill(6, "ISImprovedHeavyGaussRifle").join("\n"))
            .replace("IS LB 10-X AC Ammo|IS LB 10-X Cluster Ammo", "ISImprovedHeavyGauss Ammo|ISImprovedHeavyGauss Ammo");
        const { mech, issues } = importBattleMechMtf(armed);
        expect(issues).toEqual([]);
        expect(mech!.getInstalledEquipment().find((item) => item.tag === "gauss-rifle-heavy-improved")?.location).toBe("la");
    });

    it("reads a tripod's Center Leg, its armor and what it mounts", () => {
        const { mech, issues } = importBattleMechMtf(tripod);
        expect(issues).toEqual([]);
        expect(mech!.isTripod()).toBe(true);
        expect(mech!.getArmorAllocation().centerLeg).toBe(16);
        expect(mech!.getInstalledEquipment().filter((item) => item.tag === "medium-laser" && item.location === "cl")).toHaveLength(1);
        const omni = convertMtfToSSW(parseMtfFile(tripod.replace("Config:Tripod", "Config:Tripod OmniMek"))!);
        expect(omni.issues).toEqual([]);
        expect(omni.xml).toContain(`omnimech="TRUE"`);
    });

    // mordel.net writes "Industrial" for MegaMek's "Industrial Cockpit" (Rock Hound AM-PRM-RH7C).
    it("reads mordel.net's Industrial cockpit as one without Advanced Fire Control", () => {
        const industrial = brawler.replace("structure:IS Standard", "structure:IS Industrial\ncockpit:Industrial");
        const { mech, issues } = importBattleMechMtf(industrial);
        expect(issues).toEqual([]);
        expect(mech!.hasAdvancedFireControl()).toBe(false);
    });

    // The Patron PTN LoaderMech: a Primitive IndustrialMech whose SSW save has Primitive Industrial Structure and
    // Commercial Armor, and whose fuel-cell engine fills slots named "Fuel Cell Engine".
    it("reads a Primitive IndustrialMech's structure, commercial armor and fuel-cell engine slots", () => {
        const primitive = brawler.replace("structure:IS Standard", "structure:IS Primitive Industrial\ncockpit:Primitive Industrial Cockpit")
            .replace("engine:250 Fusion Engine", "engine:250 Fuel Cell Engine(IS)").replace("armor:Standard(Inner Sphere)", "armor:Primitive Commercial (IS)")
            .replace(/(Center Torso:\n)Fusion Engine\nFusion Engine\nFusion Engine/, "$1Fuel Cell Engine\nFuel Cell Engine\nFuel Cell Engine");
        const { mech, issues } = importBattleMechMtf(primitive);
        expect(issues).toEqual([]);
        expect(mech!.isIndustrialMech()).toBe(true);
        expect(mech!.getArmorType()).toBe("commercial");
        expect(mech!.getInternalStructureType()).toBe("industrial");
    });

    it("finds MegaMek's prototype rocket launchers (Crosscut ED-X2)", () => {
        // One, two and three slots.
        for (const [size, slots] of [[10, 1], [15, 2], [20, 3]]) {
            const rockets = brawler.replace("Right Torso:\nMedium Laser" + "\n-Empty-".repeat(slots),
                "Right Torso:\nMedium Laser" + `\nISRocketLauncher${size}Prototype`.repeat(slots));
            const { mech, issues } = importBattleMechMtf(rockets);
            expect(issues).toEqual([]);
            expect(mech!.getInstalledEquipment().map((item) => item.tag)).toContain(`prototype-rocket-launcher-${size}`);
        }
    });

    it("leaves out what it cannot convert, saying why", () => {
        const lam = striker.replace("Config:Biped", "Config:LAM");
        expect(importBattleMechMtf(lam).issues.some((issue) => /LAM/.test(issue))).toBe(true);
        const unknown = striker.replace("CLERMediumLaser", "CLNoSuchGun");
        expect(importBattleMechMtf(unknown).issues).toContain("Cannot find any equipment named 'CLNoSuchGun'");
    });
});
