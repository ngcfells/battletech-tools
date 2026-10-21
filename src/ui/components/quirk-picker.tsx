import * as React from 'react';
import type { JSX } from "react";
import { QuirkList } from '../../classes/quirk-list';
import { IAssignedQuirk, IQuirk, QuirkAttach, QuirkUnitType } from '../../data/quirk-interfaces';
import { getAssignedAttach, getOfferedQuirks, getQuirk, getQuirkOfferIssue, getQuirkPoints } from '../../data/quirk-registry';
import { getRulesEdition } from '../../data/rules-editions';

const ATTACH_NAMES: Record<QuirkAttach, string> = { unit: "Whole unit", location: "Location", weapon: "Weapon" };

/** The builder's list of a unit's design quirks, with a row to add one. Quirks never block a design. */
export default class QuirkPicker extends React.Component<IQuirkPickerProps, IQuirkPickerState> {
    constructor(props: IQuirkPickerProps) {
        super(props);
        this.state = { tag: "", attach: "unit", target: "", parameter: "", fromYear: "", toYear: "", message: "" };
    }

    private _selected(): IQuirk | undefined {
        return this.state.tag ? getQuirk(this.state.tag) : undefined;
    }

    private _selectQuirk = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        const quirk = getQuirk(event.target.value);
        this.setState({ tag: event.target.value, attach: quirk?.attaches[0] ?? "unit", target: "", parameter: "", message: "" });
    };

    private _add = (): void => {
        const quirk = this._selected();
        if (!quirk) {
            return;
        }
        const assigned: IAssignedQuirk = { tag: quirk.tag };
        if (this.state.attach === "weapon") {
            if (!this.state.target) {
                this.setState({ message: "Choose a weapon" });
                return;
            }
            assigned.equipmentUuid = this.state.target;
        } else if (this.state.attach === "location") {
            if (!this.state.target) {
                this.setState({ message: "Choose a location" });
                return;
            }
            assigned.location = this.state.target;
        }
        const parameter = this._parameterValue(quirk);
        if (parameter !== undefined) {
            assigned.parameter = parameter;
        }
        const fromYear = parseInt(this.state.fromYear, 10);
        const toYear = parseInt(this.state.toYear, 10);
        if (Number.isFinite(fromYear)) assigned.fromYear = fromYear;
        if (Number.isFinite(toYear)) assigned.toYear = toYear;
        const refusal = this.props.quirks.add(assigned);
        if (refusal) {
            this.setState({ message: `${quirk.name}: ${refusal}` });
            return;
        }
        this.setState({ tag: "", attach: "unit", target: "", parameter: "", fromYear: "", toYear: "", message: "" });
        this.props.onChange();
    };

    private _remove = (index: number): void => {
        this.props.quirks.remove(index);
        this.setState({ message: "" });
        this.props.onChange();
    };

    /** The parameter as saved: the chosen option or cost, or the typed number; undefined when the quirk has none. */
    private _parameterValue(quirk: IQuirk): string | number | undefined {
        if (!quirk.parameter) {
            return undefined;
        }
        if (quirk.parameter.options) {
            return this.state.parameter || quirk.parameter.options[0];
        }
        const value = Number(this.state.parameter);
        if (quirk.cost.choices) {
            return quirk.cost.choices.includes(value) ? value : quirk.cost.choices[0];
        }
        return this.state.parameter.trim() !== "" && Number.isFinite(value) ? value : undefined;
    }

    private _maxDamage(quirk: IQuirk, assigned: IAssignedQuirk): number {
        if (quirk.cost.per?.scope === "weapon" && assigned.equipmentUuid) {
            return this.props.weapons.find((weapon) => weapon.uuid === assigned.equipmentUuid)?.maxDamage ?? 0;
        }
        return this.props.unitMaxDamage;
    }

    private _describe(assigned: IAssignedQuirk): { name: string; notes: string[]; points: number } {
        const quirk = getQuirk(assigned.tag);
        if (!quirk) {
            return { name: assigned.tag, notes: ["not in this browser's quirk list"], points: 0 };
        }
        const notes: string[] = [];
        const attach = getAssignedAttach(assigned);
        if (attach === "weapon") {
            const weapon = this.props.weapons.find((entry) => entry.uuid === assigned.equipmentUuid);
            notes.push(weapon ? weapon.label : "weapon not installed");
        } else if (attach === "location") {
            notes.push(this.props.locations.find((entry) => entry.tag === assigned.location)?.label ?? assigned.location ?? "");
        }
        if (assigned.parameter !== undefined) notes.push(String(assigned.parameter));
        if (assigned.fromYear !== undefined || assigned.toYear !== undefined) notes.push(`${assigned.fromYear ?? ""}-${assigned.toYear ?? ""}`);
        const issue = getQuirkOfferIssue(quirk, this.props.unitType, this.props.editionTag, this.props.rulesLevel);
        if (issue === "edition") notes.push(`not offered in ${getRulesEdition(this.props.editionTag).name}`);
        else if (issue === "level") notes.push("above the selected rules level");
        else if (issue === "unit-type") notes.push("not for this unit type");
        return { name: quirk.name, notes, points: getQuirkPoints(quirk, assigned, this._maxDamage(quirk, assigned)) };
    }

    private _parameterControl(quirk: IQuirk): JSX.Element | null {
        if (!quirk.parameter) {
            return null;
        }
        const update = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => this.setState({ parameter: event.target.value });
        const choices = quirk.parameter.options ?? (quirk.cost.choices ? quirk.cost.choices.map(String) : null);
        if (choices) {
            return (
                <label>{quirk.parameter.kind === "range-band" ? "Range bracket" : "Value"}{" "}
                    <select value={this.state.parameter || choices[0]} onChange={update}>
                        {choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
                    </select>
                </label>
            );
        }
        return (
            <label>Value <input type="number" value={this.state.parameter} onChange={update} style={{ width: "5em" }} /></label>
        );
    }

    render = (): JSX.Element => {
        const assigned = this.props.quirks.getAll();
        const described = assigned.map((entry) => this._describe(entry));
        const positive = described.reduce((sum, entry) => sum + Math.max(entry.points, 0), 0);
        const negative = described.reduce((sum, entry) => sum + Math.min(entry.points, 0), 0);
        const offered = getOfferedQuirks(this.props.unitType, this.props.editionTag, this.props.rulesLevel);
        const selected = this._selected();
        const attaches = selected?.attaches ?? [];
        return (
            <div className="quirk-picker">
                <h3>Design Quirks</h3>
                <p className="smaller-text">
                    An optional rule all players should agree to. Campaign Operations (p.224) recommends giving a design
                    negative quirks worth at least as much as its positive ones; each group decides whether to require it.
                </p>
                {assigned.length > 0 ? (
                    <ul>
                        {described.map((entry, index) => (
                            <li key={index}>
                                {entry.name}{entry.notes.length ? ` (${entry.notes.join(", ")})` : ""}: {entry.points > 0 ? "+" : ""}{entry.points}{" "}
                                <button type="button" className="btn btn-xs btn-danger" aria-label={`Remove ${entry.name}`} onClick={() => this._remove(index)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                ) : <p>No quirks.</p>}
                <p>Positive {positive}, negative {negative}</p>
                <div>
                    <label>Quirk{" "}
                        <select aria-label="Quirk" value={this.state.tag} onChange={this._selectQuirk}>
                            <option value="">{offered.length ? "Choose a quirk" : "None offered"}</option>
                            {offered.map((quirk) => (
                                <option key={quirk.tag} value={quirk.tag}>{quirk.kind === "positive" ? "+" : "-"} {quirk.name}</option>
                            ))}
                        </select>
                    </label>
                    {attaches.length > 1 ? (
                        <label>{" "}On{" "}
                            <select aria-label="Attach to" value={this.state.attach} onChange={(event) => this.setState({ attach: event.target.value as QuirkAttach, target: "" })}>
                                {attaches.map((attach) => <option key={attach} value={attach}>{ATTACH_NAMES[attach]}</option>)}
                            </select>
                        </label>
                    ) : null}
                    {selected && this.state.attach === "weapon" ? (
                        <label>{" "}Weapon{" "}
                            <select aria-label="Weapon" value={this.state.target} onChange={(event) => this.setState({ target: event.target.value })}>
                                <option value="">Choose</option>
                                {this.props.weapons.map((weapon) => <option key={weapon.uuid} value={weapon.uuid}>{weapon.label}</option>)}
                            </select>
                        </label>
                    ) : null}
                    {selected && this.state.attach === "location" ? (
                        <label>{" "}Location{" "}
                            <select aria-label="Location" value={this.state.target} onChange={(event) => this.setState({ target: event.target.value })}>
                                <option value="">Choose</option>
                                {this.props.locations.map((location) => <option key={location.tag} value={location.tag}>{location.label}</option>)}
                            </select>
                        </label>
                    ) : null}
                    {selected ? this._parameterControl(selected) : null}
                    {selected ? (
                        <>
                            <label>{" "}From year <input type="number" value={this.state.fromYear} onChange={(event) => this.setState({ fromYear: event.target.value })} style={{ width: "5em" }} /></label>
                            <label>{" "}to <input type="number" value={this.state.toYear} onChange={(event) => this.setState({ toYear: event.target.value })} style={{ width: "5em" }} /></label>
                        </>
                    ) : null}
                    {" "}<button type="button" className="btn btn-sm btn-primary" disabled={!selected} onClick={this._add}>Add quirk</button>
                </div>
                {selected ? <p className="smaller-text">{selected.summary}{selected.restrictions ? ` ${selected.restrictions}` : ""}</p> : null}
                {this.state.message ? <p className="color-red" role="alert">{this.state.message}</p> : null}
            </div>
        );
    };
}

interface IQuirkPickerProps {
    quirks: QuirkList;
    unitType: QuirkUnitType;
    editionTag: string;
    rulesLevel: number;
    locations: { tag: string; label: string }[];
    weapons: { uuid: string; label: string; maxDamage: number }[];
    unitMaxDamage: number;
    onChange: () => void;
}

interface IQuirkPickerState {
    tag: string;
    attach: QuirkAttach;
    target: string;
    parameter: string;
    fromYear: string;
    toYear: string;
    message: string;
}
