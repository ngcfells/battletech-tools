import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { BattleMech } from "./battlemech";

// Battle Value of SSW designs against the BV2 SSW wrote in each file (#46).
function importFixture(name: string): BattleMech {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const mech = new BattleMech();
    mech.importSSWXML(readFileSync(`src/utils/__fixtures__/${name}.ssw`, "utf8"));
    return mech;
}
const tags = (mech: BattleMech) => mech.getInstalledEquipment().map((item) => item.tag);

describe("SSW Battle Value (#46)", () => {
    it("reads SSW's Triple-Strength Myomer enhancement, 1 more Walking MP for BV: Raider JL-1", () => {
        const mech = importFixture("raider-jl-1");
        expect(mech.getMyomerType().tag).toBe("tsm");
        expect(mech.getBattleValue()).toBe(817);
    });

    it("counts no explosive slot for the B-Pod: Bloodhound B3-HND", () => {
        expect(importFixture("bloodhound-b3-hnd").getBattleValue()).toBe(1006);
    });

    it("reads MASC from SSW's enhancement, and Hardened Armor costs 1 Running MP: Amarok 2", () => {
        const mech = importFixture("amarok-2");
        expect(tags(mech)).toContain("clan-masc");
        expect(mech.getArmorType()).toBe("hardened");
        expect(mech.getWalkSpeed()).toBe(4);
        expect(mech.getRunSpeed()).toBe(5);
        // MASC and a Supercharger: 4 x 2.5 = 10, less 1 for Hardened Armor (TO:AUE p.93).
        expect(mech.getBVRunSpeed()).toBe(9);
        expect(mech.getBattleValue()).toBe(3351);
    });

    it("counts Narc pods as explosive ammunition: Archer ARC-5S", () => {
        const mech = importFixture("archer-arc-5s");
        expect(mech.getInstalledEquipment().find((item) => item.tag === "ammo-is-narc-standard")?.explosive).toBe(true);
        expect(mech.getBattleValue()).toBe(1353);
    });

    it("installs the machine guns of SSW's MG Array items: Flea FLE-19", () => {
        const mech = importFixture("flea-fle-19");
        expect(tags(mech).filter((tag) => tag === "machine-gun-light")).toHaveLength(8);
        expect(mech.getUnallocatedCriticals()).toEqual([]);
        expect(mech.getBattleValue()).toBe(381);
    });

    it("counts Modular Armor's points and ignores its speed penalty: Trebuchet TBT-XK7", () => {
        const mech = importFixture("trebuchet-tbt-xk7");
        expect(mech.hasActiveModularArmor()).toBe(true);
        // In play the packs cost 1 Walking and Jumping MP; Battle Value ignores that (TO:AUE p.192).
        expect(mech.getWalkSpeed()).toBe(4);
        expect(mech.getBVJumpSpeed()).toBe(5);
        expect(mech.getBattleValue()).toBe(1549);
    });

    it("doubles the heat of Clan Ultra autocannons: Hunchback IIC", () => {
        expect(importFixture("hunchback-iic").getBattleValue()).toBe(1679);
    });

    it("reads SSW's Clan CASE on an Inner Sphere-base Mixed Tech design: Archer C", () => {
        const mech = importFixture("archer-c");
        expect(mech.hasClanCASE()).toBe(true);
        expect(mech.getBattleValue()).toBe(1883);

        const copy = new BattleMech();
        copy.importJSON(mech.exportJSON());
        expect(copy.hasClanCASE()).toBe(true);
        expect(copy.getBattleValue()).toBe(1883);

        mech.setClanCASE(false);
        // Four slots of LRM ammo in the side torsos, -15 each, x 1.2 Defensive Factor.
        expect(mech.getBattleValue()).toBe(1883 - 72);
    });

    it("reads each patchwork location's armor type: Victor VTR-9K2 St.James", () => {
        const mech = importFixture("victor-vtr-9k2-st-james");
        expect(mech.isPatchworkArmor()).toBe(true);
        expect(mech.getPatchworkArmorType("head").tag).toBe("standard");
        expect(mech.getPatchworkArmorType("leftArm").tag).toBe("ferro-fibrous");
        expect(mech.getPatchworkArmorType("rightLeg").tag).toBe("ferro-fibrous");
        expect(mech.getTotalArmor()).toBe(244);
        expect(mech.sswImportErrors).toEqual([]);
        expect(mech.getBattleValue()).toBe(2006);
    });

    it("takes 0.8 of a drone's weapon BV and 0.95 of its total, with no cockpit modifier (TO:AUE p.192): Celerity CLR-04-R", () => {
        const mech = importFixture("celerity-clr-04-r");
        expect(mech.hasDroneOperatingSystem()).toBe(true);
        // Defensive 82.50 (the front legs' armor included) + Offensive (TSEMP One-Shot 98 x 0.8 + 15 tons) x 3.44 = 403.80;
        // x 0.95, the Small Cockpit's 0.95 not applied.
        expect(mech.getBattleValue()).toBe(384);
    });

    it("adds 5 per slot for an armored cockpit, and 1 ton (TO:AUE pp.94, 192): Violator VT-U1", () => {
        const mech = importFixture("violator-vt-u1");
        expect(mech.getArmoredComponentRecords().map((armored) => armored.record.tag)).toEqual(["cockpit"]);
        expect(mech.getArmoredComponentWeight()).toBe(1);
        expect(mech.isCriticalSlotArmored("hd", 2)).toBe(true);
        expect(mech.isCriticalSlotArmored("hd", 1)).toBe(false);
        expect(mech.getRequiredRulesLevel()).toBeGreaterThanOrEqual(4);
        expect(mech.getBattleValue()).toBe(928);

        const copy = new BattleMech();
        copy.importJSON(mech.exportJSON());
        expect(copy.getArmoredComponentSlots()).toBe(1);
        expect(copy.getBattleValue()).toBe(928);

        mech.setComponentArmored("cockpit", false);
        expect(mech.hasArmoredComponents()).toBe(false);
        expect(mech.getBattleValue()).toBe(921);
    });

    it("adds 5 per slot for an armored engine, 0.5 tons and 150,000 C-bills a slot: Zeus X ZEU-X2", () => {
        const mech = importFixture("zeus-x-zeu-x2");
        expect(mech.getArmoredComponentSlots()).toBe(18);
        expect(mech.getArmoredComponentWeight()).toBe(9);
        expect(mech.getArmorableComponents().find((component) => component.key === "engine")?.armored).toBe(true);
        expect(mech.getBattleValue()).toBe(2120);
    });

    it("counts 5% of the gyro's BV for each armored gyro slot: Hunchback HBK-7X-4", () => {
        const mech = importFixture("hunchback-hbk-7x-4");
        // 50 tons x 0.5 = 25 gyro points; 4 slots x 5% = 5.
        expect(mech.getArmoredComponentSlots()).toBe(4);
        expect(mech.getBattleValue()).toBe(1208);
    });

    it("installs SSW's cockpit systems: Full-Head Ejection System (Phoenix Hawk PXH-4L Sante), ejection seat (Rock Hound)", () => {
        const hawk = importFixture("phoenix-hawk-pxh-4l-sante");
        expect(tags(hawk)).toContain("full-head-ejection-system");
        expect(hawk.sswImportErrors).toEqual([]);
        expect(hawk.getBattleValue()).toBe(1442);

        const hound = importFixture("rock-hound-am-prm-rh7");
        const seat = hound.getInstalledEquipment().find((item) => item.tag === "industrialmech-ejection-seat");
        expect(seat?.location).toBe("hd");
        expect(hound.getUnallocatedCriticals()).toEqual([]);
        expect(hound.sswImportErrors).toEqual([]);
    });

    it("reports a Cockpit Command Console it cannot build yet: Hatamoto-Godai HTM-30Z", () => {
        const mech = importFixture("hatamoto-godai-htm-30z");
        expect(mech.sswImportErrors.some((error) => error.includes("Command Console"))).toBe(true);
    });

    it("imports IndustrialMech and Primitive files, which were skipped: Harvester Ant KIC-3, Commando COM-1A", () => {
        const ant = importFixture("harvester-ant-kic-3");
        expect(ant.isIndustrialMech()).toBe(true);
        // A quad's front legs keep SSW's la/ra armor.
        expect(ant.getTotalArmor()).toBe(48);
        expect(ant.sswImportErrors).toEqual([]);
        expect(ant.getBattleValue()).toBe(143);

        const commando = importFixture("commando-com-1a");
        expect(commando.sswImportErrors).toEqual([]);
        expect(commando.getBattleValue()).toBe(475);
    });

    it("places a jump jet listed in a single location: Space Hound AM-PRM-SH1", () => {
        const mech = importFixture("space-hound-am-prm-sh1");
        expect(mech.getJumpSpeed()).toBe(1);
        expect(mech.getUnallocatedCriticals()).toEqual([]);
        expect(mech.getBattleValue()).toBe(465);
    });

    it("lets an Experimental IndustrialMech mount BattleMech armor (TO:AUE p.92): Spindrift SDT-1", () => {
        const mech = importFixture("spindrift-sdt-1");
        expect(mech.sswImportErrors).toEqual([]);
        expect(mech.getRequiredRulesLevel()).toBeGreaterThanOrEqual(4);
        expect(mech.getBattleValue()).toBe(441);
    });

    it("reports a Torso-Mounted Cockpit on an IndustrialMech: Crosscut ED-XX", () => {
        const mech = importFixture("crosscut-ed-xx");
        expect(mech.sswImportErrors).toContain("Cannot mount a Torso-Mounted Cockpit on an IndustrialMech (TM p.69)");
    });

    it("imports an arm AES, x 1.25 for the arm's weapons and +10% tonnage (TO:AUE p.192), and reports the turret: Dig Lord RCL-Z1", () => {
        const mech = importFixture("dig-lord-rcl-z1");
        expect(mech.getInstalledEquipment().find((item) => item.tag === "aes-arm")?.location).toBe("ra");
        expect(mech.sswImportErrors.some((error) => error.includes("left torso turret"))).toBe(true);
        expect(mech.getBattleValue()).toBe(681);
    });

    it("loads an MML (LRM) ton for the MML, not the LRM 15 beside it: HawkWolf HWK-3F", () => {
        const mech = importFixture("hawkwolf-hwk-3f");
        const bins = mech.getInstalledEquipment().filter((item) => item.tag === "ammo-lrm-standard");
        expect(bins.map((bin) => mech.getAmmoBinWeapon(bin)?.tag).sort()).toEqual(["lrm-15", "lrm-15", "lrm-15", "mml-5"]);
        expect(mech.getBattleValue()).toBe(1349);
    });

    it("adds the PPC Capacitor's 5 heat to its PPC for BV (TO:AUE p.194): Rook-X NH-1B", () => {
        expect(importFixture("rook-x-nh-1b").getBattleValue()).toBe(1187);
    });

    it("places SSW's multislot Blue Shield in each listed slot; +0.2 armor and structure modifiers, explosive in every location but the head (TO:AUE p.194): Zeus-X ZEU-9WD (Stacy)", () => {
        const mech = importFixture("zeus-x-zeu-9wd-stacy");
        const criticals = mech.getCriticals() as unknown as Record<string, ({ tag: string } | null)[]>;
        expect(criticals.leftTorso[2]?.tag).toBe("blue-shield");
        expect(criticals.rightArm[3]?.tag).toBe("blue-shield");
        expect(criticals.centerTorso[10]?.tag).toBe("blue-shield");
        expect(mech.getUnallocatedCriticals()).toEqual([]);
        expect(mech.sswImportErrors).toEqual([]);
        expect(mech.getBattleValue()).toBe(1921);
    });

    it("reports a multislot system it does not know", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const mech = new BattleMech();
        mech.importSSWXML(readFileSync("src/utils/__fixtures__/zeus-x-zeu-9wd-stacy.ssw", "utf8").replace("Blue Shield PFD", "Mystery Field"));
        expect(mech.sswImportErrors).toContain("Cannot import the Mystery Field");
    });

    it("takes the Null Signature System's 10 heat and the Chameleon LPS's 6 off the heat pool: Exterminator EXT-4C", () => {
        const mech = importFixture("exterminator-ext-4c");
        const criticals = mech.getCriticals() as unknown as Record<string, ({ tag: string } | null)[]>;
        expect(criticals.leftTorso[9]?.tag).toBe("null-signature-system");
        expect(criticals.leftLeg[4]?.tag).toBe("chameleon-lps");
        expect(mech.sswImportErrors).toEqual([]);
        expect(mech.getBattleValue()).toBe(1420);
    });

    it("counts the Void Signature System: Raptor II RPT-5X", () => {
        const mech = importFixture("raptor-ii-rpt-5x");
        expect(tags(mech)).toContain("void-signature-system");
        expect(mech.getBattleValue()).toBe(1124);
    });

    it("adds 0.4 heat sink capacity per heat sink, rounded up, for a Radical Heat Sink System (IO:AE p.185): Lament LMT-4RC, LMT-3C", () => {
        // 15 double heat sinks: 30 + 6 = 36, as the rule's own example gives.
        expect(importFixture("lament-lmt-4rc").getBattleValue()).toBe(2474);
        expect(importFixture("lament-lmt-3c").getBattleValue()).toBe(1874);
    });

    it("doubles the center torso armor and takes 0.95 for a Torso-Mounted Cockpit (TO:AUE p.193): Great Turtle GTR-2", () => {
        const mech = importFixture("great-turtle-gtr-2");
        expect(mech.getCockpitType().tag).toBe("torso-mounted");
        expect(mech.sswImportErrors).toEqual([]);
        expect(mech.getBattleValue()).toBe(2355);
    });

    it("does not count Nail/Rivet Gun ammo as explosive (TM p.317): Jabberwocky JAW-66D", () => {
        // SSW gives 353: it counts the ammo at 1 BV a ton where TM p.317 gives 0.
        expect(importFixture("jabberwocky-jaw-66d").getBattleValue()).toBe(352);
    });
});
