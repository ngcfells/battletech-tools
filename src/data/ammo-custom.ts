import { IEquipmentItem } from "./data-interfaces";
import { mechISAmmo } from "./mech-is-ammo";

/* Custom Homebrew ammunition: fuel for the Smoker (Future Wars #32, see misc-custom.ts) and the Clan ArtVee breech rounds. */

/**
 * Clan ArtVee breech ammunition (ArtVee ruling 2026-10-21). Clan standard AC ammunition goes extinct in 2850, but the
 * Clans kept the ArtVee, so the combo guns need AC-profile rounds that stay in production. Every game stat is copied
 * from the canon Inner Sphere standard AC ammunition record; only the identity, tech base and dates differ.
 */
const clanBreechAmmo = (ac: "5" | "10" | "20"): IEquipmentItem => {
    const canon = mechISAmmo.find((item) => item.tag === `ammo-is-ac-${ac}-standard`);
    if (!canon) throw new Error(`Clan breech ammo: canon record ammo-is-ac-${ac}-standard not found`);
    return {
        isAmmo: true,
        isSpecialAmmo: false,
        name: `ArtVee AC/${ac} Breech Ammo (Clan)`,
        tag: `ammo-custom-clan-artvee-ac-${ac}`,
        techBase: "clan",
        sort: `ammo, artvee breech, ac ${ac.padStart(2, "0")}`,
        category: "Ammunition",
        cbills: canon.cbills,
        prototype: 2690,
        introduced: 2700,
        extinct: null,
        reintroduced: null,
        battleValue: canon.battleValue,
        heat: canon.heat,
        heatAero: canon.heatAero,
        weight: canon.weight,
        range: { ...canon.range },
        space: { ...canon.space },
        roundsPerTon: canon.roundsPerTon,
        explosive: canon.explosive,
        techRating: canon.techRating,
        book: "Custom",
        page: 0,
        alphaStrike: JSON.parse(JSON.stringify(canon.alphaStrike)),
        catalog: "custom",
        rulesLevel: 6,
        notes: `The Clans kept the ArtVee and never lost it, so its breech rounds stayed in production after the Clan standard AC ammunition went extinct (2850). Stats are the canon standard AC/${ac} ammunition's (ArtVee ruling 2026-10-21).`
    };
};


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
    },
    clanBreechAmmo("5"),
    clanBreechAmmo("10"),
    clanBreechAmmo("20")
];
