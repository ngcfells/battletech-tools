import * as React from 'react';
import { FaPlus, FaTrash } from "react-icons/fa";
import { MUL_SOURCE_OPTIONS } from '../../data/mul-list-items';
import { MULSource } from '../../classes/alpha-strike-unit';
import { IAbilityCodeCount } from '../../utils/mulAbilities';
import { IMULSearchFilters } from '../../utils/mulSearchFilters';
import { getMULAerospaceRoles, getMULEraAliases, getMULEraIDs, getMULEraLabel, getMULFactionIDs, getMULFactionLabels, getMULGroundRoles, getMULTypeIDs, getMULTypeLabel } from '../../utils/mulUtilities';
import InputField from './form_elements/input_field';
import type { JSX } from "react";
const Plus = FaPlus as any;
const Trash = FaTrash as any;

const MAX_ABILITY_SUGGESTIONS = 12;

// The Master Unit List search filters, shared by the Alpha Strike and Classic rosters. Each roster keeps its own
// IMULSearchFilters and runs the search; `search` is false for edits that do not change the results (typing in the
// faction or ability pickers).
export default class MULSearchFilters extends React.Component<IMULSearchFiltersProps> {

    private change = ( changes: Partial<IMULSearchFilters>, search: boolean = true ): void => {
        this.props.onChange( { ...this.props.filters, ...changes }, search );
    }

    private getFactionSuggestions = (): number[] => {
        const term = this.props.filters.factionSearchTerm.trim().toLowerCase();
        if( term.length < 3 ) {
            return [];
        }
        return getMULFactionIDs().filter( (factionID) =>
            !this.props.filters.factions.includes( factionID )
            && getMULFactionLabels( factionID ).toLowerCase().includes( term ) );
    }

    private getAbilitySuggestions = (): IAbilityCodeCount[] => {
        const term = this.props.filters.abilitySearchTerm.trim().toUpperCase();
        if( !term || !this.props.abilityCodes ) {
            return [];
        }
        const selectedCodes = this.props.filters.abilities.map( (filter) => filter.replace(/^!/, "") );
        return this.props.abilityCodes
            .filter( (ability) => ability.code.startsWith( term ) && !selectedCodes.includes( ability.code ) )
            .slice( 0, MAX_ABILITY_SUGGESTIONS );
    }

    private addAbilityFilter = ( code: string, exclude: boolean ): void => {
        this.change({
            abilities: this.props.filters.abilities
                .filter( (filter) => filter.replace(/^!/, "") !== code )
                .concat( exclude ? "!" + code : code ),
            abilitySearchTerm: "",
        });
    }

    private toggleSource = ( source: MULSource, checked: boolean ): void => {
        const ticked = this.props.filters.sources.filter( (existing) => existing !== source ).concat( checked ? [source] : [] );
        this.change({ sources: MUL_SOURCE_OPTIONS.map( (option) => option.value ).filter( (value) => ticked.includes( value ) ) });
    }

    render = (): JSX.Element => {
        const filters = this.props.filters;
        const typeIDs = this.props.typeIDs ?? getMULTypeIDs();
        const factionSuggestions = this.getFactionSuggestions();
        const abilitySuggestions = this.getAbilitySuggestions();

        return (
<fieldset className="fieldset">
    <div className="row">
        <div className="col-md-6 text-center">
            <InputField
                type="search"
                onChange={(event: React.FormEvent<HTMLInputElement>) => this.change({ term: event.currentTarget.value })}
                value={filters.term}
                label="Search Terms"
            />
        </div>
        <div className="col-md-6 text-center">
            <label>
                Search Rules:<br />
                <select onChange={(event) => this.change({ rules: event.currentTarget.value })} value={filters.rules}>
                    <option value="">All</option>
                    <option value="introductory">Introductory</option>
                    <option value="standard">Standard</option>
                    <option value="advanced">Advanced</option>
                </select>
            </label>
        </div>
    </div>
    <div className="row">
        <div className="col-md-6 text-center">
            <label>
                Search Tech:<br />
                <select onChange={(event) => this.change({ tech: event.currentTarget.value })} value={filters.tech}>
                    <option value="">All</option>
                    <option value="inner sphere">Inner Sphere</option>
                    <option value="clan">Clan</option>
                </select>
            </label>

            <label>
                Type:<br />
                <select onChange={(event) => this.change({ type: +event.currentTarget.value })} value={filters.type}>
                    {typeIDs.length > 1 ? <option value={0}>All</option> : null}
                    {typeIDs.map( (typeID) => <option key={typeID} value={typeID}>{getMULTypeLabel( typeID )}</option> )}
                </select>
            </label>
        </div>
        <div className="col-md-6 text-center">
            <label>
                Era:<br />
                <select onChange={(event) => this.change({ era: +event.currentTarget.value })} value={filters.era}>
                    <option value={0}>All</option>
                    {getMULEraIDs().map( (eraID) => <option key={eraID} value={eraID}>{getMULEraLabel( eraID )}</option> )}
                    <optgroup label="Clan eras">
                        {getMULEraAliases().map( (alias) => <option key={alias.id} value={alias.id}>{alias.label}</option> )}
                    </optgroup>
                </select>
            </label>

            <label>
                Role:<br />
                <select onChange={(event) => this.change({ role: event.currentTarget.value })} value={filters.role}>
                    <option value="">All</option>
                    <optgroup label="Ground Unit Roles">
                        {getMULGroundRoles().map( (role) => <option key={role} value={role}>{role}</option> )}
                    </optgroup>
                    <optgroup label="Aerospace Roles">
                        {getMULAerospaceRoles().map( (role) => <option key={role} value={role}>{role}</option> )}
                    </optgroup>
                </select>
            </label>
        </div>
    </div>
    <div className="row">
        <div className="col-md-12 text-center">
            <InputField
                type="search"
                onChange={(event: React.FormEvent<HTMLInputElement>) => this.change({ factionSearchTerm: event.currentTarget.value }, false)}
                value={filters.factionSearchTerm}
                label="Filter Availability By Factions"
                placeholder='Type 3 or more characters to search. MUL uses OR logic for multiple factions.'
            />
        </div>
        <div className="col-md-6 text-center">
            {factionSuggestions.length > 0 ? (
                <div>
                    Add to Faction Filter?<br />
                    {factionSuggestions.map( (factionID) => (
                        <div key={factionID} className="text-left">
                            <button onClick={() => this.change({ factions: filters.factions.concat( factionID ) })} className="btn-sm btn btn-primary" aria-label={"Add " + getMULFactionLabels(factionID) + " to the faction filter"}><Plus /></button>
                            &nbsp;{getMULFactionLabels(factionID)}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
        <div className="col-md-6 text-center">
            {filters.factions.length > 0 ? (
                <div>
                    Current Faction Filter:<br />
                    {filters.factions.map( (factionID) => (
                        <div key={factionID} className="text-left">
                            <button onClick={() => this.change({ factions: filters.factions.filter( (faction) => faction !== factionID ) })} className="btn btn-sm btn-danger" aria-label={"Remove " + getMULFactionLabels(factionID) + " from the faction filter"}><Trash /></button>
                            {getMULFactionLabels(factionID)}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    </div>
    {this.props.abilityCodes ? (
    <div className="row">
        <div className="col-md-12 text-center">
            <InputField
                type="search"
                onChange={(event: React.FormEvent<HTMLInputElement>) => this.change({ abilitySearchTerm: event.currentTarget.value }, false)}
                value={filters.abilitySearchTerm}
                label="Filter By Special Abilities"
                placeholder='Type an ability code, such as ECM, IF or TAG.'
            />
        </div>
        <div className="col-md-6 text-center">
            {abilitySuggestions.length > 0 ? (
                <div>
                    Add to Ability Filter?<br />
                    {abilitySuggestions.map( (ability) => (
                        <div key={ability.code} className="text-left">
                            <button onClick={() => this.addAbilityFilter(ability.code, false)} className="btn-sm btn btn-primary" title={"Only units with " + ability.code} aria-label={"Has " + ability.code}>Has</button>
                            <button onClick={() => this.addAbilityFilter(ability.code, true)} className="btn-sm btn btn-secondary" title={"Only units without " + ability.code} aria-label={"Lacks " + ability.code}>Lacks</button>
                            &nbsp;{ability.code} <span className="small-text">({ability.count} units)</span>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
        <div className="col-md-6 text-center">
            {filters.abilities.length > 0 ? (
                <div>
                    Current Ability Filter:<br />
                    {filters.abilities.map( (filter) => {
                        const label = filter.startsWith("!") ? "Lacks " + filter.substring(1) : "Has " + filter;
                        return (
                            <div key={filter} className="text-left">
                                <button onClick={() => this.change({ abilities: filters.abilities.filter( (existing) => existing !== filter ) })} className="btn btn-sm btn-danger" title={"Remove " + label + " from the filter"} aria-label={"Remove " + label + " from the filter"}><Trash /></button>
                                {label}
                            </div>
                        )
                    })}
                </div>
            ) : null}
        </div>
    </div>
    ) : null}
    <div className="row">
        <div className="col-md-12 text-center">
            <div role="group" aria-label="Unit Lists">
                Unit Lists:<br />
                {MUL_SOURCE_OPTIONS.map( (option) => {
                    const checked = filters.sources.includes( option.value );
                    return (
                        <label key={option.value} title={option.description} className="me-2">
                            <input
                                type="checkbox"
                                name={this.props.idPrefix + "MULSources"}
                                value={option.value}
                                checked={checked}
                                // At least one list stays ticked, or every search would come back empty.
                                disabled={checked && filters.sources.length === 1}
                                onChange={(event) => this.toggleSource( option.value, event.currentTarget.checked )}
                            />&nbsp;{option.label}
                        </label>
                    );
                })}
            </div>
            <div className="small-text">
                {MUL_SOURCE_OPTIONS.filter( (option) => filters.sources.includes( option.value ) ).map( (option) => option.description ).join( " " )}
                {this.props.sourcesNote}
            </div>
        </div>
    </div>
</fieldset>
        );
    }
}

interface IMULSearchFiltersProps {
    filters: IMULSearchFilters;
    onChange( filters: IMULSearchFilters, search: boolean ): void;
    /** Prefixes the Unit Lists checkboxes' name, e.g. "alphaStrike" gives "alphaStrikeMULSources". */
    idPrefix: string;
    /** MUL type ids the Type list offers; all of them when left out. */
    typeIDs?: number[];
    /** The special ability picker shows only when given (Alpha Strike). */
    abilityCodes?: IAbilityCodeCount[];
    sourcesNote?: React.ReactNode;
}
