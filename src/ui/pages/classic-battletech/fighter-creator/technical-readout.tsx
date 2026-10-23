import React, { type JSX } from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight, FaPrint } from "react-icons/fa";
import { Link } from 'react-router';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import TechnicalReadoutSection from '../../../components/technical-readout-section';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import FighterCreatorSideMenu from '../../../components/fighter-creator-side-menu';
const ArrowCircleLeft = FaArrowCircleLeft as any;
const ArrowCircleRight = FaArrowCircleRight as any;
const Print = FaPrint as any;

export default class FighterCreatorTechnicalReadout extends React.Component<ITechnicalReadoutProps> {
    constructor(props: ITechnicalReadoutProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Step 4 | Fighter Creator");
    }

    render = (): JSX.Element => {
        const fighter = this.props.appGlobals.currentFighter;
        if (!fighter) {
            return <></>;
        }
        return (
            <UIPage current="classic-battletech-fighter-creator" appGlobals={this.props.appGlobals}>
                <div className="row">
                    <div className="d-none d-md-block col-md-3 col-lg-2">
                        <FighterCreatorSideMenu appGlobals={this.props.appGlobals} current="technical-readout" />
                    </div>
                    <div className="col-md-9 col-lg-10">
                        <TextSection label="Step 4: Technical Readout (optional)">
                            <p>Everything here is optional. Makes and text appear on the printed Technical Readout sheet; they do not change the design.</p>
                            <TechnicalReadoutSection
                                tro={fighter.tro}
                                adapter={getUnitTroAdapter(fighter)}
                                onChange={() => this.props.appGlobals.saveCurrentFighter(fighter)}
                            />
                            <div className="clear-both overflow-hidden">
                                <hr />
                                <Link to={`${process.env.PUBLIC_URL}/classic-battletech/fighter-creator/summary`} className="btn btn-primary pull-right btn-sm">Summary <ArrowCircleRight /></Link>
                                <div className="inline-block text-left">
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/fighter-creator/equipment`} className="btn btn-primary btn-sm"><ArrowCircleLeft /> Previous Step</Link>
                                    {" "}
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/fighter-creator/print-tro`} className="btn btn-primary btn-sm"><Print /> Print TRO sheet</Link>
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
