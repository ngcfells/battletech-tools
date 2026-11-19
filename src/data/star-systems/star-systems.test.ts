import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { IStarSystemIndexEntry } from "./star-system-types";
import {
    DEFAULT_JUMP_RANGE_LY,
    getDistanceLY,
    getFewestJumps,
    getStarSystemIndex,
    getSystemOwners,
    loadStarSystemDetail,
    loadStarSystemIndex,
    searchStarSystems,
} from "./star-systems";

const raw = JSON.parse( readFileSync( join( __dirname, "data", "index.json" ), "utf-8" ) ) as IStarSystemIndexEntry[];
const byId = ( id: string ) => raw.find( ( s ) => s.id === id )!;

describe( "Star system lookups", () => {
    it( "finds Tharkad by a partial name", async () => {
        await loadStarSystemIndex();
        expect( getStarSystemIndex() ).toHaveLength( 3186 );
        expect( searchStarSystems( "thark" ).map( ( s ) => s.id ) ).toContain( "Tharkad" );
        expect( searchStarSystems( "Thark" )[0].id ).toBe( "Tharkad" );
    } );

    it( "ignores apostrophes and puts prefix matches first", async () => {
        await loadStarSystemIndex();
        const withApostrophe = raw.find( ( s ) => s.name.includes( "'" ) )!;
        const typed = withApostrophe.name.replace( /'/g, "" ).toLowerCase();
        expect( searchStarSystems( typed ).map( ( s ) => s.id ) ).toContain( withApostrophe.id );
        const results = searchStarSystems( "new", 50 );
        const firstNonPrefix = results.findIndex( ( s ) => !s.name.toLowerCase().startsWith( "new" ) );
        if( firstNonPrefix >= 0 ) expect( results.slice( firstNonPrefix ).every( ( s ) => !s.name.toLowerCase().startsWith( "new" ) ) ).toBe( true );
    } );

    it( "knows who held Tharkad in 3025", () => {
        const tharkad = byId( "Tharkad" );
        const expected = [...tharkad.owners].reverse().find( ( o ) => o.date <= "3025-01-01" )!.factions;
        expect( getSystemOwners( tharkad, "3025-01-01" ) ).toEqual( expected );
        expect( expected ).toEqual( ["LA"] );
        expect( getSystemOwners( tharkad, "1000-01-01" ) ).toEqual( [] );
    } );

    it( "measures Terra to Tharkad", () => {
        expect( getDistanceLY( byId( "Terra" ), byId( "Tharkad" ) ) ).toBeCloseTo( 261.5, 1 );
    } );

    it( "counts jumps", async () => {
        await loadStarSystemIndex();
        // Strategic Operations: a jump of "approximately 30 light years".
        expect( DEFAULT_JUMP_RANGE_LY ).toBe( 30 );
        const terra = byId( "Terra" );
        const near = raw.find( ( s ) => s.id !== "Terra" && getDistanceLY( terra, s ) <= 30 )!;
        expect( getFewestJumps( terra, near, 30 ) ).toBe( 1 );
        expect( getFewestJumps( terra, terra, 30 ) ).toBe( 0 );
        expect( getFewestJumps( terra, byId( "Tharkad" ), 30 )! ).toBeGreaterThanOrEqual( 9 );
    } );

    it( "returns null when no path exists", async () => {
        await loadStarSystemIndex();
        expect( getFewestJumps( byId( "Terra" ), byId( "Tharkad" ), 1 ) ).toBeNull();
    } );

    it( "loads one system's detail", async () => {
        const detail = await loadStarSystemDetail( "Tharkad" );
        expect( detail?.planets.length ).toBeGreaterThan( 0 );
        expect( await loadStarSystemDetail( "No Such System" ) ).toBeUndefined();
    } );
} );
