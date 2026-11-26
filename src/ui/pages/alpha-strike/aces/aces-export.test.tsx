// @vitest-environment happy-dom
// These tests write localStorage directly. They sit apart from dataSaves.test.ts: happy-dom binds a Storage method to
// the instance the first time it is read, and from then on that file's Storage.prototype spies no longer reach it.
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { newAcesCardLibrary, newAcesEdgeCard } from "../../../../data/aces-cards";
import { ACES_EXPORT_FILE_NAME, checkFullRestoreData, getAcesExport, restoreFullBackup } from "../../../../dataSaves";
import { IAppGlobals } from "../../../app-router";
import { AppSettings } from "../../../classes/app_settings";
import AcesCampaignPage from "./campaign";
import AcesGamePage from "./game";
import AcesHome from "./home";
import AcesLibraryPage from "./library";
import AcesRulesPage from "./rules";

const appGlobals = {
    appSettings: new AppSettings( null ),
    makeDocumentTitle: vi.fn(),
    openConfirmDialog: vi.fn(),
    showMobile: false,
    siteAlerts: { activeAlerts: [], addAlert: vi.fn() },
} as unknown as IAppGlobals;

const createObjectURL = URL.createObjectURL;
const revokeObjectURL = URL.revokeObjectURL;

beforeEach( () => window.localStorage.clear() );
afterEach( () => {
    cleanup();
    vi.restoreAllMocks();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    window.localStorage.clear();
    window.sessionStorage.clear();
} );

const store = ( entries: Record<string, string> ) => {
    for( const [ key, value ] of Object.entries( entries ) ) window.localStorage.setItem( key, value );
};

describe( "The Aces export file (AcesExport.json)", () => {
    it( "is one full backup that Backup and Restore reads back, the cards included", async () => {
        const library = newAcesCardLibrary();
        library.edgeCards.push( { ...newAcesEdgeCard(), name: "Kite Day" } );
        store( {
            acesGame: JSON.stringify( { name: "Teapot sortie", turn: 3 } ),
            acesCampaigns: JSON.stringify( [ { name: "Kite campaign" } ] ),
            acesCardLibrary: JSON.stringify( library ),
        } );
        const exported = JSON.parse( await getAcesExport( new AppSettings( null ), new Date( "2026-11-26T12:00:00Z" ) ) );
        expect( checkFullRestoreData( exported ) ).toBe( true );
        expect( exported.acesGame ).toEqual( { name: "Teapot sortie", turn: 3 } );
        expect( exported.acesCampaigns ).toEqual( [ { name: "Kite campaign" } ] );
        expect( exported.acesCardLibrary.edgeCards.map( ( card: { name: string } ) => card.name ) ).toContain( "Kite Day" );
        expect( exported.exportedAt ).toBe( "2026-11-26T12:00:00.000Z" );

        // What Backup and Restore lists before it restores: the card comes back, and nothing in the file is an error.
        const restoreGlobals = {
            appSettings: new AppSettings( null ),
            favoriteASGroups: [], favoriteCBTGroups: [], battleMechSaves: [], vehicleSaves: [], microMechSaves: [],
        } as unknown as IAppGlobals;
        const preview = restoreFullBackup( exported, restoreGlobals );
        expect( preview.filter( ( msg ) => msg.severity === "error" ) ).toEqual( [] );
        expect( preview.map( ( msg ) => msg.message ) ).toContain( "Add or replace 1 Aces card library entry" );
    } );

    it( "carries every entry this browser stores for the app, word for word, past what a backup knows", async () => {
        const entries = { acesGame: "{\"turn\":2}", someOtherSave: "plain text, not JSON", appSettings: "{\"uiTheme\":\"dark\"}" };
        store( entries );
        const exported = JSON.parse( await getAcesExport( new AppSettings( null ) ) );
        expect( exported.localStorage ).toEqual( entries );
    } );

    it( "leaves out sessionStorage, where the GitHub tokens are kept", async () => {
        store( { acesGame: "{}" } );
        window.sessionStorage.setItem( "customMULGithubToken", "ghp_secret" );
        const text = await getAcesExport( new AppSettings( null ) );
        expect( text ).not.toContain( "ghp_secret" );
        expect( JSON.parse( text ).localStorage ).toEqual( { acesGame: "{}" } );
    } );

    it( "is named AcesExport.json", () => {
        expect( ACES_EXPORT_FILE_NAME ).toBe( "AcesExport.json" );
    } );
} );

/** The export is the first thing on the page, as a large button. */
const exportButtonFirst = ( container: HTMLElement ): HTMLButtonElement => {
    const first = container.querySelector( ".aces-page" )?.firstElementChild;
    const button = first?.querySelector( "button" );
    expect( button?.textContent ).toContain( "Export everything" );
    expect( button?.className ).toContain( "btn-lg" );
    return button as HTMLButtonElement;
};

describe( "The Aces export button", () => {
    it( "comes first on the Aces home page and downloads everything, the cards included, as AcesExport.json", async () => {
        const library = "{\"version\":1,\"cards\":[],\"commandCards\":[],\"specialOrders\":[],\"edgeCards\":[],\"scenarios\":[]}";
        store( { acesCardLibrary: library, anyOtherSave: "kept as is" } );
        const blobs: Blob[] = [];
        URL.createObjectURL = vi.fn( ( blob: Blob ) => {
            blobs.push( blob );
            return "blob:aces-export";
        } ) as unknown as typeof URL.createObjectURL;
        URL.revokeObjectURL = vi.fn();
        const downloads: string[] = [];
        vi.spyOn( HTMLAnchorElement.prototype, "click" ).mockImplementation( function ( this: HTMLAnchorElement ) {
            downloads.push( this.download );
        } );

        const { container } = render( <MemoryRouter><AcesHome appGlobals={appGlobals} /></MemoryRouter> );
        fireEvent.click( exportButtonFirst( container ) );

        await waitFor( () => expect( downloads ).toEqual( [ "AcesExport.json" ] ) );
        expect( blobs[0].type ).toBe( "application/json" );
        const exported = JSON.parse( await blobs[0].text() );
        expect( checkFullRestoreData( exported ) ).toBe( true );
        expect( exported.localStorage.anyOtherSave ).toBe( "kept as is" );
        expect( exported.localStorage.acesCardLibrary ).toBe( library );
    } );

    it.each( [
        [ "Game Tracker", AcesGamePage ],
        [ "Campaigns", AcesCampaignPage ],
        [ "Card Library", AcesLibraryPage ],
        [ "Rules Reference", AcesRulesPage ],
    ] )( "comes first on the %s page too", async ( _name, Page ) => {
        const { container } = render( <MemoryRouter><Page appGlobals={appGlobals} /></MemoryRouter> );
        await waitFor( () => exportButtonFirst( container ) );
    } );
} );
