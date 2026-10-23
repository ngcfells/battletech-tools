import React, { type JSX } from 'react';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import PrintablePage from '../../../components/printable-page';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';

export default class InfantryCreatorPrintTRO extends React.Component<IPrintTROProps> {
    constructor(props: IPrintTROProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Technical Readout | Infantry Creator");
    }

    render = (): JSX.Element => {
        const platoon = this.props.appGlobals.currentInfantry;
        if (!platoon) {
            return <></>;
        }
        return (
            <PrintablePage backTo={`${process.env.PUBLIC_URL}/classic-battletech/infantry-creator/technical-readout`} appGlobals={this.props.appGlobals}
                requiredRulesLevel={platoon.getRequiredRulesLevel()}
            >
                <div className="print-page">
                    <TechnicalReadoutSheet tro={platoon.tro} adapter={getUnitTroAdapter(platoon)} />
                </div>
            </PrintablePage>
        );
    }
}

interface IPrintTROProps {
    appGlobals: IAppGlobals;
}
