import { describe, expect, it } from "vitest";
import { BattleMech } from "./battlemech";
import { BattleMechForce } from "./battlemech-force";
import Building from "./building";
import { ANTI_ORBITAL_AMMO_TAG, findAntiOrbitalGuns, IAntiOrbitalGun } from "./space-tracker";
import Vehicle from "./vehicle";

// Anti-orbital guns in the space turn tracker (design 2026-10-22; house rules in TRO.md, user rulings 2026-10-22).
const longTomTank = (ammoTag: string = ANTI_ORBITAL_AMMO_TAG): Vehicle => {
    const vehicle = new Vehicle();
    vehicle.setTech("is");
    vehicle.setEra("jihad");
    vehicle.setMotiveType("tracked");
    vehicle.setTonnage(60);
    vehicle.setName("Long Tom Carrier");
    vehicle.addEquipmentFromTag("long-tom-artillery", "body");
    vehicle.addEquipmentFromTag(ammoTag, "body");
    return vehicle;
};

const longTomArtVee = (): Vehicle => {
    const vehicle = new Vehicle();
    vehicle.setTech("is");
    vehicle.setEra("jihad");
    vehicle.setMotiveType("tracked");
    vehicle.setTonnage(80);
    vehicle.setEngineType("xl");
    vehicle.setCruiseMP(3);
    vehicle.setHasTurret(true);
    vehicle.addEquipmentFromTag("custom-artvee-long-tom-combo", "turret");
    vehicle.addEquipmentFromTag(ANTI_ORBITAL_AMMO_TAG, "body");
    vehicle.setArtVee(true);
    return vehicle;
};

const forceWith = (...units: (Vehicle | Building | BattleMech)[]): BattleMechForce => {
    const force = new BattleMechForce();
    for (const unit of units) {
        if (unit instanceof Vehicle) force.groups[0].vehicles.push(unit);
        else if (unit instanceof Building) force.groups[0].buildings.push(unit);
        else force.groups[0].members.push(unit);
    }
    return force;
};

const onlyGun = (force: BattleMechForce): IAntiOrbitalGun => {
    const guns = findAntiOrbitalGuns(force);
    expect(guns).toHaveLength(1);
    return guns[0];
};

describe("anti-orbital guns", () => {
    it("finds a Long Tom with anti-orbital rounds and nothing else", () => {
        const gun = onlyGun(forceWith(longTomTank()));
        expect(gun.weapon.tag).toBe("long-tom-artillery");
        expect(gun.unitName).toBe("Long Tom Carrier");
        expect(gun.shotsLeft).toBe(3);
        expect(findAntiOrbitalGuns(forceWith(longTomTank("ammo-long-tom-standard")))).toEqual([]);
    });

    it("counts an ArtVee's combo gun only in Siege Mode", () => {
        const artVee = longTomArtVee();
        const force = forceWith(artVee);
        expect(findAntiOrbitalGuns(force)).toEqual([]);
        expect(artVee.startArtVeeTransformation()).toBeNull();
        artVee.turnReset();
        expect(artVee.getArtVeeMode()).toBe("siege");
        expect(onlyGun(force).shotsLeft).toBe(3);
    });

    it("finds a building's Long Tom", () => {
        const building = new Building();
        building.setClassification("castles-brian");
        expect(building.addEquipmentFromTag("long-tom-artillery")).not.toBeNull();
        expect(building.addEquipmentFromTag(ANTI_ORBITAL_AMMO_TAG)).not.toBeNull();
        expect(onlyGun(forceWith(building)).shotsLeft).toBe(3);
    });

    it("finds a 'Mech's Long Tom", () => {
        const mech = new BattleMech();
        mech.setTech("is");
        mech.setTonnage(100);
        mech.addEquipmentFromTag("long-tom-artillery", "is", "rt", false, null, "", false, [], undefined, undefined);
        mech.addEquipmentFromTag(ANTI_ORBITAL_AMMO_TAG, "is", "lt", false, null, "", false, [], undefined, undefined, -1, "", true);
        expect(onlyGun(forceWith(mech)).shotsLeft).toBe(3);
    });
});

describe("firing", () => {
    const setup = () => {
        const vehicle = longTomTank();
        const force = forceWith(vehicle);
        const gun = () => onlyGun(force);
        return { vehicle, force, tracker: force.spaceTracker, gun };
    };

    it("fires: spends a shot, starts the cooldown and lists the shot", () => {
        const { tracker, gun } = setup();
        expect(tracker.fire(gun(), "0712", "Lola III", 2).result).toBe("fired");
        expect(gun().shotsLeft).toBe(2);
        expect(tracker.getGunCooldown(gun(), 2)).toBe(5);
        expect(tracker.shotsInFlight).toHaveLength(1);
        expect(tracker.shotsInFlight[0]).toMatchObject({ aimedHex: "0712", targetName: "Lola III", firedGroundTurn: 2, firedSpaceTurn: 1, unitName: "Long Tom Carrier" });
    });

    it("asks for the roll before firing early, and changes nothing", () => {
        const { tracker, gun } = setup();
        tracker.fire(gun(), "0712", "", 2);
        expect(tracker.fire(gun(), "0712", "", 4)).toEqual({ result: "needs-roll", cooldown: 3 });
        expect(gun().shotsLeft).toBe(2);
        expect(tracker.shotsInFlight).toHaveLength(1);
    });

    it.each([[3, "destroyed"], [6, "misfire"], [10, "fired"]])("an early roll of %i gives %s", (roll, expected) => {
        const { tracker, gun } = setup();
        tracker.fire(gun(), "0712", "", 2);
        const result = tracker.fire(gun(), "0713", "", 4, roll);
        expect(result.result).toBe(expected);
        expect(gun().shotsLeft).toBe(1);
        if (expected === "destroyed") {
            expect(tracker.isGunDestroyed(gun())).toBe(true);
            expect(tracker.fire(gun(), "0712", "", 13).result).toBe("refused");
        } else if (expected === "misfire") {
            expect(result.result === "misfire" && result.reminder).toContain("3D6");
            expect(tracker.shotsInFlight).toHaveLength(1);
        } else {
            expect(tracker.shotsInFlight).toHaveLength(2);
        }
    });

    it("refuses a roll out of range, an empty hex, and an empty bin", () => {
        const { tracker, gun } = setup();
        expect(tracker.fire(gun(), "   ", "", 1).result).toBe("refused");
        tracker.fire(gun(), "0712", "", 1);
        expect(tracker.fire(gun(), "0712", "", 2, 13).result).toBe("refused");
        expect(tracker.fire(gun(), "0712", "", 2, 1).result).toBe("refused");
        expect(gun().shotsLeft).toBe(2);
        tracker.fire(gun(), "0712", "", 7);
        tracker.fire(gun(), "0712", "", 13);
        expect(gun().shotsLeft).toBe(0);
        expect(tracker.fire(gun(), "0712", "", 19).result).toBe("refused");
    });

    it("fires again freely from the next space turn", () => {
        const { tracker, gun } = setup();
        tracker.fire(gun(), "0712", "", 2);
        expect(tracker.getGunCooldown(gun(), 7)).toBe(0);
        expect(tracker.fire(gun(), "0712", "", 7).result).toBe("fired");
    });

    it("a ground round fired early on 2-4 destroys the gun", () => {
        const { tracker, gun } = setup();
        tracker.fire(gun(), "0712", "", 2);
        expect(tracker.rollEarlyFireForOtherRound(gun(), 9)).toBe("normal");
        expect(tracker.isGunDestroyed(gun())).toBe(false);
        expect(tracker.rollEarlyFireForOtherRound(gun(), 14)).toBeNull();
        expect(tracker.rollEarlyFireForOtherRound(gun(), 2)).toBe("destroyed");
        expect(tracker.isGunDestroyed(gun())).toBe(true);
        expect(gun().shotsLeft).toBe(2);
    });

    it("marks a vehicle's weapon destroyed on its sheet", () => {
        const { vehicle, tracker, gun } = setup();
        tracker.fire(gun(), "0712", "", 2);
        tracker.fire(gun(), "0712", "", 3, 2);
        expect(vehicle.getWeaponStatus(gun().weapon.uuid)).toBe("destroyed");
    });

    it("resolves a shot even after its unit leaves the roster", () => {
        const { force, tracker, gun } = setup();
        tracker.fire(gun(), "0712", "", 2);
        force.groups[0].vehicles = [];
        expect(findAntiOrbitalGuns(force)).toEqual([]);
        const due = tracker.getDueShots(7);
        expect(due).toHaveLength(1);
        expect(due[0].unitName).toBe("Long Tom Carrier");
        expect(tracker.resolve(due[0].id)).toBe(true);
        expect(tracker.resolve(due[0].id)).toBe(false);
        expect(tracker.shotsInFlight).toEqual([]);
    });
});
