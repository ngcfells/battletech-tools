import { ICanonQuirkEntry } from "./quirk-canon-interfaces";

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
 * The BattleMech Quirk Table: the quirks the BattleMech Manual recommends for each canon chassis (BMM pp.90-95,
 * Corrected seventh printing), entered from the page images in printed order.
 */
export const canonMechQuirks: ICanonQuirkEntry[] = [
    {
        chassis: "Akuma",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Albatross",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-improved-targeting", parameter: "long" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Alfar",
        quirks: [
            { tag: "quirk-non-standard-parts" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Annihilator",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Anubis",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-difficult-to-maintain" },
            { tag: "quirk-exposed-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Anvil",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-improved-targeting", parameter: "medium" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Apollo",
        quirks: [
            { tag: "quirk-fast-reload" },
            { tag: "quirk-rugged", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Aquagladius",
        quirks: [
            { tag: "quirk-difficult-ejection" },
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Arbalest",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Arcas",
        quirks: [
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Archangel",
        quirks: [
            { tag: "quirk-command-mech" },
            { tag: "quirk-improved-communications" },
            { tag: "quirk-improved-sensors" },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Archer",
        quirks: [
            { tag: "quirk-battlefists" },
            { tag: "quirk-command-mech" },
            { tag: "quirk-stable" },
            { tag: "quirk-ubiquitous" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Arctic Fox",
        quirks: [
            { tag: "quirk-weak-head-armor", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Arctic Wolf",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "short" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Arctic Wolf II",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "short" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Argus",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Assassin",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-cramped-cockpit" },
            { tag: "quirk-non-standard-parts" },
            { tag: "quirk-poor-life-support" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Atlas",
        quirks: [
            { tag: "quirk-battlefists" },
            { tag: "quirk-command-mech" },
            { tag: "quirk-distracting" },
            { tag: "quirk-improved-communications" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Atlas II",
        quirks: [
            { tag: "quirk-battlefists" },
            { tag: "quirk-command-mech" },
            { tag: "quirk-distracting" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Avatar",
        quirks: [
            { tag: "quirk-stabilized-weapon", weapon: { name: "Medium Laser", location: "ct", all: true } },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Awesome",
        quirks: [
            { tag: "quirk-battlefists", locations: ["la"] },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Axman",
        quirks: [
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Baboon (Howler)",
        altChassis: ["Baboon", "Howler"],
        quirks: [
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-narrow-low-profile" },
            { tag: "quirk-searchlight" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Balius",
        quirks: [
            { tag: "quirk-rugged", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bandersnatch",
        quirks: [
            { tag: "quirk-stable" },
            { tag: "quirk-ubiquitous" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Banshee",
        quirks: [
            { tag: "quirk-rugged", parameter: 1 },
            { tag: "quirk-bad-reputation", toYear: 3024 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Banzai",
        quirks: [
            { tag: "quirk-stabilized-weapon", weapon: { name: "Large Pulse Laser", location: "ra", all: true } },
            { tag: "quirk-difficult-to-maintain" },
            { tag: "quirk-non-standard-parts" },
            { tag: "quirk-prototype" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Barghest",
        quirks: [
            { tag: "quirk-directional-torso-mount", locations: ["lt", "rt"] },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Battle Cobra",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Battle Hawk",
        quirks: [
            { tag: "quirk-rugged", parameter: 1 },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "BattleAxe",
        quirks: [
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "BattleMaster",
        quirks: [
            { tag: "quirk-command-mech" },
            { tag: "quirk-jettison-capable-weapon", weapon: { name: "PPC" } },
            { tag: "quirk-weak-head-armor", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bear Cub",
        quirks: [
            { tag: "quirk-easy-to-pilot" },
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-cramped-cockpit" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Behemoth (Stone Rhino)",
        altChassis: ["Behemoth", "Stone Rhino"],
        quirks: [
            { tag: "quirk-barrel-fist", locations: ["la", "ra"] },
            { tag: "quirk-protected-actuators" },
            { tag: "quirk-oversized" },
            { tag: "quirk-poor-performance" },
            { tag: "quirk-weak-head-armor", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Beowulf",
        quirks: [
            { tag: "quirk-command-mech" },
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-exposed-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Berserker",
        quirks: [
            { tag: "quirk-distracting" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bishamon",
        quirks: [
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Black Hawk (Nova)",
        altChassis: ["Black Hawk", "Nova"],
        quirks: [
            { tag: "quirk-combat-computer" },
            { tag: "quirk-narrow-low-profile" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Black Hawk-KU",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Black Knight",
        quirks: [
            { tag: "quirk-command-mech" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Black Lanner",
        quirks: [
            { tag: "quirk-stable" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Black Watch",
        quirks: [
            { tag: "quirk-easy-to-pilot" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blackjack",
        quirks: [
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blackjack (Omni)",
        quirks: [
            { tag: "quirk-non-standard-parts" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blade",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-modular-weapons" },
            { tag: "quirk-exposed-weapon-linkage", weapon: { name: "Rotary AC/5" } },
            { tag: "quirk-static-ammo-feed", note: "no weapon named" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blitzkrieg",
        quirks: [
            { tag: "quirk-directional-torso-mount", locations: ["ct", "lt"] },
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blood Asp",
        quirks: [
            { tag: "quirk-rugged", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blood Kite",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-rugged", parameter: 2 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blood Reaper",
        quirks: [
            { tag: "quirk-hyper-extending-actuators" },
            { tag: "quirk-rugged", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bloodhound",
        quirks: [
            { tag: "quirk-improved-sensors" },
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Blue Flame",
        quirks: [
            { tag: "quirk-directional-torso-mount", locations: ["hd", "lt", "rt"] },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bombard",
        quirks: [
            { tag: "quirk-bad-reputation" },
            { tag: "quirk-non-standard-parts" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bombardier",
        quirks: [
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bowman",
        quirks: [
            { tag: "quirk-fast-reload", weapon: { name: "Arrow IV" } },
            { tag: "quirk-stable" },
            { tag: "quirk-bad-reputation", techBase: "clan" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Brahma",
        quirks: [
            { tag: "quirk-stabilized-weapon", weapon: { name: "Light Autocannon/5" } },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Brigand",
        quirks: [
            { tag: "quirk-nimble-jumper" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bruin",
        quirks: [
            { tag: "quirk-rugged", parameter: 1 },
            { tag: "quirk-exposed-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Buccaneer",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "short" },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Burrock",
        quirks: [
            { tag: "quirk-stable" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Bushwacker",
        quirks: [
            { tag: "quirk-narrow-low-profile" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Caesar",
        quirks: [
            { tag: "quirk-hyper-extending-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Canis",
        quirks: [
            { tag: "quirk-fast-reload" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Cataphract",
        quirks: [
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Catapult",
        quirks: [
            { tag: "quirk-no-minimal-arms" },
            { tag: "quirk-weak-head-armor", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Cauldron-Born (Ebon Jaguar)",
        altChassis: ["Cauldron-Born", "Ebon Jaguar"],
        quirks: [
            { tag: "quirk-narrow-low-profile" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Centurion",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "short" },
            { tag: "quirk-non-standard-parts" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Cephalus",
        quirks: [
            { tag: "quirk-improved-life-support" },
            { tag: "quirk-bad-reputation", techBase: "clan" },
            { tag: "quirk-difficult-to-maintain" },
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Cerberus",
        quirks: [
            { tag: "quirk-barrel-fist", locations: ["la", "ra"] },
            { tag: "quirk-improved-targeting", parameter: "long" },
            { tag: "quirk-vestigial-hands" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Cestus",
        quirks: [
            { tag: "quirk-stabilized-weapon", weapon: { name: "Gauss Rifle" } },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Chameleon",
        quirks: [
            { tag: "quirk-easy-to-pilot" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Champion",
        quirks: [
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Charger",
        quirks: [
            { tag: "quirk-barrel-fist", locations: ["la"] },
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Chimera",
        quirks: [
            { tag: "quirk-nimble-jumper" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Cicada",
        quirks: [
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Clint",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "medium" },
            { tag: "quirk-improved-targeting", parameter: "long" },
            { tag: "quirk-exposed-actuators" },
            { tag: "quirk-difficult-to-maintain" },
            { tag: "quirk-non-standard-parts" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Clint IIC",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "medium" },
            { tag: "quirk-improved-targeting", parameter: "long" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Cobra",
        quirks: [
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Colossus",
        quirks: [
            { tag: "quirk-stable" },
            { tag: "quirk-low-mounted-arms" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Commando",
        quirks: [
            { tag: "quirk-narrow-low-profile" },
            { tag: "quirk-exposed-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Commando IIC",
        quirks: [
            { tag: "quirk-narrow-low-profile" },
            { tag: "quirk-exposed-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 90 },
    },
    {
        chassis: "Copperhead",
        quirks: [
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Corvis",
        quirks: [
            { tag: "quirk-modular-weapons" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Cossack",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Cougar",
        quirks: [
            { tag: "quirk-ubiquitous" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Coyotl",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Crab",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Crimson Hawk",
        quirks: [
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Crimson Langur",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-improved-communications" },
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Crockett",
        quirks: [
            { tag: "quirk-easy-to-pilot" },
            { tag: "quirk-poor-life-support" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Cronus",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Crossbow",
        quirks: [
            { tag: "quirk-modular-weapons", note: "LRM 10s" },
            { tag: "quirk-obsolete", note: "2550-3070" },
            { tag: "quirk-poor-targeting", parameter: "long" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Crossbow (Omni)",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "short" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Crusader",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-rugged", parameter: 1 },
            { tag: "quirk-stabilized-weapon", note: "Legs" },
            { tag: "quirk-ubiquitous" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Cudgel",
        quirks: [
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Cuirass",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Cyclops",
        quirks: [
            { tag: "quirk-battle-computer" },
            { tag: "quirk-cowl" },
            { tag: "quirk-difficult-ejection" },
            { tag: "quirk-weak-head-armor", parameter: 2 },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Cygnus",
        quirks: [
            { tag: "quirk-exposed-weapon-linkage", note: "no weapon named" },
            { tag: "quirk-static-ammo-feed", note: "no weapon named" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Daboku",
        quirks: [
            { tag: "quirk-stabilized-weapon", note: "Autocannons" },
            { tag: "quirk-prototype" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Daedalus",
        quirks: [
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Daikyu",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Daimyo",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-narrow-low-profile" },
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Daishi (Dire Wolf)",
        altChassis: ["Daishi", "Dire Wolf"],
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "long" },
            { tag: "quirk-difficult-ejection" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dark Crow",
        quirks: [
            { tag: "quirk-low-mounted-arms" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dart",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dasher (Fire Moth)",
        altChassis: ["Dasher", "Fire Moth"],
        quirks: [
            { tag: "quirk-narrow-low-profile" },
            { tag: "quirk-overhead-arms" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dasher II",
        quirks: [
            { tag: "quirk-poor-performance" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Defiance",
        quirks: [
            { tag: "quirk-barrel-fist", locations: ["la", "ra"] },
            { tag: "quirk-hyper-extending-actuators" },
            { tag: "quirk-searchlight" },
            { tag: "quirk-stable" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Deimos",
        quirks: [
            { tag: "quirk-anti-aircraft-targeting" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dervish",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-hyper-extending-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Deva",
        quirks: [
            { tag: "quirk-improved-communications" },
            { tag: "quirk-improved-sensors" },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Devastator",
        quirks: [
            { tag: "quirk-hyper-extending-actuators" },
            { tag: "quirk-searchlight" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dragon",
        quirks: [
            { tag: "quirk-narrow-low-profile" },
            { tag: "quirk-stable" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dragon Fire",
        quirks: [
            { tag: "quirk-good-reputation", parameter: 1 },
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dragonfly (Viper)",
        altChassis: ["Dragonfly"],
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "long" },
            { tag: "quirk-narrow-low-profile" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Dragoon",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-modular-weapons" },
            { tag: "quirk-bad-reputation" },
            { tag: "quirk-obsolete", parameter: 2780 },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Duan Gung",
        quirks: [
            { tag: "quirk-protected-actuators" },
            { tag: "quirk-non-standard-parts" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Eagle",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-weak-head-armor", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Ebony",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "medium" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Eidolon",
        quirks: [
            { tag: "quirk-non-standard-parts" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Eisenfaust",
        quirks: [
            { tag: "quirk-battlefists" },
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-protected-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Emperor",
        quirks: [
            { tag: "quirk-command-mech" },
            { tag: "quirk-improved-cooling-jacket", weapon: { name: "Large Laser", location: "la" } },
            { tag: "quirk-improved-cooling-jacket", weapon: { name: "Large Laser", location: "ra" } },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Enfield",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Enforcer",
        quirks: [
            { tag: "quirk-barrel-fist", locations: ["la", "ra"] },
            { tag: "quirk-fast-reload", weapon: { name: "Autocannon/10" } },
            { tag: "quirk-improved-cooling-jacket", weapon: { name: "Autocannon/10" } },
            { tag: "quirk-ammunition-feed-problem", weapon: { name: "Autocannon/10" } },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Enforcer III",
        quirks: [
            { tag: "quirk-barrel-fist", locations: ["la", "ra"] },
            { tag: "quirk-fast-reload", weapon: { name: "Ultra AC/10" } },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Epimetheus",
        quirks: [
            { tag: "quirk-non-standard-parts" },
            { tag: "quirk-prototype" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Excalibur",
        quirks: [
            { tag: "quirk-vestigial-hands" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Exterminator",
        quirks: [
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Eyleuka",
        quirks: [
            { tag: "quirk-exposed-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Fafnir",
        quirks: [
            { tag: "quirk-stabilized-weapon", weapon: { name: "Heavy Gauss Rifle", location: "lt", all: true } },
            { tag: "quirk-stabilized-weapon", weapon: { name: "Heavy Gauss Rifle", location: "rt", all: true } },
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Falcon",
        quirks: [
            { tag: "quirk-narrow-low-profile" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Falcon Hawk",
        quirks: [
            { tag: "quirk-good-reputation", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Falconer",
        quirks: [
            { tag: "quirk-stable" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Fennec",
        quirks: [
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Fenris (Ice Ferret)",
        altChassis: ["Fenris", "Ice Ferret"],
        quirks: [
            { tag: "quirk-improved-sensors" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Fire Falcon",
        quirks: [
            { tag: "quirk-improved-sensors" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Fire Scorpion",
        quirks: [
            { tag: "quirk-cowl" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Fireball",
        quirks: [
            { tag: "quirk-improved-communications" },
            { tag: "quirk-narrow-low-profile" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Firebee",
        quirks: [
            { tag: "quirk-poor-life-support" },
            { tag: "quirk-weak-legs" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Firefly",
        quirks: [
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Firestarter",
        quirks: [
            { tag: "quirk-ubiquitous" },
            { tag: "quirk-exposed-weapon-linkage", weapon: { name: "Flamer", location: "la", all: true } },
            { tag: "quirk-exposed-weapon-linkage", weapon: { name: "Flamer", location: "ra", all: true } },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Firestarter (Omni)",
        quirks: [
            { tag: "quirk-cowl" },
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Flamberge",
        quirks: [
            { tag: "quirk-improved-targeting", parameter: "medium" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Flashfire",
        quirks: [
            { tag: "quirk-modular-weapons", note: "Fluid Guns" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Flashman",
        quirks: [
            { tag: "quirk-rugged", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Flea",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-improved-life-support" },
            { tag: "quirk-no-minimal-arms" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Galahad",
        quirks: [
            { tag: "quirk-difficult-to-maintain" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Galahad (Glass Spider)",
        altChassis: ["Glass Spider"],
        quirks: [
            { tag: "quirk-anti-aircraft-targeting" },
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-multi-trac" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Gallant",
        quirks: [
            { tag: "quirk-stabilized-weapon", weapon: { name: "Large Pulse Laser", location: "ra", all: true } },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Gallowglas",
        quirks: [
            { tag: "quirk-good-reputation", parameter: 1 },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Garm",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Ghost",
        quirks: [
            { tag: "quirk-extended-torso-twist" },
            { tag: "quirk-improved-communications" },
            { tag: "quirk-improved-sensors" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Gladiator",
        quirks: [
            { tag: "quirk-cowl" },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Gladiator (Executioner)",
        altChassis: ["Executioner"],
        quirks: [
            { tag: "quirk-distracting" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Goliath",
        quirks: [
            { tag: "quirk-multi-trac" },
            { tag: "quirk-exposed-actuators" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Goshawk (Vapor Eagle)",
        altChassis: ["Goshawk", "Vapor Eagle"],
        quirks: [
            { tag: "quirk-nimble-jumper" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Goshawk II",
        quirks: [
            { tag: "quirk-improved-life-support" },
            { tag: "quirk-nimble-jumper" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Grand Crusader",
        quirks: [
            { tag: "quirk-directional-torso-mount", locations: ["lt", "rt"] },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
    {
        chassis: "Grand Crusader II",
        quirks: [
            { tag: "quirk-easy-to-maintain" },
            { tag: "quirk-stable" },
            { tag: "quirk-bad-reputation" },
        ],
        source: { book: "BattleMech Manual", page: 91 },
    },
];
