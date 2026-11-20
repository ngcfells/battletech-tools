/**
 * MegaMek ".blk" unit files that differ from the book, keyed by "Name Model" as the file gives them (the model
 * trimmed). Each correction replaces whole blocks of the file, keyed by tag in lower case. Applied when the file is
 * read, so the bundle and a player's own import of the file both get the book's design.
 */
export interface IBlkDesignCorrection {
    blocks: Record<string, string[]>;
    source: string;
}

// Both armed Brunels "carry some nine and a half tons of standard armor" (152 points), NGCFells's ruling 2026-11-20:
// BAR 10. The files give BAR 6 (AC) or no BAR (LRM) at armor Tech Rating C, where BAR 10 does not exist; it needs
// Tech Rating D or better and the Armored chassis modification (TM p.134). At D the 152 points weigh 9,576 kg, the
// nearest to the book's figure (10 tons rounded up; E would be 8.5).
const BRUNEL_SOURCE = "Historical: Operation Klondike, the armed Brunel Dump Trucks (no record sheet printed)";
const BRUNEL_ARMOR = { armor_type: ["0"], barrating: ["10"], armor_tech_rating: ["3"] };

export const BLK_DESIGN_CORRECTIONS: Record<string, IBlkDesignCorrection> = {
    "Brunel Dump Truck (AC)": {
        blocks: { ...BRUNEL_ARMOR, "body equipment": ["IS Ammo MG - Full", "IS Ammo AC/20", "IS Ammo AC/20", "IS Ammo AC/20", "ISOffRoadChassis", "ArmoredChassis"] },
        source: BRUNEL_SOURCE,
    },
    "Brunel Dump Truck (LRM)": {
        blocks: {
            ...BRUNEL_ARMOR,
            "body equipment": ["Basic Fire Control", "ISOffRoadChassis", "ArmoredChassis", "IS Ammo MG - Full",
                "IS Ammo LRM-20", "IS Ammo LRM-20", "IS Ammo LRM-20", "IS Ammo LRM-20", "IS Ammo LRM-20"],
        },
        source: BRUNEL_SOURCE,
    },
};
