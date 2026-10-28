import { describe, expect, it } from "vitest";
import { acesSampleBrawler383 } from "../data/aces-card-samples";
import {
    acesScanBinarize, acesScanColoursFromPixels, acesScanMargin, acesScanTagColour, applyAcesScanToCard, findAcesCardLayout,
    IAcesScanColours, IAcesScanIO, IAcesScanLine, IAcesScanRect, parseAcesScanColumn, parseAcesScanCombat, parseAcesScanFooter,
    parseAcesScanHeader, restoreAcesScanIcons, scanAcesCard, tidyAcesScanLines,
} from "./aces-card-scan";

// Line fixtures are real tesseract output from photos of the printed cards.

const none: IAcesScanColours = { red: 0, yellow: 0, blue: 0, green: 0 };
const plain = ( text: string ) => ( { text: text, colours: none } );

/** An OCR line at whole-image coordinates, one word per space. */
const line = ( text: string, x0: number, y0: number, x1: number, y1: number ): IAcesScanLine => {
    const parts = text.split( " " );
    const step = ( x1 - x0 ) / parts.length;
    return {
        text: text,
        bbox: { x0, y0, x1, y1 },
        words: parts.map( ( part, index ) => ( { text: part, bbox: { x0: x0 + step * index, y0, x1: x0 + step * ( index + 1 ), y1 } } ) ),
    };
}

const pixels = ( count: number, rgb: [ number, number, number ] ): number[] => {
    const rv: number[] = [];
    for( let index = 0; index < count; index++ ) rv.push( rgb[0], rgb[1], rgb[2], 255 );
    return rv;
}

describe( "Aces card scan: header and footer", () => {
    it( "matches the deck and keeps a variant", () => {
        expect( parseAcesScanHeader( "\"MISSILE BOAT" ) ).toEqual( { deck: "Missile Boat", deckId: "missile-boat", priority: null } );
        const hover = parseAcesScanHeader( "| SCOUT (HOVER) 737" );
        expect( hover.deck ).toBe( "Scout (Hover)" );
        expect( hover.deckId ).toBe( "scout-hover" );
        expect( hover.priority ).toBe( 737 );
    } );

    it( "reads the card number from the footer", () => {
        expect( parseAcesScanFooter( "3/6 Scout (Hover) B TTLETE(" ) ).toBe( "3/6" );
        expect( parseAcesScanFooter( "BATTLETECH" ) ).toBe( "" );
    } );
} );

describe( "Aces card scan: icons from wording", () => {
    it( "keeps a lost command-list number from reading as \"no\"", () => {
        expect( restoreAcesScanIcons( "0 command list" ) ).not.toMatch( /^no\b/ );
    } );

    it( "mends OCR's mixed-case \"cover\"", () => {
        expect( restoreAcesScanIcons( "COVer vs enemies" ) ).toBe( "cover vs [highest] enemies" );
        expect( restoreAcesScanIcons( "covervs enemies" ) ).toBe( "cover vs [highest] enemies" );
        expect( restoreAcesScanIcons( "no Cover" ) ).toBe( "no Cover" );
    } );

    it( "reads \"10 ✖ enemies\" as no", () => {
        expect( restoreAcesScanIcons( "10 EJ enemies in 12\"" ) ).toMatch( /^no \[\S+\] enemies in 12"$/ );
    } );
} );

describe( "Aces card scan: movement column", () => {
    it( "reads Missile Boat 1/6 Balanced", () => {
        const column = parseAcesScanColumn( [
            plain( "If there are more allies" ),
            plain( "than enemies in 18\"" ),
            plain( "12\") 18\") 24\")" ),
            // The target row prints only a YELLOW tag and the moved check, so OCR reads nothing there.
            { text: "", colours: { red: 0, yellow: 0.1, blue: 0, green: 0.05 } },
            plain( "1.0ccupy woods" ),
            plain( "2. »{ target" ),
            plain( "3.cover vs enemies" ),
        ] );
        expect( column.condition ).toBe( "If there are more allies than enemies in 18\"" );
        expect( column.zoneRings ).toEqual( [ 12, 18, 24 ] );
        expect( column.targetSelect ).toBe( "yellow" );
        expect( column.targetMoved ).toBe( true );
        expect( column.moveType ).toBe( "ground" );
        expect( column.filters ).toEqual( [ "occupy woods", "[closer] target", "cover vs [highest] enemies" ] );
    } );

    it( "reads Missile Boat 1/6 Cautious, with sprint", () => {
        const column = parseAcesScanColumn( [
            plain( "nearest" ),
            plain( "[6)([s)if there are no" ),
            plain( "enemies in 36\")" ),
            plain( "1. ¢ all enemies" ),
            plain( "2. »< target" ),
            plain( "3. occupy woods" ),
        ] );
        expect( column.condition ).toBe( "" );
        expect( column.zoneKeyword ).toBe( "nearest" );
        expect( column.altMoveType ).toBe( "sprint" );
        expect( column.altMoveWhen ).toBe( "if there are no enemies in 36\"" );
        expect( column.filters ).toEqual( [ "[nolos] all enemies", "[closer] target", "occupy woods" ] );
    } );
} );

describe( "Aces card scan: combat side", () => {
    const brawlerOverheat = [
        "If TNS or less or if this unit is destroyed: Use maximum OV.",
        "If TN7 or less and OV might let unit hit target's structure: Use up to 2 OV.",
        "If TN9 or more and this unit has any heat: Don't attack.",
    ];

    it( "reads Brawler 3/6, whose command-list number reads as 0", () => {
        const combat = parseAcesScanCombat( [ "~ 1.Hit target's Rear", "2.0 command list" ], brawlerOverheat, [ null, "yellow" ] );
        expect( combat.filters.map( ( rule ) => rule.text ) ).toEqual( [ "Hit target's Rear", "[yellow] command list" ] );
        expect( combat.overheat.map( ( row ) => [ row.tnAtMost, row.tnAtLeast, row.action, row.ovLimit ] ) ).toEqual( [
            [ 5, null, "max", null ],
            [ 7, null, "up-to", 2 ],
            [ null, 9, "no-attack", null ],
        ] );
    } );

    it( "reads Scout (Hover) 3/6: a zone ring without its inch mark, an unnumbered command list", () => {
        // The first tag is the red rule under the zone, not a list.
        const combat = parseAcesScanCombat( [ "@6') 24)", "1. Hit ittarget's Rear", "+ command list" ], [], [ "red", null, "blue" ] );
        expect( combat.zoneRings ).toEqual( [ 6, 24 ] );
        expect( combat.filters.map( ( rule ) => rule.text ) ).toEqual( [ "Hit ittarget's Rear", "[blue] command list" ] );
    } );

    it( "takes text before any number as the first filter", () => {
        const combat = parseAcesScanCombat( [ "Attacked by ally this tum", "2. command list" ], [], [ null, "red" ] );
        expect( combat.filters.map( ( rule ) => rule.text ) ).toEqual( [ "Attacked by ally this turn", "[red] command list" ] );
    } );
} );

describe( "Aces card scan: layout", () => {
    const width = 2084, height = 1500;

    it( "spaces the movement columns from the headers, filling a missing one", () => {
        const layout = findAcesCardLayout( [
            line( "AGGRESSIVE", 200, 322, 500, 366 ),
            // BALANCED unread
            line( "CAUTIOUS", 1550, 322, 1820, 366 ),
            line( "BATTLETECH ACES", 700, 1368, 1350, 1440 ),
        ], width, height )!;
        expect( layout.side ).toBe( "movement" );
        expect( layout.columns.length ).toBe( 3 );
        const centres = layout.columns.map( ( rect ) => rect.left + rect.width / 2 );
        expect( centres[1] ).toBeCloseTo( ( centres[0] + centres[2] ) / 2, -1 );
        expect( layout.columns[0].top ).toBeGreaterThan( 366 );
        expect( layout.columns[0].top + layout.columns[0].height ).toBeLessThanOrEqual( 1368 );
    } );

    it( "finds the combat side from COMBAT when TARGET is unread", () => {
        const layout = findAcesCardLayout( [
            line( "AMBUSHER (INFANTRY)", 90, 72, 900, 160 ),
            line( "COMBAT", 90, 180, 300, 240 ),
            line( "1. Anti-'Mech attack vs.", 110, 523, 700, 580 ),
        ], width, height )!;
        expect( layout.side ).toBe( "combat" );
        const panel = layout.columns[0];
        expect( panel.left ).toBeLessThan( 110 );
        expect( panel.left + panel.width ).toBeGreaterThan( 700 );
        expect( panel.top ).toBeLessThan( 523 );
    } );

    it( "takes lowercase \"target\" in a filter for no header", () => {
        expect( findAcesCardLayout( [ line( "1. Hit target's Rear", 110, 523, 700, 580 ) ], width, height ) ).toBeNull();
    } );
} );

describe( "Aces card scan: pixels", () => {
    it( "binarizes dark text and clears a panel's edge strip", () => {
        const width = 50, height = 20;
        const data: number[] = [];
        for( let y = 0; y < height; y++ ) {
            for( let x = 0; x < width; x++ ) {
                // A black border down the left, one black "letter" pixel in the middle, cream elsewhere.
                const ink = x < 2 || ( x === 25 && y === 10 );
                data.push( ...( ink ? [ 0, 0, 0, 255 ] : [ 240, 230, 200, 255 ] ) );
            }
        }
        const at = ( image: { data: Uint8ClampedArray, width: number }, x: number, y: number ) => image.data[( ( y + acesScanMargin ) * image.width + x + acesScanMargin ) * 4];
        const dark = acesScanBinarize( data, width, height, "dark" );
        expect( dark.width ).toBe( width + acesScanMargin * 2 );
        expect( at( dark, 0, 5 ) ).toBe( 0 );
        expect( at( dark, 25, 10 ) ).toBe( 0 );
        expect( at( dark, 10, 10 ) ).toBe( 255 );
        const panel = acesScanBinarize( data, width, height, "panel" );
        expect( at( panel, 0, 5 ) ).toBe( 255 );
        expect( at( panel, 25, 10 ) ).toBe( 0 );
    } );

    it( "tells tag colours from the card's gold", () => {
        expect( acesScanTagColour( acesScanColoursFromPixels( pixels( 100, [ 220, 30, 30 ] ) ) ) ).toBe( "red" );
        expect( acesScanTagColour( acesScanColoursFromPixels( pixels( 100, [ 20, 140, 190 ] ) ) ) ).toBe( "blue" );
        expect( acesScanTagColour( acesScanColoursFromPixels( pixels( 100, [ 250, 210, 10 ] ) ) ) ).toBe( "yellow" );
        // The gold condition boxes are less saturated than a YELLOW tag.
        expect( acesScanTagColour( acesScanColoursFromPixels( pixels( 100, [ 240, 190, 100 ] ) ) ) ).toBeNull();
        expect( acesScanColoursFromPixels( pixels( 100, [ 40, 180, 60 ] ) ).green ).toBe( 1 );
    } );

    it( "drops tall art lines and the copyright, and joins pieces of a row", () => {
        const lines = tidyAcesScanLines( [
            line( "1. Hit", 100, 500, 200, 540 ),
            line( "target's Rear", 210, 502, 400, 541 ),
            line( "2. command list", 100, 560, 400, 600 ),
            line( "= ii TBE & A fo", 100, 100, 700, 400 ),
            line( "©2025 The Topps Company", 1500, 1368, 1900, 1400 ),
        ] );
        expect( lines.map( ( entry ) => entry.text ) ).toEqual( [ "1. Hit target's Rear", "2. command list" ] );
    } );
} );

describe( "Aces card scan: whole card", () => {
    const width = 2084, height = 1500;
    const within = ( rect: IAcesScanRect, y: number ) => y >= rect.top && y < rect.top + rect.height;

    // Brawler 3/6 combat, as the OCR reads its regions.
    const io: IAcesScanIO = {
        width, height,
        recognize: async ( rect, mode ) => {
            if( mode === "plain" ) return [
                line( "BRAWLER", 90, 90, 500, 213 ),
                line( "COMBAT", 90, 190, 300, 240 ),
                line( "© TARGET", 230, 313, 640, 368 ),
                line( "PA, 3/6 Brawler BATTLETECH", 60, 1374, 1300, 1426 ),
            ];
            if( mode === "bright" ) return within( rect, 100 ) ? [ line( "BRAWLER", rect.left + 50, 90, rect.left + 500, 174 ) ] : [ line( "3/6 Brawler B TTLETE(", rect.left + 20, rect.top + 20, rect.left + 600, rect.top + 69 ) ];
            if( mode === "digits" ) return [ line( "253", rect.left + 100, 91, rect.left + 600, 238 ) ];
            if( mode === "panel" ) return [
                line( "~ 1.Hit target's Rear", rect.left + 60, rect.top + 156, rect.left + 500, rect.top + 216 ),
                line( "2.0 command list", rect.left + 60, rect.top + 251, rect.left + 500, rect.top + 313 ),
            ];
            return [
                line( "If TNS or less or if this unit is destroyed: Use maximum OV.", rect.left, rect.top + 104, rect.left + 1500, rect.top + 161 ),
                line( "If TN7 or less and OV might let unit hit target's structure: Use up to 2 OV.", rect.left, rect.top + 196, rect.left + 1500, rect.top + 253 ),
                line( "If TN9 or more and this unit has any heat: Don't attack.", rect.left, rect.top + 287, rect.left + 1500, rect.top + 344 ),
            ];
        },
        // The YELLOW tag sits on the command list row.
        colours: ( rect ) => rect.top > 600 && rect.top < 700 ? { ...none, yellow: 0.2 } : none,
    };

    it( "scans Brawler 3/6 combat and fills a card for review", async () => {
        const scan = await scanAcesCard( io );
        expect( scan.side ).toBe( "combat" );
        expect( scan.deckId ).toBe( "brawler" );
        expect( scan.priority ).toBe( 253 );
        expect( scan.cardNumber ).toBe( "3/6" );
        expect( scan.combat!.filters.map( ( rule ) => rule.text ) ).toEqual( [ "Hit target's Rear", "[yellow] command list" ] );
        expect( scan.combat!.overheat.length ).toBe( 3 );
        expect( scan.warnings.some( ( warning ) => /priority number/.test( warning ) ) ).toBe( true );

        const card = applyAcesScanToCard( null, scan );
        expect( card.deck ).toBe( "Brawler" );
        expect( card.combatPriority ).toBe( 253 );
        expect( card.combat.filters.length ).toBe( 2 );
        // A scan never overwrites what the card already says about its deck, and leaves the other side alone.
        const existing = applyAcesScanToCard( acesSampleBrawler383, scan );
        expect( existing.aggressive ).toEqual( acesSampleBrawler383.aggressive );
        expect( existing.combatPriority ).toBe( 253 );
    } );

    it( "warns of a TN no roll could need", async () => {
        const misread: IAcesScanIO = {
            ...io,
            recognize: async ( rect, mode, scale ) => {
                const lines = await io.recognize( rect, mode, scale );
                return mode === "dark" ? lines.map( ( entry ) => ( { ...entry, text: entry.text.replace( "TN9", "TN0" ) } ) ) : lines;
            },
        };
        const scan = await scanAcesCard( misread );
        expect( scan.warnings.some( ( warning ) => /TN numbers/.test( warning ) ) ).toBe( true );
        expect( ( await scanAcesCard( io ) ).warnings.some( ( warning ) => /TN numbers/.test( warning ) ) ).toBe( false );
    } );

    it( "warns when it can't find the card's layout", async () => {
        const scan = await scanAcesCard( { ...io, recognize: async () => [] } );
        expect( scan.side ).toBeNull();
        expect( scan.warnings.length ).toBe( 1 );
    } );
} );
