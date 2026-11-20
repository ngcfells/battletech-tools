// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Campaign } from "../../../../classes/campaign/campaign";
import { ICampaignExport } from "../../../../classes/campaign/campaign-types";
import { IAppGlobals } from "../../../app-router";
import { AppSettings } from "../../../classes/app_settings";
import { saveCampaigns } from "../../../../dataSaves";
import { campaignDice } from "./campaign-store";
import CampaignsRouter from "./_router";

const store: { campaigns: ICampaignExport[] } = { campaigns: [] };

vi.mock( "../../../../dataSaves", async ( original ) => ( {
    ...( await original<typeof import( "../../../../dataSaves" )>() ),
    getCampaigns: vi.fn( async () => store.campaigns ),
    saveCampaigns: vi.fn( ( _settings: unknown, value: ICampaignExport[] ) => { store.campaigns = value; } ),
    getCurrentCBTForce: vi.fn( async () => null ),
    getCurrentASForce: vi.fn( async () => null ),
} ) );

vi.mock( "../../../../data/star-systems/star-systems", async ( original ) => ( {
    ...( await original<typeof import( "../../../../data/star-systems/star-systems" )>() ),
    loadStarSystemSites: vi.fn( async () => ( {
        sites: [ { id: "Tharkad-tharhes", systemId: "Tharkad", planet: "Tharkad", name: "Tharhes Industries", products: ["BattleMechs"], heavy: true, date: "3067-01-01", source: "Objectives: Lyran Alliance p.10" } ],
        garrisons: [ { systemId: "Tharkad", date: "3054-01-01", faction: "LA", units: ["Royal Guard"], source: "Objective Raids p.40" } ],
    } ) ),
} ) );

afterEach( cleanup );

const appGlobals = {
    appSettings: new AppSettings( null ),
    makeDocumentTitle: vi.fn(),
    openConfirmDialog: vi.fn( ( _t: string, _m: string, _y: string, _n: string, yes: () => void ) => yes() ),
    showMobile: false,
    siteAlerts: { activeAlerts: [], addAlert: vi.fn() },
} as unknown as IAppGlobals;

const open = ( path: string ) => render(
    <MemoryRouter initialEntries={[ "/game-management/campaigns" + path ]}>
        <Routes>
            <Route path="/game-management/campaigns/*" element={<CampaignsRouter appGlobals={appGlobals} />} />
        </Routes>
    </MemoryRouter>,
);

/** A saved campaign on Tharkad in 3055, with the Economics rulesets ticked as asked. */
const saved = ( rulesetIds: string[] = ["fw-economics", "fw-economic-damage"], systemId = "Tharkad" ): Campaign => {
    const c = new Campaign();
    c.id = "c1";
    c.name = "Tharkad Defence";
    c.startDate = "3055-01-01";
    c.rulesetIds = rulesetIds;
    const held = c.addSide( "Lyrans", "defender" );
    c.addSide( "Raiders", "attacker" );
    c.planet = {
        systemId, name: "Tharkad", customDotTypes: [], customCombinations: [],
        areas: [ { id: "a1", name: "Bremen", terrain: "tundra", controllerSideId: held.id, comboOverride: null,
            dots: ["mining", "refining", "heavy-manufacturing", "oil", "processing"].map( ( type, i ) => ( { id: "d" + i, type, destroyed: false } ) ) } ],
    };
    store.campaigns = [ c.export() ];
    return c;
};

describe( "Campaign screens", () => {
    beforeEach( () => {
        store.campaigns = [];
        vi.mocked( saveCampaigns ).mockClear();
        vi.restoreAllMocks();
    } );

    it( "picks the campaign planet from a real system", async () => {
        open( "" );
        fireEvent.click( await screen.findByRole( "button", { name: "New campaign" } ) );
        fireEvent.change( screen.getByLabelText( "Star system" ), { target: { value: "Thark" } } );
        fireEvent.click( await screen.findByRole( "button", { name: "Tharkad" }, { timeout: 10000 } ) );
        const planet = await screen.findByLabelText( "Planet" ) as HTMLSelectElement;
        await waitFor( () => expect( Array.from( planet.options ).map( ( o ) => o.textContent ) ).toContain( "Tharkad" ) );
    } );

    it( "creates a campaign with a side and saves it", async () => {
        open( "" );
        fireEvent.click( await screen.findByRole( "button", { name: "New campaign" } ) );
        fireEvent.change( screen.getByLabelText( "Campaign name" ), { target: { value: "Operation Test" } } );
        fireEvent.change( screen.getByLabelText( "Planet name" ), { target: { value: "Freeworld" } } );
        fireEvent.change( screen.getByLabelText( "Side name" ), { target: { value: "Our Lance" } } );
        fireEvent.click( screen.getByRole( "button", { name: "Add side" } ) );
        fireEvent.click( screen.getByRole( "button", { name: "Create campaign" } ) );
        await waitFor( () => expect( store.campaigns.map( ( c ) => c.name ) ).toEqual( ["Operation Test"] ) );
        expect( store.campaigns[0].sides.map( ( s ) => s.name ) ).toEqual( ["Our Lance"] );
        expect( store.campaigns[0].planet?.name ).toBe( "Freeworld" );
    } );

    it( "advancing three months shows a payday in the controller's ledger", async () => {
        saved();
        open( "/c1" );
        const advance = await screen.findByRole( "button", { name: "Advance a month" } );
        fireEvent.click( advance ); fireEvent.click( advance ); fireEvent.click( advance );
        const ledger = await screen.findByTestId( "campaign-ledger-Lyrans" );
        await waitFor( () => expect( ledger.textContent ).toContain( "14,000,000" ) );
        expect( screen.getByTestId( "campaign-step" ).textContent ).toContain( "3" );
    } );

    it( "a target shows distance and jumps", async () => {
        saved( ["fw-economics"], "Terra" );
        open( "/c1" );
        const targets = await screen.findByTestId( "campaign-targets" );
        fireEvent.change( within( targets ).getByLabelText( "Target system" ), { target: { value: "Tharkad" } } );
        fireEvent.click( await within( targets ).findByRole( "button", { name: "Tharkad" }, { timeout: 10000 } ) );
        fireEvent.change( within( targets ).getByLabelText( "Intent" ), { target: { value: "assault" } } );
        fireEvent.click( within( targets ).getByRole( "button", { name: "Add target" } ) );
        const row = await within( targets ).findByTestId( "target-row-Tharkad" );
        expect( row.textContent ).toContain( "261.5" );
        expect( row.textContent ).toMatch( /\d+ jumps?/ );
        expect( row.textContent ).toContain( "assault" );
    } );

    it( "lists a system's garrisons for the campaign's date", async () => {
        saved();
        open( "/c1" );
        expect( await screen.findByText( /Royal Guard/ ) ).toBeTruthy();
        expect( screen.getByText( /Objective Raids p\.40/ ) ).toBeTruthy();
        expect( screen.getByText( /MegaMek Data/ ) ).toBeTruthy();
    } );

    it( "the Systems section names no 'our' books", async () => {
        saved( ["fw-economics"], "Terra" );
        open( "/c1" );
        const credit = await screen.findByText( /MegaMek Data/ );
        expect( credit.closest( "section, .text-section, div" )!.parentElement!.textContent ).not.toMatch( /\bour\b/i );
        expect( screen.getAllByText( /None in the books checked so far/ ).length ).toBeGreaterThan( 0 );
    } );

    it( "payday preview shows the grouping that pays most", async () => {
        saved();
        open( "/c1/planet" );
        const area = await screen.findByTestId( "area-a1" );
        expect( area.textContent ).toContain( "14,000,000" );
        expect( area.textContent ).toContain( "Oil, refining and processing" );
        // A GM grouping keeps only that combination; the rest are paid loose, so the option says "Only".
        const options = within( within( area ).getByLabelText( /Grouping/ ) ).getAllByRole( "option" ).map( ( o ) => o.textContent || "" );
        expect( options.slice( 1 ).every( ( t ) => t.startsWith( "Only " ) ) ).toBe( true );
    } );

    it( "the damage roller marks destroyed dots and logs them", async () => {
        saved();
        vi.spyOn( campaignDice, "roll2d6" ).mockReturnValue( 12 );
        open( "/c1/planet" );
        const area = await screen.findByTestId( "area-a1" );
        fireEvent.change( within( area ).getByLabelText( "Fight size" ), { target: { value: "company" } } );
        fireEvent.click( within( area ).getByRole( "button", { name: "Roll damage" } ) );
        await waitFor( () => expect( store.campaigns[0].planet!.areas[0].dots.every( ( d ) => d.destroyed ) ).toBe( true ) );
        expect( store.campaigns[0].log.some( ( l ) => l.text.includes( "Bremen" ) && l.text.includes( "destroyed" ) ) ).toBe( true );
    } );

    it( "the planet page is hidden without Economics", async () => {
        saved( [] );
        open( "/c1" );
        await screen.findByRole( "button", { name: "Advance a month" } );
        expect( screen.queryByRole( "link", { name: "Planet economy" } ) ).toBeNull();
        cleanup();
        open( "/c1/planet" );
        expect( await screen.findByText( /Tick Future Wars: Economics/ ) ).toBeTruthy();
    } );

    it( "the Game Management section menu lists Campaigns", async () => {
        open( "" );
        const menu = await screen.findByRole( "navigation", { name: "Section menu" } );
        const link = within( menu ).getByRole( "link", { name: "Campaigns" } );
        expect( link.getAttribute( "href" ) ).toMatch( /\/game-management\/campaigns$/ );
        expect( link.className ).toContain( "current" );
    } );

    it( "the planet page links back to its own campaign", async () => {
        saved();
        open( "/c1/planet" );
        const back = await screen.findByRole( "link", { name: "Back to Tharkad Defence" } );
        expect( back.getAttribute( "href" ) ).toBe( "/game-management/campaigns/c1" );
        cleanup();
        open( "/nope/planet" );
        const list = await screen.findByRole( "link", { name: "Back to campaigns" } );
        expect( list.getAttribute( "href" ) ).toBe( "/game-management/campaigns" );
    } );

    it( "shows NOT OFFICIAL and NGCFells's merge note", async () => {
        saved();
        open( "/c1/planet" );
        await screen.findByTestId( "area-a1" );
        expect( screen.getAllByText( /NOT OFFICIAL/ ).length ).toBeGreaterThan( 0 );
        expect( screen.getByText( /Both printings merged into one ruleset by NGCFells's decision\./ ) ).toBeTruthy();
        expect( screen.getByText( /Inspired by Herb Barents, Future Wars #5/ ) ).toBeTruthy();
    } );

    it( "a new campaign can take the Mercenary's Handbook (1987) edition", async () => {
        open( "" );
        fireEvent.click( await screen.findByRole( "button", { name: "New campaign" } ) );
        fireEvent.change( screen.getByLabelText( "Edition" ), { target: { value: "mh-1987" } } );
        fireEvent.change( screen.getByLabelText( "Side name" ), { target: { value: "Our Battalion" } } );
        fireEvent.click( screen.getByRole( "button", { name: "Add side" } ) );
        fireEvent.click( screen.getByRole( "button", { name: "Create campaign" } ) );
        await waitFor( () => expect( store.campaigns.map( ( c ) => c.editionId ) ).toEqual( ["mh-1987"] ) );
    } );

    it( "the 1987 panel previews the month and books it on advance", async () => {
        const c = saved( [] );
        c.editionId = "mh-1987";
        store.campaigns = [ c.export() ];
        open( "/c1" );
        const panel = await screen.findByTestId( "edition-mh1987" );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Add squads" } ) );
        const line = await within( panel ).findByTestId( "mh1987-line-0" );
        fireEvent.change( within( line ).getByLabelText( "Type" ), { target: { value: "heavy-mech" } } );
        fireEvent.change( within( line ).getByLabelText( "Count" ), { target: { value: "4" } } );
        // 4 Regular heavy 'Mechs: salaries 2,400, supplies 2,000, overhead 15% 660, maintenance 140 SP x 5,000.
        await waitFor( () => expect( within( panel ).getByTestId( "mh1987-costs" ).textContent ).toContain( "705,060" ) );
        fireEvent.click( screen.getByRole( "button", { name: "Advance a month" } ) );
        await waitFor( () => expect( screen.getByTestId( "campaign-ledger-Lyrans" ).textContent ).toContain( "Salaries" ) );
    } );

    it( "the 1987 panel negotiates, signs and resolves a month", async () => {
        const c = saved( [] );
        c.editionId = "mh-1987";
        c.editionState = { roster: [ { id: "l1", type: "heavy-mech", quality: "regular", condition: "new", count: 12, company: "Company 1" } ] };
        store.campaigns = [ c.export() ];
        vi.spyOn( campaignDice, "roll2d6" ).mockReturnValue( 7 );
        vi.spyOn( campaignDice, "roll1d6" ).mockReturnValue( 3 );
        open( "/c1" );
        const panel = await screen.findByTestId( "edition-mh1987" );
        fireEvent.change( within( panel ).getByLabelText( "Mission" ), { target: { value: "garrison" } } );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Roll employer positions" } ) );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Negotiate" } ) );
        fireEvent.click( await within( panel ).findByRole( "button", { name: "Sign contract" } ) );
        await waitFor( () => expect( store.campaigns[0].log.some( ( l ) => l.text.startsWith( "Contract signed: Garrison Duty" ) ) ).toBe( true ) );
        fireEvent.click( await within( panel ).findByRole( "button", { name: "Resolve month" } ) );
        // Garrison: resistance 7 reads N; the N row at 7 reads I (uncompleted).
        await waitFor( () => expect( store.campaigns[0].log.some( ( l ) => l.text.includes( "outcome I" ) ) ).toBe( true ) );
        // A month resolves once: a second click books nothing more.
        fireEvent.click( within( panel ).getByRole( "button", { name: "Resolve month" } ) );
        await new Promise( ( r ) => setTimeout( r, 50 ) );
        expect( store.campaigns[0].log.filter( ( l ) => l.text.includes( "outcome I" ) ) ).toHaveLength( 1 );
    } );

    it( "each Mercenary's Handbook panel lists NGCFells's readings of the book", async () => {
        const c = saved( [] );
        c.editionId = "mh-1987";
        store.campaigns = [ c.export() ];
        open( "/c1" );
        const old = ( await screen.findByTestId( "mh1987-readings" ) ).textContent || "";
        expect( old ).toContain( "NGCFells" );
        expect( old ).toContain( "Inspired by" );
        expect( old ).toContain( "a squad a week" );
        expect( old ).toContain( "5 SP" );
        cleanup();
        c.editionId = "mh-3055";
        store.campaigns = [ c.export() ];
        open( "/c1" );
        const text = ( await screen.findByTestId( "mh3055-readings" ) ).textContent || "";
        expect( text ).toContain( "NGCFells" );
        expect( text ).toContain( "Inspired by" );
        expect( text ).toContain( "two paydays" );
        expect( text ).toContain( "7%" );
        expect( text ).toContain( "first draw" );
        expect( text ).toContain( "Upkeep draw" );
    } );

    it( "the GM adds a ledger entry by hand and removes it again", async () => {
        saved();
        open( "/c1" );
        const ledger = await screen.findByTestId( "campaign-ledger-Lyrans" );
        fireEvent.change( within( ledger ).getByLabelText( "Reason" ), { target: { value: "Repair bill" } } );
        fireEvent.change( within( ledger ).getByLabelText( "Amount" ), { target: { value: "-25000" } } );
        fireEvent.click( within( ledger ).getByRole( "button", { name: "Add entry" } ) );
        await waitFor( () => expect( store.campaigns[0].ledger.map( ( e ) => [e.reason, e.amount] ) ).toEqual( [["Repair bill", -25000]] ) );
        fireEvent.click( await within( ledger ).findByRole( "button", { name: "Remove Repair bill" } ) );
        await waitFor( () => expect( store.campaigns[0].ledger ).toEqual( [] ) );
    } );

    it( "the 3055 panel previews payroll and maintenance and books paydays on advance", async () => {
        const c = saved( [] );
        c.editionId = "mh-3055";
        store.campaigns = [ c.export() ];
        open( "/c1" );
        const panel = await screen.findByTestId( "edition-mh3055" );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Add combatants" } ) );
        const unit = await within( panel ).findByTestId( "mh3055-unit-0" );
        fireEvent.change( within( unit ).getByLabelText( "Template" ), { target: { value: "heavy-mech" } } );
        fireEvent.change( within( unit ).getByLabelText( "Count" ), { target: { value: "4" } } );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Add personnel" } ) );
        const person = await within( panel ).findByTestId( "mh3055-person-0" );
        fireEvent.change( within( person ).getByLabelText( "Count" ), { target: { value: "4" } } );
        // 4 Regular MechWarriors: 500 x 1.5 x 4 = 3,000 a payday; 4 heavy 'Mechs need 375 SP a week each.
        await waitFor( () => expect( within( panel ).getByTestId( "mh3055-costs" ).textContent ).toContain( "3,000" ) );
        expect( within( panel ).getByTestId( "mh3055-costs" ).textContent ).toContain( "1,500 SP" );
        // Regular experience alone is 10 points: Dragoons Rating D.
        expect( within( panel ).getByTestId( "mh3055-rating" ).textContent ).toContain( "D" );
        fireEvent.click( screen.getByRole( "button", { name: "Advance a month" } ) );
        await waitFor( () => expect( screen.getByTestId( "campaign-ledger-Lyrans" ).textContent ).toContain( "Payday 2 of 2" ) );
    } );

    it( "the 3055 panel rolls an employer and job and signs the contract", async () => {
        const c = saved( [] );
        c.editionId = "mh-3055";
        c.editionState = { personnel: [ { id: "p1", position: "mechwarrior", quality: "regular", count: 4, antiMech: false } ] };
        store.campaigns = [ c.export() ];
        vi.spyOn( campaignDice, "roll2d6" ).mockReturnValue( 7 );
        open( "/c1" );
        const panel = await screen.findByTestId( "edition-mh3055" );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Roll employer" } ) );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Roll job" } ) );
        // Employer 7 = Federated Commonwealth; its Job Table at 7 = Objective Raid against the Clans (2 months).
        // 3,000 x 2 paydays x 2.1 (D) x 1.3 (FedCom) x 1.6 (raid) x 2 (Clans) = 52,416 a month.
        await waitFor( () => expect( within( panel ).getByTestId( "mh3055-pay" ).textContent ).toContain( "104,832" ) );
        fireEvent.click( within( panel ).getByRole( "button", { name: "Sign contract" } ) );
        await waitFor( () => expect( store.campaigns[0].log.some( ( l ) =>
            l.text === "Contract signed: Objective Raid for Federated Commonwealth against the Clans, 2 months, 104,832 C-bills" ) ).toBe( true ) );
        expect( screen.getByTestId( "campaign-ledger-Lyrans" ).textContent ).toContain( "Contract advance (25%)" );
    } );

    it( "seeds dots from Objectives sites", async () => {
        saved();
        open( "/c1/planet" );
        fireEvent.click( await screen.findByRole( "button", { name: "Seed dots from Objectives" } ) );
        await waitFor( () => expect( store.campaigns[0].planet!.areas.map( ( a ) => a.name ) ).toContain( "Tharhes Industries" ) );
        const seeded = store.campaigns[0].planet!.areas.find( ( a ) => a.name === "Tharhes Industries" )!;
        expect( seeded.dots.map( ( d ) => d.type ) ).toEqual( ["heavy-manufacturing"] );
        expect( seeded.siteId ).toBe( "Tharkad-tharhes" );
    } );
} );
