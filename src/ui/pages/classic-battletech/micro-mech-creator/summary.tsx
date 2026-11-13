import React, { type JSX } from 'react';
import { Link } from 'react-router';
import { FaArrowCircleLeft } from "react-icons/fa";
import { IAppGlobals } from '../../../app-router';
import { MicroMechCreatorSideMenu } from '../../../components/creator-side-menus';
import CalcBreakdown from '../../../components/calc-breakdown';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import { formatBattleValue } from '../../../../data/battle-value';
import { btRulesEditions } from '../../../../data/rules-editions';
const ArrowCircleLeft = FaArrowCircleLeft as any;

export default class MicroMechCreatorSummary extends React.Component<ISummaryProps> {
    constructor(props: ISummaryProps) {
        super(props);
        this.props.appGlobals.makeDocumentTitle("Summary | Micro-Mech Creator");
    }

    render = (): JSX.Element => {
        const micro = this.props.appGlobals.currentMicroMech;
        if (!micro) return <></>;
        const issues = micro.getIssues();
        const notes = micro.getNotes();
        const printed = micro.getPrintedFigures();
        const jump = micro.getJumpMP();

        return (
            <UIPage current="classic-battletech-micro-mech-creator" appGlobals={this.props.appGlobals}>
                <div className="row">
                    <div className="d-none d-md-block col-md-3 col-lg-2">
                        <MicroMechCreatorSideMenu appGlobals={this.props.appGlobals} current="summary" />
                    </div>
                    <div className="col-md-9 col-lg-10">
                        <TextSection label={`Summary: ${micro.getDisplayName()}`}>
                            {issues.length === 0 ? (
                                <p data-testid="mm-legal"><strong>This Micro-Mech is legal under {micro.getRules().name}.</strong></p>
                            ) : (
                                <>
                                    <p className="color-red"><strong>This Micro-Mech is not legal yet:</strong></p>
                                    <ul className="color-red" data-testid="mm-summary-issues">
                                        {issues.map((issue, index) => <li key={index}>{issue}</li>)}
                                    </ul>
                                </>
                            )}

                            <p data-testid="mm-summary">
                                <strong>Type</strong>: {micro.getTons()}-ton {micro.isQuad() ? "quad" : "biped"} Micro-Mech (fan-made, Custom Homebrew, NOT OFFICIAL) &nbsp;|&nbsp;
                                <strong>Rules</strong>: {micro.getRules().name} &nbsp;|&nbsp;
                                <strong>Era</strong>: {micro.getEra().name} &nbsp;|&nbsp;
                                <strong>Battle Value</strong> (provisional): {formatBattleValue((edition) => micro.getBattleValue(edition), "mech", micro.getRulesEdition())} &nbsp;|&nbsp;
                                <strong>Cost</strong>: {micro.getCBillCost().toLocaleString("en-US")} C-bills
                            </p>
                            <p>
                                <strong>Weight</strong>: {micro.getWeight()} of {micro.getMaxWeight()} kg &nbsp;|&nbsp;
                                <strong>Movement</strong>: {micro.getWalkMP()}/{micro.getRunMP()}{jump > 0 ? `/${jump}` : ""} &nbsp;|&nbsp;
                                <strong>Engine</strong>: {micro.getInstalledEngineRating()} {micro.getEngineKind() === "fusion" ? "fusion" : "ICE"} &nbsp;|&nbsp;
                                <strong>Armor</strong>: {micro.getArmorPoints()} points &nbsp;|&nbsp;
                                <strong>Structure</strong>: {micro.getTotalStructure()} points &nbsp;|&nbsp;
                                <strong>Heat sinks</strong>: {micro.getHeatSinks()} &nbsp;|&nbsp;
                                <strong>Slots</strong>: {micro.getTotalUsedSlots()} of {micro.getTotalSlots()}
                            </p>
                            {printed ? (
                                <p className="smaller-text" data-testid="mm-printed">
                                    {printed.corrupt
                                        ? `The document prints this design as ${printed.name}, but its printed cost and Battle Value are unreadable; ours are worked out from the rules text.`
                                        : `The document prints this design as ${printed.name}: Battle Value ${printed.battleValue}, cost ${printed.cost.toLocaleString("en-US")} C-bills. Ours are worked out from its rules text.`}
                                </p>
                            ) : null}
                            <ul className="smaller-text">
                                {notes.map((note, index) => <li key={index}>{note}</li>)}
                            </ul>

                            <h3>Weight</h3>
                            <table className="table" data-testid="mm-weight-log">
                                <tbody>
                                    {micro.getWeightLog().map((line, index) => <tr key={index}><td>{line.name}</td><td className="text-right">{line.kg} kg</td></tr>)}
                                    <tr><th>Total</th><th className="text-right">{micro.getWeight()} kg</th></tr>
                                </tbody>
                            </table>

                            <h3>Battle Value and Cost Calculation</h3>
                            <CalcBreakdown
                                battleValue={(edition) => micro.getBattleValueBreakdown(edition)}
                                cost={() => micro.getCostBreakdown()}
                                editions={btRulesEditions.filter((edition) => (edition.unitTypes ?? ["mech"]).includes("mech")).map((edition) => edition.tag)}
                                edition={micro.getRulesEdition()}
                            />

                            <div className="clear-both overflow-hidden">
                                <hr />
                                <Link to={`${process.env.PUBLIC_URL}/classic-battletech/micro-mech-creator/equipment`} className="btn btn-primary btn-sm"><ArrowCircleLeft /> Previous Step</Link>
                            </div>
                        </TextSection>
                    </div>
                </div>
            </UIPage>
        );
    }
}

interface ISummaryProps {
    appGlobals: IAppGlobals;
}
