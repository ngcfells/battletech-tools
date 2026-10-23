import React, { type JSX } from 'react';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import PrintablePage from '../../../components/printable-page';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';

export default class ProtoMechCreatorPrintTRO extends React.Component<IPrintTROProps> {
    constructor(props: IPrintTROProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Technical Readout | ProtoMech Creator");
    }

    render = (): JSX.Element => {
        const proto = this.props.appGlobals.currentProtoMech;
        if (!proto) {
            return <></>;
        }
        return (
            <PrintablePage backTo={`${process.env.PUBLIC_URL}/classic-battletech/protomech-creator/technical-readout`} appGlobals={this.props.appGlobals}
                requiredRulesLevel={proto.getRequiredRulesLevel()}
            >
                <div className="print-page">
                    <TechnicalReadoutSheet tro={proto.tro} adapter={getUnitTroAdapter(proto)} />
                </div>
            </PrintablePage>
        );
    }
}

interface IPrintTROProps {
    appGlobals: IAppGlobals;
}
