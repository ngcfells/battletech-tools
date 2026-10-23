import React, { type JSX } from 'react';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import PrintablePage from '../../../components/printable-page';
import TechnicalReadoutSheet from '../../../components/technical-readout-sheet';

export default class VehicleCreatorPrintTRO extends React.Component<IPrintTROProps> {
    constructor(props: IPrintTROProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Technical Readout | Vehicle Creator");
    }

    render = (): JSX.Element => {
        const vehicle = this.props.appGlobals.currentVehicle;
        if (!vehicle) {
            return <></>;
        }
        return (
            <PrintablePage backTo={`${process.env.PUBLIC_URL}/classic-battletech/vehicle-creator/technical-readout`} appGlobals={this.props.appGlobals}
                requiredRulesLevel={vehicle.getRequiredRulesLevel()}
            >
                <div className="print-page">
                    <TechnicalReadoutSheet tro={vehicle.tro} adapter={getUnitTroAdapter(vehicle)} />
                </div>
            </PrintablePage>
        );
    }
}

interface IPrintTROProps {
    appGlobals: IAppGlobals;
}
