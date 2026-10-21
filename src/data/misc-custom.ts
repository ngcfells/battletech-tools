import { IEquipmentItem } from "./data-interfaces";

/*
 * Custom Homebrew equipment from the fan magazine Future Wars #32. Both devices are in the one catalog because
 * they are not canon: neither appears in any published rulebook.
 *
 * The magazine predates BV2 and printed dates, so cost, Battle Value, dates, tech rating and the Smoker's 'Mech slots
 * are taken from the nearest canon device (user ruling 2026-10-21: the tech has always been around and was never
 * lost). Each record's notes name its analog. Vehicle slots are 1 each (the magazine gives the Buckler's "1 Critical").
 */

const derived = (analog: string) => `Not printed in Future Wars #32: cost, Battle Value, dates, tech rating${analog}.`;

export const miscCustom: IEquipmentItem[] = [
    {
        name: "Smoker", tag: "custom-smoker", techBase: "universal", catalog: "custom", sort: "equipment, smoker", category: "Custom Equipment",
        notes: "Smoke generator. While it runs, the 'Mech leaves a trail of smoke behind and around its movement path, reducing visibility. "
            + "Each ton of fuel (ammo-custom-smoker-fuel) provides 50 hexes of level 2 smoke. It generates three heat points every turn it is used. "
            + "A hit to the fuel results in a small fire, doing 5 points of damage and generating 10 points of heat (Future Wars #32, 'New Toys for Techs', printed p.9). "
            + derived(" and 'Mech slots are the Vehicle Flamer's (TM p.218), a fuel-fed projector of the same weight: 7,500 C-bills, BV 5 (counted as defensive, it lays smoke), introduced 1950, never extinct, tech B, 1 slot"),
        damage: 0, damageAero: 0, accuracyModifier: 0, cbills: 7500, introduced: 1950, extinct: null, reintroduced: null,
        battleValue: 5, battleValueDefensive: true, heat: 3, heatAero: 3, weight: 0.5,
        range: { min: 0, short: 0, medium: 0, long: 0 }, space: { battlemech: 1, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: -1, smallCraft: -1, dropShip: -1 },
        ammoTypes: ["ammo-custom-smoker-fuel"], shotsPerTon: 50, minAmmoTons: 1, explosive: false, weaponType: [], techRating: "b", book: "Future Wars #32", page: 9, rulesLevel: 6,
        alphaStrike: { heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike effect"] }
    },
    {
        name: "Buckler Smoke Dispenser", tag: "custom-buckler-smoke-dispenser", techBase: "universal", catalog: "custom", sort: "equipment, buckler smoke dispenser", category: "Custom Equipment",
        notes: "The BSD smoke screen blocks line of sight to all attacks. 10 shots (integral), no range. Generates smoke as per the rules in the Compendium, in the unit's own hex. "
            + "The unit must remain stationary in the turn it activates, and the smoke takes effect immediately after the Movement Phase in which it is declared. "
            + "It cannot be mounted on VTOLs (Future Wars #32, 'Gargoyle Industries', printed p.17). "
            + derived(" are the Vehicular Grenade Launcher's (TO:AUE p.127), a launcher of the same weight, slots and heat: 10,000 C-bills, BV 15 (counted as defensive), introduced 2100, never extinct, tech C"),
        damage: 0, damageAero: 0, accuracyModifier: 0, cbills: 10000, introduced: 2100, extinct: null, reintroduced: null,
        battleValue: 15, battleValueDefensive: true, heat: 1, heatAero: 1, weight: 0.5,
        range: { min: 0, short: 0, medium: 0, long: 0 }, space: { battlemech: 1, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: -1, smallCraft: -1, dropShip: -1 },
        excludedMotives: ["vtol"],
        shotsPerTon: 10, minAmmoTons: 0, explosive: false, weaponType: [], techRating: "c", book: "Future Wars #32", page: 17, rulesLevel: 6,
        alphaStrike: { heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike effect"] }
    }
];
