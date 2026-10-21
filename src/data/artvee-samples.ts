import type { IVehicleExport } from "../classes/vehicle";

/*
 * Sample ArtVees (Custom Homebrew): nine full vehicle designs, three combo guns in three patterns, loadable from the
 * Vehicle Creator's step 1 at the Custom Homebrew level. Every item is production technology in the sample's era
 * (the Armored Motive System is prototype only in these eras, so the Clan and MAP samples carry the creator's
 * "Armored Motive System recommended" advice). Clan samples carry no AC ammunition bin: Clan standard AC ammunition
 * is extinct from 2850 in the catalog, so it is not production in the Clan Invasion era.
 *
 * Flavour (spec lore): the Star League samples are 2700s builds, the Clan samples are the line the Clans kept after
 * the Exodus, and the MAP samples are the Inner Sphere rediscovery of 3071.
 */

type ArtVeeSaveData = Omit<IVehicleExport, "lastUpdated"> & { lastUpdated: string };

const SAMPLE_DATA: { id: string; name: string; save: ArtVeeSaveData }[] = [
    {
        id: "falconet",
        name: "Falconet ArtVee FLC-1",
        save: {
            "uuid": "38ce6051-0884-417c-25a8-d6f27699f06e",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Falconet ArtVee",
            "model": "FLC-1",
            "nickname": "",
            "tonnage": 55,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "is",
            "era": "star-league",
            "engineType": "xl",
            "cruiseMP": 4,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 38,
                "left": 38,
                "right": 38,
                "rear": 37,
                "turret": 37,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-artvee-thumper-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "1cd4cb2d-1bce-4fe5-b667-862ee7c0e175"
                },
                {
                    "tag": "ammo-thumper-standard",
                    "rear": false,
                    "uuid": "b5176d0a-0e44-4642-3c58-3f965c005d63"
                },
                {
                    "tag": "ammo-is-ac-5-standard",
                    "rear": false,
                    "uuid": "bbbf30da-fb29-4fe7-9945-c74c40d9b7fd"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "d084a3b4-d5ba-49dd-0895-e69acc8a5b62"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "120078bb-6e4e-428d-a0ae-fa453c78f679"
                },
                {
                    "tag": "small-pulse-laser",
                    "location": "turret",
                    "rear": false,
                    "uuid": "73a9e881-7550-487e-164b-037bf6b65b98"
                },
                {
                    "tag": "searchlight",
                    "location": "front",
                    "rear": false,
                    "uuid": "8c5e5869-e888-4155-aba8-e2019f1a852a"
                },
                {
                    "tag": "custom-buckler-smoke-dispenser",
                    "location": "rear",
                    "rear": false,
                    "uuid": "2d58d494-bf52-4aa6-bca6-31db1911919e"
                },
                {
                    "tag": "ammo-machine-gun-standard",
                    "rear": false,
                    "uuid": "12f55dc4-04f3-46f2-218e-a071e17910a7"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "pangolin",
        name: "Pangolin ArtVee PNG-C",
        save: {
            "uuid": "789172a6-215a-47b3-8d24-e3c80f2ea34b",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Pangolin ArtVee",
            "model": "PNG-C",
            "nickname": "",
            "tonnage": 45,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "clan",
            "era": "clan-inv",
            "engineType": "clan_xl",
            "cruiseMP": 4,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 27,
                "left": 27,
                "right": 27,
                "rear": 27,
                "turret": 26,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-clan-artvee-thumper-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "29c6c28c-d01c-4d2d-ba4a-e40a9c5ee178"
                },
                {
                    "tag": "ammo-thumper-standard",
                    "rear": false,
                    "uuid": "049610b0-fdce-4f64-2740-ef51c55a82f2"
                },
                {
                    "tag": "clan-machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "c9c36ca6-3516-4da4-a65e-a6f427f70cee"
                },
                {
                    "tag": "clan-machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "ad050e54-2566-4321-34e2-a9a3efc5a810"
                },
                {
                    "tag": "clan-small-pulse-laser",
                    "location": "turret",
                    "rear": false,
                    "uuid": "27b64635-de54-4a77-0bfa-5073c1893bd0"
                },
                {
                    "tag": "clan-flamer",
                    "location": "rear",
                    "rear": false,
                    "uuid": "4ae6a2d5-e5a3-4f80-2228-8ec781e53456"
                },
                {
                    "tag": "ammo-machine-gun-standard",
                    "rear": false,
                    "uuid": "6b1f6f11-f66d-4d2e-9ef3-66c88541276b"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "springald",
        name: "Springald ArtVee SPR-1M",
        save: {
            "uuid": "793be10c-0409-4034-b3f3-0f5f57f71e91",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Springald ArtVee",
            "model": "SPR-1M",
            "nickname": "",
            "tonnage": 45,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "is",
            "era": "jihad",
            "engineType": "xl",
            "cruiseMP": 4,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 22,
                "left": 22,
                "right": 21,
                "rear": 21,
                "turret": 21,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-artvee-thumper-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "c7110ab6-879e-4beb-b072-8879e58e529b"
                },
                {
                    "tag": "ammo-thumper-standard",
                    "rear": false,
                    "uuid": "8634ae8c-5420-4750-87a9-4077c26caccb"
                },
                {
                    "tag": "ammo-is-ac-5-standard",
                    "rear": false,
                    "uuid": "61bfda9d-b4a3-4f27-2555-d5ac414c50d8"
                },
                {
                    "tag": "machine-gun-light",
                    "location": "front",
                    "rear": false,
                    "uuid": "2ca6d074-c981-4667-a89a-125b6b3aa723"
                },
                {
                    "tag": "machine-gun-light",
                    "location": "front",
                    "rear": false,
                    "uuid": "1f6ac306-850e-4483-0ef4-ed83378f6cc8"
                },
                {
                    "tag": "small-pulse-laser",
                    "location": "turret",
                    "rear": false,
                    "uuid": "2aa8518d-0b31-4a24-2042-a4bea00181f9"
                },
                {
                    "tag": "ammo-is-light-machine-gun-standard",
                    "rear": false,
                    "uuid": "631a7645-47f9-44b8-b6ae-8ab3072dca3a"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "saker",
        name: "Saker ArtVee SKR-1",
        save: {
            "uuid": "bb3d1863-3de8-4f3c-260f-00b81dda02a3",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Saker ArtVee",
            "model": "SKR-1",
            "nickname": "",
            "tonnage": 70,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "is",
            "era": "star-league",
            "engineType": "xl",
            "cruiseMP": 4,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 40,
                "left": 40,
                "right": 39,
                "rear": 39,
                "turret": 39,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-artvee-sniper-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "9baa6e2b-59aa-4c76-bef4-a3ee4159478a"
                },
                {
                    "tag": "ammo-sniper-standard",
                    "rear": false,
                    "uuid": "318a07b2-d8e4-41bd-154b-e49d0a5d5e28"
                },
                {
                    "tag": "ammo-is-ac-10-standard",
                    "rear": false,
                    "uuid": "5a69c012-c3d3-4423-81cd-a4d825e6bf0a"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "e85e93ee-f7e9-4ddc-0bf9-cea483748ab7"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "c4f3959d-3eb0-4388-13d4-51da9dc45964"
                },
                {
                    "tag": "medium-pulse-laser",
                    "location": "turret",
                    "rear": false,
                    "uuid": "6d86b8c3-c101-472e-860c-69a450053408"
                },
                {
                    "tag": "searchlight",
                    "location": "front",
                    "rear": false,
                    "uuid": "0f567110-28be-407a-1686-1a9fdc6048e7"
                },
                {
                    "tag": "custom-buckler-smoke-dispenser",
                    "location": "rear",
                    "rear": false,
                    "uuid": "108e0dd9-298c-4807-9ae5-0e0390097e50"
                },
                {
                    "tag": "ammo-machine-gun-standard",
                    "rear": false,
                    "uuid": "45aa1472-6b5c-4cb7-8123-fb96de787e53"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "archerfish",
        name: "Archerfish ArtVee ARF-C",
        save: {
            "uuid": "ddc1159b-c776-43d4-aadb-0420242906ba",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Archerfish ArtVee",
            "model": "ARF-C",
            "nickname": "",
            "tonnage": 65,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "clan",
            "era": "clan-inv",
            "engineType": "clan_xl",
            "cruiseMP": 4,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 33,
                "left": 33,
                "right": 33,
                "rear": 32,
                "turret": 32,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-clan-artvee-sniper-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "c2547bcd-86a2-4c9a-222f-45b14f298c38"
                },
                {
                    "tag": "ammo-sniper-standard",
                    "rear": false,
                    "uuid": "1516412d-402d-4559-2976-7e40bac35d90"
                },
                {
                    "tag": "clan-machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "973960cf-7573-42d6-1352-4c21ddc57cde"
                },
                {
                    "tag": "clan-machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "ac23e889-23fa-4330-050e-417593812971"
                },
                {
                    "tag": "clan_medium-pulse-laser",
                    "location": "turret",
                    "rear": false,
                    "uuid": "96165399-7393-46c7-0f63-7c61ec308722"
                },
                {
                    "tag": "clan-mech-mortar-1",
                    "location": "front",
                    "rear": false,
                    "uuid": "68174dff-a051-43a0-1f17-7f63daf25250"
                },
                {
                    "tag": "clan-flamer",
                    "location": "rear",
                    "rear": false,
                    "uuid": "83ef8dd0-b6cc-4471-3623-0470c5b3f685"
                },
                {
                    "tag": "ammo-machine-gun-standard",
                    "rear": false,
                    "uuid": "6e93dbbc-bbd9-41db-0f22-b5d46d488371"
                },
                {
                    "tag": "ammo-clan-mech-mortar-standard",
                    "rear": false,
                    "uuid": "30c6888d-fb02-443e-0848-5f332c6c236d"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "perrier",
        name: "Perrier ArtVee PER-1M",
        save: {
            "uuid": "7b12a433-0899-4ae5-0447-c10a328f889f",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Perrier ArtVee",
            "model": "PER-1M",
            "nickname": "",
            "tonnage": 60,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "is",
            "era": "jihad",
            "engineType": "xl",
            "cruiseMP": 4,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 29,
                "left": 29,
                "right": 29,
                "rear": 28,
                "turret": 28,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-artvee-sniper-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "9b19d453-8166-4418-9b1a-7c1f1f28d97b"
                },
                {
                    "tag": "ammo-sniper-standard",
                    "rear": false,
                    "uuid": "7493a799-68c6-43bb-3e7d-83af61c4bbac"
                },
                {
                    "tag": "ammo-is-ac-10-standard",
                    "rear": false,
                    "uuid": "ffb57c62-f778-4305-32bb-3f5bc8602718"
                },
                {
                    "tag": "machine-gun-light",
                    "location": "front",
                    "rear": false,
                    "uuid": "daac94ed-6a45-41bc-39dc-a53d2e0e4438"
                },
                {
                    "tag": "machine-gun-light",
                    "location": "front",
                    "rear": false,
                    "uuid": "6c74e598-7880-46c7-08e6-a8755b50ed55"
                },
                {
                    "tag": "vehicle-flamer",
                    "location": "rear",
                    "rear": false,
                    "uuid": "c138dcb9-c151-4678-b9d0-25fe7ae7d8a8"
                },
                {
                    "tag": "custom-smoker",
                    "location": "rear",
                    "rear": false,
                    "uuid": "e4a18def-ec41-41b4-9b1b-5cb6dc2d9ae7"
                },
                {
                    "tag": "ammo-is-light-machine-gun-standard",
                    "rear": false,
                    "uuid": "fa6d8a1f-6d46-4456-a3b1-4564cd19e708"
                },
                {
                    "tag": "ammo-custom-smoker-fuel",
                    "rear": false,
                    "uuid": "d59676d2-dfaf-4e60-a0bc-8c8409ca68c2"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "culverin",
        name: "Culverin ArtVee CLV-1",
        save: {
            "uuid": "9a282083-4899-4bad-26bc-c0dacc5a0645",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Culverin ArtVee",
            "model": "CLV-1",
            "nickname": "",
            "tonnage": 100,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "is",
            "era": "star-league",
            "engineType": "xl",
            "cruiseMP": 3,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 59,
                "left": 59,
                "right": 59,
                "rear": 59,
                "turret": 59,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-artvee-long-tom-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "ea9ef618-9942-4999-227f-9a92ee93b431"
                },
                {
                    "tag": "ammo-long-tom-standard",
                    "rear": false,
                    "uuid": "17906d34-fb35-4a48-a4ea-155a83db5b9d"
                },
                {
                    "tag": "ammo-is-ac-20-standard",
                    "rear": false,
                    "uuid": "55b76b96-1648-4eb2-89d3-5122706c63a0"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "18106141-1c51-48dd-2f5f-3cf14a93e113"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "ae301d2c-dec7-47d8-9df2-65e52a67be15"
                },
                {
                    "tag": "medium-pulse-laser",
                    "location": "turret",
                    "rear": false,
                    "uuid": "5314660c-cf52-41ce-3510-7c456a74a0b9"
                },
                {
                    "tag": "mech-mortar-1",
                    "location": "front",
                    "rear": false,
                    "uuid": "351059f8-2d8e-4ec9-3a49-b54f0cb570cf"
                },
                {
                    "tag": "vehicular-grenade-launcher",
                    "location": "rear",
                    "rear": false,
                    "uuid": "149ec2e2-98ae-4617-0c05-802489554a9e"
                },
                {
                    "tag": "searchlight",
                    "location": "front",
                    "rear": false,
                    "uuid": "3c892fdc-1f49-4f79-1ecd-c8ef31926fd3"
                },
                {
                    "tag": "custom-buckler-smoke-dispenser",
                    "location": "rear",
                    "rear": false,
                    "uuid": "84d7eca3-8606-403e-1bd8-de62081b9dcf"
                },
                {
                    "tag": "ammo-machine-gun-standard",
                    "rear": false,
                    "uuid": "d9d2379c-4a48-4bba-228e-d05275412236"
                },
                {
                    "tag": "ammo-is-mech-mortar-standard",
                    "rear": false,
                    "uuid": "30a5ceee-a103-449e-3501-b097d146100d"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "glyptodon",
        name: "Glyptodon ArtVee GLY-C",
        save: {
            "uuid": "6d207334-ab00-4ece-1cf1-24e65d2e42ca",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Glyptodon ArtVee",
            "model": "GLY-C",
            "nickname": "",
            "tonnage": 75,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "clan",
            "era": "clan-inv",
            "engineType": "clan_xl",
            "cruiseMP": 3,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 39,
                "left": 39,
                "right": 38,
                "rear": 38,
                "turret": 38,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-clan-artvee-long-tom-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "ac45c095-6fee-4bdd-085b-e1597d147542"
                },
                {
                    "tag": "ammo-long-tom-standard",
                    "rear": false,
                    "uuid": "7c1513d6-fa8d-461e-1ca0-a52d857ffecb"
                },
                {
                    "tag": "clan-machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "34185097-12b6-4282-390a-b7a1b71bebd6"
                },
                {
                    "tag": "clan-machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "5a5114e4-89e3-4c22-21d6-0fdf3ad42705"
                },
                {
                    "tag": "clan_medium-pulse-laser",
                    "location": "turret",
                    "rear": false,
                    "uuid": "ddc4feda-532b-4f09-bf91-0ac1a33aca2a"
                },
                {
                    "tag": "clan-flamer",
                    "location": "rear",
                    "rear": false,
                    "uuid": "109df3e3-4d99-45d7-815b-4d5e3df2b060"
                },
                {
                    "tag": "ammo-machine-gun-standard",
                    "rear": false,
                    "uuid": "177e009c-6b59-4616-3792-e1ef35092a75"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
    {
        id: "tormentum",
        name: "Tormentum ArtVee TRM-1M",
        save: {
            "uuid": "665c75d5-c706-4e62-a7d6-68f14cede5ff",
            "lastUpdated": "2026-10-21T00:00:00.000Z",
            "name": "Tormentum ArtVee",
            "model": "TRM-1M",
            "nickname": "",
            "tonnage": 75,
            "motiveType": "tracked",
            "hasTurret": true,
            "dualTurret": false,
            "sponsonTurrets": false,
            "artVee": true,
            "jumpMP": 0,
            "tech": "is",
            "era": "jihad",
            "engineType": "xl",
            "cruiseMP": 3,
            "armorType": "ferro-fibrous",
            "armorAllocation": {
                "front": 34,
                "left": 34,
                "right": 34,
                "rear": 34,
                "turret": 34,
                "rotor": 0,
                "frontLeft": 0,
                "frontRight": 0,
                "rearLeft": 0,
                "rearRight": 0,
                "turret2": 0
            },
            "structureType": "standard",
            "heatSinkType": "single",
            "additionalHeatSinks": 0,
            "equipment": [
                {
                    "tag": "custom-artvee-long-tom-combo",
                    "location": "turret",
                    "rear": false,
                    "uuid": "4be71f98-9be5-4731-2a43-f3a450ec524e"
                },
                {
                    "tag": "ammo-long-tom-standard",
                    "rear": false,
                    "uuid": "ba513e88-46b7-433f-2c06-6b9571a608b5"
                },
                {
                    "tag": "ammo-is-ac-20-standard",
                    "rear": false,
                    "uuid": "a38d2d94-048e-419c-a4ed-0fbd2ab05519"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "5552ba9e-c4d8-4473-957b-7191ecaed007"
                },
                {
                    "tag": "machine-gun",
                    "location": "front",
                    "rear": false,
                    "uuid": "d226d766-6f84-4fa6-8903-12cd7a7c57db"
                },
                {
                    "tag": "vehicle-flamer",
                    "location": "rear",
                    "rear": false,
                    "uuid": "fbc9a42f-f7e9-42cf-9088-6a2e6d3b40b1"
                },
                {
                    "tag": "custom-smoker",
                    "location": "rear",
                    "rear": false,
                    "uuid": "bcbce563-8b7d-4d19-9067-6cb4cc0ef1e3"
                },
                {
                    "tag": "ammo-machine-gun-standard",
                    "rear": false,
                    "uuid": "58343a29-688e-45ac-8e4a-8c2c0d4af019"
                },
                {
                    "tag": "ammo-custom-smoker-fuel",
                    "rear": false,
                    "uuid": "07ac3723-89dc-4da9-b956-4675ac2d2da9"
                }
            ],
            "pilot": {
                "name": "",
                "piloting": 5,
                "gunnery": 4,
                "wounds": 0,
                "alphaStrikeAbilities": []
            }
        },
    },
];

export const ARTVEE_SAMPLES: { id: string; name: string; save: IVehicleExport }[] = SAMPLE_DATA.map((sample) => ({
    ...sample,
    save: { ...sample.save, lastUpdated: new Date(sample.save.lastUpdated) },
}));

/** The ArtVee is Custom Homebrew (rules level 6): below it there are no samples to offer. */
export const ARTVEE_SAMPLES_RULES_LEVEL = 6;

export function getArtVeeSamples(rulesLevel: number): { id: string; name: string; save: IVehicleExport }[] {
    return rulesLevel >= ARTVEE_SAMPLES_RULES_LEVEL ? ARTVEE_SAMPLES : [];
}
