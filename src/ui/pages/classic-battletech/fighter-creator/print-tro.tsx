import React, { type JSX } from 'react';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import PrintablePage from '../../../components/printable-page';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';

export default class FighterCreatorPrintTRO extends React.Component<IPrintTROProps> {
    constructor(props: IPrintTROProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Technical Readout | Fighter Creator");
    }

    render = (): JSX.Element => {
        const fighter = this.props.appGlobals.currentFighter;
        if (!fighter) {
            return <></>;
        }
        return (
            <PrintablePage backTo={`${process.env.PUBLIC_URL}/classic-battletech/fighter-creator/technical-readout`} appGlobals={this.props.appGlobals}
                requiredRulesLevel={fighter.getRequiredRulesLevel()}
            >
                <div className="print-page">
                    <TechnicalReadoutSheet tro={fighter.tro} adapter={getUnitTroAdapter(fighter)} />
                </div>
            </PrintablePage>
        );
    }
}

interface IPrintTROProps {
    appGlobals: IAppGlobals;
}
