import {
    IAcesBehaviorColumn,
    IAcesCard,
    newAcesBehaviorColumn,
    newAcesCard,
    parseAcesOverheatLine,
    parseAcesPriorityLine,
    TAcesColor,
    TAcesMoveType,
} from "../data/aces-cards";
import { acesDecks } from "../data/aces-rules";
import { ICardScanColours, ICardScanIO, ICardScanLine, ICardScanRect, ICardScanWord, cardScanMargin } from "./card-scan-io";

/*
 * Reads an Aces behavior card from a photo of the players' own card, for those who find the small print hard to
 * read or type in. Text comes from OCR; the icons don't OCR, so they come from pixel colour (the RED / YELLOW /
 * BLUE tags, the green moved check, the red J and yellow S tabs) and from the card wording around them ("no ?
 * enemies" is always the not-moved icon). An icon that can't be placed is left as a visible "[?]" for the player
 * to fix: the result is a draft for review in the card editor, never saved unchecked.
 *
 * The OCR engine and the image are reached through ICardScanIO (card-scan-io.ts).
 */

export type TAcesScanSide = "movement" | "combat";

export interface IAcesScanResult {
    side: TAcesScanSide | null;
    deck: string;
    deckId: IAcesCard["deckId"];
    cardNumber: string;
    priority: number | null;
    columns: IAcesBehaviorColumn[];
    combat: IAcesCard["combat"] | null;
    /** What the player should check by hand. */
    warnings: string[];
}

const tagThreshold = 0.03;
const checkThreshold = 0.01;

/** The Command list tag in a region, if any. */
export const acesScanTagColour = ( colours: ICardScanColours ): TAcesColor | null => {
    const ranked = ( [ "red", "yellow", "blue" ] as TAcesColor[] ).sort( ( a, b ) => colours[b] - colours[a] );
    return colours[ranked[0]] >= tagThreshold ? ranked[0] : null;
}

/* ----- layout ----- */

/** A printed header word, which the cards set in capitals (so "target" in a filter line is no match). */
const fuzzyIs = ( text: string, target: string ): boolean => {
    const letters = text.replace( /[^A-Za-z]/g, "" );
    if( letters.replace( /[^A-Z]/g, "" ).length < letters.length * 0.6 ) return false;
    const word = letters.toUpperCase();
    if( word.length < 4 ) return false;
    if( word.includes( target.substring( 0, 5 ) ) || word.includes( target.substring( target.length - 5 ) ) ) return true;
    return editDistance( word, target ) <= 2;
}

const editDistance = ( a: string, b: string ): number => {
    const row = Array.from( { length: b.length + 1 }, ( _, index ) => index );
    for( let i = 1; i <= a.length; i++ ) {
        let previous = row[0];
        row[0] = i;
        for( let j = 1; j <= b.length; j++ ) {
            const current = row[j];
            row[j] = Math.min( row[j] + 1, row[j - 1] + 1, previous + ( a[i - 1] === b[j - 1] ? 0 : 1 ) );
            previous = current;
        }
    }
    return row[b.length];
}

const allWords = ( lines: ICardScanLine[] ): ICardScanWord[] => lines.reduce( ( rv, line ) => rv.concat( line.words ), [] as ICardScanWord[] );

export interface IAcesScanLayout {
    side: TAcesScanSide;
    header: ICardScanRect;
    footer: ICardScanRect;
    /** Movement: Aggressive, Balanced, Cautious. Combat: the TARGET column. */
    columns: ICardScanRect[];
    /** Combat: the OV rows. */
    overheat: ICardScanRect | null;
}

const clampRect = ( rect: ICardScanRect, width: number, height: number ): ICardScanRect => {
    const left = Math.max( 0, Math.round( rect.left ) );
    const top = Math.max( 0, Math.round( rect.top ) );
    return {
        left: left,
        top: top,
        width: Math.max( 1, Math.min( width - left, Math.round( rect.width ) ) ),
        height: Math.max( 1, Math.min( height - top, Math.round( rect.height ) ) ),
    };
}

/** Finds the card's regions from a first OCR pass over the whole photo: the column headers or TARGET, and the footer. */
export const findAcesCardLayout = ( lines: ICardScanLine[], width: number, height: number ): IAcesScanLayout | null => {
    const words = allWords( lines );
    const footerWord = words.filter( ( word ) => /BATTLETECH|ACES|Topps|Rights/i.test( word.text ) && word.bbox.y0 > height * 0.6 )
        .sort( ( a, b ) => a.bbox.y0 - b.bbox.y0 )[0];
    const footerTop = footerWord ? footerWord.bbox.y0 - ( footerWord.bbox.y1 - footerWord.bbox.y0 ) * 0.4 : height * 0.92;

    const names = [ "AGGRESSIVE", "BALANCED", "CAUTIOUS" ];
    const headers = names.map( ( name ) => words.find( ( word ) => fuzzyIs( word.text, name ) ) || null );
    const found = headers.filter( ( word ) => word !== null ) as ICardScanWord[];
    if( found.length >= 2 ) {
        const centres = headers.map( ( word ) => word ? ( word.bbox.x0 + word.bbox.x1 ) / 2 : null );
        // Columns are evenly spaced; fill one missing header from the other two.
        const known = centres.map( ( centre, index ) => ( { centre, index } ) ).filter( ( entry ) => entry.centre !== null ) as { centre: number, index: number }[];
        const step = ( known[known.length - 1].centre - known[0].centre ) / ( known[known.length - 1].index - known[0].index );
        const filled = centres.map( ( centre, index ) => centre !== null ? centre : known[0].centre + ( index - known[0].index ) * step );
        const headerBottom = Math.max( ...found.map( ( word ) => word.bbox.y1 ) );
        const headerTop = Math.min( ...found.map( ( word ) => word.bbox.y0 ) );
        const rowHeight = headerBottom - headerTop;
        const columns = filled.map( ( centre ) => clampRect( {
            left: centre - step / 2,
            top: headerBottom + rowHeight * 0.3,
            width: step,
            height: footerTop - headerBottom - rowHeight * 0.3,
        }, width, height ) );
        const cardLeft = Math.max( 0, filled[0] - step * 0.62 );
        return {
            side: "movement",
            header: clampRect( { left: cardLeft, top: 0, width: width - cardLeft, height: headerTop - rowHeight * 0.4 }, width, height ),
            footer: clampRect( { left: cardLeft, top: footerTop, width: step * 1.2, height: height - footerTop }, width, height ),
            columns: columns,
            overheat: null,
        };
    }

    let target: ICardScanWord | undefined = words.filter( ( word ) => fuzzyIs( word.text, "TARGET" ) ).sort( ( a, b ) => a.bbox.y0 - b.bbox.y0 )[0];
    // TARGET is thin type over art and sometimes unread; the red COMBAT under the title still marks the side,
    // and TARGET then sits where it does on every combat card of a photo that fills the frame.
    if( !target && words.some( ( word ) => fuzzyIs( word.text, "COMBAT" ) && word.bbox.y0 < height * 0.3 ) )
        target = { text: "TARGET", bbox: { x0: width * 0.155, y0: height * 0.215, x1: width * 0.305, y1: height * 0.243 } };
    if( !target ) return null;
    const wordWidth = target.bbox.x1 - target.bbox.x0;
    const rowHeight = target.bbox.y1 - target.bbox.y0;
    const boxLeft = target.bbox.x0 - wordWidth * 0.9;
    const boxWidth = wordWidth * 2.4;
    const tnWords = words.filter( ( word ) => /^TN\d+/i.test( word.text ) && word.bbox.y0 > target.bbox.y1 );
    const overheatTop = tnWords.length > 0 ? Math.min( ...tnWords.map( ( word ) => word.bbox.y0 ) ) - rowHeight * 0.5 : target.bbox.y1 + ( footerTop - target.bbox.y1 ) * 0.62;
    return {
        side: "combat",
        header: clampRect( { left: boxLeft - wordWidth * 0.2, top: 0, width: width - boxLeft, height: target.bbox.y0 - rowHeight * 0.4 }, width, height ),
        footer: clampRect( { left: boxLeft - wordWidth * 0.2, top: footerTop, width: boxWidth * 1.4, height: height - footerTop }, width, height ),
        columns: [ clampRect( { left: boxLeft, top: target.bbox.y1 + rowHeight * 0.3, width: boxWidth, height: overheatTop - target.bbox.y1 - rowHeight * 0.3 }, width, height ) ],
        overheat: clampRect( { left: boxLeft + boxWidth * 0.25, top: overheatTop, width: width - boxLeft - boxWidth * 0.25, height: footerTop - overheatTop }, width, height ),
    };
}

/* ----- header and footer ----- */

/** Deck name and priority from the card's title band, e.g. "MISSILE BOAT 132". */
export const parseAcesScanHeader = ( text: string ): { deck: string, deckId: IAcesCard["deckId"], priority: number | null } => {
    const flat = text.replace( /[[\]|]/g, " " ).replace( /\s+/g, " " ).trim();
    const priorities = flat.match( /\b\d{3}\b/g );
    const priority = priorities ? +priorities[priorities.length - 1] : null;
    const upper = flat.toUpperCase();
    // Longest name first, so "SCOUT (HOVER)" isn't read as "SCOUT".
    const decks = acesDecks.slice().sort( ( a, b ) => b.name.length - a.name.length );
    const deck = decks.find( ( entry ) => upper.includes( entry.name.toUpperCase() ) )
        || decks.find( ( entry ) => upper.includes( entry.role.toUpperCase() ) );
    if( deck ) {
        const variant = new RegExp( deck.role.toUpperCase().replace( /[()]/g, "\\$&" ) + "\\s*\\(([A-Z]+)\\)" ).exec( upper );
        const name = variant && !deck.name.includes( "(" ) ? deck.role + " (" + titleCase( variant[1] ) + ")" : deck.name;
        const exact = acesDecks.find( ( entry ) => entry.name.toLowerCase() === name.toLowerCase() );
        return { deck: name, deckId: exact ? exact.id : deck.id, priority: priority };
    }
    const words = flat.replace( /\b\d+\b/g, "" ).replace( /[^A-Za-z() ]/g, "" ).trim();
    return { deck: titleCase( words ), deckId: "", priority: priority };
}

const titleCase = ( text: string ): string => text.toLowerCase().replace( /(^|[\s(])([a-z])/g, ( _, lead, letter ) => lead + letter.toUpperCase() );

/** Card number from the footer, "2/6 Missile Boat". */
export const parseAcesScanFooter = ( text: string ): string => {
    const match = /(\d)\s*\/\s*(\d)/.exec( text );
    return match ? match[1] + "/" + match[2] : "";
}

/* ----- card text ----- */

const plainWord = /^[("']?[A-Za-z][A-Za-z'’-]*[A-Za-z][.,:;)"'’]*$/;
const inchWord = /^\(?\d+(\.\d+)?["”'’°]*\)?[.,:;]?$/;
const tokenWord = /^\[[a-z?]+\]$/i;
const ownWords = [ "a", "vs" ];

const isJunk = ( word: string ): boolean => {
    if( ownWords.includes( word ) ) return false;
    return !plainWord.test( word ) && !inchWord.test( word ) && !tokenWord.test( word );
}

/** OCR slips that the card vocabulary makes certain: "0ccupy", "n0", "enemiesin". */
const fixWords = ( text: string ): string => {
    const digitFor: { [letter: string]: string } = { G: "6", O: "0", o: "0", S: "5", B: "8", I: "1", l: "1", Z: "2" };
    return text
        .replace( /\bTN\s*([0-9GOoSBIlZ]{1,2})\b/g, ( _, value: string ) => "TN" + value.split( "" ).map( ( letter ) => digitFor[letter] || letter ).join( "" ) )
        .replace( /\b0(?=[a-z])/g, "o" )
        .replace( /(?<=[a-z])0\b/g, "o" )
        .replace( /enemiesin\b/gi, "enemies in" )
        .replace( /\b[a-z]?n[eo]mies\b/g, "enemies" )
        .replace( /\b[a-z]?n[eo]my\b/g, "enemy" )
        .replace( /onlytotarget/gi, "only to target" )
        .replace( /\bthis tum\b/g, "this turn" )
        // "COVer", "cOver vs", "covervs": the cards print it lower case, or capitalised to open a line.
        .replace( /\b([cC][oO0][vV][eE][rR])(vs)?\b/g, ( word: string, cover: string, vs: string | undefined ) => ( /^(cover|Cover)$/.test( cover ) ? cover : "cover" ) + ( vs ? " vs" : "" ) )
        .replace( /\bAmor\b/g, "Armor" )
        .replace( /([^A-Za-z0-9\s[\]()"'’.,]+)([A-Za-z]{2,})/g, "$1 $2" )
        .replace( /[”“]/g, "\"" )
        .replace( /°/g, "\"" );
}

/**
 * Card text with the unreadable icons put back as tokens, from the wording around them (the icon set is small and
 * each phrase on the cards takes the same icon). Anything else becomes "[?]".
 */
export const restoreAcesScanIcons = ( text: string, hints: { colour?: TAcesColor | null, moved?: boolean } = {} ): string => {
    // "no ✖ enemies" often reads "10 ✖ enemies".
    const words = fixWords( text ).replace( /^(1?0|n0)\s+(?=(\S+\s+)?enem)/, "no " ).split( /\s+/ ).filter( ( word ) => word !== "" );
    // One junk run is one icon. A bare number with no inch mark is an icon misread, except as a count ("in 2").
    const merged: string[] = [];
    words.forEach( ( word, index ) => {
        const bareNumber = /^\d+$/.test( word ) && !/^(in|to|than|up|of)$/i.test( words[index - 1] || "" );
        // An icon between "no ... enemies" can read as a short capital word ("no EJ enemies").
        const iconWord = /^[A-Z]{1,3}$/.test( word ) && /^(no|vs|any|in)$/i.test( words[index - 1] || "" ) && /^enem/i.test( words[index + 1] || "" );
        const junk = isJunk( word ) || bareNumber || iconWord;
        if( junk && merged.length > 0 && merged[merged.length - 1] === "\u0000" ) return;
        merged.push( junk ? "\u0000" : word );
    } );
    // The cards never print these phrases without their icon; coloured icons drop out with the background.
    for( let index = merged.length - 1; index > 0; index-- ) {
        const word = merged[index - 1].toLowerCase();
        const next = merged[index].toLowerCase();
        if( /^(no|vs|any|in)$/.test( word ) && /^(enemies|enemy|other)$/.test( next ) ) merged.splice( index, 0, "\u0000" );
        else if( word === "ideal" && next !== "\u0000" ) merged.splice( index, 0, "\u0000" );
    }
    // "in ▼ enemy ⌖": the attack-range icon ends the line.
    if( merged.length >= 2 && merged[merged.length - 1].toLowerCase() === "enemy" && merged[merged.length - 3] === "\u0000" ) merged.push( "\u0000" );
    let colour = hints.colour || null;
    let moved = !!hints.moved;
    const rv = merged.map( ( word, index ) => {
        if( word !== "\u0000" ) return word;
        const before = ( merged[index - 1] || "" ).toLowerCase();
        const after = merged.slice( index + 1, index + 4 ).join( " " ).toLowerCase();
        if( /^(enemies|enemy)\b/.test( after ) ) {
            if( before === "no" ) return "[notmoved]";
            if( before === "any" ) {
                if( colour ) { const token = "[" + colour + "]"; colour = null; return token; }
                moved = false;
                return "[moved]";
            }
            if( before === "in" ) return "[lowest]";
            if( before === "vs" || before === "more" ) return "[highest]";
        }
        if( /^other enemies/.test( after ) ) return "[highest]";
        if( /^all enemies/.test( after ) || /^any enemy/.test( after ) ) return "[nolos]";
        if( /^(only to )?target/.test( after ) ) {
            if( inchWord.test( before ) ) return "[spacing]";
            if( /^only/.test( after ) ) return "[los]";
            return "[closer]";
        }
        if( before === "enemy" && after === "" ) return "[range]";
        if( before === "ideal" && colour ) { const token = "[" + colour + "]"; colour = null; return token; }
        if( ( before === "is" || before === "are" ) && moved ) { moved = false; return "[moved]"; }
        return "[?]";
    } );
    return rv.join( " " ).replace( /\s+([,.:;)])/g, "$1" ).trim();
}

/** Column-edge noise: rule-like stray characters or a lone "i" at either end of a line (icons are kept). */
const trimEdges = ( text: string ): string => {
    return text
        .replace( /^(\s*([|=~‘'`_\-.,:;]{1,2}|i)\s+)+/, "" )
        .replace( /(\s+([|=~‘'`_\-.,:;]{1,2}|i))+\s*$/, "" )
        .replace( /^[|=~‘'`_\-.,:;]+\s*/, "" )
        .trim();
}

const numbered = /^\W{0,3}(\d)\s*(?:[.,:]\s*|\s+(?=[A-Za-z[])|(?=[a-z]))/;
const zoneLine = /\d+\s*["”'’°]+\s*\)/;

/**
 * Zone rings from a line of only numbers, inch marks and brackets, which OCR sometimes runs together: "©1624)" is
 * 16" and 24". Rings are 6" to 48", so a run of digits splits into pairs from the right.
 */
const gluedRings = ( text: string ): number[] | null => {
    if( /[A-Za-z]{2,}/.test( text ) || !/\d/.test( text ) || !/[)"”'’°]/.test( text ) ) return null;
    const rv: number[] = [];
    for( const run of text.match( /\d+/g ) || [] ) {
        for( let end = run.length; end > 0; end -= 2 ) rv.unshift( +run.substring( Math.max( 0, end - 2 ), end ) );
    }
    return rv.length > 0 && rv.every( ( ring ) => ring >= 6 && ring <= 48 ) ? rv.sort( ( a, b ) => a - b ) : null;
}

const parseZone = ( text: string ): { zoneRings: number[], zoneKeyword: "" | "nearest" | "any" } => {
    // A ring line is only numbers and marks, so once one ring reads cleanly the others count even where OCR lost the inch mark ("6') 24)").
    const marked = /\d+(?=\s*["”'’°]+\s*\))/.test( text ) && !/[A-Za-z]{2,}/.test( text );
    const rings = ( text.match( marked ? /\d+/g : /\d+(?=\s*["”'’°]+\s*\))/g ) || [] ).map( ( ring ) => +ring )
        .filter( ( ring ) => ring >= 6 && ring <= 48 );
    if( rings.length > 0 ) return { zoneRings: rings, zoneKeyword: "" };
    const glued = gluedRings( text );
    if( glued ) return { zoneRings: glued, zoneKeyword: "" };
    if( /\bany\b/i.test( text ) ) return { zoneRings: [], zoneKeyword: "any" };
    return { zoneRings: [], zoneKeyword: "nearest" };
}

const isZoneLine = ( text: string ): boolean => zoneLine.test( text ) || gluedRings( text ) !== null || /^\W*(nearest|any)\W*$/i.test( text );

/** Numbered lines with their wrapped continuations joined. Items count up from 1, so a stray digit is no new item. */
const joinNumbered = ( lines: string[] ): string[] => {
    const rv: string[] = [];
    for( const line of lines ) {
        const match = numbered.exec( line );
        if( match && +match[1] === rv.length + 1 ) rv.push( line.substring( match[0].length ) );
        else if( rv.length > 0 ) rv[rv.length - 1] += " " + line;
    }
    return rv;
}

const isNumberedStart = ( text: string ): boolean => {
    const match = numbered.exec( text );
    return !!match && match[1] === "1";
}

/** One behavior column from its OCR lines, top to bottom, with the icon colours of each line. */
export const parseAcesScanColumn = ( lines: { text: string, colours: ICardScanColours }[] ): IAcesBehaviorColumn => {
    const column = newAcesBehaviorColumn();
    // Blank rows (all icons, no OCR text) are kept when they show a tag or a check.
    const texts = lines.map( ( line ) => ( { text: trimEdges( line.text ), colours: line.colours } ) )
        .filter( ( line ) => line.text !== "" || acesScanTagColour( line.colours ) !== null || line.colours.green >= checkThreshold );
    // The alternative movement reads "(S if there are no ...)" or "(J if needed)"; a condition opens with "If".
    const isMoveRow = ( text: string ) => /if\s*needed|standstill/i.test( text ) || ( /if\s*there/i.test( text ) && !/^\W{0,2}If\b/.test( text ) );
    const zoneIndex = texts.findIndex( ( line ) => isZoneLine( line.text ) );
    // Without a zone row the condition runs from an opening "If" to the first row that can't be part of it.
    let conditionEnd = zoneIndex;
    if( zoneIndex < 0 ) {
        conditionEnd = 0;
        if( texts.length > 0 && /^\W{0,2}If/i.test( texts[0].text ) ) {
            conditionEnd = texts.findIndex( ( line, index ) => index > 0 && ( line.text === "" || isMoveRow( line.text ) || isNumberedStart( line.text ) ) );
            if( conditionEnd < 0 ) conditionEnd = texts.length;
        }
    }
    const middleStart = zoneIndex >= 0 ? zoneIndex + 1 : conditionEnd;
    const firstNumbered = texts.findIndex( ( line, index ) => index >= middleStart && isNumberedStart( line.text ) );

    // The condition wraps, so its icons are restored over the whole text.
    const conditionLines = texts.slice( 0, Math.max( 0, conditionEnd ) );
    column.condition = restoreAcesScanIcons( conditionLines.map( ( line ) => line.text ).join( " " ), {
        colour: conditionLines.map( ( line ) => acesScanTagColour( line.colours ) ).find( ( colour ) => colour ) || null,
        moved: conditionLines.some( ( line ) => line.colours.green >= checkThreshold ),
    } );

    if( zoneIndex >= 0 ) {
        const zone = parseZone( texts[zoneIndex].text );
        column.zoneRings = zone.zoneRings;
        column.zoneKeyword = zone.zoneKeyword;
    }

    const middle = texts.slice( middleStart, firstNumbered >= 0 ? firstNumbered : texts.length );
    let moveRow = 0;
    if( middle.length > 0 && !isMoveRow( middle[0].text ) ) {
        const first = middle[0];
        const colour = acesScanTagColour( first.colours );
        const hasNearest = /nearest/i.test( first.text );
        const moved = first.colours.green >= checkThreshold;
        // A target row shows a list tag, "nearest" or the moved check; otherwise it's the plain G movement row.
        if( colour || hasNearest || moved ) {
            column.targetSelect = colour || ( hasNearest ? "nearest" : "" );
            column.targetMoved = moved;
            moveRow = 1;
        }
    }
    const moveText = middle.slice( moveRow ).map( ( line ) => line.text ).join( " " );
    const moveColours = middle[moveRow] ? middle[moveRow].colours : null;
    if( /standstill/i.test( moveText ) ) {
        column.moveType = "standstill";
    } else {
        const when = /(if (needed|there)[^]*)$/i.exec( moveText );
        if( when ) {
            const lead = moveText.substring( 0, when.index );
            const letter = /\b([SJ])\b/.exec( lead.toUpperCase().replace( /[^A-Z]/g, " " ) );
            let alt: TAcesMoveType = "jump";
            if( letter ) alt = letter[1] === "S" ? "sprint" : "jump";
            else if( moveColours ) alt = moveColours.yellow > moveColours.red ? "sprint" : "jump";
            column.altMoveType = alt;
            column.altMoveWhen = fixWords( when[1] ).replace( /\)\s*\W*$/, "" ).replace( /\s+/g, " " ).trim();
        }
    }

    column.filters = joinNumbered( texts.slice( firstNumbered >= 0 ? firstNumbered : texts.length ).map( ( line ) => line.text ) )
        .map( ( line ) => restoreAcesScanIcons( line ) );
    return column;
}

/**
 * The combat side: zone and numbered target filters from the TARGET column, OV rows from the band below. Each target
 * line may carry the list-tag colour read from its pixels.
 */
export const parseAcesScanCombat = ( targetLines: string[], overheatLines: string[], tags: ( TAcesColor | null )[] = [] ): IAcesCard["combat"] => {
    const lines = targetLines.map( ( text, index ) => ( { text: trimEdges( text ), tag: tags[index] || null } ) ).filter( ( line ) => line.text !== "" );
    const zone = lines.find( ( line ) => isZoneLine( line.text ) );
    // Items as joinNumbered makes them, but the panel holds nothing else, so text before any number is item 1, and a
    // "command list" line is always its own item: its number often goes unread beside the tag.
    const items: { text: string, tag: TAcesColor | null }[] = [];
    for( const line of lines ) {
        if( line === zone ) continue;
        const match = numbered.exec( line.text );
        if( match && +match[1] === items.length + 1 ) items.push( { text: line.text.substring( match[0].length ), tag: line.tag } );
        else if( /\bcommand\s+list\b/i.test( line.text ) || items.length === 0 ) items.push( { text: line.text.replace( /^\W*\d?\W*/, "" ), tag: line.tag } );
        else if( items.length > 0 ) items[items.length - 1].text += " " + line.text;
    }
    const filters = items.map( ( item ) => {
        // "RED command list": the white-on-colour tag word never survives, so the colour comes from the pixels.
        let restored = restoreAcesScanIcons( item.text ).replace( /^(\[\?\]\s*)?(\S{1,3}\s+)?(command\s+)?list$/i, "[?] command list" );
        if( item.tag && /^\[\?\]\s*command list$/i.test( restored ) ) restored = "[" + item.tag + "] command list";
        return parseAcesPriorityLine( restored );
    } );
    // OV rows can wrap; each one starts "If TN".
    const rows: string[] = [];
    for( const line of overheatLines.map( trimEdges ) ) {
        if( /^\W*If\s*TN/i.test( line ) || rows.length === 0 ) rows.push( line.replace( /^\W*/, "" ) );
        else rows[rows.length - 1] += " " + line;
    }
    const overheat = rows.map( ( row ) => parseAcesOverheatLine( fixWords( row ).replace( /\s+/g, " " ) ) )
        .filter( ( row ) => row !== null ) as IAcesCard["combat"]["overheat"];
    return { ...( zone ? parseZone( zone.text ) : { zoneRings: [], zoneKeyword: "" as const } ), filters: filters, overheat: overheat };
}

/**
 * Lines as the card prints them: noise (low confidence, the copyright footer) dropped, and pieces of one printed
 * row that OCR split, such as an item number and its text, joined left to right.
 */
export const tidyAcesScanLines = ( lines: ICardScanLine[] ): ICardScanLine[] => {
    // Card art read as text comes back as one tall line; printed rows are all about the same height.
    const heights = lines.map( ( line ) => line.bbox.y1 - line.bbox.y0 ).sort( ( a, b ) => a - b );
    const rowHeight = heights.length > 0 ? heights[Math.floor( heights.length / 2 )] : 0;
    const kept = lines.filter( ( line ) => line.text.trim() !== ""
        && line.bbox.y1 - line.bbox.y0 <= rowHeight * 2.5
        && !/Topps|Company|Rights Reserved|©\s*20/i.test( line.text ) );
    const rows: ICardScanLine[] = [];
    for( const line of kept.slice().sort( ( a, b ) => a.bbox.y0 - b.bbox.y0 ) ) {
        const row = rows.find( ( entry ) => {
            const overlap = Math.min( entry.bbox.y1, line.bbox.y1 ) - Math.max( entry.bbox.y0, line.bbox.y0 );
            return overlap > 0.5 * Math.min( entry.bbox.y1 - entry.bbox.y0, line.bbox.y1 - line.bbox.y0 );
        } );
        if( !row ) {
            rows.push( { ...line, words: line.words.slice() } );
            continue;
        }
        const pieces = [ row, line ].sort( ( a, b ) => a.bbox.x0 - b.bbox.x0 );
        row.text = pieces.map( ( piece ) => piece.text.trim() ).join( " " );
        row.words = pieces[0].words.concat( pieces[1].words );
        row.bbox = {
            x0: Math.min( row.bbox.x0, line.bbox.x0 ), y0: Math.min( row.bbox.y0, line.bbox.y0 ),
            x1: Math.max( row.bbox.x1, line.bbox.x1 ), y1: Math.max( row.bbox.y1, line.bbox.y1 ),
        };
    }
    return rows;
}

/* ----- the whole scan ----- */

const linesIn = ( lines: ICardScanLine[] ): string => lines.map( ( line ) => line.text ).join( " " );

/** A column's line with the colours of its full column width, so tags left or right of the OCR text count. */
const columnLineRect = ( line: ICardScanLine, column: ICardScanRect ): ICardScanRect => ( {
    left: column.left,
    top: line.bbox.y0,
    width: column.width,
    height: Math.max( 1, line.bbox.y1 - line.bbox.y0 ),
} );

/**
 * Empty rows for the gaps between OCR lines a printed row could fill. A target row such as "⌖ ✔ YELLOW" is all
 * icons and often gives OCR nothing, but its colours still tell the list and the moved check.
 */
const withBlankRows = ( lines: ICardScanLine[], column: ICardScanRect ): ICardScanLine[] => {
    if( lines.length === 0 ) return lines;
    const heights = lines.map( ( line ) => line.bbox.y1 - line.bbox.y0 ).sort( ( a, b ) => a - b );
    const rowHeight = heights[Math.floor( heights.length / 2 )];
    const rv: ICardScanLine[] = [];
    let previous = column.top;
    for( const line of lines ) {
        if( line.bbox.y0 - previous > rowHeight * 1.6 ) {
            const top = previous + ( line.bbox.y0 - previous - rowHeight ) / 2;
            rv.push( { text: "", words: [], bbox: { x0: column.left, y0: top, x1: column.left + column.width, y1: top + rowHeight } } );
        }
        rv.push( line );
        previous = line.bbox.y1;
    }
    return rv;
}

export const scanAcesCard = async ( io: ICardScanIO ): Promise<IAcesScanResult> => {
    const result: IAcesScanResult = {
        side: null, deck: "", deckId: "", cardNumber: "", priority: null, columns: [], combat: null, warnings: [],
    };
    const whole = await io.recognize( { left: 0, top: 0, width: io.width, height: io.height }, "plain" );
    const layout = findAcesCardLayout( whole, io.width, io.height );
    if( !layout ) {
        result.warnings.push( "Couldn't find the Aggressive / Balanced / Cautious headers or TARGET. Take the photo straight on, with one card filling the frame." );
        return result;
    }
    result.side = layout.side;

    // The title sits left in the band and the priority number right.
    const titleRect = clampRect( { ...layout.header, width: layout.header.width * 0.62 }, io.width, io.height );
    const numberRect = clampRect( { ...layout.header, left: layout.header.left + layout.header.width * 0.66, width: layout.header.width * 0.34 }, io.width, io.height );
    const header = parseAcesScanHeader( linesIn( await io.recognize( titleRect, "bright" ) ) );
    // OCR misreads very large digits, and the narrow 1 against 7 in this font; small sizes read best, so a few are
    // tried and the most common three-digit reading wins.
    const votes: { [value: string]: number } = {};
    for( const height of [ 30, 34, 38, 42 ] ) {
        const digits = linesIn( await io.recognize( numberRect, "digits", Math.min( 1, height / ( numberRect.height + cardScanMargin * 2 ) ) ) ).replace( /\D/g, "" );
        if( digits.length === 3 ) votes[digits] = ( votes[digits] || 0 ) + 1;
    }
    const best = Object.keys( votes ).sort( ( a, b ) => votes[b] - votes[a] )[0];
    result.deck = header.deck;
    result.deckId = header.deckId;
    result.priority = best !== undefined ? +best : header.priority;
    result.cardNumber = parseAcesScanFooter( linesIn( await io.recognize( layout.footer, "bright" ) ) );
    result.warnings.push( result.priority === null ? "Priority number not read." : "Check the priority number: OCR can mix up 1 and 7 in the card's font." );
    if( !result.deck ) result.warnings.push( "Deck name not read." );
    if( !result.cardNumber ) result.warnings.push( "Card number (e.g. 2/6) not read." );

    if( layout.side === "movement" ) {
        for( const rect of layout.columns ) {
            const lines = tidyAcesScanLines( await io.recognize( rect, "panel" ) );
            result.columns.push( parseAcesScanColumn( withBlankRows( lines, rect ).map( ( line ) => ( { text: line.text, colours: io.colours( columnLineRect( line, rect ) ) } ) ) ) );
        }
        result.warnings.push( "The black target icons (⌖ in attack range, 👁 in line of sight, ⊘ out of line of sight) aren't read: tick them by hand." );
    } else {
        const targetLines = tidyAcesScanLines( await io.recognize( layout.columns[0], "panel" ) );
        const overheatLines = layout.overheat ? tidyAcesScanLines( await io.recognize( layout.overheat, "dark" ) ) : [];
        // The tag sits at the line's start; the panel's right edge meets the red card art.
        const panel = layout.columns[0];
        const tagBand = { ...panel, left: panel.left + panel.width * 0.08, width: panel.width * 0.6 };
        const tags = targetLines.map( ( line ) => acesScanTagColour( io.colours( columnLineRect( line, tagBand ) ) ) );
        result.combat = parseAcesScanCombat( targetLines.map( ( line ) => line.text ), overheatLines.map( ( line ) => line.text ), tags );
        if( result.combat.overheat.length === 0 ) result.warnings.push( "No OV rows read." );
        // No roll needs less than 2, so a TN under that is a misread digit (often 9 or 6 read as 0).
        if( result.combat.overheat.some( ( row ) => ( row.tnAtMost !== null && row.tnAtMost < 2 ) || ( row.tnAtLeast !== null && row.tnAtLeast < 2 ) ) )
            result.warnings.push( "Check the TN numbers in the OV rows: one didn't read as a real target number." );
    }
    const unknown = JSON.stringify( result ).split( "[?]" ).length - 1;
    if( unknown > 0 ) result.warnings.push( unknown + " icon" + ( unknown > 1 ? "s" : "" ) + " couldn't be placed and show as [?]." );
    return result;
}

/** Puts a scan onto a card draft: a movement side fills the three columns, a combat side the combat block. */
export const applyAcesScanToCard = ( card: IAcesCard | null, scan: IAcesScanResult ): IAcesCard => {
    const rv: IAcesCard = card ? JSON.parse( JSON.stringify( card ) ) : newAcesCard();
    if( scan.deck && !rv.deck ) {
        rv.deck = scan.deck;
        rv.deckId = scan.deckId;
    }
    if( scan.cardNumber && !rv.cardNumber ) rv.cardNumber = scan.cardNumber;
    if( scan.side === "movement" && scan.columns.length === 3 ) {
        rv.aggressive = scan.columns[0];
        rv.balanced = scan.columns[1];
        rv.cautious = scan.columns[2];
        rv.movePriority = scan.priority;
    }
    if( scan.side === "combat" && scan.combat ) {
        rv.combat = scan.combat;
        rv.combatPriority = scan.priority;
    }
    return rv;
}
