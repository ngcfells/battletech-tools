import { describe, expect, it } from "vitest";
import { Campaign } from "./campaign";
import { CONTRACT_SHEET_MAX_ROWS, CONTRACT_SHEET_MAX_TEXT, CONTRACT_SHEET_ROWS, newContractSheet, pickContractSheet } from "./contract-sheet";

describe( "contract record sheets (#639)", () => {
    it( "a new sheet has the 23 printed ledger lines", () => {
        expect( newContractSheet().rows ).toHaveLength( CONTRACT_SHEET_ROWS );
        expect( CONTRACT_SHEET_ROWS ).toBe( 23 );
    } );

    it( "round-trips with the campaign; a save made before sheets has none", () => {
        const c = new Campaign();
        const sheet = newContractSheet( "Henshin Tigers" );
        sheet.basePay = { percent: "60", roll: "7" };
        sheet.rows[0].event = "Contract Accepted";
        c.contractSheets = [ sheet ];
        expect( new Campaign( c.export() ).contractSheets ).toEqual( [ sheet ] );

        const old = c.export();
        delete old.contractSheets;
        expect( new Campaign( old ).contractSheets ).toEqual( [] );
    } );

    it( "cleans a stored sheet: wrong types become blank, text and lines are capped, short ledgers are padded", () => {
        expect( pickContractSheet( { name: "no id" } ) ).toBeNull();
        const picked = pickContractSheet( {
            id: "s1", name: 5, contract: "x".repeat( CONTRACT_SHEET_MAX_TEXT + 10 ), basePay: "60",
            rows: [ { month: "1", event: { bad: true } } ],
        } )!;
        expect( picked.name ).toBe( "" );
        expect( picked.contract ).toHaveLength( CONTRACT_SHEET_MAX_TEXT );
        expect( picked.basePay ).toEqual( { percent: "", roll: "" } );
        expect( picked.rows ).toHaveLength( CONTRACT_SHEET_ROWS );
        expect( picked.rows[0] ).toMatchObject( { month: "1", event: "" } );

        const long = pickContractSheet( { id: "s2", rows: Array.from( { length: CONTRACT_SHEET_MAX_ROWS + 50 }, () => ( {} ) ) } )!;
        expect( long.rows ).toHaveLength( CONTRACT_SHEET_MAX_ROWS );
    } );
} );
