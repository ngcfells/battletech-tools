/**
 * The books, printings and errata documents a calculation step may cite (#599).
 *
 * A citation in the app is a claim that the page was read in this printing. Add a source here only for a document
 * our reference library holds, with the printing as the library's index gives it.
 */
export interface ICalcSource {
    /** The abbreviation printed in a citation: "TM", "TM errata v8.0". */
    short: string;
    title: string;
    /** The printing or version that was read. */
    printing: string;
    /** For an errata or revision document: the id of the book it corrects. */
    errataOf?: string;
}

export const CALC_SOURCES: Record<string, ICalcSource> = {
    "tm": { short: "TM", title: "TechManual", printing: "Corrected Sixth Printing (2021)" },
    "tm-errata-8.0": { short: "TM errata v8.0", title: "TechManual errata", printing: "v8.0 (22 August 2024)", errataOf: "tm" },
    "tm-bv-tables-4.1": { short: "TM Battle Value tables v4.1", title: "TechManual Battle Value tables", printing: "v4.1", errataOf: "tm" },
    "tm-bv-2.1": { short: "TM BV 2.1", title: "TechManual: Revised Battle Value rules (BV 2.1)", printing: "Revision of 2017", errataOf: "tm" },
    "tw": { short: "TW", title: "Total Warfare", printing: "Corrected Eleventh Printing (2024)" },
    "tw-errata-11.01": { short: "TW errata v11.01", title: "Total Warfare errata", printing: "v11.01 (17 September 2023)", errataOf: "tw" },
    "toaue": { short: "TO:AUE", title: "Tactical Operations: Advanced Units & Equipment", printing: "2022 printing" },
    "toaue-errata-7.0": { short: "TO:AUE errata v7.0", title: "Tactical Operations: Advanced Units & Equipment errata", printing: "v7.0 (23 September 2023)", errataOf: "toaue" },
    "ioae": { short: "IO:AE", title: "Interstellar Operations: Alternate Eras", printing: "2022 printing" },
    "bmr": { short: "BMR", title: "BattleTech Master Rules", printing: "FASA 1707 (1998)" },
    "bmr-errata": { short: "BMR errata", title: "Classic BattleTech Master Rules errata (FanPro printings)", printing: "As of 1 October 2004", errataOf: "bmr" },
    "bmrr": { short: "BMR(R)", title: "BattleTech Master Rules, Revised Edition", printing: "FanPro 35000 (2005 printing)" },
    "mt": { short: "Max Tech", title: "Maximum Tech", printing: "FASA 1700, Corrected Second Printing (1999)" },
    "mt-revised": { short: "Max Tech (Revised)", title: "Maximum Tech, Revised Edition", printing: "FanPro 35013, PDF version 1.0 (2005)" },
    "ioae-errata-3.01": { short: "IO:AE errata v3.01", title: "Interstellar Operations: Alternate Eras errata", printing: "v3.01 (17 January 2023)", errataOf: "ioae" },
};
