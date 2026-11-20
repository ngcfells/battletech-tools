import React, { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { FaArrowCircleLeft, FaPrint } from "react-icons/fa";
import { Link } from 'react-router';
import {
    blankContractSheetRow, CONTRACT_SHEET_COMMON_COSTS, CONTRACT_SHEET_MAX_ROWS, CONTRACT_SHEET_ROW_FIELDS, CONTRACT_SHEET_ROWS,
    contractSheetRowUsed, IContractSheet, IContractSheetRow, IContractSheetTerm, newContractSheet,
} from '../../../../classes/campaign/contract-sheet';
import { IAppGlobals } from '../../../app-router';
import { useCampaign } from './campaign-store';
import './contract-sheet.scss';

const ArrowCircleLeft = FaArrowCircleLeft as any;
const PrintIcon = FaPrint as any;

/** Typing saves after this pause (and at once on leaving the page). */
const SAVE_DELAY_MS = 400;

const ROW_LABELS: Record<keyof IContractSheetRow, string> = {
    month: "Month", event: "Event", cost: "Cost", cover: "Cover", paid: "Paid", balance: "Balance", rep: "Rep",
};

type TTermKey = "basePay" | "transportation" | "support" | "salvage" | "command";

/** One "Label: ____" field on the sheet. */
function Field( props: { label: string; value: string; onChange: ( v: string ) => void; className?: string; suffix?: string } ): JSX.Element {
    return (
        <label className={`cs-field ${props.className ?? ""}`}>
            <span className="cs-label">{props.label}</span>
            <input type="text" className="cs-line" value={props.value} onChange={( e ) => props.onChange( e.currentTarget.value )} />
            {props.suffix ? <span className="cs-suffix">{props.suffix}</span> : null}
        </label>
    );
}

/** "Label: ____ % ( __ )", or "Label: ________ ( __ )" for Command. */
function TermField( props: { label: string; value: IContractSheetTerm; percent: boolean; onChange: ( v: IContractSheetTerm ) => void; className?: string } ): JSX.Element {
    return (
        <span className={`cs-field cs-term ${props.className ?? ""}`}>
            <label className="cs-term-main">
                <span className="cs-label">{props.label}</span>
                <input type="text" className="cs-line" value={props.value.percent} aria-label={props.percent ? `${props.label} percent` : props.label}
                    onChange={( e ) => props.onChange( { ...props.value, percent: e.currentTarget.value } )} />
            </label>
            {props.percent ? <span className="cs-suffix">%</span> : null}
            <span className="cs-suffix">(</span>
            <input type="text" className="cs-line cs-roll" value={props.value.roll} aria-label={`${props.label} roll`}
                onChange={( e ) => props.onChange( { ...props.value, roll: e.currentTarget.value } )} />
            <span className="cs-suffix">)</span>
        </span>
    );
}

/** The sheet as printed (Hot Spots: Draconis Reach p.203), every blank an input. */
function ContractSheetForm( props: { sheet: IContractSheet; onChange: ( s: IContractSheet ) => void } ): JSX.Element {
    const s = props.sheet;
    const set = <K extends keyof IContractSheet>( key: K, value: IContractSheet[K] ) => props.onChange( { ...s, [key]: value } );
    const term = ( key: TTermKey, label: string, percent: boolean, className?: string ) =>
        <TermField label={label} value={s[key]} percent={percent} className={className} onChange={( v ) => set( key, v )} />;
    const setRow = ( index: number, field: keyof IContractSheetRow, value: string ) =>
        set( "rows", s.rows.map( ( r, i ) => ( i === index ? { ...r, [field]: value } : r ) ) );
    return (
        <div className="contract-sheet">
            <div className="cs-header">
                <div className="cs-brand">BATTLETECH</div>
                <div className="cs-title-box">MERCENARY CONTRACT<br />RECORD SHEET</div>
            </div>
            <div className="cs-box cs-terms">
                <div className="cs-line-row">
                    <Field label="Name:" value={s.name} onChange={( v ) => set( "name", v )} className="cs-grow" />
                    <Field label="Contract:" value={s.contract} onChange={( v ) => set( "contract", v )} className="cs-grow" />
                </div>
                <div className="cs-line-row">
                    <Field label="Type of Action:" value={s.typeOfAction} onChange={( v ) => set( "typeOfAction", v )} className="cs-grow" />
                    <Field label="Scale:" value={s.scale} onChange={( v ) => set( "scale", v )} className="cs-mid" />
                    <Field label="Length:" value={s.length} onChange={( v ) => set( "length", v )} className="cs-mid" suffix="Months" />
                </div>
                <div className="cs-line-row">
                    {term( "basePay", "Base Pay:", true, "cs-grow" )}
                    {term( "transportation", "Transportation:", true, "cs-grow" )}
                    {term( "support", "Support:", true, "cs-grow" )}
                </div>
                <div className="cs-line-row">
                    {term( "salvage", "Salvage:", true, "cs-third" )}
                    {term( "command", "Command:", false, "cs-grow" )}
                </div>
                <div className="cs-line-row">
                    <Field label="Starting Warchest:" value={s.startingWarchest} onChange={( v ) => set( "startingWarchest", v )} className="cs-grow" />
                </div>
            </div>
            <div className="cs-body">
                <div className="cs-box cs-ledger">
                    <table>
                        <thead>
                            <tr>{CONTRACT_SHEET_ROW_FIELDS.map( ( f ) => <th key={f} className={`cs-col-${f}`}>{ROW_LABELS[f]}</th> )}</tr>
                        </thead>
                        <tbody>
                            {s.rows.map( ( row, index ) => (
                                <tr key={index}>
                                    {CONTRACT_SHEET_ROW_FIELDS.map( ( f ) => (
                                        <td key={f} className={`cs-col-${f}`}>
                                            <input type="text" className="cs-line" value={row[f]} aria-label={`${ROW_LABELS[f]}, line ${index + 1}`}
                                                onChange={( e ) => setRow( index, f, e.currentTarget.value )} />
                                        </td>
                                    ) )}
                                </tr>
                            ) )}
                        </tbody>
                    </table>
                </div>
                <div className="cs-common">
                    <div className="cs-common-title">COMMON COSTS/PAY</div>
                    {CONTRACT_SHEET_COMMON_COSTS.map( ( group ) => (
                        <div key={group.heading}>
                            <div className="cs-common-heading">{group.heading}</div>
                            {group.lines.map( ( line ) => (
                                <div key={line.label} className="cs-common-line"><strong>{line.label}</strong> {line.value}</div>
                            ) )}
                        </div>
                    ) )}
                </div>
            </div>
            <div className="cs-footer">
                Form after the Mercenary Contract Record Sheet in Hot Spots: Draconis Reach (Catalyst Game Labs, 2026).
                BattleTech and ’Mech are trademarks of The Topps Company, Inc. Filled in and printed from Jeff's BattleTech Tools.
            </div>
        </div>
    );
}

/**
 * A campaign's Mercenary Contract Record Sheets (#639): fill them in on screen, kept with the campaign, and print
 * them on Letter paper like the book's page.
 */
export default function CampaignContractSheets( props: { appGlobals: IAppGlobals; id: string | undefined } ): JSX.Element {
    const { loaded, campaign, error, update } = useCampaign( props.appGlobals, props.id );
    const [selectedId, setSelectedId] = useState<string | null>( null );
    const [draft, setDraft] = useState<IContractSheet | null>( null );
    const pending = useRef<IContractSheet | null>( null );
    const updateRef = useRef( update );
    useEffect( () => { updateRef.current = update; } );

    const save = useCallback( ( sheet: IContractSheet ) => updateRef.current( ( c ) => {
        c.contractSheets = c.contractSheets.some( ( s ) => s.id === sheet.id )
            ? c.contractSheets.map( ( s ) => ( s.id === sheet.id ? sheet : s ) )
            : c.contractSheets.concat( sheet );
    } ), [] );
    const flush = useCallback( () => {
        if( pending.current ) save( pending.current );
        pending.current = null;
    }, [save] );

    // Save typing after a pause, and whatever is unsaved when the page closes.
    useEffect( () => {
        if( !draft ) return;
        const timer = setTimeout( flush, SAVE_DELAY_MS );
        return () => clearTimeout( timer );
    }, [draft, flush] );
    useEffect( () => () => flush(), [flush] );

    const sheets = campaign?.contractSheets ?? [];
    const stored = sheets.find( ( s ) => s.id === selectedId ) ?? sheets[0] ?? null;
    const sheet = draft && draft.id === stored?.id ? draft : stored;

    if( !loaded ) return <main className="campaign-contract-sheets"><p>Loading...</p></main>;
    if( !campaign ) {
        return (
            <main className="campaign-contract-sheets">
                <p>{error ? `This campaign cannot be opened: ${error}.` : "No campaign with this id."} <Link to="../.." relative="path">Back to campaigns</Link></p>
            </main>
        );
    }

    const change = ( next: IContractSheet ) => {
        pending.current = next;
        setDraft( next );
    };
    const select = ( id: string ) => {
        flush();
        setDraft( null );
        setSelectedId( id );
    };
    const add = () => {
        flush();
        const next = newContractSheet();
        save( next );
        setDraft( null );
        setSelectedId( next.id );
    };
    const remove = () => {
        if( !sheet ) return;
        const label = sheetLabel( sheet, sheets.indexOf( stored! ) );
        props.appGlobals.openConfirmDialog( "Delete contract sheet", `Delete '${label}'? This cannot be undone.`, "Delete", "Cancel", () => {
            pending.current = null;
            setDraft( null );
            setSelectedId( null );
            update( ( c ) => { c.contractSheets = c.contractSheets.filter( ( s ) => s.id !== sheet.id ); } );
        } );
    };
    const addLines = () => {
        if( !sheet ) return;
        const room = CONTRACT_SHEET_MAX_ROWS - sheet.rows.length;
        if( room <= 0 ) return;
        change( { ...sheet, rows: sheet.rows.concat( Array.from( { length: Math.min( CONTRACT_SHEET_ROWS, room ) }, blankContractSheetRow ) ) } );
    };
    /** Saves what was just typed, then opens the browser's print dialog; only the sheet prints (Letter, one page). */
    const print = () => {
        flush();
        window.print();
    };
    const usedLines = sheet ?sheet.rows.filter( contractSheetRowUsed ).length : 0;

    return (
        <>
            <header className="topmenu print-bar">
                <ul className="main-menu">
                    <li><Link title="Back to the campaign" className="current" to=".." relative="path"><ArrowCircleLeft /></Link></li>
                    {sheet ? <li><span title="Open the Print Dialog" role="button" onClick={print} className="current"><PrintIcon /></span></li> : null}
                </ul>
            </header>
            <main className="campaign-contract-sheets">
                <div className="print-bar cs-controls">
                    <h1 className="h4">{campaign.name}: Mercenary Contract Record Sheets</h1>
                    <p className="smaller-text">
                        The sheet from Hot Spots: Draconis Reach (p.203), filled in here and saved with this campaign. Print it on Letter paper.
                    </p>
                    <p>
                        {sheets.length > 0 ? (
                            <label>
                                Sheet{" "}
                                <select value={sheet?.id ?? ""} onChange={( e ) => select( e.currentTarget.value )}>
                                    {sheets.map( ( s, i ) => <option key={s.id} value={s.id}>{sheetLabel( s.id === sheet?.id ? sheet : s, i )}</option> )}
                                </select>
                            </label>
                        ) : null}{" "}
                        <button type="button" className="btn btn-primary btn-sm" onClick={add}>New sheet</button>{" "}
                        {sheet ? <>
                            <button type="button" className="btn btn-primary btn-sm" onClick={print}>Print sheet</button>{" "}
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addLines}
                                disabled={sheet.rows.length >= CONTRACT_SHEET_MAX_ROWS}>Add {CONTRACT_SHEET_ROWS} lines</button>{" "}
                            <button type="button" className="btn btn-danger btn-sm" onClick={remove}>Delete sheet</button>{" "}
                            <span className="smaller-text">{usedLines} of {sheet.rows.length} lines used.</span>
                        </> : null}
                    </p>
                </div>
                {sheet ? <ContractSheetForm sheet={sheet} onChange={change} /> : <p className="print-bar">No contract sheets yet.</p>}
            </main>
        </>
    );
}

const sheetLabel = ( s: IContractSheet, index: number ): string =>
    s.contract.trim() || s.name.trim() ? [s.name.trim(), s.contract.trim()].filter( Boolean ).join( ": " ) : `Sheet ${index + 1}`;
