import { IEquipmentItem } from "./data-interfaces";

/* Custom Homebrew ammunition from the fan magazine Future Wars #32: fuel for the Smoker (see misc-custom.ts). */

export const ammoCustom: IEquipmentItem[] = [
    {
        isAmmo: true,
        isSpecialAmmo: false,
        name: "Smoker - Fuel",
        altNames: ["Smoker Fuel"],
        tag: "ammo-custom-smoker-fuel",
        techBase: "universal",
        altTags: ["ammo-custom-smoker"],
        sort: "ammo, smoker fuel",
        category: "Ammunition",
        cbills: 1000,
        introduced: 1950,
        extinct: null,
        reintroduced: null,
        battleValue: 1,
        heat: 0,
        heatAero: 0,
        weight: 1,
        range: { min: 0, short: 0, medium: 0, long: 0 },
        space: { battlemech: 1, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: -1, smallCraft: -1, dropShip: -1 },
        roundsPerTon: 50,
        explosive: false,
        techRating: "b",
        book: "Future Wars #32",
        page: 9,
        alphaStrike: { specialAbility: [], heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike effect"] },
        catalog: "custom",
        rulesLevel: 6,
        notes: "Each ton of fuel provides 50 hexes of level 2 smoke for the Smoker. A hit to the fuel results in a small fire, doing 5 points of damage and generating 10 points of heat (Future Wars #32, printed p.9). "
            + "Not printed in Future Wars #32: cost, Battle Value, dates and tech rating are those of Vehicle Flamer ammo (TM p.218) and Fluid Gun obscurant ammo (TO:AUE p.174), "
            + "both 1,000 C-bills a ton and BV 1: introduced 1950 with the Smoker, never extinct, tech B (user ruling 2026-10-21)."
    }
];
