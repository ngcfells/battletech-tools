import React, { type JSX } from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight, FaPrint } from "react-icons/fa";
import { Link } from 'react-router';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import TechnicalReadoutSection from '../../../components/technical-readout-section';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import VehicleCreatorSideMenu from '../../../components/vehicle-creator-side-menu';
const ArrowCircleLeft = FaArrowCircleLeft as any;
const ArrowCircleRight = FaArrowCircleRight as any;
const Print = FaPrint as any;

export default class VehicleCreatorTechnicalReadout extends React.Component<ITechnicalReadoutProps> {
    constructor(props: ITechnicalReadoutProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Step 5 | Vehicle Creator");
    }

    render = (): JSX.Element => {
        const vehicle = this.props.appGlobals.currentVehicle;
        if (!vehicle) {
            return <></>;
        }
        return (
            <UIPage current="classic-battletech-vehicle-creator" appGlobals={this.props.appGlobals}>
                <div className="row">
                    <div className="d-none d-md-block col-md-3 col-lg-2">
                        <VehicleCreatorSideMenu appGlobals={this.props.appGlobals} current="technical-readout" />
                    </div>
                    <div className="col-md-9 col-lg-10">
                        <TextSection label="Step 5: Technical Readout (optional)">
                            <p>Everything here is optional. Makes and text appear on the printed Technical Readout sheet; they do not change the design.</p>
                            <TechnicalReadoutSection
                                tro={vehicle.tro}
                                adapter={getUnitTroAdapter(vehicle)}
                                onChange={() => this.props.appGlobals.saveCurrentVehicle(vehicle)}
                            />
                            <div className="clear-both overflow-hidden">
                                <hr />
                                <Link to={`${process.env.PUBLIC_URL}/classic-battletech/vehicle-creator/summary`} className="btn btn-primary pull-right btn-sm">Summary <ArrowCircleRight /></Link>
                                <div className="inline-block text-left">
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/vehicle-creator/equipment-placement`} className="btn btn-primary btn-sm"><ArrowCircleLeft /> Previous Step</Link>
                                    {" "}
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/vehicle-creator/print-tro`} className="btn btn-primary btn-sm"><Print /> Print TRO sheet</Link>
                                </div>
                            </div>
                        </TextSection>
                    </div>
                </div>
            </UIPage>
        );
    }
}

interface ITechnicalReadoutProps {
    appGlobals: IAppGlobals;
}
