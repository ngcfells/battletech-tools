import React, { type JSX } from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight, FaPrint } from "react-icons/fa";
import { Link } from 'react-router';
import { getBattleMechTroAdapter } from '../../../../classes/battlemech-tro';
import { IAppGlobals } from '../../../app-router';
import MechCreatorSideMenu from '../../../components/mech-creator-side-menu';
import MechCreatorStatusbar from '../../../components/mech-creator-status-bar';
import TechnicalReadoutSection from '../../../components/technical-readout-section';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import './home.scss';
const ArrowCircleLeft = FaArrowCircleLeft as any;
const ArrowCircleRight = FaArrowCircleRight as any;
const Print = FaPrint as any;

export default class MechCreatorStep7 extends React.Component<IStep7Props> {
    constructor(props: IStep7Props) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Step 7 | 'Mech Creator");
    }

    render = (): JSX.Element => {
        const mech = this.props.appGlobals.currentBattleMech;
        if( !mech ) {
            return <></>;
        }
        return (
            <>
                <MechCreatorStatusbar appGlobals={this.props.appGlobals} />
                <UIPage current="classic-battletech-mech-creator" appGlobals={this.props.appGlobals}>
                    <div className="row">
                        <div className="d-none d-md-block col-md-3 col-lg-2">
                            <MechCreatorSideMenu appGlobals={this.props.appGlobals} current="step7" />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <TextSection label="Step 7: Technical Readout (optional)">
                                <p>Everything here is optional. Makes and text appear on the printed Technical Readout sheet; they do not change the design.</p>
                                <TechnicalReadoutSection
                                    tro={mech.tro}
                                    adapter={getBattleMechTroAdapter(mech)}
                                    onChange={() => this.props.appGlobals.saveCurrentBattleMech(mech)}
                                />
                                <div className="clear-both overflow-hidden">
                                    <hr />
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/mech-creator/summary`} className="btn btn-primary pull-right btn-sm">Summary <ArrowCircleRight /></Link>
                                    <div className="inline-block text-left">
                                        <Link to={`${process.env.PUBLIC_URL}/classic-battletech/mech-creator/step6`} className="btn btn-primary btn-sm"><ArrowCircleLeft /> Previous Step</Link>
                                        {" "}
                                        <Link to={`${process.env.PUBLIC_URL}/classic-battletech/mech-creator/print-tro`} className="btn btn-primary btn-sm"><Print /> Print TRO sheet</Link>
                                    </div>
                                </div>
                            </TextSection>
                        </div>
                    </div>
                </UIPage>
            </>
        );
    }
}

interface IStep7Props {
    appGlobals: IAppGlobals;
}
