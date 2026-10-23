import React, { type JSX } from 'react';
import { getBattleMechTroAdapter } from '../../../../classes/battlemech-tro';
import { IAppGlobals } from '../../../app-router';
import PrintablePage from '../../../components/printable-page';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';

export default class MechCreatorPrintTRO extends React.Component<IPrintTROProps> {
    constructor(props: IPrintTROProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("'Mech Creator");
    }

    render = (): JSX.Element => {
        const mech = this.props.appGlobals.currentBattleMech;
        if( !mech ) {
            return <></>;
        }
        return (
            <PrintablePage backTo={`${process.env.PUBLIC_URL}/classic-battletech/mech-creator/step7`} appGlobals={this.props.appGlobals}
                requiredRulesLevel={mech.getRequiredRulesLevel()}
                provisionalNote={mech.isBattleValueProvisional() ? "provisional BV" : undefined}
            >
                <div className="print-page">
                    <TechnicalReadoutSheet tro={mech.tro} adapter={getBattleMechTroAdapter(mech)} />
                </div>
            </PrintablePage>
        );
    }
}

interface IPrintTROProps {
    appGlobals: IAppGlobals;
}
