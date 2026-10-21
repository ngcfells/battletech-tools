import { IEquipmentItem } from "./data-interfaces";

/*
 * Custom Homebrew equipment from the fan magazine Future Wars #32. Both devices are in the one catalog because
 * they are not canon: neither appears in any published rulebook.
 *
 * Cost, Battle Value, dates and 'Mech critical slots are not printed for either device, so they are left at the
 * neutral values used for unknown data in custom records (0 cost and BV, no dates, availability in every era) and
 * the notes say so. Vehicle slots are 1 each (a builder decision; the magazine gives the Buckler's "1 Critical").
 */

const notPrinted = (...fields: string[]) => fields.map((field) => `not yet verified: ${field} is not printed in Future Wars #32`).join("; ") + ".";

export const miscCustom: IEquipmentItem[] = [
    {
        name: "Smoker", tag: "custom-smoker", techBase: "universal", catalog: "custom", sort: "equipment, smoker", category: "Custom Equipment",
        notes: "Smoke generator. While it runs, the 'Mech leaves a trail of smoke behind and around its movement path, reducing visibility. "
            + "Each ton of fuel (ammo-custom-smoker-fuel) provides 50 hexes of level 2 smoke. It generates three heat points every turn it is used. "
            + "A hit to the fuel results in a small fire, doing 5 points of damage and generating 10 points of heat (Future Wars #32, 'New Toys for Techs', printed p.9). "
            + notPrinted("cost", "Battle Value", "dates", "'Mech critical slots"),
        damage: 0, damageAero: 0, accuracyModifier: 0, cbills: 0, introduced: 0, extinct: null, reintroduced: null,
        battleValue: 0, heat: 3, heatAero: 3, weight: 0.5,
        range: { min: 0, short: 0, medium: 0, long: 0 }, space: { battlemech: 1, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: -1, smallCraft: -1, dropShip: -1 },
        ammoTypes: ["ammo-custom-smoker-fuel"], shotsPerTon: 50, minAmmoTons: 1, explosive: false, weaponType: [], techRating: "x", book: "Future Wars #32", page: 9, rulesLevel: 6,
        alphaStrike: { heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike effect"] }
    },
    {
        name: "Buckler Smoke Dispenser", tag: "custom-buckler-smoke-dispenser", techBase: "universal", catalog: "custom", sort: "equipment, buckler smoke dispenser", category: "Custom Equipment",
        notes: "The BSD smoke screen blocks line of sight to all attacks. 10 shots (integral), no range. Generates smoke as per the rules in the Compendium, in the unit's own hex. "
            + "The unit must remain stationary in the turn it activates, and the smoke takes effect immediately after the Movement Phase in which it is declared. "
            + "It cannot be mounted on VTOLs (Future Wars #32, 'Gargoyle Industries', printed p.17). "
            + notPrinted("cost", "Battle Value", "dates"),
        damage: 0, damageAero: 0, accuracyModifier: 0, cbills: 0, introduced: 0, extinct: null, reintroduced: null,
        battleValue: 0, heat: 1, heatAero: 1, weight: 0.5,
        range: { min: 0, short: 0, medium: 0, long: 0 }, space: { battlemech: 1, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: -1, smallCraft: -1, dropShip: -1 },
        excludedMotives: ["vtol"],
        shotsPerTon: 10, minAmmoTons: 0, explosive: false, weaponType: [], techRating: "x", book: "Future Wars #32", page: 17, rulesLevel: 6,
        alphaStrike: { heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike effect"] }
    }
];
