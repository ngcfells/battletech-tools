import * as React from 'react';
import { FaBook, FaEye, FaPlusCircle } from 'react-icons/fa';
import { Link } from "react-router";
import { getMULDisplayName, IASMULUnit } from '../../../../classes/alpha-strike-unit';
import { BattleMech } from '../../../../classes/battlemech';
import { BattleMechGroup } from '../../../../classes/battlemech-group';
import { searchBundledMUL } from '../../../../utils';
import AerospaceFighter from '../../../../classes/aerospace-fighter';
import BattleArmor from '../../../../classes/battle-armor';
import InfantryPlatoon from '../../../../classes/infantry-platoon';
import ProtoMech from '../../../../classes/protomech';
import SmallCraft from '../../../../classes/small-craft';
import CapitalShip from '../../../../classes/capital-ship';
import Vehicle from '../../../../classes/vehicle';
import { ARTVEE_SAMPLES } from '../../../../data/artvee-samples';
import { VTOLAM_SAMPLES } from '../../../../data/vtolam-samples';
import { getBundledMechEntries, IBundledMechRef, loadBundledMechDesign, loadBundledMechIndex } from '../../../../data/bundled-mechs';
import { BundledUnitType, IBundledUnitRef, loadBundledIndex, loadBundledUnitDesign } from '../../../../data/bundled-units';
import type { IBundledDesignHeader } from '../../../../utils/bundled-designs';
import BattleArmorRecordSheet from '../../../components/battle-armor-record-sheet';
import FighterRecordSheet from '../../../components/fighter-record-sheet';
import InfantryRecordSheet from '../../../components/infantry-record-sheet';
import ProtoMechRecordSheet from '../../../components/protomech-record-sheet';
import SmallCraftRecordSheet from '../../../components/small-craft-record-sheet';
import CapitalShipRecordSheet from '../../../components/capital-ship-record-sheet';
import VehicleRecordSheet from '../../../components/vehicle-record-sheet';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';
import { getUnitRulesets } from '../../../../classes/unit-game-settings';
import { getBattleMechTroAdapter } from '../../../../classes/battlemech-tro';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import type { TechnicalReadout } from '../../../../classes/technical-readout';
import type { ITroUnitAdapter } from '../../../../data/technical-readout-interfaces';
import { getMULAerospaceClass, MULAerospaceClass, buildClassicDesignIndex, ClassicDesignIndex, findClassicDesign, getClassicMechEntries, getClassicUnitEntries, isMULCapitalShip, isMULLargeAerospaceCraft } from '../../../../utils/classicMULMatch';
import { IMULSearchFilters } from '../../../../utils/mulSearchFilters';
import { getMULEraLabel, getMULTypeLabel } from '../../../../utils/mulUtilities';
import { paginate } from '../../../../utils/paginate';
import { IAppGlobals } from '../../../app-router';
import BundledMechList from '../../../components/bundled-mech-list';
import MULSearchFilters from '../../../components/mul-search-filters';
import SearchResultsPager from '../../../components/search-results-pager';
import MechViewPanel from '../../../components/mech-view-panel';
import StandardModal from '../../../components/standard-modal';
import BattleMechTableGroup from './_tableGroup';
import type { JSX } from "react";
const Eye = FaEye as any;
const Book = FaBook as any;
const PlusCircle = FaPlusCircle as any;

// A saved 'Mech, already imported, or a bundled one imported when the user opens it.
type MechDesign = BattleMech | IBundledMechRef;

type ClassicMULUnit = Vehicle | AerospaceFighter | InfantryPlatoon | BattleArmor | ProtoMech | SmallCraft | CapitalShip;
// Likewise for the other types: a saved or sample unit, or a bundled MegaMek one.
type UnitDesign = ClassicMULUnit | IBundledUnitRef;
const isBundledRef = ( design: UnitDesign ): design is IBundledUnitRef => "header" in design;

interface IClassicMULKind {
    typeIDs: number[];
    // Narrows a shared MUL type: fighters and the larger aerospace craft are both type 17.
    matches?: (unit: IASMULUnit) => boolean;
    creator: string;
    saves: (appGlobals: IAppGlobals) => { uuid?: string; lastUpdated?: unknown }[];
    load: (json: string) => ClassicMULUnit;
    // Designs that ship with the app, matched after the user's saves (like the Skunk Werks 'Mechs).
    bundled?: () => object[];
    // The bundled MegaMek designs of the kind (#241), matched last and imported only when one is opened.
    bundledType?: BundledUnitType;
    // The blank record sheet the View button shows, drawn by the same components as Print Force.
    sheet: (unit: ClassicMULUnit) => JSX.Element;
    table: "vehicles" | "fighters" | "infantry" | "battleArmor" | "protoMechs" | "smallCraft" | "capitalShips";
}

// The Classic MUL search (Ideas #84): 'Mechs (BattleMechs and IndustrialMechs) match saved and bundled designs; the
// other types match saved designs and go into their own table in the group.
const CBT_MUL_MECH_TYPE_IDS = [18, 20];
const CBT_MUL_KINDS: IClassicMULKind[] = [
    { typeIDs: [19, 24], creator: "vehicle-creator", saves: (g) => g.vehicleSaves, load: (json) => new Vehicle( json ), table: "vehicles", sheet: (unit) => <VehicleRecordSheet vehicle={unit as Vehicle} />, bundled: () => ARTVEE_SAMPLES.map( (sample) => sample.save ), bundledType: "support-vehicles" },
    { typeIDs: [17], matches: (unit) => !isMULLargeAerospaceCraft( unit ), creator: "fighter-creator", saves: (g) => g.fighterSaves, load: (json) => new AerospaceFighter( json ), table: "fighters", sheet: (unit) => <FighterRecordSheet fighter={unit as AerospaceFighter} /> },
    { typeIDs: [21], creator: "infantry-creator", saves: (g) => g.infantrySaves, load: (json) => new InfantryPlatoon( json ), table: "infantry", sheet: (unit) => <InfantryRecordSheet platoons={[unit as InfantryPlatoon]} /> },
    { typeIDs: [22], creator: "battle-armor-creator", saves: (g) => g.battleArmorSaves, load: (json) => new BattleArmor( json ), bundledType: "battle-armor", table: "battleArmor", sheet: (unit) => <BattleArmorRecordSheet squads={[unit as BattleArmor]} /> },
    { typeIDs: [23], creator: "protomech-creator", saves: (g) => g.protoMechSaves, load: (json) => new ProtoMech( json ), bundledType: "protomechs", table: "protoMechs", sheet: (unit) => <ProtoMechRecordSheet proto={unit as ProtoMech} /> },
    { typeIDs: [17], matches: (unit) => isMULLargeAerospaceCraft( unit ) && !isMULCapitalShip( unit ), creator: "small-craft-creator", saves: (g) => g.smallCraftSaves, load: (json) => new SmallCraft( json ), bundledType: "small-craft", table: "smallCraft", sheet: (unit) => <SmallCraftRecordSheet craft={unit as SmallCraft} /> },
    { typeIDs: [17], matches: isMULCapitalShip, creator: "capital-ship-creator", saves: (g) => g.capitalShipSaves, load: (json) => new CapitalShip( json ), table: "capitalShips", sheet: (unit) => <CapitalShipRecordSheet ship={unit as CapitalShip} /> },
];
const CBT_MUL_TYPE_IDS = Array.from( new Set( CBT_MUL_MECH_TYPE_IDS.concat( ...CBT_MUL_KINDS.map( (kind) => kind.typeIDs ) ) ) );
// The MUL files fighters, Small Craft, DropShips and capital ships all under type 17, so the Type list gives each kind
// its own option (issue 322), on ids of their own that the search maps back to type 17 and the kind's Alpha Strike type.
const CBT_MUL_AEROSPACE_TYPES: { id: number; label: string; aeroClass: MULAerospaceClass }[] = [
    { id: 1701, label: "Aerospace Fighter", aeroClass: "AF" },
    { id: 1702, label: "Conventional Fighter", aeroClass: "CF" },
    { id: 1703, label: "Small Craft", aeroClass: "SC" },
    { id: 1704, label: "DropShip", aeroClass: "DS" },
    { id: 1705, label: "JumpShip", aeroClass: "JS" },
    { id: 1706, label: "WarShip", aeroClass: "WS" },
    { id: 1707, label: "Space Station", aeroClass: "SS" },
];
const CBT_MUL_TYPE_OPTIONS = CBT_MUL_TYPE_IDS
    .flatMap( (id) => id === 17 ? CBT_MUL_AEROSPACE_TYPES : [{ id, label: getMULTypeLabel( id ) }] )
    .map( ({ id, label }) => ({ id, label }) );
const MUL_RESULTS_PAGE_SIZE = 25;

export default class BattleMechAddMechDialog extends React.Component<IBattleMechAddMechDialogProps, IBattleMechAddMechDialogState> {

    private searchTimeout: ReturnType<typeof setTimeout> | null = null;
    private latestSearch = 0;
    private designIndex: { key: string; index: ClassicDesignIndex<MechDesign> } | null = null;
    private unitIndexes = new Map<IClassicMULKind, { key: string; index: ClassicDesignIndex<UnitDesign> }>();

    constructor(props: IBattleMechAddMechDialogProps) {
        super(props);
        this.state = {
            viewingUnit: null,
            viewingOther: null,
            viewingTRO: null,
            updated: false,
            mulResults: [],
            mulPage: 0,
            mulSearching: false,
            bundledMechs: [],
            bundledUnits: {},
        }

    }

    componentDidMount() {
        // A search saved before the Type list split type 17 (issue 322) has no option left, so it starts from All.
        if( this.props.appGlobals.appSettings.cbtMULSearch.type === 17 ) {
            this.props.appGlobals.appSettings.cbtMULSearch.type = 0;
        }
        void this.updateMULResults();
        loadBundledMechIndex().then( (bundledMechs) => this.setState({ bundledMechs }) )
            .catch( (error) => console.error("Unable to load the bundled 'Mechs", error) );
        for( const type of CBT_MUL_KINDS.flatMap( (kind) => kind.bundledType ? [kind.bundledType] : [] ) ) {
            loadBundledIndex( type ).then( (headers) => this.setState( (state) => ({ bundledUnits: { ...state.bundledUnits, [type]: headers } }) ) )
                .catch( (error) => console.error("Unable to load the bundled " + type, error) );
        }
    }

    componentWillUnmount() {
        if( this.searchTimeout ) {
            clearTimeout( this.searchTimeout );
        }
    }

    updateMULFilters = ( filters: IMULSearchFilters, search: boolean ): void => {
        const appSettings = this.props.appGlobals.appSettings;
        const termChanged = filters.term !== appSettings.cbtMULSearch.term;
        appSettings.cbtMULSearch = filters;
        this.props.appGlobals.saveAppSettings( appSettings );
        this.setState({ updated: true });
        if( !search ) {
            return;
        }
        if( this.searchTimeout ) {
            clearTimeout( this.searchTimeout );
        }
        // Wait for the user to stop typing before searching on the name.
        this.searchTimeout = setTimeout( () => void this.updateMULResults(), termChanged ? 500 : 0 );
    }

    updateMULResults = async (): Promise<void> => {
        const searchId = ++this.latestSearch;
        this.setState({ mulSearching: true });
        const filters = this.props.appGlobals.appSettings.cbtMULSearch;
        const aerospace = CBT_MUL_AEROSPACE_TYPES.find( (type) => type.id === filters.type );
        const results = ( await searchBundledMUL( { ...filters, type: aerospace ? 17 : filters.type } ) )
            .filter( (unit) => CBT_MUL_TYPE_IDS.includes( unit.Type?.Id ) )
            .filter( (unit) => !aerospace || getMULAerospaceClass( unit ) === aerospace.aeroClass )
            .sort( (a, b) => getMULDisplayName(a).localeCompare( getMULDisplayName(b) ) );
        if( searchId !== this.latestSearch ) {
            return;
        }
        this.setState({ mulResults: results, mulPage: 0, mulSearching: false });
    }

    // Saved designs come first, so a design the user built wins over the bundled Skunk Werks copy of the same model.
    getDesignIndex = (): ClassicDesignIndex<MechDesign> => {
        const saves = this.props.appGlobals.battleMechSaves;
        const bundled = this.state.bundledMechs;
        const key = JSON.stringify( saves.map( (save) => save.uuid + save.lastUpdated ) ) + bundled.length;
        if( !this.designIndex || this.designIndex.key !== key ) {
            // The sample VTOLAMs ship with the app like the ArtVees, after the user's own saves (#376).
            const saved = ( saves as object[] ).concat( VTOLAM_SAMPLES.map( (sample) => sample.save ) ).map( (save) => new BattleMech( JSON.stringify( save ) ) );
            this.designIndex = { key, index: buildClassicDesignIndex<MechDesign>( [ ...getClassicMechEntries( saved ), ...getBundledMechEntries( bundled ) ] ) };
        }
        return this.designIndex.index;
    }

    // Runs a button's action on the design, importing a bundled one first.
    withMech = ( design: MechDesign, action: ( e: React.FormEvent<HTMLButtonElement>, mech: BattleMech ) => void ) => ( e: React.FormEvent<HTMLButtonElement> ): void => {
        e.preventDefault();
        if( design instanceof BattleMech ) {
            action( e, design );
            return;
        }
        loadBundledMechDesign( design.header, design.configuration ).then( (mech) => action( e, mech ) )
            .catch( (error) => console.error("Unable to load " + design.header.name, error) );
    }

    getUnitIndex = ( kind: IClassicMULKind ): ClassicDesignIndex<UnitDesign> => {
        const saves = kind.saves( this.props.appGlobals );
        const headers = kind.bundledType ? this.state.bundledUnits[kind.bundledType] ?? [] : [];
        const key = JSON.stringify( saves.map( (save) => String( save.uuid ) + String( save.lastUpdated ) ) ) + headers.length;
        let cached = this.unitIndexes.get( kind );
        if( !cached || cached.key !== key ) {
            const designs = ( saves as object[] ).concat( kind.bundled ? kind.bundled() : [] );
            const bundled = headers.map( (header) => ({ chassis: header.name, model: header.model, design: { type: kind.bundledType!, header } }) );
            cached = { key, index: buildClassicDesignIndex<UnitDesign>( [ ...getClassicUnitEntries( designs.map( (save) => kind.load( JSON.stringify( save ) ) ) ), ...bundled ] ) };
            this.unitIndexes.set( kind, cached );
        }
        return cached.index;
    }

    // Runs a button's action on the unit, importing a bundled one first.
    withUnit = ( design: UnitDesign, action: ( e: React.FormEvent<HTMLButtonElement>, unit: ClassicMULUnit ) => void ) => ( e: React.FormEvent<HTMLButtonElement> ): void => {
        e.preventDefault();
        if( !isBundledRef( design ) ) {
            action( e, design );
            return;
        }
        loadBundledUnitDesign( design.type, design.header ).then( (unit) => action( e, unit ) )
            .catch( (error) => console.error("Unable to load " + design.header.name, error) );
    }

    importOtherUnit = ( e: React.FormEvent<HTMLButtonElement> | null, kind: IClassicMULKind, design: ClassicMULUnit ): void => {
        if( e && e.preventDefault ) {
            e.preventDefault();
        }
        if( this.props.currentForce ) {
            const unit = kind.load( design.exportJSON() );
            unit.newUUID();
            unit.resetInPlay();
            ( this.props.currentForce[kind.table] as ClassicMULUnit[] ).push( unit );
            this.props.onChange( this.props.currentForce );
            this.setState({ viewingOther: null });
        }
    }

    viewTRO = ( e: React.FormEvent<HTMLButtonElement>, design: BattleMech | ClassicMULUnit ): void => {
        e.preventDefault();
        this.showTRO( design );
    }

    showTRO = ( design: BattleMech | ClassicMULUnit ): void => {
        const adapter = design instanceof BattleMech ? getBattleMechTroAdapter( design ) : getUnitTroAdapter( design );
        this.setState({ viewingTRO: { title: design.getName(), tro: design.tro, adapter, rulesets: getUnitRulesets( design ) } });
    }

    viewOtherUnit = ( e: React.FormEvent<HTMLButtonElement>, kind: IClassicMULKind, design: ClassicMULUnit ): void => {
        e.preventDefault();
        this.setState({ viewingOther: { kind, design } });
    }


    viewUnit = (
        e: React.FormEvent<HTMLButtonElement>,
        bm: BattleMech,
    ) => {
        if( e && e.preventDefault ) {
            e.preventDefault();
        }
        this.setState({
            viewingUnit: bm,
        })
    }

    closeViewUnit = (
        e: React.FormEvent<HTMLButtonElement> | null,
    ) => {
        if( e && e.preventDefault ) {
            e.preventDefault();
        }
        this.setState({
            viewingUnit: null,
        })
    }

    addViewedUnit = (
        e: React.FormEvent<HTMLButtonElement> | null,
    ) => {
        if( e && e.preventDefault ) {
            e.preventDefault();
        }
        if( this.props.currentForce && this.state.viewingUnit ) {
            let currentForce = this.props.currentForce;
            let newBM = new BattleMech( this.state.viewingUnit.exportJSON()  );
            newBM.newUUID();
            currentForce.members.push (
                newBM
            )
            this.props.onChange( currentForce );
            this.setState({
                viewingUnit: null,
            })
        }

    }

    importUnit = (
        e: React.FormEvent<HTMLButtonElement> | null,
        bm: BattleMech,
    ) => {
        if( e && e.preventDefault ) {
            e.preventDefault();
        }
        if( this.props.currentForce && bm ) {
            let currentForce = this.props.currentForce;
            let newBM = new BattleMech( bm.exportJSON()  );
            newBM.newUUID();
            currentForce.members.push (
                newBM
            )
            this.props.onChange( currentForce );
            this.setState({
                viewingUnit: null,
            })
        }

    }

    renderMULSearch = (): JSX.Element => {
        const resultsPage = paginate( this.state.mulResults, this.state.mulPage, MUL_RESULTS_PAGE_SIZE );
        const index = this.getDesignIndex();
        return (
<fieldset className="fieldset">
    <legend>Master Unit List Search</legend>
    <p className="small-text">
        Search the Master Unit List copy kept in the app by name, era, faction and more, then add the matching Classic design. A 'Mech matches one you saved first, else the bundled Skunk Werks 'Mech; vehicles, fighters, Small Craft and DropShips, JumpShips, WarShips and space stations, infantry, battle armor and ProtoMechs match the designs you saved, by name and model (infantry, battle armor and ProtoMechs by a name holding both). 'Mechs also match the sample VTOLAMs, vehicles the bundled ArtVees, and battle armor, ProtoMechs, Small Craft and DropShips and Support Vehicles the designs converted from MegaMek's unit files (MegaMek Data by The MegaMek Team, CC BY-NC-SA 4.0), each checked against the Battle Value on the Master Unit List. Idea from Camille, Centrella-Sworn on the Star League Discord.
    </p>
    <MULSearchFilters
        filters={this.props.appGlobals.appSettings.cbtMULSearch}
        onChange={this.updateMULFilters}
        idPrefix="cbt"
        typeOptions={CBT_MUL_TYPE_OPTIONS}
    />
    <h4 className="text-center">
        MUL Results ({this.state.mulSearching ? "..." : this.state.mulResults.length})
    </h4>
    {!this.state.mulSearching ? <SearchResultsPager page={resultsPage} onGo={(page) => this.setState({ mulPage: page })} /> : null}
    <table className="table">
        <thead>
            <tr>
                <th>Name</th>
                <th className="min-width no-wrap text-left">Tech</th>
                <th className="min-width no-wrap text-left">Era</th>
                <th className="min-width no-wrap text-center">Tonnage</th>
                <th className="min-width no-wrap text-center">BV2</th>
                <th className="min-width no-wrap text-center">&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            {!this.state.mulSearching && this.state.mulResults.length === 0 ? (
                <tr><td className="text-center" colSpan={6}>No units on the Master Unit List match your filters.</td></tr>
            ) : null}
            {resultsPage.items.map( (unit: IASMULUnit) => {
                const kind = CBT_MUL_KINDS.find( (item) => item.typeIDs.includes( unit.Type?.Id ) && ( !item.matches || item.matches( unit ) ) );
                if( kind ) {
                    return this.renderOtherMULRow( unit, kind );
                }
                const design = findClassicDesign( unit, index );
                return (
                    <tr key={unit.MulUnitKey ?? unit.Id}>
                        <td>{getMULDisplayName( unit )}</td>
                        <td className="min-width no-wrap text-left">{unit.Technology?.Name}</td>
                        <td className="min-width no-wrap text-left">{getMULEraLabel( unit.EraId )}</td>
                        <td className="min-width no-wrap text-center">{unit.Tonnage}</td>
                        <td className="min-width no-wrap text-center">{design ? ( design instanceof BattleMech ? design.getBattleValue() : design.bv ) : unit.BattleValue}</td>
                        <td className="min-width no-wrap text-center">
                            {design ? (
                                <>
                                    <button className='btn btn-sm btn-primary' onClick={this.withMech( design, this.viewUnit )} title={"View " + getMULDisplayName( unit )}><Eye /></button>
                                    <button className='btn btn-sm btn-primary' onClick={this.withMech( design, this.viewTRO )} title={"Technical Readout of " + getMULDisplayName( unit )} aria-label={"TRO " + getMULDisplayName( unit )}><Book /></button>
                                    <button className='btn btn-sm btn-primary' onClick={this.withMech( design, this.importUnit )} title={"Add " + getMULDisplayName( unit ) + " to this group"} aria-label={"Add " + getMULDisplayName( unit )}><PlusCircle /></button>
                                </>
                            ) : (
                                <span className="small-text">
                                    No Classic design yet: <Link to={`${process.env.PUBLIC_URL}/classic-battletech/mech-creator`}>build it</Link>
                                </span>
                            )}
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
    {!this.state.mulSearching ? <SearchResultsPager page={resultsPage} onGo={(page) => this.setState({ mulPage: page })} below /> : null}
</fieldset>
        );
    }

    renderOtherMULRow = ( unit: IASMULUnit, kind: IClassicMULKind ): JSX.Element => {
        const design = findClassicDesign( unit, this.getUnitIndex( kind ) );
        const name = design ? ( isBundledRef( design ) ? ( design.header.name + " " + design.header.model ).trim() : design.getName() ) : "";
        return (
            <tr key={unit.MulUnitKey ?? unit.Id}>
                <td>{getMULDisplayName( unit )}</td>
                <td className="min-width no-wrap text-left">{unit.Technology?.Name}</td>
                <td className="min-width no-wrap text-left">{getMULEraLabel( unit.EraId )}</td>
                <td className="min-width no-wrap text-center">{unit.Tonnage}</td>
                <td className="min-width no-wrap text-center">{design ? ( isBundledRef( design ) ? design.header.bv : design.getBattleValue() ) : unit.BattleValue}</td>
                <td className="min-width no-wrap text-center">
                    {design ? (
                        <>
                        <button className='btn btn-sm btn-primary' onClick={this.withUnit( design, (e, loaded) => this.viewOtherUnit(e, kind, loaded) )} title={"View " + name} aria-label={"View " + getMULDisplayName( unit )}><Eye /></button>
                        <button className='btn btn-sm btn-primary' onClick={this.withUnit( design, this.viewTRO )} title={"Technical Readout of " + name} aria-label={"TRO " + getMULDisplayName( unit )}><Book /></button>
                        <button className='btn btn-sm btn-primary' onClick={this.withUnit( design, (e, loaded) => this.importOtherUnit(e, kind, loaded) )} title={"Add " + name + " to this group"} aria-label={"Add " + getMULDisplayName( unit )}><PlusCircle /></button>
                        </>
                    ) : (
                        <span className="small-text">
                            No Classic design yet: <Link to={`${process.env.PUBLIC_URL}/classic-battletech/${kind.creator}`}>build it</Link>
                        </span>
                    )}
                </td>
            </tr>
        );
    }

    render = (): JSX.Element => {
        const viewingOther = this.state.viewingOther;
        const viewingTRO = this.state.viewingTRO;
        return(
<>
{viewingTRO ? (
    <StandardModal
        show={true}
        onClose={() => this.setState({ viewingTRO: null })}
        className="modal modal-xl"
        printable={true}
    >
        <h3 className="text-center">Technical Readout: {viewingTRO.title}</h3>
        <TechnicalReadoutSheet tro={viewingTRO.tro} adapter={viewingTRO.adapter} rulesets={viewingTRO.rulesets} />
    </StandardModal>
) : null}
{viewingOther ? (
    <StandardModal
        show={true}
        onClose={() => this.setState({ viewingOther: null })}
        onAdd={() => this.importOtherUnit( null, viewingOther.kind, viewingOther.design )}
        className="modal modal-xl"
        printable={true}
    >
        <h3 className="text-center">Viewing {( viewingOther.design.getName() + " " + ( "getModel" in viewingOther.design ? viewingOther.design.getModel() : "" ) ).trim()}</h3>
        {viewingOther.kind.sheet( viewingOther.design )}
    </StandardModal>
) : null}
{this.state.viewingUnit ? (
    <StandardModal
        show={true}
        onClose={this.closeViewUnit}
        onAdd={this.addViewedUnit}
        className="modal modal-xl"
        printable={true}
    >

        <h3 className="text-center">Viewing {this.state.viewingUnit.getName()}</h3>
        <MechViewPanel mech={this.state.viewingUnit} />
    </StandardModal>
) : null}

    <div className="row">
      <div className="col">
          {this.renderMULSearch()}
          <fieldset className="fieldset">
              <legend>Your Saved Units</legend>
              {this.props.appGlobals.battleMechSaves.length === 0 ? (
                <div className='text-center'>
                    You have no saved 'mechs. Currently this app does not have permission to have any pre-built 'mechs loaded, but you should be able to create existing or new ' mechs in the <Link to={`${process.env.PUBLIC_URL}/classic-battletech/mech-creator`}>'Mech Creator</Link>
                </div>
              ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Make</th>
                            <th className="min-width no-wrap text-left">Tech</th>
                            <th className="min-width no-wrap text-center">Tonnage</th>
                            <th className="min-width no-wrap text-center">BV2</th>
                            <th className="min-width no-wrap text-center">&nbsp;</th>
                        </tr>
                    </thead>
                    {this.props.appGlobals.battleMechSaves.map( (bmDef, bmIndex) => {
                        let savedObj = new BattleMech( JSON.stringify(bmDef) )
                        // An OmniMech with several configurations gets one row per configuration
                        let configurations = savedObj.getOmniConfigurationNames().length > 1
                            ? savedObj.getOmniConfigurationNames().map( (name) => savedObj.cloneOmniConfiguration( name ) as BattleMech )
                            : [savedObj];
                        return (
                            <tbody key={bmIndex}>
                                {configurations.map( (bmObj, configIndex) => (
                                <tr key={configIndex}>
                                    <td>{bmObj.getName()}</td>
                                    <td className="min-width no-wrap text-left">{bmObj.getTech().name}</td>
                                    <td className="min-width no-wrap text-center">{bmObj.getTonnage()}</td>
                                    <td className="min-width no-wrap text-center">{bmObj.getBattleValue()}</td>
                                    <td className="min-width no-wrap text-center">
                                        <button
                                            className='btn btn-xs btn-primary'
                                            onClick={e => this.viewUnit(e, bmObj )}
                                            title={"View " + bmObj.getName()}
                                        >
                                            <Eye />
                                        </button>

                                        <button
                                            className='btn btn-xs btn-primary'
                                            onClick={e => this.viewTRO(e, bmObj )}
                                            title={"Technical Readout of " + bmObj.getName()}
                                            aria-label={"TRO " + bmObj.getName()}
                                        >
                                            <Book />
                                        </button>

                                        <button
                                            className='btn btn-xs btn-primary'
                                            onClick={e => this.importUnit(e, bmObj )}
                                            title={"Add " + bmObj.getName()}
                                        >
                                            <PlusCircle />
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        )
                    })}

                </table>
            )}
        </fieldset>


        <fieldset className="fieldset">
            <legend>Solaris Skunk Werks Data Import</legend>
            <p>'Mech designs converted from Solaris Skunk Werks files, each checked against the Battle Value on the Master Unit List (or in the file, for a design the MUL does not list).</p>
            <BundledMechList appGlobals={this.props.appGlobals} onView={(mech) => this.setState({ viewingUnit: mech })} onAdd={(mech) => this.importUnit( null, mech )} onTRO={this.showTRO} />



        </fieldset>
      </div>
      <div className="col">
          <fieldset className="fieldset">
              <legend>Current Force</legend>

              <BattleMechTableGroup
                appGlobals={this.props.appGlobals}
                bmGroupIndex={this.props.currentForceIndex}
                showAdd={false}
                showEdit={true}
                // onChange={this.onForceChange}
            />
          </fieldset>
      </div>
    </div>

</>
        )
    }
}

interface IBattleMechAddMechDialogProps {
    appGlobals: IAppGlobals;
    currentForce: BattleMechGroup;
    currentForceIndex: number;
    onChange( nv: BattleMechGroup ): void;
}

interface IBattleMechAddMechDialogState {
    viewingUnit: BattleMech | null;
    updated: boolean;
    mulResults: IASMULUnit[];
    viewingOther: { kind: IClassicMULKind; design: ClassicMULUnit } | null;
    viewingTRO: { title: string; tro: TechnicalReadout; adapter: ITroUnitAdapter; rulesets: string[] } | null;
    mulPage: number;
    mulSearching: boolean;
    bundledMechs: IBundledDesignHeader[];
    bundledUnits: Partial<Record<BundledUnitType, IBundledDesignHeader[]>>;
}