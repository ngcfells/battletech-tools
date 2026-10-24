// The makers the Engine Table names for each fusion engine rating, by rules edition. A Technical Readout uses
// them as the power plant's make when the player has entered none.
//
// Kept apart from the edition stats in mech-engine-types.ts on purpose: those inherit from the edition before
// (a null entry), but later tables rename makers (the Compendium's 165 is a Vlar, its 170 a Magna), so an
// edition gets makers only once its own table is entered here.

// Ratings 10, 15, ... 400 in order (79 entries).
const ratings = (makers: string[]): Record<number, string> =>
    Object.fromEntries(makers.map((maker, index) => [10 + index * 5, maker]));

// Engine Table, BD p.23 ("Name"). BT2 p.37 ("Manufacturer") prints the same makers.
// Errata (user ruling, 2026-10-07, obvious misprints corrected): BD prints "Nisson" at 195, BT2 at 195 and 200;
// every other entry, and both books' worked example and listings, spell it Nissan.
const firstEngineTable = ratings([
    "Omni", "GM", "Pitban", "Omni", "Nissan", "VOX", "GM", "GM", "DAV", "VOX", // 10-55
    "Leenex", "Nissan", "Omni", "GM", "VOX", "DAV", "DAV", "Nissan", "Hermes", "DAV", // 60-105
    "GM", "GM", "GM", "Nissan", "Vlar", "Magna", "Hermes", "Leenex", "Omni", "Nissan", // 110-155
    "LTV", "VOX", "DAV", "Omni", "GM", "GM", "DAV", "Nissan", "Nissan", "Vlar", // 160-205
    "GM", "CoreTek", "DAV", "VOX", "Leenex", "GM", "Pitban", "Magna", "Magna", "Strand", // 210-255
    "Magna", "Vlar", "GM", "CoreTek", "VOX", "Pitban", "Omni", "GM", "Vlar", "GM", // 260-305
    "Magna", "GM", "Pitban", "VOX", "VOX", "Leenex", "VOX", "Vlar", "Magna", "LTV", // 310-355
    "Hermes", "Hermes", "Magna", "GM", "GM", "LTV", "Magna", "Hermes", "LTV", // 360-400
]);

const engineMakersByEdition: Record<string, Record<number, string>> = {
    "battledroids": firstEngineTable,
    "battletech-2nd-edition": firstEngineTable,
};

/** The maker the edition's Engine Table names for a fusion engine rating, if the table is entered. */
export function getEngineTableMaker(editionTag: string | undefined, rating: number): string | undefined {
    return editionTag ? engineMakersByEdition[editionTag]?.[rating] : undefined;
}
