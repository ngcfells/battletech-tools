import React, { type JSX } from 'react';
import { FaArrowCircleLeft, FaArrowCircleRight, FaPrint } from "react-icons/fa";
import { Link } from 'react-router';
import { getUnitTroAdapter } from '../../../../classes/unit-tro';
import { IAppGlobals } from '../../../app-router';
import TechnicalReadoutSection from '../../../components/technical-readout-section';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import BattleArmorCreatorSideMenu from '../../../components/battle-armor-creator-side-menu';
const ArrowCircleLeft = FaArrowCircleLeft as any;
const ArrowCircleRight = FaArrowCircleRight as any;
const Print = FaPrint as any;

export default class BattleArmorCreatorTechnicalReadout extends React.Component<ITechnicalReadoutProps> {
    constructor(props: ITechnicalReadoutProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Step 6 | Battle Armor Creator");
    }

    render = (): JSX.Element => {
        const suit = this.props.appGlobals.currentBattleArmor;
        if (!suit) {
            return <></>;
        }
        return (
            <UIPage current="classic-battletech-battle-armor-creator" appGlobals={this.props.appGlobals}>
                <div className="row">
                    <div className="d-none d-md-block col-md-3 col-lg-2">
                        <BattleArmorCreatorSideMenu appGlobals={this.props.appGlobals} current="technical-readout" />
                    </div>
                    <div className="col-md-9 col-lg-10">
                        <TextSection label="Step 6: Technical Readout (optional)">
                            <p>Everything here is optional. Makes and text appear on the printed Technical Readout sheet; they do not change the design.</p>
                            <TechnicalReadoutSection
                                tro={suit.tro}
                                adapter={getUnitTroAdapter(suit)}
                                onChange={() => this.props.appGlobals.saveCurrentBattleArmor(suit)}
                            />
                            <div className="clear-both overflow-hidden">
                                <hr />
                                <Link to={`${process.env.PUBLIC_URL}/classic-battletech/battle-armor-creator/summary`} className="btn btn-primary pull-right btn-sm">Summary <ArrowCircleRight /></Link>
                                <div className="inline-block text-left">
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/battle-armor-creator/loadouts`} className="btn btn-primary btn-sm"><ArrowCircleLeft /> Previous Step</Link>
                                    {" "}
                                    <Link to={`${process.env.PUBLIC_URL}/classic-battletech/battle-armor-creator/print-tro`} className="btn btn-primary btn-sm"><Print /> Print TRO sheet</Link>
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
