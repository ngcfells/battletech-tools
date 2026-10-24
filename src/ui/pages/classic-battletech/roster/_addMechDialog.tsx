import * as React from 'react';
import { FaBook, FaCheckCircle, FaEye, FaPlusCircle, FaTimesCircle } from 'react-icons/fa';
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
import BattleArmorRecordSheet from '../../../components/battle-armor-record-sheet';
import FighterRecordSheet from '../../../components/fighter-record-sheet';
import InfantryRecordSheet from '../../../components/infantry-record-sheet';
import ProtoMechRecordSheet from '../../../components/protomech-record-sheet';
import SmallCraftRecordSheet from '../../../components/small-craft-record-sheet';
import CapitalShipRecordSheet from '../../../components/capital-ship-record-sheet';
import VehicleRecordSheet from '../../../components/vehicle-record-sheet';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';
import { getBattleMechTroAdapter } from '../../../../classes/battlemech-tro';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import type { TechnicalReadout } from '../../../../classes/technical-readout';
import type { ITroUnitAdapter } from '../../../../data/technical-readout-interfaces';
import { buildClassicDesignIndex, ClassicDesignIndex, findClassicDesign, getClassicMechEntries, getClassicUnitEntries, isMULCapitalShip, isMULLargeAerospaceCraft } from '../../../../utils/classicMULMatch';
import { IMULSearchFilters } from '../../../../utils/mulSearchFilters';
import { getMULEraLabel } from '../../../../utils/mulUtilities';
import { paginate } from '../../../../utils/paginate';
import { getSSWRulesLevelLabel } from '../../../../utils/sswUtils';
import { IAppGlobals } from '../../../app-router';
import InputField from '../../../components/form_elements/input_field';
import MULSearchFilters from '../../../components/mul-search-filters';
import SearchResultsPager from '../../../components/search-results-pager';
import SanitizedHTML from '../../../components/sanitized-html';
import StandardModal from '../../../components/standard-modal';
import BattleMechSVG from '../../../components/svg/battlemech-svg';
import BattleMechTableGroup from './_tableGroup';
import type { JSX } from "react";
const CheckCircle = FaCheckCircle as any;
const Eye = FaEye as any;
const Book = FaBook as any;
const PlusCircle = FaPlusCircle as any;
const TimesCircle = FaTimesCircle as any;

type ClassicMULUnit = Vehicle | AerospaceFighter | InfantryPlatoon | BattleArmor | ProtoMech | SmallCraft | CapitalShip;

interface IClassicMULKind {
    typeIDs: number[];
    // Narrows a shared MUL type: fighters and the larger aerospace craft are both type 17.
    matches?: (unit: IASMULUnit) => boolean;
    creator: string;
    saves: (appGlobals: IAppGlobals) => { uuid?: string; lastUpdated?: unknown }[];
    load: (json: string) => ClassicMULUnit;
    // Designs that ship with the app, matched after the user's saves (like the Skunk Werks 'Mechs).
    bundled?: () => object[];
    // The blank record sheet the View button shows, drawn by the same components as Print Force.
    sheet: (unit: ClassicMULUnit) => JSX.Element;
    table: "vehicles" | "fighters" | "infantry" | "battleArmor" | "protoMechs" | "smallCraft" | "capitalShips";
}

// The Classic MUL search (Ideas #84): 'Mechs (BattleMechs and IndustrialMechs) match saved and bundled designs; the
// other types match saved designs and go into their own table in the group.
const CBT_MUL_MECH_TYPE_IDS = [18, 20];
const CBT_MUL_KINDS: IClassicMULKind[] = [
    { typeIDs: [19, 24], creator: "vehicle-creator", saves: (g) => g.vehicleSaves, load: (json) => new Vehicle( json ), table: "vehicles", sheet: (unit) => <VehicleRecordSheet vehicle={unit as Vehicle} />, bundled: () => ARTVEE_SAMPLES.map( (sample) => sample.save ) },
    { typeIDs: [17], matches: (unit) => !isMULLargeAerospaceCraft( unit ), creator: "fighter-creator", saves: (g) => g.fighterSaves, load: (json) => new AerospaceFighter( json ), table: "fighters", sheet: (unit) => <FighterRecordSheet fighter={unit as AerospaceFighter} /> },
    { typeIDs: [21], creator: "infantry-creator", saves: (g) => g.infantrySaves, load: (json) => new InfantryPlatoon( json ), table: "infantry", sheet: (unit) => <InfantryRecordSheet platoons={[unit as InfantryPlatoon]} /> },
    { typeIDs: [22], creator: "battle-armor-creator", saves: (g) => g.battleArmorSaves, load: (json) => new BattleArmor( json ), table: "battleArmor", sheet: (unit) => <BattleArmorRecordSheet squads={[unit as BattleArmor]} /> },
    { typeIDs: [23], creator: "protomech-creator", saves: (g) => g.protoMechSaves, load: (json) => new ProtoMech( json ), table: "protoMechs", sheet: (unit) => <ProtoMechRecordSheet proto={unit as ProtoMech} /> },
    { typeIDs: [17], matches: (unit) => isMULLargeAerospaceCraft( unit ) && !isMULCapitalShip( unit ), creator: "small-craft-creator", saves: (g) => g.smallCraftSaves, load: (json) => new SmallCraft( json ), table: "smallCraft", sheet: (unit) => <SmallCraftRecordSheet craft={unit as SmallCraft} /> },
    { typeIDs: [17], matches: isMULCapitalShip, creator: "capital-ship-creator", saves: (g) => g.capitalShipSaves, load: (json) => new CapitalShip( json ), table: "capitalShips", sheet: (unit) => <CapitalShipRecordSheet ship={unit as CapitalShip} /> },
];
const CBT_MUL_TYPE_IDS = CBT_MUL_MECH_TYPE_IDS.concat( ...CBT_MUL_KINDS.map( (kind) => kind.typeIDs ) );
const MUL_RESULTS_PAGE_SIZE = 25;

export default class BattleMechAddMechDialog extends React.Component<IBattleMechAddMechDialogProps, IBattleMechAddMechDialogState> {

    private searchTimeout: ReturnType<typeof setTimeout> | null = null;
    private latestSearch = 0;
    private designIndex: { key: string; index: ClassicDesignIndex<BattleMech> } | null = null;
    private unitIndexes = new Map<IClassicMULKind, { key: string; index: ClassicDesignIndex<ClassicMULUnit> }>();

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
        }

    }

    componentDidMount() {
        void this.updateMULResults();
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
        const results = ( await searchBundledMUL( this.props.appGlobals.appSettings.cbtMULSearch ) )
            .filter( (unit) => CBT_MUL_TYPE_IDS.includes( unit.Type?.Id ) )
            .sort( (a, b) => getMULDisplayName(a).localeCompare( getMULDisplayName(b) ) );
        if( searchId !== this.latestSearch ) {
            return;
        }
        this.setState({ mulResults: results, mulPage: 0, mulSearching: false });
    }

    // Saved designs come first, so a design the user built wins over the bundled Skunk Werks copy of the same model.
    getDesignIndex = (): ClassicDesignIndex<BattleMech> => {
        const saves = this.props.appGlobals.battleMechSaves;
        const bundled = this.props.appGlobals.sswMechObjects;
        const key = JSON.stringify( saves.map( (save) => save.uuid + save.lastUpdated ) ) + bundled.length;
        if( !this.designIndex || this.designIndex.key !== key ) {
            const saved = saves.map( (save) => new BattleMech( JSON.stringify( save ) ) );
            this.designIndex = { key, index: buildClassicDesignIndex( getClassicMechEntries( saved ).concat( getClassicMechEntries( bundled ) ) ) };
        }
        return this.designIndex.index;
    }

    getUnitIndex = ( kind: IClassicMULKind ): ClassicDesignIndex<ClassicMULUnit> => {
        const saves = kind.saves( this.props.appGlobals );
        const key = JSON.stringify( saves.map( (save) => String( save.uuid ) + String( save.lastUpdated ) ) );
        let cached = this.unitIndexes.get( kind );
        if( !cached || cached.key !== key ) {
            const designs = ( saves as object[] ).concat( kind.bundled ? kind.bundled() : [] );
            cached = { key, index: buildClassicDesignIndex( getClassicUnitEntries( designs.map( (save) => kind.load( JSON.stringify( save ) ) ) ) ) };
            this.unitIndexes.set( kind, cached );
        }
        return cached.index;
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
        const adapter = design instanceof BattleMech ? getBattleMechTroAdapter( design ) : getUnitTroAdapter( design );
        this.setState({ viewingTRO: { title: design.getName(), tro: design.tro, adapter } });
    }

    viewOtherUnit = ( e: React.FormEvent<HTMLButtonElement>, kind: IClassicMULKind, design: ClassicMULUnit ): void => {
        e.preventDefault();
        this.setState({ viewingOther: { kind, design } });
    }


    updateMechNameFilter = (
        e: React.FormEvent<HTMLInputElement>,
      ) => {
        if( e && e.preventDefault ) {
          e.preventDefault()
        }
        let appSettings = this.props.appGlobals.appSettings;
        appSettings.mechNameFilter = e.currentTarget.value;

        this.props.appGlobals.saveAppSettings(appSettings);
        this.setState({
          updated: true,
        })
      }

      updateMechRulesFilter = (
        e: React.FormEvent<HTMLSelectElement>,
      ) => {
        if( e && e.preventDefault ) {
          e.preventDefault()
        }
        let appSettings = this.props.appGlobals.appSettings;
        appSettings.mechRulesFilter = +e.currentTarget.value;

        this.props.appGlobals.saveAppSettings(appSettings)
        this.setState({
          updated: true,
        })
      }

      _filterSSWMechs = (
        a: BattleMech
      ): boolean => {

        if(
          this.props.appGlobals.appSettings.mechNameFilter.trim() !== ""
          &&
          a.getName().trim().toLowerCase().indexOf( this.props.appGlobals.appSettings.mechNameFilter.trim().toLowerCase()  ) === -1
        ) {
          return false;
        }

        if(
          this.props.appGlobals.appSettings.mechRulesFilter > -1
          &&
          a.basicSSWInfo?.rules_level_ssw !== this.props.appGlobals.appSettings.mechRulesFilter
        ) {
          return false;
        }

        return true;
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
        Search the Master Unit List copy kept in the app by name, era, faction and more, then add the matching Classic design. A 'Mech matches one you saved first, else the bundled Skunk Werks 'Mech; vehicles, fighters, Small Craft and DropShips, JumpShips, WarShips and space stations, infantry, battle armor and ProtoMechs match the designs you saved (vehicles also the bundled ArtVees), by name and model (infantry, battle armor and ProtoMechs by a name holding both). Idea from Camille, Centrella-Sworn on the Star League Discord.
    </p>
    <MULSearchFilters
        filters={this.props.appGlobals.appSettings.cbtMULSearch}
        onChange={this.updateMULFilters}
        idPrefix="cbt"
        typeIDs={CBT_MUL_TYPE_IDS}
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
                        <td className="min-width no-wrap text-center">{design ? design.getBattleValue() : unit.BattleValue}</td>
                        <td className="min-width no-wrap text-center">
                            {design ? (
                                <>
                                    <button className='btn btn-sm btn-primary' onClick={e => this.viewUnit(e, design)} title={"View " + design.getName()}><Eye /></button>
                                    <button className='btn btn-sm btn-primary' onClick={e => this.viewTRO(e, design)} title={"Technical Readout of " + design.getName()} aria-label={"TRO " + getMULDisplayName( unit )}><Book /></button>
                                    <button className='btn btn-sm btn-primary' onClick={e => this.importUnit(e, design)} title={"Add " + design.getName() + " to this group"} aria-label={"Add " + getMULDisplayName( unit )}><PlusCircle /></button>
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
</fieldset>
        );
    }

    renderOtherMULRow = ( unit: IASMULUnit, kind: IClassicMULKind ): JSX.Element => {
        const design = findClassicDesign( unit, this.getUnitIndex( kind ) );
        return (
            <tr key={unit.MulUnitKey ?? unit.Id}>
                <td>{getMULDisplayName( unit )}</td>
                <td className="min-width no-wrap text-left">{unit.Technology?.Name}</td>
                <td className="min-width no-wrap text-left">{getMULEraLabel( unit.EraId )}</td>
                <td className="min-width no-wrap text-center">{unit.Tonnage}</td>
                <td className="min-width no-wrap text-center">{design ? design.getBattleValue() : unit.BattleValue}</td>
                <td className="min-width no-wrap text-center">
                    {design ? (
                        <>
                        <button className='btn btn-sm btn-primary' onClick={e => this.viewOtherUnit(e, kind, design)} title={"View " + design.getName()} aria-label={"View " + getMULDisplayName( unit )}><Eye /></button>
                        <button className='btn btn-sm btn-primary' onClick={e => this.viewTRO(e, design)} title={"Technical Readout of " + design.getName()} aria-label={"TRO " + getMULDisplayName( unit )}><Book /></button>
                        <button className='btn btn-sm btn-primary' onClick={e => this.importOtherUnit(e, kind, design)} title={"Add " + design.getName() + " to this group"} aria-label={"Add " + getMULDisplayName( unit )}><PlusCircle /></button>
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
    >
        <h3 className="text-center">Technical Readout: {viewingTRO.title}</h3>
        <TechnicalReadoutSheet tro={viewingTRO.tro} adapter={viewingTRO.adapter} />
    </StandardModal>
) : null}
{viewingOther ? (
    <StandardModal
        show={true}
        onClose={() => this.setState({ viewingOther: null })}
        onAdd={() => this.importOtherUnit( null, viewingOther.kind, viewingOther.design )}
        className="modal modal-xl"
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
    >

        <h3 className="text-center">Viewing {this.state.viewingUnit.getName()}</h3>
        <div className="row">
            <div className='col'>
                <SanitizedHTML
                    raw={true}
                    html={this.state.viewingUnit.makeTROHTML()}
                />
            </div>
            <div className='col'>
                <BattleMechSVG
                    mechData={this.state.viewingUnit}
                />
            </div>
        </div>
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
                                        >
                                            <Eye />
                                        </button>

                                        <button
                                            className='btn btn-xs btn-primary'
                                            onClick={e => this.importUnit(e, bmObj )}
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
            <p>'Mech designs bundled from Solaris Skunk Werks. A <CheckCircle title="This import looks good to add!" className="color-green" /> beside a name means its Battle Value and cost match the Skunk Werks file and nothing failed to import; hover over a red icon to see what differs.</p>

            <div className="row">
  <div className="col">
  <InputField
              type="search"
              placeholder='Filter'
              value={this.props.appGlobals.appSettings.mechNameFilter}
              onChange={this.updateMechNameFilter}
            />
  </div>
  <div className="col">
  <label>
              <select
                  value={this.props.appGlobals.appSettings.mechRulesFilter}
                  onChange={this.updateMechRulesFilter}
              >
                <option value={-1}>All</option>
                <option value={0}>{getSSWRulesLevelLabel(0)}</option>
                <option value={1}>{getSSWRulesLevelLabel(1)}</option>
                <option value={2}>{getSSWRulesLevelLabel(2)}</option>
              </select>
            </label>

  </div>
</div>


<table className="table">
                    <thead>
                        <tr>
                            <th>Make</th>
                            <th className="min-width no-wrap text-left">Tech</th>
                            <th className="min-width no-wrap text-center">Rules</th>
                            <th className="min-width no-wrap text-center">Tonnage</th>

                            <th className="min-width no-wrap text-center">BV2</th>
                            <th className="min-width no-wrap text-center">&nbsp;</th>
                        </tr>
                    </thead>
                    {this.props.appGlobals.sswMechObjects.length === 0 ? (
                        <tbody>
                            <tr>
                                <td className="text-center" colSpan={6}>
                                    <br />No 'mechs found for import. This should not be!
                                    <br />
                                    <br />
                                </td>
                            </tr>
                        </tbody>
                    ) : null}
                    {this.props.appGlobals.sswMechObjects.length > 0 && this.props.appGlobals.sswMechObjects.filter( this._filterSSWMechs ).length === 0 ? (
                        <tbody>
                            <tr>
                                <td className="text-center" colSpan={6}>
                                    <br />There are no 'mechs found with your filter preferences
                                    <br />
                                    <br />
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                      <>
                      {this.props.appGlobals.sswMechObjects.filter( this._filterSSWMechs ).map( (bmObj, bmIndex) => {


let perfectImport = true;
let problems: string[] = [];
if( bmObj.basicSSWInfo && bmObj.basicSSWInfo.bv2 !== bmObj.getBattleValue()) {
    perfectImport = false;
    problems.push( "BV2 doesn't match! SSW " + bmObj.basicSSWInfo.bv2 + " vs calculated " + bmObj.getBattleValue() )
}
if( bmObj.basicSSWInfo && bmObj.basicSSWInfo.cbill_cost !== bmObj.getCBillCostNumeric(true)) {
    perfectImport = false;
    problems.push( "Cbill Cost doesn't match! SSW " + bmObj.basicSSWInfo.cbill_cost + " vs calculated " + bmObj.getCBillCost(true) )
}
if( bmObj.sswImportErrors.length > 0 ) {
    perfectImport = false;
    problems.push( bmObj.sswImportErrors.length + " import errors!" );
}

return (
    <tbody key={bmIndex}>
        <tr>
            <td>
                {bmObj.getName()}&nbsp;
                {perfectImport ? (
                    <CheckCircle title="This import looks good to add!" className="color-green" />
                ) : (
                    <TimesCircle title={"Not an accurate import, not recommended for adding to your force. " + problems.join("; ")} className="color-red" />
                )}
            </td>
            <td className="min-width no-wrap text-left">{bmObj.getTech().name}</td>
            <td className="min-width no-wrap text-left">{getSSWRulesLevelLabel(bmObj.basicSSWInfo?.rules_level_ssw ? bmObj.basicSSWInfo?.rules_level_ssw : 0, true )}</td>
            <td className="min-width no-wrap text-center">{bmObj.getTonnage()}</td>
            <td className="min-width no-wrap text-center">{bmObj.getBattleValue()}</td>
            <td className="min-width no-wrap text-center">
                <button
                    className='btn btn-sm btn-primary'
                    onClick={e => this.viewUnit(e, bmObj )}
                >
                    <Eye />
                </button>

                <button
                    className='btn btn-sm btn-primary'
                    onClick={e => this.importUnit(e, bmObj )}
                >
                    <PlusCircle />
                </button>
            </td>
        </tr>
    </tbody>
)
})}
                      </>
                    )}


                </table>



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
    viewingTRO: { title: string; tro: TechnicalReadout; adapter: ITroUnitAdapter } | null;
    mulPage: number;
    mulSearching: boolean;
}