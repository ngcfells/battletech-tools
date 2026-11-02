import { IEquipmentItem } from "./data-interfaces";
import { equipmentBallistic } from "./equipment-ballistic";

/*
 * DISCLAIMER: This file processes gameplay data derived from the BattleTech universe. 
 * All official lore, trademarks, and intellectual property belong strictly to 
 * Catalyst Game Labs, Topps, and/or their respective corporate rights holders. 
 * Any original, fan-made content or custom homebrew data processed by this tool 
 * remains the exclusive property of its respective community creators, which,
 * where known, has been appropriately attributed.
 *
 * This open-source utility is a non-commercial fan project designed purely for 
 * tabletop gameplay assistance. Content processed by this file is not intended 
 * to challenge any copyright or trademark status, and this data is explicitly 
 * excluded from the software's underlying license (GNU GPLv3).
 */

/**
 * The Improved 'Mech Taser (Ideas #92): VoiceOfAN's police equipment submission, posted on Battletech Into The Future
 * (professorheyteen, 2024-04-27). The PDF keeps the canon BattleMech Taser's weight, slots, heat and damage and adds 14 BV
 * and 100,000 C-bills, so every other stat is copied from the canon record.
 */
const improvedMechTaser = (): IEquipmentItem => {
    const canon = equipmentBallistic.find((item) => item.tag === "mech-taser");
    if (!canon) throw new Error("iTaser: canon record mech-taser not found");
    const stats = { ...canon };
    delete stats.editions;
    return {
        ...stats,
        name: "Improved 'Mech Taser (iTaser)",
        altNames: ["iTaser", "Improved BattleMech Taser"],
        tag: "custom-improved-mech-taser",
        altTags: [],
        sort: "taser, battlemech, improved",
        catalog: "custom",
        rulesLevel: 6,
        cbills: canon.cbills + 100000,
        battleValue: (canon.battleValue ?? 0) + 14,
        prototype: 3090,
        introduced: 3101,
        book: "https://battletechfuture.com/2024/04/27/more-police-equipment-for-battletech/",
        page: 0,
        alphaStrike: { ...canon.alphaStrike, notes: ["Custom equipment: no Alpha Strike conversion"] },
        notes: "Custom Homebrew by VoiceOfAN, Battletech Into The Future (2024-04-27). A hit adds 5 heat to the target, then roll 2D6: "
            + "the target shuts down on 8+; a unit that stays active takes +2 to any roll it makes the following turn. It kills one member "
            + "of an infantry unit, battle armor included. No effect on buildings, aerospace fighters in flight or capital-scale units. "
            + "Its gauss-launched explosive harpoons do 6 damage to the carrier if the weapon or its ammunition is hit. Weight, slots, heat, "
            + "damage, range and ammunition are the canon BattleMech Taser's (TO:AUE p.158); +14 BV and +100,000 C-bills. Federated Suns, "
            + "prototype 3090, available 3101."
    };
};

export const ballisticCustom: IEquipmentItem[] = [
    improvedMechTaser(),
    {
        name: "AC/15 (Solaris7)", tag: "custom-ac-15", techBase: "universal", sort: "ac, 15", category: "Custom Equipment", notes: "Unverified placeholder based on the Kronos Battle Systems 'Class 15 autocannons' homebrew rules (Solaris7 forum thread, archived).",
        damage: 15, damageAero: 15, accuracyModifier: 0, cbills: 0, introduced: 2500, prototype: 2488, extinct: null, reintroduced: null, battleValue: 0, heat: 5, heatAero: 5, weight: 13, // Dates of the heavier-bore Standard AC/20 (IO p.38).
        range: { min: 3, short: 5, medium: 10, long: 15 }, space: { battlemech: 9, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        shotsPerTon: 7, minAmmoTons: 1, explosive: false, weaponType: ["DB", "S"], techRating: "f", book: "https://drive.google.com/drive/folders/0B5bLPOivte0vdjZ0YVQySDZ2SGc?resourcekey=0-oabxb-hZhk9iZVmeTa9zPQ", page: 0, rulesLevel: 6,
        alphaStrike: { heat: 5, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Unverified custom equipment"] }
    },
    {
        isAmmo: false,
        name: "Heavy Rotary Rifle Cannon",
        altNames: ["Heavy RRC", "HRRC"],
        tag: "heavy-rotary-rifle-cannon",
        techBase: "universal",
        altTags: ["weapon-hrrc"],
        sort: "rotary rifle cannon, heavy",
        category: "Ballistic Weapons",
        damage: 9,
        notes: "Fanon Age of War stop-gap system. Fires up to 6 shots; prone to jamming. Inflicts 6 damage vs BAR8+ armor types.",
        damageAero: 9,
        accuracyModifier: 0,
        cbills: 125000,
        introduced: 2400,
        extinct: 2500,
        reintroduced: null,
        battleValue: 105,
        heat: 6,
        heatAero: 6,
        weight: 10,
        range: { min: 0, short: 6, medium: 12, long: 18 },
        space: { battlemech: 5, protomech: -1, combatVehicle: 1, supportVehicle: 5, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        shotsPerTon: 6,
        ammoTypes: ["ammo-is-heavy-rotary-rifle-standard"],
        minAmmoTons: 1,
        explosive: false,
        weaponType: ["DB", "Fanon"],
        techRating: "c",
        book: "https://battletechfanon.fandom.com/wiki/Rotary_Rifle_Cannon",
        page: 0,
        alphaStrike: { heat: 6, rangeShort: 0.9, rangeMedium: 0.9, rangeLong: 0.9, rangeExtreme: 0, tc: true, notes: ["BAR8-Penalty"] },
        rangeAero: "m"
    },
    {
        isAmmo: false,
        name: "LB 15-X Autocannon",
        altNames: ["LB 15-X AC", "LBX 15"],
        tag: "custom-lb-15x-ac",
        techBase: "universal",
        sort: "ac, 15 lbx",
        category: "Custom Equipment",
        notes: "Custom weapon based on the Kronos Battle Systems 'Class 15 autocannons' homebrew rules. Can switch between solid slugs and cluster ammunition.",
        damage: 15,
        damageAero: 15,
        accuracyModifier: -1,
        cbills: 500000,
        introduced: 3050,
        extinct: null,
        reintroduced: null,
        battleValue: 0,
        heat: 4,
        heatAero: 4,
        weight: 12.5,
        range: { min: 1, short: 5, medium: 10, long: 15 },
        space: { battlemech: 9, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        shotsPerTon: 7,
        ammoTypes: ["ammo-lb-15x-standard"],
        minAmmoTons: 1,
        explosive: false,
        weaponType: ["DB", "C"],
        techRating: "f",
        book: "https://drive.google.com/drive/folders/0B5bLPOivte0vdjZ0YVQySDZ2SGc?resourcekey=0-oabxb-hZhk9iZVmeTa9zPQ",
        page: 0,
        rulesLevel: 6,
        alphaStrike: { heat: 4, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["FLK"] }
    },
    {
        isAmmo: false,
        name: "Light Rotary Rifle Cannon",
        altNames: ["Light RRC", "LRRC"],
        tag: "light-rotary-rifle-cannon",
        techBase: "universal",
        altTags: ["weapon-lrrc"],
        sort: "rotary rifle cannon, light",
        category: "Ballistic Weapons",
        damage: 3,
        notes: "Fanon Age of War stop-gap system. Fires up to 6 shots; prone to jamming. Inflicts 0 damage vs BAR8+ armor types.",
        damageAero: 3,
        accuracyModifier: 0,
        cbills: 65000,
        introduced: 2400,
        extinct: 2500,
        reintroduced: null,
        battleValue: 45,
        heat: 2,
        heatAero: 2,
        weight: 6,
        range: { min: 0, short: 3, medium: 6, long: 9 },
        space: { battlemech: 3, protomech: -1, combatVehicle: 1, supportVehicle: 3, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        shotsPerTon: 18,
        ammoTypes: ["ammo-light-rotary-rifle-standard"],
        minAmmoTons: 1,
        explosive: false,
        weaponType: ["DB", "Fanon"],
        techRating: "c",
        book: "https://battletechfanon.fandom.com/wiki/Rotary_Rifle_Cannon",
        page: 0,
        alphaStrike: { heat: 2, rangeShort: 0.3, rangeMedium: 0.3, rangeLong: 0.0, rangeExtreme: 0, tc: true, notes: ["BAR8-Penalty"] },
        rangeAero: "s"
    },
    {
        isAmmo: false,
        name: "Medium Rotary Rifle Cannon",
        altNames: ["Medium RRC", "MRRC"],
        tag: "medium-rotary-rifle-cannon",
        techBase: "universal",
        altTags: ["weapon-mrrc"],
        sort: "rotary rifle cannon, medium",
        category: "Ballistic Weapons",
        damage: 6,
        notes: "Fanon Age of War stop-gap system. Fires up to 6 shots; prone to jamming. Inflicts 3 damage vs BAR8+ armor types.",
        damageAero: 6,
        accuracyModifier: 0,
        cbills: 95000,
        introduced: 2400,
        extinct: 2500,
        reintroduced: null,
        battleValue: 72,
        heat: 4,
        heatAero: 4,
        weight: 8,
        range: { min: 0, short: 4, medium: 8, long: 12 },
        space: { battlemech: 4, protomech: -1, combatVehicle: 1, supportVehicle: 4, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        shotsPerTon: 9,
        ammoTypes: ["ammo-medium-rotary-rifle-standard"],
        minAmmoTons: 1,
        explosive: false,
        weaponType: ["DB", "Fanon"],
        techRating: "c",
        book: "https://battletechfanon.fandom.com/wiki/Rotary_Rifle_Cannon",
        page: 0,
        alphaStrike: { heat: 4, rangeShort: 0.6, rangeMedium: 0.6, rangeLong: 0.0, rangeExtreme: 0, tc: true, notes: ["BAR8-Penalty"] },
        rangeAero: "s"
    },
    {
        isAmmo: false,
        name: "Ultra AC/15",
        altNames: ["Ultra Autocannon/15", "UAC/15"],
        tag: "custom-ultra-ac-15", isUltra: true,
        techBase: "universal",
        sort: "ac, 15 ultra",
        category: "Custom Equipment",
        notes: "Custom weapon based on the Kronos Battle Systems 'Class 15 autocannons' homebrew rules. Capable of firing double rate with a risk of jamming.",
        damage: 15,
        damageAero: 15,
        accuracyModifier: 0,
        cbills: 400000,
        introduced: 3050,
        extinct: null,
        reintroduced: null,
        battleValue: 0,
        heat: 4,
        heatAero: 4,
        weight: 14,
        range: { min: 1, short: 5, medium: 10, long: 14 },
        space: { battlemech: 9, protomech: -1, combatVehicle: 1, supportVehicle: 1, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        shotsPerTon: 7,
        ammoTypes: ["ammo-ultra-ac-15-standard"],
        minAmmoTons: 1,
        explosive: false,
        weaponType: ["DB", "F"],
        techRating: "f",
        book: "https://drive.google.com/drive/folders/0B5bLPOivte0vdjZ0YVQySDZ2SGc?resourcekey=0-oabxb-hZhk9iZVmeTa9zPQ",
        page: 0,
        rulesLevel: 6,
        alphaStrike: { heat: 8, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["UAC"] }
    },
    // Solaris7 forum railguns (#301), both Munchkin: the thread is tagged "munchtek", and each outclasses the Heavy Gauss
    // Rifle (18 t, 25 damage, 4/6/13/20) on damage, range or both. What a post does not print comes from that rifle (TM p.219).
    {
        name: "Railgun (Nightstalker666)", tag: "custom-railgun-nightstalker666", techBase: "universal", catalog: "custom", sort: "railgun, nightstalker666", category: "Ballistic Weapons",
        notes: "Munchkin by Nightstalker666, Solaris7 forum ('Railgun varient', July 2018), a one-of-a-kind prototype. His 22 July revision doubles the weight "
            + "to 20 tons and 8 slots and sets the heat at 12; damage, range, ammunition and cost are his first post's. The 25 points are armor-piercing and do not "
            + "transfer to another location, except from a destroyed front torso to its rear. It cannot fire indirectly. An ammunition hit does only 2 damage a round "
            + "unless a laser or PPC caused it; heat, flamers and infernos do not set it off. BV 704 (88 a ton of ammunition) is Thunder's figure from the Heavy Metal "
            + "custom weapon tool. Not printed in the thread: dates and tech rating are the Heavy Gauss Rifle's (prototype 3051, available 3061, tech E).",
        damage: 25, damageAero: 25, accuracyModifier: 0, cbills: 2500000, prototype: 3051, introduced: 3061, extinct: null, reintroduced: null, battleValue: 704, heat: 12, heatAero: 12, weight: 20,
        range: { min: 6, short: 12, medium: 25, long: 39, extreme: 50 }, space: { battlemech: 8, protomech: -1, combatVehicle: 1, supportVehicle: 8, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        shotsPerTon: 16, ammoTypes: ["ammo-custom-railgun-nightstalker666-standard"], minAmmoTons: 1, explosive: false, weaponType: ["DB"], techRating: "e",
        book: "http://solaris7.com/thread/railgun-varient/", page: 0, rulesLevel: 7,
        alphaStrike: { heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike conversion"] }
    },
    {
        name: "Railgun (Captain)", tag: "custom-railgun-captain", techBase: "universal", catalog: "custom", sort: "railgun, captain", category: "Ballistic Weapons",
        notes: "Munchkin by Captain, Solaris7 forum ('Railgun varient', July 2018), after the MekTek railgun of MechWarrior 4: Mercenaries. A critical hit on it "
            + "explodes like a 60-point ammunition explosion. Firing it from a 'Mech below the Super-Heavy class forces an immediate Piloting Skill Roll: +1 for an "
            + "Assault 'Mech, +2 for a Heavy, doubled if the 'Mech moved this turn; a Medium fails automatically. A Super-Heavy that moves and fires it rolls with no "
            + "modifier. Its 22 'Mech slots take one whole side: all 12 of a side torso and the 10 left in the arm on that side once the lower arm and hand "
            + "actuators are removed (user ruling 2026-11-02; the post gives no placement). "
            + "Not printed in the thread: cost, Battle Value, dates and tech rating are the Heavy Gauss Rifle's (500,000 C-bills, BV 346, prototype 3051, available 3061, tech E).",
        damage: 50, damageAero: 50, accuracyModifier: 0, cbills: 500000, prototype: 3051, introduced: 3061, extinct: null, reintroduced: null, battleValue: 346, heat: 5, heatAero: 5, weight: 30,
        range: { min: 10, short: 11, medium: 22, long: 33 }, space: { battlemech: 22, protomech: -1, combatVehicle: 1, supportVehicle: 22, aerospaceFighter: 1, smallCraft: 1, dropShip: 1 },
        spreadSlots: true, spreadLocations: "one-side",
        shotsPerTon: 2, ammoTypes: ["ammo-custom-railgun-captain-standard"], minAmmoTons: 1, explosive: true, weaponType: ["DB"], techRating: "e",
        book: "http://solaris7.com/thread/railgun-varient/", page: 0, rulesLevel: 7,
        alphaStrike: { heat: 0, rangeShort: 0, rangeMedium: 0, rangeLong: 0, rangeExtreme: 0, tc: false, notes: ["Custom equipment: no Alpha Strike conversion"] }
    }
];