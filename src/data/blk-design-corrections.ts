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

/**
 * Designs checked and found illegal as printed, by "Name Model" as above: kept, and flagged in the lists with what
 * their construction checks report (NGCFells 2026-11-20: "Leave them, but add an illegal flag"). Only a design
 * checked against its book goes here, so a fault in our own checks never brands a legal design.
 */
export const BLK_ILLEGAL_AS_PRINTED: ReadonlySet<string> = new Set([
    // Both armed Brunels mount their weapons in a 150-ton Large Support Vehicle's 20 item slots (5 + tonnage / 10,
    // TM p.120): three AC/20s take 10 slots each and four LRM 20s 5 each (Support Vehicle column, TM p.136), so 34
    // and 24 slots. Built as Superheavy Combat Vehicles they would fit (one slot a weapon, 35 slots), but the
    // Operation Klondike text describes Support Vehicles.
    "Brunel Dump Truck (AC)",
    "Brunel Dump Truck (LRM)",
    // Ajax Assault Tank C (Record Sheets: 3067 Unabridged): the chassis leaves 42 tons of pod space and fixes the turret
    // at 3.5 tons (TRO 3067 p.27; TM p.108), but the C's targeting computer, MRM 40, four Streak SRM 6s, Guardian ECM,
    // PPC and four tons of ammunition come to 44.5 tons: 92.5 tons on a 90-ton tank.
    "Ajax Assault Tank C",
]);

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
