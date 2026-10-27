import React, { useState, type JSX } from 'react';
import { BattleMech } from '../../classes/battlemech';
import SanitizedHTML from './sanitized-html';
import BattleMechSVG from './svg/battlemech-svg';
import './mech-view-panel.scss';

/** A 'Mech's TRO beside its record sheet. A click on the sheet shows it alone at full width, another brings the TRO back (#372). */
export default function MechViewPanel( props: { mech: BattleMech } ): JSX.Element {
    const [sheetOnly, setSheetOnly] = useState(false);
    return (
        <div className="row">
            {sheetOnly ? null : (
                <div className="col">
                    <SanitizedHTML raw={true} html={props.mech.makeTROHTML()} />
                </div>
            )}
            <div className="col">
                <button type="button" className="mech-view-sheet" aria-pressed={sheetOnly} aria-label="Record sheet, full width"
                    title={sheetOnly ? "Click to show the TRO beside the record sheet" : "Click to show the record sheet full width"}
                    onClick={() => setSheetOnly( !sheetOnly )}>
                    <BattleMechSVG mechData={props.mech} />
                </button>
            </div>
        </div>
    );
}
