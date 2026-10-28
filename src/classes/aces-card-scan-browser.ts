/*
 * Reading a photo of an Aces card in the browser: the photo goes on a canvas, regions are cropped and cleaned there,
 * and tesseract.js reads them. Nothing leaves the device but the one-time download of tesseract's English data.
 */
import { acesScanBinarize, acesScanColoursFromPixels, acesScanMargin, IAcesScanIO, IAcesScanLine, IAcesScanRect, IAcesScanResult, scanAcesCard, TAcesScanMode } from "./aces-card-scan";

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

/** Reads one card photo. The result is a draft for the player to check against the card. */
export const scanAcesCardPhoto = async ( file: Blob ): Promise<IAcesScanResult> => {
    const photo = await loadPhoto( file );
    const photoContext = photo.getContext( "2d", { willReadFrequently: true } )!;
    const pixels = ( rect: IAcesScanRect ) => photoContext.getImageData( rect.left, rect.top, rect.width, rect.height ).data;

    // Loaded on demand: tesseract is large and only this page uses it.
    const { createWorker, PSM } = await import( "tesseract.js" );
    const worker = await createWorker( "eng" );
    const io: IAcesScanIO = {
        width: photo.width,
        height: photo.height,
        recognize: async ( rect: IAcesScanRect, mode: TAcesScanMode, scale = 1 ): Promise<IAcesScanLine[]> => {
            const canvas = document.createElement( "canvas" );
            let offset = 0;
            if( mode === "plain" ) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                canvas.getContext( "2d" )!.drawImage( photo, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height );
            } else {
                const clean = acesScanBinarize( pixels( rect ), rect.width, rect.height, mode === "digits" ? "bright" : mode );
                const full = document.createElement( "canvas" );
                full.width = clean.width;
                full.height = clean.height;
                full.getContext( "2d" )!.putImageData( new ImageData( clean.data, clean.width, clean.height ), 0, 0 );
                canvas.width = Math.max( 1, Math.round( clean.width * scale ) );
                canvas.height = Math.max( 1, Math.round( clean.height * scale ) );
                canvas.getContext( "2d" )!.drawImage( full, 0, 0, canvas.width, canvas.height );
                offset = acesScanMargin;
            }
            if( mode === "digits" ) await worker.setParameters( { tessedit_char_whitelist: "0123456789", tessedit_pageseg_mode: PSM.SINGLE_LINE } );
            const { data } = await worker.recognize( canvas, {}, { blocks: true } );
            if( mode === "digits" ) await worker.setParameters( { tessedit_char_whitelist: "", tessedit_pageseg_mode: PSM.AUTO } );
            // Boxes back to whole-photo pixels.
            const shift = ( box: { x0: number, y0: number, x1: number, y1: number } ) => ( {
                x0: box.x0 / scale - offset + rect.left, y0: box.y0 / scale - offset + rect.top,
                x1: box.x1 / scale - offset + rect.left, y1: box.y1 / scale - offset + rect.top,
            } );
            const rv: IAcesScanLine[] = [];
            for( const block of data.blocks || [] ) for( const paragraph of block.paragraphs ) for( const line of paragraph.lines ) {
                rv.push( { text: line.text.trim(), bbox: shift( line.bbox ), words: line.words.map( ( word ) => ( { text: word.text, bbox: shift( word.bbox ) } ) ) } );
            }
            return rv;
        },
        colours: ( rect: IAcesScanRect ) => acesScanColoursFromPixels( pixels( rect ) ),
    };
    try {
        return await scanAcesCard( io );
    } finally {
        await worker.terminate();
    }
}
