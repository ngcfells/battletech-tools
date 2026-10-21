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
        cbills: 0,
        introduced: 0,
        extinct: null,
        reintroduced: null,
        battleValue: 0,
        heat: 0,
        heatAero: 0,
        weight: 1,
        range: { min: 0, short: 0, medium: 0, long: 0 },
        space: { battlemech: 1, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: -1, smallCraft: -1, dropShip: -1 },
        roundsPerTon: 50,
        explosive: false,
        techRating: "x",
        book: "Future Wars #32",
        page: 9,
        alphaStrike: { specialAbility: [], heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike effect"] },
        catalog: "custom",
        rulesLevel: 6,
        notes: "Each ton of fuel provides 50 hexes of level 2 smoke for the Smoker. A hit to the fuel results in a small fire, doing 5 points of damage and generating 10 points of heat (Future Wars #32, printed p.9). "
            + "not yet verified: cost is not printed in Future Wars #32; not yet verified: Battle Value is not printed in Future Wars #32; not yet verified: dates are not printed in Future Wars #32."
    }
];
