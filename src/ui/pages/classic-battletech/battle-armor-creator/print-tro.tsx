import React, { type JSX } from 'react';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import PrintablePage from '../../../components/printable-page';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';

export default class BattleArmorCreatorPrintTRO extends React.Component<IPrintTROProps> {
    constructor(props: IPrintTROProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Technical Readout | Battle Armor Creator");
    }

    render = (): JSX.Element => {
        const suit = this.props.appGlobals.currentBattleArmor;
        if (!suit) {
            return <></>;
        }
        return (
            <PrintablePage backTo={`${process.env.PUBLIC_URL}/classic-battletech/battle-armor-creator/technical-readout`} appGlobals={this.props.appGlobals}
                requiredRulesLevel={suit.getRequiredRulesLevel()}
            >
                <div className="print-page">
                    <TechnicalReadoutSheet tro={suit.tro} adapter={getUnitTroAdapter(suit)} />
                </div>
            </PrintablePage>
        );
    }
}

interface IPrintTROProps {
    appGlobals: IAppGlobals;
}
