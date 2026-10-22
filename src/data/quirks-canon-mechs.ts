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
];
