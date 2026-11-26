import React, { type JSX } from 'react';
import { Link } from 'react-router';
import { FaBook, FaChessKnight, FaDownload, FaLayerGroup, FaMedal } from "react-icons/fa";
import { IAppGlobals } from '../../../app-router';
import TextSection from '../../../components/text-section';
import UIPage from '../../../components/ui-page';
import { ACES_EXPORT_FILE_NAME, getAcesCampaigns, getAcesExport, getAcesGame } from '../../../../dataSaves';
import { ACES_BOOK, ACES_SS_BOOK } from '../../../../data/aces-rules';
import './aces.scss';
const Book = FaBook as any;
const Cards = FaLayerGroup as any;
const ChessKnight = FaChessKnight as any;
const Download = FaDownload as any;
const Medal = FaMedal as any;

/** The export at the top of every Aces page: one file with everything this browser stores for the app. */
export const AcesExportButton = ( props: { appGlobals: IAppGlobals } ): JSX.Element => {
    const [ busy, setBusy ] = React.useState( false );
    const exportEverything = async () => {
        setBusy( true );
        try {
            const blob = new Blob( [ await getAcesExport( props.appGlobals.appSettings ) ], { type: "application/json" } );
            const url = URL.createObjectURL( blob );
            const link = document.createElement( "a" );
            link.href = url;
            link.download = ACES_EXPORT_FILE_NAME;
            document.body.appendChild( link );
            link.click();
            document.body.removeChild( link );
            URL.revokeObjectURL( url );
        } catch( error ) {
            console.error( "Unable to export", error );
            props.appGlobals.siteAlerts.addAlert(
                "danger",
                "Export Failed",
                "The export could not be made: " + String( error ),
                "", true, null, 0,
            );
        } finally {
            setBusy( false );
        }
    };
    return (
        <div className="alert alert-primary d-print-none aces-export">
            <button type="button" className="btn btn-lg btn-primary" onClick={exportEverything} disabled={busy}>
                <Download /> Export everything ({ACES_EXPORT_FILE_NAME})
            </button>
            <p className="mb-0 mt-2">
                Downloads one file with everything this browser stores for the app: your Aces games, campaigns and card
                library, saved units, forces and settings. Backup and Restore can read the saves and cards back from it.
            </p>
        </div>
    );
};

export default class AcesHome extends React.Component<IAcesHomeProps, IAcesHomeState> {
    constructor(props: IAcesHomeProps) {
        super(props);
        this.state = {
            gameSummary: "",
            campaignCount: 0,
        }

        this.props.appGlobals.makeDocumentTitle("Alpha Strike: Aces");
    }

    componentDidMount = async () => {
        const game = await getAcesGame( this.props.appGlobals.appSettings );
        const campaigns = await getAcesCampaigns( this.props.appGlobals.appSettings );
        let gameSummary = "";
        if( game && game.automatedForce ) {
            gameSummary = ( game.name ? game.name + ": " : "" ) + "turn " + ( game.turn || 1 ) + ", " + ( game.phase || "initiative" ) + " phase";
        }
        this.setState({
            gameSummary: gameSummary,
            campaignCount: campaigns.length,
        });
    }

    render = (): JSX.Element => {
      return (
        <UIPage current="alpha-strike-aces" appGlobals={this.props.appGlobals}>
          <div className="aces-page">
          <AcesExportButton appGlobals={this.props.appGlobals} />
          <TextSection
            label="BattleTech: Aces"
          >
              <p>
                  A companion for playing Alpha Strike against the automated opponent from <em>{ACES_BOOK}</em> and
                  {" "}<em>{ACES_SS_BOOK}</em>. The app keeps track of what the rules decide by the numbers: turns and
                  phases, Initiative modifiers, activation order by priority number, front-loaded move order, Aces deck
                  cycling and splitting, crippled units, to-hit numbers, and the campaign ledger, Named Pilots and sortie log.
              </p>
              <p>
                  You still need the Aces box and books. Type your own Aces, Command and Special Order cards and
                  sorties into the Card Library once, and the Game Tracker deals from it, reads each unit's top card
                  with you and loads sorties with their turn track and objectives. The library ships with one sample
                  of each kind from the rulebooks' worked examples; without your cards you can still enter the
                  priority numbers and card letters by hand.
              </p>

              <div className="icon-links">
                <Link to={`${process.env.PUBLIC_URL}/alpha-strike/aces/game`}>
                  <ChessKnight />
                  Game Tracker
                </Link>
                <Link to={`${process.env.PUBLIC_URL}/alpha-strike/aces/campaign`}>
                  <Medal />
                  Campaigns
                </Link>
                <Link to={`${process.env.PUBLIC_URL}/alpha-strike/aces/library`}>
                  <Cards />
                  Card Library
                </Link>
                <Link to={`${process.env.PUBLIC_URL}/alpha-strike/aces/rules`}>
                  <Book />
                  Rules Reference
                </Link>
              </div>

              {this.state.gameSummary ? (
                  <p>Game in progress: {this.state.gameSummary}.</p>
              ) : (
                  <p className="aces-muted">No game in progress. Open the Game Tracker to load an automated force from your Alpha Strike roster or favorites.</p>
              )}
              <p className="aces-muted">Saved campaigns: {this.state.campaignCount}</p>
           </TextSection>
          </div>
        </UIPage>
      );
    }
}

interface IAcesHomeProps {
  appGlobals: IAppGlobals;
}

interface IAcesHomeState {
    gameSummary: string;
    campaignCount: number;
}
