import { CUSTOM_HOMEBREW_RULES_LEVEL } from "./rules-level-options";

/*
 * Sample VTOLAMs (Custom Homebrew), loadable from the 'Mech Creator's step 1 at the Custom Homebrew level. The VTOLAM
 * and its Locust are BishopSteiner's (deviantart.com/bishopsteiner/art/LOCUST-VTOLAM-concept-899660337, 2021); the
 * author gives the Locust's role, movement, engine rating and weapons, and the rest of the build is ours.
 */
export const VTOLAM_SAMPLES: { id: string; name: string; save: object }[] = [
    {
        id: "locust-vtolam",
        name: "Locust VTOLAM LCT-XX",
        save: {
            "model": "LCT-XX",
            "name": "Locust VTOLAM",
            "tech": "is",
            "tonnage": 25,
            "omnimech": false,
            "additionalHeatSinks": 0,
            "allocation": [
                {
                    "uuid": "cc70153a-ac38-425d-ac36-9ae4876d0422",
                    "name": "Medium Laser",
                    "tag": "medium-laser",
                    "loc": "ct",
                    "rear": false,
                    "crits": 1,
                    "movable": true,
                    "size": 1,
                    "slot": 10
                },
                {
                    "uuid": "4f8700f7-65c6-46f6-9f29-4c000b341a8b",
                    "name": "Machine Gun",
                    "tag": "machine-gun",
                    "loc": "ra",
                    "rear": false,
                    "crits": 1,
                    "movable": true,
                    "size": 1,
                    "slot": 4
                },
                {
                    "uuid": "099f059b-4bd5-49a3-9a7e-09ed6747c81e",
                    "name": "Machine Gun",
                    "tag": "machine-gun",
                    "loc": "la",
                    "rear": false,
                    "crits": 1,
                    "movable": true,
                    "size": 1,
                    "slot": 4
                },
                {
                    "uuid": "a77e04a9-7110-4ca4-9056-382d206932f1",
                    "name": "TAG",
                    "tag": "is-tag",
                    "loc": "lt",
                    "rear": false,
                    "crits": 1,
                    "movable": true,
                    "size": 1,
                    "slot": 5
                },
                {
                    "uuid": "9abf528b-ac0d-4f13-8f62-bc97e46b891d",
                    "name": "Heat Sink",
                    "rear": false,
                    "tag": "heat-sink",
                    "crits": 1,
                    "movable": true,
                    "size": 1,
                    "loc": "rt",
                    "slot": 5
                },
                {
                    "uuid": "789126f0-0534-42f7-9e30-764210fad532",
                    "name": "Heat Sink",
                    "rear": false,
                    "tag": "heat-sink",
                    "crits": 1,
                    "movable": true,
                    "size": 1,
                    "loc": "lt",
                    "slot": 6
                },
                {
                    "uuid": "b979031d-577f-411e-9348-fd7e85795787",
                    "name": "MG - Standard Ammo",
                    "tag": "ammo-machine-gun-standard",
                    "loc": "ct",
                    "rear": false,
                    "crits": 1,
                    "movable": true,
                    "size": 1,
                    "slot": 11
                }
            ],
            "armor_allocation": {
                "head": 6,
                "centerTorso": 11,
                "rightTorso": 8,
                "leftTorso": 8,
                "centerTorsoRear": 1,
                "rightTorsoRear": 1,
                "leftTorsoRear": 1,
                "leftArm": 5,
                "rightArm": 5,
                "leftLeg": 9,
                "rightLeg": 9,
                "centerLeg": 0,
                "frontLeftLeg": 0,
                "frontRightLeg": 0
            },
            "armor_type": "standard",
            "armor_weight": 4,
            "engineType": "xl",
            "engineTechBase": "is",
            "equipment": [
                {
                    "tag": "ammo-machine-gun-standard",
                    "loc": "ct",
                    "allocationIndex": 11,
                    "allocationLocation": "ct",
                    "rear": false,
                    "uuid": "b979031d-577f-411e-9348-fd7e85795787",
                    "weight": 1
                },
                {
                    "tag": "is-tag",
                    "loc": "lt",
                    "allocationIndex": 5,
                    "allocationLocation": "lt",
                    "rear": false,
                    "uuid": "a77e04a9-7110-4ca4-9056-382d206932f1",
                    "weight": 1
                },
                {
                    "tag": "medium-laser",
                    "loc": "ct",
                    "allocationIndex": 10,
                    "allocationLocation": "ct",
                    "rear": false,
                    "uuid": "cc70153a-ac38-425d-ac36-9ae4876d0422",
                    "weight": 1
                },
                {
                    "tag": "machine-gun",
                    "loc": "la",
                    "allocationIndex": 4,
                    "allocationLocation": "la",
                    "rear": false,
                    "uuid": "099f059b-4bd5-49a3-9a7e-09ed6747c81e",
                    "weight": 0.5
                },
                {
                    "tag": "machine-gun",
                    "loc": "ra",
                    "allocationIndex": 4,
                    "allocationLocation": "ra",
                    "rear": false,
                    "uuid": "4f8700f7-65c6-46f6-9f29-4c000b341a8b",
                    "weight": 0.5
                }
            ],
            "era": "ilClan",
            "features": [],
            "gyro": "standard",
            "heat_sink_type": "single",
            "jump_jet_type": "standard",
            "myomer_type": "standard",
            "hideNonAvailableEquipment": true,
            "introductoryRules": false,
            "is_type": "standard",
            "jumpSpeed": 0,
            "lastUpdated": "2026-10-25T00:00:00.000Z",
            "mechType": "lam",
            "quadVeeMotive": "tracked",
            "lamType": "vtolam",
            "transformationMode": "mech",
            "mirrorArmorAllocations": true,
            "nickname": "",
            "strictEra": true,
            "uuid": "5f1c2a7e-3b9d-4e61-9a0c-7d4b8e2f1a63",
            "walkSpeed": 8,
            "tro": {
                "production": {
                    "manufacturer": "Hellespont Industrials (parts from Bergan Industries)"
                },
                "text": {
                    "overview": "After Grey Monday, House Liao began many experimental designs for its build-up against Davion space and the Republic. Inspired by Hell's Horses QuadVees, the VTOLAM was meant to keep a LAM's versatility without the headaches of the old LAMs: a Locust-derived 'Mech that converts to a VTOL instead of a fighter.",
                    "capabilities": "Still an 8/12 LCT-1V at heart, the VTOLAM spends its extra 5 tons on the conversion gear. In VTOL mode it cannot fly in vacuum and is far slower than a fighter, but it needs no fuel, its conversion gear is less intrusive, and it may use non-standard engines and gyros; this sample uses an XL engine to carry its 1V-style armor.",
                    "deployment": "As of 3150, two prototypes are on Hellespont's testing grounds, showing promise as scouts, raiders and search-and-rescue units. Bergan builds the Locust for the CCAF, but for security reasons Hellespont oversees the project.",
                    "variants": "A third prototype removes the TAG and one machine gun to mount a Guardian ECM in the right arm, to work with Stealth Armor; so far the conversion geometry has kept the armor from working reliably, and even then at about 65% efficacy. A Bimodal (fighter) prototype is also kept for testing.",
                    "notes": "Custom Homebrew. The VTOLAM and the Locust VTOLAM concept are by BishopSteiner, \"LOCUST VTOLAM concept\" (2021), on DeviantArt: https://www.deviantart.com/bishopsteiner/art/LOCUST-VTOLAM-concept-899660337. The author's rules are fan rules, \"by no means official\". This sample's engine, armor and equipment layout are our build of the author's 8/12, 25-ton Locust with its medium laser, two machine guns and TAG."
                }
            }
        },
    },
];

export function getVTOLAMSamples(rulesLevel: number): { id: string; name: string; save: object }[] {
    return rulesLevel >= CUSTOM_HOMEBREW_RULES_LEVEL ? VTOLAM_SAMPLES : [];
}
