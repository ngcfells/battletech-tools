/**
 * Bundled designs whose MegaMek file differs from the newest printed sheet, by "chassis model", with the sheet for
 * each. The values replace the file's "key:value" lines (keys in lower case, as parseMtfFile reads them) on import,
 * so the bundle and a player's own import of the file both get the printed design.
 */
export const MTF_DESIGN_CORRECTIONS: Record<string, { values: Record<string, string>; source: string }> = {
    // The MegaMek files follow the CO pp.213-214 example; the newer sheets print other armor on plain 60-ton structure.
    "Hybrid Rifleman RFL-3N (Sneede)": {
        values: {
            "hd armor": "9", "lt armor": "22", "rt armor": "15", "la armor": "20", "ra armor": "20", "ct armor": "22",
            "ll armor": "16", "rl armor": "16", "rtc armor": "4", "rtl armor": "6", "rtr armor": "2",
            "la structure": "60", "lt structure": "60",
        },
        source: "ForcePack Record Sheets: Snord's Irregulars (2023), BV 1,269",
    },
    "Hybrid Rifleman RFL-3N (Sneede II)": {
        values: {
            "hd armor": "9", "lt armor": "20", "rt armor": "21", "la armor": "15", "ra armor": "19", "ct armor": "28",
            "ll armor": "24", "rl armor": "24", "rtc armor": "9", "rtl armor": "6", "rtr armor": "7",
            "la structure": "60", "lt structure": "60",
        },
        source: "ForcePack Record Sheets: Snord's Irregulars (2023), BV 2,198",
    },
    // The right leg is a TMP-3M Tempest's (65 tons; MegaMek has 90). The printed 1,475 takes -1 per HVAC/10 slot;
    // TO:AUE p.195 (errata v7.0) counts one slot, so ours is 1,481.
    "Temax Cat Ninjabolt TMC-NB": {
        values: { "rtr armor": "6", "rl structure": "IS Endo Steel:65" },
        source: "XTRO: Boondocks (2010) p.6",
    },
};
