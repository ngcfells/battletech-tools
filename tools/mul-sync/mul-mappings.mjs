// Lookup tables for the weekly MUL sync (sync-mul.mjs), kept in their own module so tests can import them
// (the sync script runs on import). The live site's data has no Alpha Strike type codes; these are fixed rules
// knowledge keyed off its unit_types.json names and unit_sub_types.json ids.

// Alpha Strike unit type by the live unit type's name.
const BF_TYPE_BY_UNIT_TYPE_NAME = {
    BattleMech: "BM",
    OmniMech: "BM",
    "Combat Vehicle": "CV",
    OmniVehicle: "CV",
    "Support Vehicle": "SV",
    "Fighter Craft": "AF",
    "Battle Armor": "BA",
    Infantry: "CI",
    ProtoMech: "PM",
    IndustrialMech: "IM",
    "Advanced Support": "SV",
    // The Alpha Strike Companion's unit type table has no code for buildings; MegaMek types them as vehicles, CV.
    // (They had "CF", which the app reads as a conventional fighter.)
    Buildings: "CV",
};

// Where the type alone doesn't say: the live unit_sub_types.json ids. "Aerospace Craft" holds every large craft,
// and "Fighter Craft" holds conventional fighters too.
const BF_TYPE_BY_SUB_TYPE_ID = {
    46: "DS", // Spheroid DropShip
    14: "DA", // Aerodyne DropShip
    26: "SC", // Small Craft
    33: "JS", // JumpShip
    29: "WS", // WarShip
    31: "SS", // Space Station
    5: "CF", // Conventional Fighter
    35: "MS", // Mobile Structure (Advanced Support)
};

/** The Alpha Strike type code ("BM", "DS", ...) for a live unit type name and sub-type id; null if unknown. */
export function bfTypeOf(unitTypeName, subTypeId) {
    return BF_TYPE_BY_SUB_TYPE_ID[subTypeId] ?? BF_TYPE_BY_UNIT_TYPE_NAME[unitTypeName] ?? null;
}

/** The sub-type id held in a stored record's summary hash (see summaryHashOf), for records stored before SubTypeId. */
export function subTypeIdOfSummaryHash(summaryHash) {
    try {
        const fields = JSON.parse(summaryHash);
        return Array.isArray(fields) && typeof fields[3] === "number" ? fields[3] : undefined;
    } catch {
        return undefined;
    }
}

// Live eras.json id -> the app's era id (src/utils/mulUtilities.ts mulEras), matched by name. The live site has
// no era 9.
const LEGACY_ERA_ID_BY_LIVE_ID = {
    1: 1, // Age of War
    2: 10, // Star League
    3: 11, // Early Succession War
    4: 13, // Clan Invasion
    5: 14, // Jihad
    6: 15, // Early Republic
    7: 16, // Dark Age
    8: 247, // Civil War
    10: 254, // Late Republic
    11: 255, // Late Succession War - LosTech
    12: 256, // Late Succession War - Renaissance
    13: 257, // ilClan
};

/** The app's era id for a live era id, or undefined for an era the table doesn't know (add it here). */
export function legacyEraIdOf(liveEraId) {
    return LEGACY_ERA_ID_BY_LIVE_ID[liveEraId];
}
