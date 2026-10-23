import React, { type JSX } from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight, FaPrint } from "react-icons/fa";
import { Link } from 'react-router';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import TechnicalReadoutSection from '../../../components/technical-readout-section';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import ProtoMechCreatorSideMenu from '../../../components/protomech-creator-side-menu';
const ArrowCircleLeft = FaArrowCircleLeft as any;
const ArrowCircleRight = FaArrowCircleRight as any;
const Print = FaPrint as any;

export default class ProtoMechCreatorTechnicalReadout extends React.Component<ITechnicalReadoutProps> {
    constructor(props: ITechnicalReadoutProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Step 6 | ProtoMech Creator");
    }

    render = (): JSX.Element => {
        const proto = this.props.appGlobals.currentProtoMech;
        if (!proto) {
            return <></>;
        }
        return (
            <UIPage current="classic-battletech-protomech-creator" appGlobals={this.props.appGlobals}>
                <div className="row">
                    <div className="d-none d-md-block col-md-3 col-lg-2">
                        <ProtoMechCreatorSideMenu appGlobals={this.props.appGlobals} current="technical-readout" />
                    </div>
                    <div className="col-md-9 col-lg-10">
                        <TextSection label="Step 6: Technical Readout (optional)">
                            <p>Everything here is optional. Makes and text appear on the printed Technical Readout sheet; they do not change the design.</p>
                            <TechnicalReadoutSection
                                tro={proto.tro}
                                adapter={getUnitTroAdapter(proto)}
                                onChange={() => this.props.appGlobals.saveCurrentProtoMech(proto)}
                            />
                            <div className="clear-both overflow-hidden">
                                <hr />
                                <Link to={`${process.env.PUBLIC_URL}/classic-battletech/protomech-creator/summary`} className="btn btn-primary pull-right btn-sm">Summary <ArrowCircleRight /></Link>
                                <div className="inline-block text-left">
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/protomech-creator/equipment`} className="btn btn-primary btn-sm"><ArrowCircleLeft /> Previous Step</Link>
                                    {" "}
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/protomech-creator/print-tro`} className="btn btn-primary btn-sm"><Print /> Print TRO sheet</Link>
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
