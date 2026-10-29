/*
 * Reading a photo of a printed card in the browser: the photo goes on a canvas, regions are cropped and cleaned
 * there, and tesseract.js reads them. Nothing leaves the device but the one-time download of tesseract's English data.
 */
import { cardScanBinarize, cardScanColoursFromPixels, cardScanMargin, ICardScanIO, ICardScanLine, ICardScanRect, TCardScanMode } from "./card-scan-io";

/** The scan's layout rules were tuned on cards about this wide, so every photo is scaled to it. */
const cardWidth = 2000;

const loadPhoto = async ( file: Blob ): Promise<HTMLCanvasElement> => {
    const url = URL.createObjectURL( file );
    try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement( "canvas" );
        canvas.width = cardWidth;
        canvas.height = Math.round( image.naturalHeight * cardWidth / image.naturalWidth );
        canvas.getContext( "2d" )!.drawImage( image, 0, 0, canvas.width, canvas.height );
        return canvas;
    } finally {
        URL.revokeObjectURL( url );
    }
}

/** Reads one card photo with a card type's scan. The result is a draft for the player to check against the card. */
export const scanCardPhoto = async <T,>( file: Blob, scan: ( io: ICardScanIO ) => Promise<T> ): Promise<T> => {
    const photo = await loadPhoto( file );
    const photoContext = photo.getContext( "2d", { willReadFrequently: true } )!;
    const pixels = ( rect: ICardScanRect ) => photoContext.getImageData( rect.left, rect.top, rect.width, rect.height ).data;

    // Loaded on demand: tesseract is large and only the card readers use it.
    const { createWorker, PSM } = await import( "tesseract.js" );
    const worker = await createWorker( "eng" );
    const io: ICardScanIO = {
        width: photo.width,
        height: photo.height,
        recognize: async ( rect: ICardScanRect, mode: TCardScanMode, scale = 1, singleLine = false, charset = "" ): Promise<ICardScanLine[]> => {
            const canvas = document.createElement( "canvas" );
            let offset = 0;
            if( mode === "plain" ) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                canvas.getContext( "2d" )!.drawImage( photo, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height );
            } else {
                const clean = cardScanBinarize( pixels( rect ), rect.width, rect.height, mode );
                const full = document.createElement( "canvas" );
                full.width = clean.width;
                full.height = clean.height;
                full.getContext( "2d" )!.putImageData( new ImageData( clean.data, clean.width, clean.height ), 0, 0 );
                canvas.width = Math.max( 1, Math.round( clean.width * scale ) );
                canvas.height = Math.max( 1, Math.round( clean.height * scale ) );
                canvas.getContext( "2d" )!.drawImage( full, 0, 0, canvas.width, canvas.height );
                offset = cardScanMargin;
            }
            const digits = mode === "digits" || mode === "dim-digits";
            const special = digits || singleLine || !!charset;
            if( special ) await worker.setParameters( { tessedit_char_whitelist: digits ? "0123456789" : charset, tessedit_pageseg_mode: digits || singleLine ? PSM.SINGLE_LINE : PSM.AUTO } );
            const { data } = await worker.recognize( canvas, {}, { blocks: true } );
            if( special ) await worker.setParameters( { tessedit_char_whitelist: "", tessedit_pageseg_mode: PSM.AUTO } );
            // Boxes back to whole-photo pixels.
            const shift = ( box: { x0: number, y0: number, x1: number, y1: number } ) => ( {
                x0: box.x0 / scale - offset + rect.left, y0: box.y0 / scale - offset + rect.top,
                x1: box.x1 / scale - offset + rect.left, y1: box.y1 / scale - offset + rect.top,
            } );
            const rv: ICardScanLine[] = [];
            for( const block of data.blocks || [] ) for( const paragraph of block.paragraphs ) for( const line of paragraph.lines ) {
                rv.push( { text: line.text.trim(), bbox: shift( line.bbox ), words: line.words.map( ( word ) => ( { text: word.text, bbox: shift( word.bbox ) } ) ) } );
            }
            return rv;
        },
        colours: ( rect: ICardScanRect ) => cardScanColoursFromPixels( pixels( rect ) ),
        pixels: pixels,
    };
    try {
        return await scan( io );
    } finally {
        await worker.terminate();
    }
}
