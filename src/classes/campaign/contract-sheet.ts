import { generateUUID } from "../../utils/generateUUID";

/**
 * The Mercenary Contract Record Sheet (Hot Spots: Draconis Reach, CGL 2026, unnumbered p.203; the same sheet is in
 * Hot Spots: Hinterlands). A paper form: every field is the player's own text, saved with the campaign (#639).
 */

/** Ledger lines printed on the sheet. More can be added on screen; print adds a page as needed. */
export const CONTRACT_SHEET_ROWS = 23;
/** Most ledger lines one sheet keeps. */
export const CONTRACT_SHEET_MAX_ROWS = 200;
/** Most characters in one field. */
export const CONTRACT_SHEET_MAX_TEXT = 500;

/** A "percent (roll)" pair: Base Pay, Transportation, Support and Salvage print "____ % ( __ )". */
export interface IContractSheetTerm {
    percent: string;
    roll: string;
}

export interface IContractSheetRow {
    month: string;
    event: string;
    cost: string;
    cover: string;
    paid: string;
    balance: string;
    rep: string;
}

export interface IContractSheet {
    id: string;
    name: string;
    contract: string;
    typeOfAction: string;
    scale: string;
    length: string;
    basePay: IContractSheetTerm;
    transportation: IContractSheetTerm;
    support: IContractSheetTerm;
    salvage: IContractSheetTerm;
    command: IContractSheetTerm;
    startingWarchest: string;
    rows: IContractSheetRow[];
}

export const CONTRACT_SHEET_ROW_FIELDS: ( keyof IContractSheetRow )[] = ["month", "event", "cost", "cover", "paid", "balance", "rep"];

/** The sheet's COMMON COSTS/PAY panel, as printed. */
export const CONTRACT_SHEET_COMMON_COSTS: { heading: string; lines: { label: string; value: string }[] }[] = [
    { heading: "Contract Terms:", lines: [
        { label: "Travel:", value: "300 SP × Scale" },
        { label: "Mon. Maintenance:", value: "500 SP × Scale" },
    ] },
    { heading: "Combat Bonus:", lines: [
        { label: "Broke Contract:", value: "0" },
        { label: "Unsuccessful:", value: "250 SP × Scale" },
        { label: "Success:", value: "500 SP × Scale" },
        { label: "All Obj:", value: "750 SP × Scale" },
    ] },
    { heading: "Support:", lines: [
        { label: "Repair (Armor only):", value: "Ton/2" },
        { label: "Repair (Structure/Critical):", value: "Ton × 2" },
        { label: "Repair (Crippled):", value: "Ton × 3" },
        { label: "Repair (Destroyed):", value: "Ton × 5" },
        { label: "Rearm:", value: "10 SP/Ton" },
        { label: "Purchase ’Mech:", value: "BV or PV × 40" },
        { label: "Sell (Repaired) ’Mech:", value: "BV/2 or PV × 20" },
    ] },
    { heading: "Salvage:", lines: [
        { label: "Salvage Value:", value: "BV/2 or PV × 20" },
    ] },
];

export const blankContractSheetRow = (): IContractSheetRow => ( { month: "", event: "", cost: "", cover: "", paid: "", balance: "", rep: "" } );

const blankTerm = (): IContractSheetTerm => ( { percent: "", roll: "" } );

export function newContractSheet( name: string = "" ): IContractSheet {
    return {
        id: generateUUID(),
        name,
        contract: "",
        typeOfAction: "",
        scale: "",
        length: "",
        basePay: blankTerm(),
        transportation: blankTerm(),
        support: blankTerm(),
        salvage: blankTerm(),
        command: blankTerm(),
        startingWarchest: "",
        rows: Array.from( { length: CONTRACT_SHEET_ROWS }, blankContractSheetRow ),
    };
}

/** A filled-in ledger line (any field typed). */
export const contractSheetRowUsed = ( row: IContractSheetRow ): boolean => CONTRACT_SHEET_ROW_FIELDS.some( ( f ) => row[f].trim() !== "" );

const text = ( v: unknown ): string => ( typeof v === "string" ? v.slice( 0, CONTRACT_SHEET_MAX_TEXT ) : "" );

const term = ( v: unknown ): IContractSheetTerm => {
    const o = v && typeof v === "object" ? v as Record<string, unknown> : {};
    return { percent: text( o.percent ), roll: text( o.roll ) };
};

/** A stored sheet, cleaned: non-strings become empty, text is capped, and the ledger keeps at least the printed lines. */
export function pickContractSheet( s: Record<string, any> ): IContractSheet | null {
    if( typeof s.id !== "string" || !s.id ) return null;
    const rows: IContractSheetRow[] = ( Array.isArray( s.rows ) ? s.rows : [] )
        .slice( 0, CONTRACT_SHEET_MAX_ROWS )
        .map( ( r: unknown ) => {
            const o = r && typeof r === "object" ? r as Record<string, unknown> : {};
            const row = blankContractSheetRow();
            for( const f of CONTRACT_SHEET_ROW_FIELDS ) row[f] = text( o[f] );
            return row;
        } );
    while( rows.length < CONTRACT_SHEET_ROWS ) rows.push( blankContractSheetRow() );
    return {
        id: s.id,
        name: text( s.name ),
        contract: text( s.contract ),
        typeOfAction: text( s.typeOfAction ),
        scale: text( s.scale ),
        length: text( s.length ),
        basePay: term( s.basePay ),
        transportation: term( s.transportation ),
        support: term( s.support ),
        salvage: term( s.salvage ),
        command: term( s.command ),
        startingWarchest: text( s.startingWarchest ),
        rows,
    };
}
