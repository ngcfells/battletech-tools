import { afterEach, describe, expect, it } from "vitest";
import { setLocalCustomEquipment } from "../data/equipment-registry";
import type { IEquipmentItem } from "../data/data-interfaces";
import { mechCustomEquipmentEnergy } from "../data/mech-custom-equipment-weapons-energy";
import { ARTVEE_CONVERSION_EQUIPMENT } from "../data/combat-vehicle-chassis-modifications-custom";
import Vehicle from "./vehicle";
import { getArtVeeComboGuns, getArtVeeIssues, getArtVeeVariant, getArtVeeWarnings } from "./vehicle-artvee";

describe("custom records by tech base", () => {
    const template = mechCustomEquipmentEnergy[0];
    const fixture = (tag: string, techBase: "is" | "clan"): IEquipmentItem => ({
        ...structuredClone(template),
        name: tag,
        tag,
        techBase,
        category: "Custom Equipment",
        rulesLevel: 6,
        introduced: 2000,
        prototype: undefined,
        extinct: null,
        reintroduced: null
    });
    const offered = (tech: string): string[] => {
        const vehicle = new Vehicle();
        vehicle.setTech(tech);
        return vehicle.getAvailableEquipment(true, 6)
            .map((item) => item.tag)
            .filter((tag) => tag === "artvee-test-is" || tag === "artvee-test-clan");
    };

    afterEach(() => setLocalCustomEquipment([]));

    it("offers an IS custom record to IS and mixed vehicles, a Clan one to Clan and mixed vehicles", () => {
        setLocalCustomEquipment([fixture("artvee-test-is", "is"), fixture("artvee-test-clan", "clan")]);
        expect(offered("is")).toEqual(["artvee-test-is"]);
        expect(offered("clan")).toEqual(["artvee-test-clan"]);
        expect(offered("mis").sort()).toEqual(["artvee-test-clan", "artvee-test-is"]);
        expect(offered("mclan").sort()).toEqual(["artvee-test-clan", "artvee-test-is"]);
    });
});

describe("ArtVee construction", () => {
    const thumperArtVee = (options: { tonnage?: number; combo?: string; location?: string } = {}): Vehicle => {
        const vehicle = new Vehicle();
        vehicle.setTech("is");
        vehicle.setEra("jihad");
        vehicle.setMotiveType("tracked");
        vehicle.setTonnage(options.tonnage ?? 60);
        vehicle.setEngineType("xl");
        vehicle.setCruiseMP(4);
        vehicle.setHasTurret(true);
        vehicle.addEquipmentFromTag(options.combo ?? "custom-artvee-thumper-combo", options.location ?? "turret");
        vehicle.addEquipmentFromTag("ammo-thumper-standard", "body");
        vehicle.addEquipmentFromTag("ammo-is-ac-5-standard", "body");
        vehicle.setArtVee(true);
        return vehicle;
    };
    const plain = (tonnage = 60): Vehicle => {
        const vehicle = thumperArtVee({ tonnage });
        vehicle.setArtVee(false);
        return vehicle;
    };
    const logValue = (log: string, label: string): number => {
        const row = log.split("<br />").find((line) => line.startsWith(label));
        if (!row) throw new Error(`no cost row ${label}`);
        return Number(row.slice(row.lastIndexOf(": ") + 2).replace(/,/g, ""));
    };

    it("is offered at Custom Homebrew to tracked Combat Vehicles only", () => {
        const vehicle = plain();
        expect(vehicle.canBeArtVee(5)).toBe(false);
        expect(vehicle.canBeArtVee(6)).toBe(true);
        const wheeled = plain();
        wheeled.setMotiveType("wheeled");
        expect(wheeled.canBeArtVee(6)).toBe(false);
        const support = plain();
        support.setSupportVehicle(true);
        expect(support.canBeArtVee(6)).toBe(false);
        const heavy = plain();
        heavy.setTonnage(110);
        expect(heavy.canBeArtVee(6)).toBe(false);
        const civilWar = plain();
        civilWar.setEra("civil-war");
        expect(civilWar.canBeArtVee(6)).toBe(false);
        const starLeague = plain();
        starLeague.setEra("star-league");
        expect(starLeague.canBeArtVee(6)).toBe(true);
    });

    it("weighs 10% of tonnage, rounded up to the half ton, and takes 2 body and 1 turret slots", () => {
        expect(thumperArtVee({ tonnage: 55 }).getArtVeeConversionWeight()).toBe(5.5);
        expect(thumperArtVee({ tonnage: 58 }).getArtVeeConversionWeight()).toBe(6);
        expect(thumperArtVee().getArtVeeConversionWeight()).toBe(6);
        expect(plain().getArtVeeConversionWeight()).toBe(0);
        expect(thumperArtVee().getWeights()).toContainEqual({ name: "ArtVee Conversion Equipment", weight: 6 });
        expect(plain().getWeights().some((row) => row.name === "ArtVee Conversion Equipment")).toBe(false);
        expect(thumperArtVee().getUsedItemSlots()).toBe(plain().getUsedItemSlots() + 3);
        expect(ARTVEE_CONVERSION_EQUIPMENT.bodySlots + ARTVEE_CONVERSION_EQUIPMENT.turretSlots).toBe(3);
    });

    it("adds half the weapons, equipment and structure cost before the final multiplier (IO:AE p.181 precedent)", () => {
        const vehicle = thumperArtVee();
        const log = vehicle.getCBillCostLog();
        const label = "ArtVee Conversion Equipment (0.5 x weapons, equipment and structure)";
        const structure = logValue(log, "Internal Structure");
        const equipment = vehicle.getEquipmentList().filter((item) => !item.isAmmo).reduce((sum, item) => sum + item.cbills, 0);
        expect(logValue(log, label)).toBe(Math.round(0.5 * (structure + equipment)));
        expect(plain().getCBillCostLog()).not.toContain("ArtVee Conversion Equipment");
        expect(vehicle.getCBillCost()).toBeGreaterThan(plain().getCBillCost());
    });

    it("needs an XL or XXL engine, 4/6 (3/5 for the Long Tom), and one combo gun in the turret", () => {
        expect(getArtVeeIssues(thumperArtVee())).toEqual([]);
        expect(getArtVeeVariant(thumperArtVee())).toBe("thumper");

        const standard = thumperArtVee();
        standard.setEngineType("standard");
        expect(getArtVeeIssues(standard)).toEqual(["ArtVee needs an XL or XXL engine"]);

        const slow = thumperArtVee();
        slow.setCruiseMP(3);
        expect(getArtVeeIssues(slow)).toEqual(["ArtVee needs at least 4 Cruising MP"]);

        const longTom = thumperArtVee({ tonnage: 100, combo: "custom-artvee-long-tom-combo" });
        longTom.setCruiseMP(3);
        expect(getArtVeeVariant(longTom)).toBe("long-tom");
        expect(getArtVeeIssues(longTom)).toEqual([]);
        longTom.setCruiseMP(2);
        expect(getArtVeeIssues(longTom)).toEqual(["ArtVee with a Long Tom combo gun needs at least 3 Cruising MP"]);

        const none = thumperArtVee();
        const gun = getArtVeeComboGuns(none)[0];
        expect(gun.tag).toBe("custom-artvee-thumper-combo");
        none.removeEquipment(gun.uuid as string);
        expect(getArtVeeComboGuns(none)).toEqual([]);
        expect(getArtVeeVariant(none)).toBeNull();
        expect(getArtVeeIssues(none)).toEqual(["ArtVee needs exactly one combo gun (has 0)"]);

        const two = thumperArtVee();
        two.addEquipmentFromTag("custom-artvee-sniper-combo", "turret");
        expect(getArtVeeVariant(two)).toBeNull();
        expect(getArtVeeIssues(two)).toEqual(["ArtVee needs exactly one combo gun (has 2)"]);

        const body = thumperArtVee({ location: "body" });
        expect(getArtVeeIssues(body)).toEqual(["ArtVee combo gun must be mounted in the turret"]);
    });

    it("warns below half armor and recommends Armored Motive when it is available", () => {
        const vehicle = thumperArtVee();
        vehicle.setArmorTonnage(0);
        const max = vehicle.getMaxArmorPoints();
        expect(getArtVeeWarnings(vehicle, 6)).toEqual([
            `ArtVee armor is below half the maximum (0 of ${max} points)`,
            "Armored Motive System recommended",
        ]);
        vehicle.allocateMaxArmor();
        expect(getArtVeeWarnings(vehicle, 6)).toEqual(["Armored Motive System recommended"]);
        vehicle.setChassisModification("armored-motive", true, 6);
        expect(getArtVeeWarnings(vehicle, 6)).toEqual([]);
        const starLeague = thumperArtVee();
        starLeague.setEra("star-league");
        starLeague.allocateMaxArmor();
        expect(getArtVeeWarnings(starLeague, 6)).toEqual([]);
        expect(getArtVeeWarnings(plain(), 6)).toEqual([]);
    });

    it("drops the ArtVee when the vehicle stops being a tracked Combat Vehicle", () => {
        const vehicle = thumperArtVee();
        vehicle.setMotiveType("wheeled");
        expect(vehicle.isArtVee()).toBe(false);
        expect(getArtVeeComboGuns(vehicle)).toHaveLength(1);
        expect(getArtVeeIssues(vehicle)).toContain("ArtVee Thumper Combo Gun is an ArtVee combo gun, but the vehicle is not an ArtVee");
        const heavy = thumperArtVee();
        heavy.setTonnage(110);
        expect(heavy.isArtVee()).toBe(false);
    });

    it("refuses combo guns on a vehicle that is not an ArtVee", () => {
        const offered = (vehicle: Vehicle): boolean => vehicle.getAvailableEquipment(true, 6).some((item) => item.tag === "custom-artvee-thumper-combo" && item.available);
        expect(offered(plain())).toBe(false);
        expect(offered(thumperArtVee())).toBe(true);
    });

    it("requires rules level 6", () => {
        expect(thumperArtVee().getRequiredRulesLevel()).toBe(6);
    });

    it("turns the turret on and clears Omni, and turning it off leaves the equipment alone", () => {
        const vehicle = plain();
        vehicle.setOmni(true);
        vehicle.setHasTurret(false);
        expect(vehicle.setArtVee(true)).toBe(true);
        expect(vehicle.hasTurret()).toBe(true);
        expect(vehicle.isOmni()).toBe(false);
        vehicle.setArtVee(false);
        expect(vehicle.isArtVee()).toBe(false);
        expect(getArtVeeComboGuns(vehicle)).toHaveLength(1);
        expect(plain().setArtVee(true, 5)).toBe(false);
    });

    it("rates the ArtVee once, blended as for LAMs (IO:AE p.185)", () => {
        const log = thumperArtVee().getBattleValueLog();
        expect(log).toContain("ArtVee: movement from Vehicle Mode; Siege Mode (0 MP) adds nothing (blended, IO:AE p.185)");
        expect(log).toContain("+ ArtVee Thumper Combo Gun (turret) = 93.00");
        expect(log).toContain("+ Ammunition for custom-artvee-thumper-combo = 14.00");
        expect(plain().getBattleValueLog()).not.toContain("ArtVee:");
    });

    it("imports", () => {
        const vehicle = thumperArtVee();
        const saved = JSON.stringify(vehicle.export());
        const loaded = new Vehicle(saved);
        expect(loaded.isArtVee()).toBe(true);
        expect(getArtVeeVariant(loaded)).toBe("thumper");
        expect(loaded.getEquipmentList().filter((item) => item.isAmmo).map((item) => item.tag).sort())
            .toEqual(["ammo-is-ac-5-standard", "ammo-thumper-standard"]);
        expect(loaded.getImportIssues()).toEqual([]);

        const ordinary = JSON.parse(saved);
        delete ordinary.artVee;
        expect(new Vehicle(JSON.stringify(ordinary)).isArtVee()).toBe(false);
        expect(JSON.parse(JSON.stringify(plain().export())).artVee).toBeUndefined();

        const wheeled = JSON.parse(saved);
        wheeled.motiveType = "wheeled";
        const dropped = new Vehicle(JSON.stringify(wheeled));
        expect(dropped.isArtVee()).toBe(false);
        expect(dropped.getImportIssues()).toContain("Dropped the ArtVee conversion: the vehicle is not a tracked Combat Vehicle");
    });

    describe("play", () => {
        const withLaser = (): Vehicle => {
            const vehicle = thumperArtVee();
            vehicle.addEquipmentFromTag("medium-laser", "front");
            return vehicle;
        };
        const combo = (vehicle: Vehicle): IEquipmentItem => getArtVeeComboGuns(vehicle)[0];
        const laser = (vehicle: Vehicle): IEquipmentItem => vehicle.getEquipmentList().find((item) => item.tag === "medium-laser")!;

        it("transforms in the Movement Phase; the new mode takes effect at the end of the turn", () => {
            const vehicle = thumperArtVee();
            expect(vehicle.getArtVeeMode()).toBe("vehicle");
            expect(vehicle.startArtVeeTransformation()).toBeNull();
            expect(vehicle.getArtVeeMode()).toBe("vehicle");
            expect(vehicle.getInPlay().artVeeTransformingTo).toBe("siege");
            expect(vehicle.startArtVeeTransformation()).toBe("it is already transforming");
            vehicle.turnReset();
            expect(vehicle.getArtVeeMode()).toBe("siege");
            expect(vehicle.getInPlay().artVeeTransformingTo).toBe("");
            expect(vehicle.startArtVeeTransformation()).toBeNull();
            vehicle.turnReset();
            expect(vehicle.getArtVeeMode()).toBe("vehicle");
            expect(plain().startArtVeeTransformation()).toBe("it is not an ArtVee");
        });

        it("in Siege Mode has 0 MP but is not immobile", () => {
            const vehicle = thumperArtVee();
            expect(vehicle.getEffectiveCruiseMP()).toBe(4);
            vehicle.startArtVeeTransformation();
            vehicle.turnReset();
            expect(vehicle.getEffectiveCruiseMP()).toBe(0);
            expect(vehicle.getEffectiveFlankMP()).toBe(0);
            expect(vehicle.isImmobile()).toBe(false);
            expect(vehicle.getTargetMovementModifier()).toBe(0);
            // The turret still turns through 360 degrees.
            expect(vehicle.canRotateTurret("turret")).toBe(true);
            expect(vehicle.setTurretFacing("turret", 3)).toBe(true);
            expect(vehicle.getTurretFacing("turret")).toBe(3);
        });

        it("fires the combo gun's AC profile only in Vehicle Mode, and nothing on a transformation turn", () => {
            const vehicle = thumperArtVee();
            const gun = combo(vehicle);
            expect(vehicle.getArtVeeWeaponBlock(gun)).toBeNull();
            expect(vehicle.getWeaponToHitModifier(gun)).not.toBeNull();
            vehicle.startArtVeeTransformation();
            expect(vehicle.getArtVeeWeaponBlock(gun)).toBe("Transforming: the combo gun can't fire this turn");
            expect(vehicle.getWeaponToHitModifier(gun)).toBeNull();
            vehicle.turnReset();
            expect(vehicle.getArtVeeWeaponBlock(gun)).toBe("Siege Mode: fires as the Thumper Artillery Piece artillery (artillery rules)");
            expect(vehicle.getWeaponToHitModifier(gun)).toBeNull();
            vehicle.startArtVeeTransformation();
            vehicle.turnReset();
            expect(vehicle.getArtVeeWeaponBlock(gun)).toBeNull();
            expect(vehicle.getWeaponToHitModifier(gun)).not.toBeNull();
        });

        it("lets the other weapons fire in both modes", () => {
            const vehicle = withLaser();
            const weapon = laser(vehicle);
            expect(vehicle.getArtVeeWeaponBlock(weapon)).toBeNull();
            vehicle.startArtVeeTransformation();
            expect(vehicle.getArtVeeWeaponBlock(weapon)).toBeNull();
            expect(vehicle.getWeaponToHitModifier(weapon)).not.toBeNull();
            vehicle.turnReset();
            expect(vehicle.getArtVeeWeaponBlock(weapon)).toBeNull();
            expect(vehicle.getWeaponToHitModifier(weapon)).not.toBeNull();
        });

        it("is stranded in its mode when the conversion equipment is destroyed", () => {
            const vehicle = thumperArtVee();
            // Only the conversion equipment is a candidate when it is the pick.
            const text = vehicle.applyCriticalHit("weaponDestroyed", "front", "artvee-conversion");
            expect(text).toContain("ArtVee Conversion Equipment destroyed: stuck in its current Mode");
            expect(vehicle.getInPlay().artVeeConversionDestroyed).toBe(true);
            expect(vehicle.startArtVeeTransformation()).toBe("the conversion equipment is destroyed");
            expect(vehicle.getArtVeeMode()).toBe("vehicle");
            // Once destroyed, it is no longer a candidate.
            vehicle.applyCriticalHit("weaponDestroyed", "front", "artvee-conversion");
            expect(vehicle.getInPlay().artVeeConversionDestroyed).toBe(true);
            expect(plain().applyCriticalHit("weaponDestroyed", "front", "artvee-conversion")).not.toContain("ArtVee Conversion");
        });

        it("stays in its current mode when the conversion equipment is destroyed mid-transformation", () => {
            const vehicle = thumperArtVee();
            vehicle.startArtVeeTransformation();
            vehicle.applyCriticalHit("weaponDestroyed", "front", "artvee-conversion");
            vehicle.turnReset();
            expect(vehicle.getArtVeeMode()).toBe("vehicle");
            expect(vehicle.getInPlay().artVeeTransformingTo).toBe("");
        });

        it("stays in its current mode when the crew is killed mid-transformation", () => {
            const vehicle = thumperArtVee();
            vehicle.startArtVeeTransformation();
            vehicle.applyCriticalHit("crewKilled", "front");
            vehicle.turnReset();
            expect(vehicle.getArtVeeMode()).toBe("vehicle");
            expect(vehicle.getInPlay().artVeeTransformingTo).toBe("");
        });

        it("keeps the mode in the save", () => {
            const vehicle = thumperArtVee();
            vehicle.startArtVeeTransformation();
            vehicle.turnReset();
            vehicle.startArtVeeTransformation();
            vehicle.getInPlay().artVeeConversionDestroyed = true;
            const loaded = new Vehicle(JSON.stringify(vehicle.export(false)));
            expect(loaded.getArtVeeMode()).toBe("siege");
            expect(loaded.getInPlay().artVeeTransformingTo).toBe("vehicle");
            expect(loaded.getInPlay().artVeeConversionDestroyed).toBe(true);

            const old = JSON.parse(JSON.stringify(thumperArtVee().export(false)));
            delete old.inPlay.artVeeMode;
            delete old.inPlay.artVeeTransformingTo;
            delete old.inPlay.artVeeConversionDestroyed;
            const legacy = new Vehicle(JSON.stringify(old));
            expect(legacy.getArtVeeMode()).toBe("vehicle");
            expect(legacy.getInPlay().artVeeTransformingTo).toBe("");
            expect(legacy.getInPlay().artVeeConversionDestroyed).toBe(false);
            expect(JSON.parse(JSON.stringify(vehicle.export(true))).inPlay).toBeUndefined();
        });
    });
});
