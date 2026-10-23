import React, { type JSX } from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight, FaPrint } from "react-icons/fa";
import { Link } from 'react-router';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import TechnicalReadoutSection from '../../../components/technical-readout-section';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import InfantryCreatorSideMenu from '../../../components/infantry-creator-side-menu';
const ArrowCircleLeft = FaArrowCircleLeft as any;
const ArrowCircleRight = FaArrowCircleRight as any;
const Print = FaPrint as any;

export default class InfantryCreatorTechnicalReadout extends React.Component<ITechnicalReadoutProps> {
    constructor(props: ITechnicalReadoutProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Step 3 | Infantry Creator");
    }

    render = (): JSX.Element => {
        const platoon = this.props.appGlobals.currentInfantry;
        if (!platoon) {
            return <></>;
        }
        return (
            <UIPage current="classic-battletech-infantry-creator" appGlobals={this.props.appGlobals}>
                <div className="row">
                    <div className="d-none d-md-block col-md-3 col-lg-2">
                        <InfantryCreatorSideMenu appGlobals={this.props.appGlobals} current="technical-readout" />
                    </div>
                    <div className="col-md-9 col-lg-10">
                        <TextSection label="Step 3: Technical Readout (optional)">
                            <p>Everything here is optional. Makes and text appear on the printed Technical Readout sheet; they do not change the design.</p>
                            <TechnicalReadoutSection
                                tro={platoon.tro}
                                adapter={getUnitTroAdapter(platoon)}
                                onChange={() => this.props.appGlobals.saveCurrentInfantry(platoon)}
                            />
                            <div className="clear-both overflow-hidden">
                                <hr />
                                <Link to={`${process.env.PUBLIC_URL}/classic-battletech/infantry-creator/summary`} className="btn btn-primary pull-right btn-sm">Summary <ArrowCircleRight /></Link>
                                <div className="inline-block text-left">
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/infantry-creator/weapons`} className="btn btn-primary btn-sm"><ArrowCircleLeft /> Previous Step</Link>
                                    {" "}
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/infantry-creator/print-tro`} className="btn btn-primary btn-sm"><Print /> Print TRO sheet</Link>
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
