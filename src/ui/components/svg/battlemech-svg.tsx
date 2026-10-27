
import React, { type JSX } from 'react';
import { BattleMech, IGATOR } from '../../../classes/battlemech';
import { CONST_HIGHLIGHT_COLOR } from '../../../configVars';
import { editionHasPrices } from '../../../data/rules-editions';
import { breakLines } from '../../../utils/breakLines';
import BattleTechLogo from '../battletech-logo';
import { NOT_ENDORSED, TRADEMARK_NOTICE } from './record-sheet-svg-kit';
import { drawnBubble } from './armor-bubble-layouts';
import { renderStructureBubbles } from './armor-bubbles';
import BattleMechHeatEffectsBoxSVG from './battlemech-heat-effects-box-svg';
import BattledroidsMechRecordSheetSVG from './battledroids-mech-record-sheet-svg';
import BipedArmorCircles from './biped-armor-circles';
import BipedArmorDiagramSVG from './biped-armor-diagram';
import BipedDamageTransferDiagramSVG from './biped-damage-transfer-diagram-svg';
import BipedInternalStructureDiagramSVG from './biped-internal-structure-diagram-svg';
import BipedRearArmorDiagramSVG from './biped-rear-armor-diagram-svg';
import ComponentDamageSVG from './component-damage-svg';
import CritAllocationTableSVG from './crit-allocation-table-svg';
import DamageCircleSVG from './damage-circle-svg';
import DieSVG from './die-svg';
import HeatSinksSVG from './heat-sink-svg';
import HeatTrackSVG from './heat-track-svg';
import PilotHitTrackSVG from './pilot-hit-track-svg';
import QuadArmorCircles from './quad-armor-circles';
import QuadArmorDiagramSVG from './quad-armor-diagram-svg';
import QuadDamageTransferDiagramSVG from './quad-damage-transfer-diagram-svg';
import QuadInternalStructureDiagramSVG from './quad-internal-structure-damage-svg';
import QuadRearArmorDiagramSVG from './quad-rear-armor-diagram-svg';
import RecordSheetEquipmentTable from './record-sheet-equipment-table';
import RecordSheetGATORTable from './record-sheet-gator-table';
import RecordSheetGroupBoxSVG from './record-sheet-group-box-svg';
import ShieldDiagramSVG from './shield-diagram-svg';
import { BIPED_STRUCTURE_BUBBLES, QUAD_STRUCTURE_BUBBLES } from './structure-bubble-layouts';
import { rulesetsAttributionSvg } from '../rulesets-attribution';
import TakeDamageButtonSVG from './take-damage-button';
import TargetSelectSVG from './target-select-svg';
import TripodArmorCircles from './tripod-armor-circles';
import { TripodArmorDiagramSVG, TripodDamageTransferDiagramSVG, TripodInternalStructureDiagramSVG, TRIPOD_INTERNAL_CENTER_LEG_LAYOUT, tripodCenterLegBubbles } from './tripod-diagram-svg';

export default class BattleMechSVG extends React.Component<IBattleMechSVGProps, IBattleMechSVGState> {

    docWidth = 2000;
    docHeight = 2600;

    colorTan = "#fdfde3";

    armorBoxLeft = 1240
    armorBoxWidth = 745
    armorBoxTop = 10

    isBoxLeft = 1250;
    isBoxWidth =655;
    isBoxTop = 1250;

    isQuadCenterAdjust = 0;

    toggleISBubble = ( shortLoc: string, indexNumnber: number): void => {
		if( this.props.inPlay ) {
			this.props.mechData.toggleISBubble(shortLoc, indexNumnber);
            if( this.props.onChange ) {
                this.props.onChange( this.props.mechData );
            }
		}
    }

    toggleShieldBubble = ( uuid: string, index: number ): void => {
        if( this.props.inPlay ) {
            this.props.mechData.toggleShieldBubble( uuid, index );
            if( this.props.onChange ) {
                this.props.onChange( this.props.mechData );
            }
        }
    }

    render = (): JSX.Element => {
        const mech = this.props.mechData;
        // A Battledroids biped prints on the book's own droid record sheet; play mode keeps this sheet's trackers.
        if( !this.props.inPlay && mech.getRulesEdition() === "battledroids" && !mech.isQuad() && !mech.isTripod() && !mech.isLAM() && !mech.isQuadVee() ) {
            return <BattledroidsMechRecordSheetSVG mechData={mech} />;
        }
        // The footer band's notice lines; with Special Rulesets to credit (#324) they close up to make room on top.
        const rulesets = mech.getRulesets();
        const noticeY = rulesets.length > 0 ? [58, 36, 14] : [75, 45, 15];

        // Biped/LAM use the Biped anatomy; Tripod extends that base with a Center Leg overlay.
        // QuadVee correctly reuses the Quad diagram (same 4-leg, no-arm anatomy).
        const hasArms = !this.props.mechData.isQuad() && !this.props.mechData.isQuadVee();

        let bgColor = "rgb(255,255,255)";
        let strokeColor = "rgb(0,0,0)";
        // landscape: boolean = false;
        let inPlay: boolean = false;
        if( this.props.bgColor ) {
            bgColor = this.props.bgColor;
        }
        if( this.props.strokeColor ) {
            strokeColor = this.props.strokeColor;
        }
        // if( this.props.landscape ) {
        //     this.landscape = this.props.landscape;
        // }
        if( this.props.inPlay ) {
            inPlay = this.props.inPlay;
        }
        const modularArmorLabels = this.props.mechData.getModularArmorPacks()
            .filter(pack => pack.allocationLocation && pack.allocationLocation !== "un")
            .map(pack => `${pack.allocationLocation!.toUpperCase()}${pack.rear ? "(R)" : ""} ${this.props.mechData.getModularArmorCurrentPoints(pack)}/10`);
        const modularArmorLines = Array.from(
            { length: Math.ceil(modularArmorLabels.length / 4) },
            (_, index) => modularArmorLabels.slice(index * 4, index * 4 + 4).join("   ")
        );

        const currentPhaseGroupColor = "#00a";

        const generalDataBoxX = 10;
        const generalDataBoxY = 10;

        const pilotBoxX = 725;
        const pilotBoxY = 160;

        const eraString = this.props.mechData.getEra().name;
        const eraArray = eraString.split("(");
        let eraLine1 = eraArray[0];
        let eraLine2 = "";
        if( eraArray[1] ) {
            eraLine2 = eraArray[1];
            eraLine2 = eraLine2.replace(")", "");
            eraLine2 = eraLine2.replace("(", "");
        }
        eraLine1 = eraLine1.trim();
        eraLine2 = eraLine2.trim();

        let battleValue = this.props.mechData.getBattleValue().toString();
        const adjustedBattleValue = this.props.mechData.getPilotAdjustedBattleValue().toString();
        let battleValueLabel = "BattleValue (BV2)"
        if( battleValue !== adjustedBattleValue ) {
            battleValueLabel = "Adjusted / Base BV (BV2)"
            battleValue = "with pilot: " + adjustedBattleValue + " / base: " + battleValue + "";
        }

        const critBoxTop = 1250;
        const critBoxLeft = 10;
        const critBoxWidth = 1225;
        const damageTransferWidth = 150;

        const critCol1Start = 125;
        const critCol2Start = 513;
        const critCol3Start = 925;

        let currentMoveColor = "white";
        let currentMoveBackground = "#009";

        if( this.props.mechData.currentMovementMode === "n" ) {
            currentMoveBackground = CONST_HIGHLIGHT_COLOR;
            currentMoveColor = "white";
          }

        if( this.props.mechData.currentMovementMode === "w" ) {
            currentMoveColor = "black";
            currentMoveBackground = "white";
        }

        if( this.props.mechData.currentMovementMode === "r" ) {
            currentMoveColor = "white";
            currentMoveBackground = "black";
        }

        if( this.props.mechData.currentMovementMode === "j" ) {
            currentMoveColor = "white";
            currentMoveBackground = "red";
        }

        return (
        <>
        <svg
            version="1.1"
            x={0}
            y={0}
            viewBox={"0 0 " + this.docWidth  + " " + this.docHeight }
            xmlns="http://www.w3.org/2000/svg"
        >
            <g>

                <rect
                    x={0}
                    y={0}
                    width={this.docWidth}
                    height={this.docHeight}
                    fill={bgColor}
                />

                <RecordSheetGroupBoxSVG
                    width={700}
                    height={400}
                    xLoc={generalDataBoxX}
                    yLoc={generalDataBoxY}
                    title="'Mech Data"
                    bgColor={bgColor}
                    strokeColor={strokeColor}
                >
                    <text
                        x={10 + generalDataBoxX}
                        y={80 + generalDataBoxY}
                        textAnchor="start"
                        fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 700}}
                        fontSize={30}
                    >
                        Type:
                    </text>

                    <text
                        x={10 + generalDataBoxX}
                        y={120 + generalDataBoxY}
                        textAnchor="start"
                        fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 500}}
                        fontSize={35}
                    >
                        {this.props.mechData.getName()}
                    </text>

                    {/* // Movement */}
                    <text
                        x={generalDataBoxX + 15}
                        y={generalDataBoxY + 160}
                        textAnchor="start"
                        fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 700}}
                        fontSize={30}
                    >
                        Movement Points
                    </text>

                    {/* // Walk */}
                    <text
                        x={generalDataBoxX + 220}
                        y={generalDataBoxY + 210}
                        textAnchor="end"
                        fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 700}}
                        fontSize={30}
                    >
                        Walking:
                    </text>
                    <text
                        x={generalDataBoxX + 240}
                        y={generalDataBoxY + 210}
                        textAnchor="start" fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 500}}
                        fontSize={30}
                    >
                        {this.props.mechData.getWalkSpeed()}
                    </text>
                    <DieSVG
                        posY={ generalDataBoxY + 210 - 25}
                        posX={generalDataBoxX + 20}
                        strokeColor="#000000"
                        bgColor="#ffffff"
                        pipColor="#000000"
                        width={30}
                        numberPips={1}
                    />

                    {/* // Run */}
                    <text
                        x={generalDataBoxX + 220}
                        y={generalDataBoxY + 245}
                        textAnchor="end" fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 700}}
                        fontSize={30}
                    >
                        Running
                    </text>
                    <text
                    x={generalDataBoxX + 240}
                    y={generalDataBoxY + 245}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 500}}
                    fontSize={30}
                    >
                        {this.props.mechData.getRunSpeed()}
                    </text>

                    <DieSVG
                        posY={ generalDataBoxY + 245 - 25}
                        posX={generalDataBoxX + 20}
                        strokeColor="#000000"
                        bgColor="#000000"
                        pipColor="#ffffff"
                        width={30}
                        numberPips={2}
                    />
                    {/* // Jump */}
                    <text
                        x={generalDataBoxX + 220}
                        y={generalDataBoxY + 280}
                        textAnchor="end"
                        fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 700}}
                        fontSize={30}
                    >
                        Jumping
                    </text>
                    <text
                        x={generalDataBoxX + 240}
                        y={generalDataBoxY + 280}
                        textAnchor="start"
                        fontFamily="sans-serif"
                        fill={strokeColor}
                        style={{fontWeight: 500}}
                        fontSize={30}
                    >
                        {this.props.mechData.getJumpSpeed()}
                    </text>

                    <DieSVG
                        posY={ generalDataBoxY + 280 - 25}
                        posX={generalDataBoxX + 20}
                        strokeColor="#cc0000"
                        bgColor="#cc0000"
                        pipColor="#ffffff"
                        width={30}
                        numberPips={3}
                    />

                {/* // Tonnage */}
                <text
                    x={generalDataBoxX + 340}
                    y={generalDataBoxY + 160}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 700}}
                    fontSize={25}>
                    Tonnage:
                </text>
                <text
                    x={generalDataBoxX + 665}
                    y={generalDataBoxY + 160}
                    textAnchor="end"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 500}}
                    fontSize={25}
                    >
                        {this.props.mechData.getTonnage()}
                    </text>

                {/* Tech Base */}
                <text
                    x={generalDataBoxX + 340}
                    y={generalDataBoxY + 205}
                    textAnchor="start" fontFamily="sans-serif"
                    fill={strokeColor} style={{fontWeight: 700}}
                    fontSize={25}
                >
                    Tech Base:
                </text>
                <text
                    x={generalDataBoxX + 665}
                    y={generalDataBoxY + 225}
                    textAnchor="end" fontFamily="sans-serif"
                    fill={strokeColor} style={{fontWeight: 500}}
                    fontSize={this.props.mechData.isFrankenMech() ? 18 : 25}
                >
                    {/* The XTROs name a FrankenMech beside its tech base ("Mixed Tech (Experimental - FrankenMech)"). */}
                    {this.props.mechData.getTech().name}{this.props.mechData.isFrankenMech() ? " (FrankenMech)" : ""}
                </text>

                <text

                    x={generalDataBoxX + 340}
                    y={generalDataBoxY + 255}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 700}}
                    fontSize={25}
                >
                    Era:
                </text>

                <text
                    x={generalDataBoxX + 665}
                    y={generalDataBoxY + 280}
                    textAnchor="end"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 500}}
                    fontSize={20}
                >{eraLine1}</text>
                <text
                    x={generalDataBoxX + 665}
                    y={generalDataBoxY + 300}
                    textAnchor="end"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 500}}
                    fontSize={20}
                >{eraLine2}</text>

                {/* // Cost */}
                <text
                    x={generalDataBoxX + 15}
                    y={generalDataBoxY + 350}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 700}}
                    fontSize={30}
                    >
                        Cost (CBills)
                    </text>
                <text
                    x={generalDataBoxX + 15}
                    y={generalDataBoxY + 380}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 500}}
                    fontSize={25  }
                >
                    {editionHasPrices(this.props.mechData.getRulesEdition()) ? this.props.mechData.getCBillCost() : "Not in this edition"}
                </text>
	            {/* // BV */}
                <text
                    x={generalDataBoxX + 270}
                    y={generalDataBoxY + 350}
                    textAnchor="start"
                    fontFamily="sans-serif"
                    fill={strokeColor}
                    style={{fontWeight: 700}}
                    fontSize={30}
                >
                    {battleValueLabel}
                </text>

            <text
                x={generalDataBoxX + 270}
                y={generalDataBoxY + 380}
                textAnchor="start"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 500}}
                fontSize={25}
            >
                {battleValue}
            </text>

                </RecordSheetGroupBoxSVG>

    <text
        x={this.docWidth / 2 - 25}
        y={80}
        textAnchor="middle"
        fontFamily="sans-serif"
        fill={strokeColor}
        style={{fontWeight: 700}}
        fontSize={65}
    >
        BATTLEMECH
    </text>
    <text
        x={this.docWidth / 2 - 25}
        y={120}
        textAnchor="middle"
        fontFamily="sans-serif"
        fill={strokeColor}
        style={{fontWeight: 700}}
        fontSize={35}
    >
        Record Sheet
    </text>

    <RecordSheetGroupBoxSVG
        width={500}
        height={250}
        xLoc={pilotBoxX}
        yLoc={pilotBoxY}
        title="Warrior Data"
        bgColor={bgColor}
        strokeColor={strokeColor}
    >
        	{/* // Name/Type */}
            <text
                x={pilotBoxX + 10}
                y={pilotBoxY + 80}
                textAnchor="start"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 500}}
                fontSize={25}
            >
                {this.props.mechData.getPilot().name}
            </text>

	{/* Piloting */}
            <text
                x={pilotBoxX + 450}
                y={pilotBoxY + 120}
                textAnchor="end"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 500}}
                fontSize={35}
            >
                Piloting: {this.props.mechData.getPilot().piloting}
            </text>

	        {/* Gunnery */}
            <text
                x={pilotBoxX + 450}
                y={pilotBoxY + 160}
                textAnchor="end"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 500}}
                fontSize={35}
            >
                Gunnery: {this.props.mechData.getPilot().gunnery}
            </text>

            <PilotHitTrackSVG
                width={500}
                height={250}
                xLoc={pilotBoxX + 100}
                yLoc={pilotBoxY + 200}
                bgColor={bgColor}
                strokeColor={strokeColor}
                pilot={this.props.mechData.getPilot()}
            />

    </RecordSheetGroupBoxSVG>

    <RecordSheetEquipmentTable
        width={1215}
        height={645}
        xLoc={10}
        yLoc={440}
        bgColor={bgColor}
        mechData={this.props.mechData}
        inPlay={this.props.inPlay}
        quirksInPlay={this.props.quirksInPlay}
        onChange={this.props.onChange}
        viewGATOR={this.props.viewGATOR}
        boxStrokeColor={this.props.currentPhase === 2 ? currentPhaseGroupColor : undefined}
        openSetTargetDialog={this.props.openSetTargetDialog}
    />

    {this.props.inPlay ? (
        <>
        <RecordSheetGroupBoxSVG
            title="Movement"

            width={400}
            height={99}
            xLoc={10}
            bgColor={bgColor}
            yLoc={1113}
            onClick={this.props.openSetMovementDialog}
            strokeColor={this.props.currentPhase === 1 ? currentPhaseGroupColor : undefined}
        >
            <svg
                x={10}
                y={1150}
                width={400}
                height={80}
                onClick={this.props.openSetMovementDialog}
                className="cursor-pointer"
            >
                {this.props.inPlay && this.props.openSetMovementDialog ? (
                    <svg
                        onClick={this.props.openSetMovementDialog}
                        className="cursor-pointer"
                    >
                    {this.props.mechData.currentMovementMode ? (
                        <DieSVG
                            posX={ 10 }
                            posY={ 10}
                            width={60}
                            bgColor={currentMoveBackground}
                            pipColor={currentMoveColor}
                            numberPips={this.props.mechData.getMovementToHitModifier()}
                            numericPips={true}
                        />
                    ) : (
                        <DieSVG
                            posX={ 10 }
                            posY={ 10}
                            width={60}
                            bgColor={"#009"}
                            pipColor={"#fff"}
                            numberPips={0}
                            numericPips={true}

                        />
                    )}

                        <text
                            x={ 80 }
                            y={ 35 }
                            width={60}
                            fontSize={30}
                            className="cursor-pointer"
                            onClick={this.props.openSetMovementDialog}
                        >
                            {this.props.mechData.getMovementText()}
                        </text>
                        <text
                            x={ 80 }
                            y={ 65 }
                            width={60}
                            fontSize={20}
                            className="cursor-pointer"

                            onClick={this.props.openSetMovementDialog}
                        >
                            {this.props.mechData.getMovementToHitText()}
                        </text>

                    </svg>
                ) : (
                    <>
                <line
                    x1={ 250 }
                    x2={ 350 }
                    y1={ 110}
                    y2={ 110}
                    strokeWidth={2}
                    stroke={strokeColor}
                />
                </>
                )}
            </svg>
        </RecordSheetGroupBoxSVG>
        <RecordSheetGroupBoxSVG
            title="Target Selection"
            bgColor={bgColor}
            width={800}
            height={99}
            xLoc={425}
            yLoc={1113}
            onClick={() => { if( this.props.openSetTargetDialog ) {this.props.openSetTargetDialog( this.props.mechData) }  } }
            strokeColor={this.props.currentPhase === 2 ? currentPhaseGroupColor : undefined}
        >
            <svg
                x={425}
                y={1150}
                width={800}
                height={80}
                onClick={() => { if( this.props.openSetTargetDialog ) {this.props.openSetTargetDialog( this.props.mechData) }  } }
            >
                <TargetSelectSVG
                    x={0}
                    y={0}
                    width={800}
                    height={75}
                    mechData={this.props.mechData}
                    target={"a"}
                    onClick={this.props.openSetTargetDialog }
                />
                <TargetSelectSVG
                    x={0}
                    y={40}
                    width={800}
                    height={75}
                    mechData={this.props.mechData}
                    target={"b"}
                    onClick={this.props.openSetTargetDialog }
                />
                <TargetSelectSVG
                    x={400}
                    y={0}
                    width={800}
                    height={75}
                    mechData={this.props.mechData}
                    target={"c"}
                    onClick={this.props.openSetTargetDialog }
                />
                <text
                    x={600}
                    y={78}
                    textAnchor="middle"
                    fontSize="15"
                    onClick={() => { if( this.props.openSetTargetDialog ) {this.props.openSetTargetDialog( this.props.mechData) }  } }
                >
                    Click to bring up target selection
                </text>
            </svg>
        </RecordSheetGroupBoxSVG>
        </>
    ) : (
        <RecordSheetGATORTable
            width={1215}
            height={99}
            xLoc={10}
            yLoc={1113}
            mechData={this.props.mechData}
            inPlay={this.props.inPlay}
            openSetMovementDialog={this.props.openSetMovementDialog}
        />

    )
    }

    <RecordSheetGroupBoxSVG
        width={this.armorBoxWidth}
        height={1200}
        xLoc={this.armorBoxLeft}
        yLoc={this.armorBoxTop}
        title="Armor Diagram"
        bgColor={bgColor}
        strokeColor={this.props.currentPhase === 2 ? currentPhaseGroupColor : undefined}
    >
    {hasArms ? (
        <>
            {this.props.mechData.isTripod() ? (
                <TripodArmorDiagramSVG xLoc={1263} yLoc={-10} width={700} bgColor={bgColor} />
            ) : (
                <BipedArmorDiagramSVG xLoc={1263} yLoc={-10} width={700} bgColor={bgColor} />
            )}

            {/* A Tripod's rear armor is the Biped's: the Center Leg has none. */}
            <BipedRearArmorDiagramSVG xLoc={1413} yLoc={875} width={400} bgColor={bgColor} />

            {/* Each arm's shield beside the arm, as the Gundam RX-78-2 sheet draws it (TO:AUE p.103). */}
            {this.props.mechData.getShields().filter(shield => shield.location === "la" || shield.location === "ra").map(shield => (
                <ShieldDiagramSVG
                    key={shield.item.uuid}
                    shield={shield}
                    xLoc={shield.location === "la" ? this.armorBoxLeft + 6 : this.armorBoxLeft + this.armorBoxWidth - 52}
                    yLoc={140}
                    side={shield.location === "la" ? "left" : "right"}
                    strokeColor={strokeColor}
                    inPlay={inPlay}
                    onToggle={this.toggleShieldBubble}
                />
            ))}

        {/* Main Armor Labels */}
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2} y={this.armorBoxTop + 70} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>HEAD [{this.props.mechData.getArmorAllocation().head }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 55} y={this.armorBoxTop + 95} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 85} y={this.armorBoxTop + 115} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>[{this.props.mechData.getArmorAllocation().leftTorso }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 55} y={this.armorBoxTop + 95} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 85} y={this.armorBoxTop + 115} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>[{this.props.mechData.getArmorAllocation().rightTorso }]</text>

		<text x={this.armorBoxLeft +  20} y={this.armorBoxTop + 620} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT</text>
		<text x={this.armorBoxLeft +  20} y={this.armorBoxTop + 640} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>ARM [{this.props.mechData.getArmorAllocation().leftArm }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth - 40} y={this.armorBoxTop + 620} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth - 40} y={this.armorBoxTop + 640} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>ARM [{this.props.mechData.getArmorAllocation().rightArm }]</text>

		<text x={this.armorBoxLeft +  20} y={this.armorBoxTop + 890} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT</text>
		<text x={this.armorBoxLeft +  20} y={this.armorBoxTop + 910} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEG [{this.props.mechData.getArmorAllocation().leftLeg }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth - 20} y={this.armorBoxTop + 890} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth - 20} y={this.armorBoxTop + 910} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEG [{this.props.mechData.getArmorAllocation().rightLeg }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2  } y={this.armorBoxTop + 600} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>CENTER</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 } y={this.armorBoxTop + 620} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 } y={this.armorBoxTop + 640} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>[{this.props.mechData.getArmorAllocation().centerTorso }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 } y={this.armorBoxTop + 1215} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>CENTER TORSO (REAR) [{this.props.mechData.getArmorAllocation().centerTorsoRear }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 190} y={this.armorBoxTop + 1090} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 190} y={this.armorBoxTop + 1110} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>(REAR) [{this.props.mechData.getArmorAllocation().leftTorsoRear }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 190} y={this.armorBoxTop + 1090} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 190} y={this.armorBoxTop + 1110} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>(REAR) [{this.props.mechData.getArmorAllocation().rightTorsoRear }]</text>
            {this.props.mechData.isTripod() ? (
                <TripodArmorCircles
                    armorBoxLeft={this.armorBoxLeft}
                    armorBoxWidth={this.armorBoxWidth}
                    armorBoxTop={this.armorBoxTop}
                    inPlay={this.props.inPlay}
                    mechData={this.props.mechData}
                    onChange={this.props.onChange}
                    openTakeDamageDialog={this.props.openTakeDamageDialog}
                    bgColor={bgColor}
                    strokeColor={strokeColor}
                    currentPhase={this.props.currentPhase}
                />
            ) : (
                <BipedArmorCircles
                    armorBoxLeft={this.armorBoxLeft}
                    armorBoxWidth={this.armorBoxWidth}
                    armorBoxTop={this.armorBoxTop}
                    inPlay={this.props.inPlay}
                    mechData={this.props.mechData}
                    onChange={this.props.onChange}
                    openTakeDamageDialog={this.props.openTakeDamageDialog}
                    bgColor={bgColor}
                    currentPhase={this.props.currentPhase}
                />
            )}
        </>
    ) : (
        <>

            <QuadArmorDiagramSVG
                xLoc={this.armorBoxLeft + 55}
                yLoc={this.armorBoxTop + 50}
                width={640}
                bgColor={bgColor}
            />

            <QuadRearArmorDiagramSVG
                xLoc={this.armorBoxLeft + 170}
                yLoc={this.armorBoxTop + 970}
                width={400}
                bgColor={bgColor}
            />

        {/* // Main Armor Labels */}
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 } y={this.armorBoxTop + 125} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>HEAD [{ this.props.mechData.getArmorAllocation().head }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 95} y={this.armorBoxTop + 105} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 125 } y={this.armorBoxTop + 125} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>[{ this.props.mechData.getArmorAllocation().leftTorso }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 95 } y={this.armorBoxTop + 105} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 125 } y={this.armorBoxTop + 125} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>[{ this.props.mechData.getArmorAllocation().rightTorso }]</text>

		<text x={this.armorBoxLeft +  this.armorBoxWidth / 2 - 280 } y={this.armorBoxTop + 970} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>FRONT</text>
		<text x={this.armorBoxLeft +  this.armorBoxWidth / 2 - 280 } y={this.armorBoxTop + 990} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT</text>
		<text x={this.armorBoxLeft +  this.armorBoxWidth / 2 - 280 } y={this.armorBoxTop + 1010} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEG [{ this.props.mechData.getArmorAllocation().frontLeftLeg }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 280 } y={this.armorBoxTop + 970} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>FRONT</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 280 } y={this.armorBoxTop + 990} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 280 } y={this.armorBoxTop + 1010} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEG [{ this.props.mechData.getArmorAllocation().frontRightLeg }]</text>

		<text x={this.armorBoxLeft +  this.armorBoxWidth / 2 - 110 } y={this.armorBoxTop + 935} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>REAR</text>
		<text x={this.armorBoxLeft +  this.armorBoxWidth / 2 - 110 } y={this.armorBoxTop + 955} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT</text>
		<text x={this.armorBoxLeft +  this.armorBoxWidth / 2 - 110 } y={this.armorBoxTop + 975} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEG [{ this.props.mechData.getArmorAllocation().leftLeg }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 110 } y={this.armorBoxTop + 935} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>REAR</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 110 } y={this.armorBoxTop + 955} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 110 } y={this.armorBoxTop + 975} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEG [{ this.props.mechData.getArmorAllocation().rightLeg }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 10  } y={this.armorBoxTop + 600} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={17}>CENTER</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 10  } y={this.armorBoxTop + 620} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={17}>TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 10  } y={this.armorBoxTop + 640} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={17}>[{ this.props.mechData.getArmorAllocation().centerTorso }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2  } y={this.armorBoxTop + 1210} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>CENTER TORSO (REAR) [{ this.props.mechData.getArmorAllocation().centerTorsoRear }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 190 } y={this.armorBoxTop + 1090} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>LEFT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 - 190 } y={this.armorBoxTop + 1110} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>(REAR) [{ this.props.mechData.getArmorAllocation().leftTorsoRear }]</text>

		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 190 } y={this.armorBoxTop + 1090} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>RIGHT TORSO</text>
		<text x={this.armorBoxLeft + this.armorBoxWidth / 2 + 190 } y={this.armorBoxTop + 1110} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={20}>(REAR) [{ this.props.mechData.getArmorAllocation().rightTorsoRear }]</text>

            <QuadArmorCircles
                armorBoxLeft={this.armorBoxLeft}
                armorBoxWidth={this.armorBoxWidth}
                armorBoxTop={this.armorBoxTop}
                inPlay={this.props.inPlay}
                mechData={this.props.mechData}
                onChange={this.props.onChange}
                bgColor={bgColor}
                openTakeDamageDialog={this.props.openTakeDamageDialog}
                currentPhase={this.props.currentPhase}
            />
        </>
    )}
    {modularArmorLines.map((line, index) => (
        <text
            key={`modular-armor-${index}`}
            x={this.armorBoxLeft + this.armorBoxWidth / 2}
            y={this.armorBoxTop + 1145 + index * 20}
            textAnchor="middle"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={16}
        >
            {index === 0 ? "MODULAR ARMOR: " : ""}{line}
        </text>
    ))}
    </RecordSheetGroupBoxSVG>

    <RecordSheetGroupBoxSVG
        width={this.isBoxWidth}
        height={600}
        bgColor={bgColor}
        xLoc={this.isBoxLeft}
        yLoc={this.isBoxTop}
        title="Internal Structure"
        strokeColor={this.props.currentPhase === 2 ? currentPhaseGroupColor : undefined}
    >
    {hasArms ? (
        <>
            {this.props.mechData.isTripod() ? (
                <TripodInternalStructureDiagramSVG xLoc={1350} yLoc={1275} width={420} />
            ) : (
                <BipedInternalStructureDiagramSVG xLoc={1350} yLoc={1275} width={420} />
            )}

        {/* // Main Structure Labels */}
		<text x={this.isBoxLeft + this.isBoxWidth / 2} y={this.isBoxTop + 55} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>HEAD [{this.props.mechData.getInternalStructure().head }]</text>

		<text x={this.isBoxLeft + this.isBoxWidth / 2 - 65} y={this.isBoxTop + 85} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEFT TORSO</text>
		<text x={this.isBoxLeft + this.isBoxWidth / 2 - 65} y={this.isBoxTop + 105} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>[{this.props.mechData.getInternalStructure().leftTorso }]</text>

		<text x={this.isBoxLeft + this.isBoxWidth / 2 + 65} y={this.isBoxTop + 85} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>RIGHT TORSO</text>
		<text x={this.isBoxLeft + this.isBoxWidth / 2 + 65} y={this.isBoxTop + 105} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>[{this.props.mechData.getInternalStructure().rightTorso }]</text>

		<text x={this.isBoxLeft +  this.isBoxWidth / 2 - 200} y={this.isBoxTop + 310} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEFT</text>
		<text x={this.isBoxLeft +  this.isBoxWidth / 2 - 200} y={this.isBoxTop + 330} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>ARM [{this.props.mechData.getInternalStructure().leftArm }]</text>

		<text x={this.isBoxLeft + this.isBoxWidth / 2 + 200} y={this.isBoxTop + 310} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>RIGHT</text>
		<text x={this.isBoxLeft + this.isBoxWidth / 2 + 200} y={this.isBoxTop + 330} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>ARM [{this.props.mechData.getInternalStructure().rightArm }]</text>

		<text x={this.isBoxLeft +  this.isBoxWidth / 2 - 150} y={this.isBoxTop + 570} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEFT</text>
		<text x={this.isBoxLeft +  this.isBoxWidth / 2 - 150} y={this.isBoxTop + 590} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEG [{this.props.mechData.getInternalStructure().leftLeg }]</text>

		<text x={this.isBoxLeft + this.isBoxWidth / 2 + 150} y={this.isBoxTop + 570} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>RIGHT</text>
		<text x={this.isBoxLeft + this.isBoxWidth / 2 + 150} y={this.isBoxTop + 590} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEG [{this.props.mechData.getInternalStructure().rightLeg }]</text>

		<text x={this.isBoxLeft + this.isBoxWidth / 2 } y={this.isBoxTop + 400} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>CENTER</text>
		<text x={this.isBoxLeft + this.isBoxWidth / 2 } y={this.isBoxTop + 420} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>TORSO</text>
		<text x={this.isBoxLeft + this.isBoxWidth / 2 } y={this.isBoxTop + 440} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>[{this.props.mechData.getInternalStructure().centerTorso }]</text>

        {renderStructureBubbles( BIPED_STRUCTURE_BUBBLES, {
            mechData: this.props.mechData,
            inPlay: this.props.inPlay,
            isBoxTop: this.isBoxTop,
            isBoxLeft: this.isBoxLeft,
            isBoxWidth: this.isBoxWidth,
            onClick: this.toggleISBubble,
        })}

        {this.props.mechData.isTripod() ? (
            // The Center Leg's structure, inside the leg TripodInternalStructureDiagramSVG draws (issue 77).
            <>
                <text x={this.isBoxLeft + this.isBoxWidth / 2} y={this.isBoxTop + TRIPOD_INTERNAL_CENTER_LEG_LAYOUT.labelY} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={11}>CTR LEG</text>
                <text x={this.isBoxLeft + this.isBoxWidth / 2} y={this.isBoxTop + TRIPOD_INTERNAL_CENTER_LEG_LAYOUT.labelY + 13} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={11}>[{this.props.mechData.getInternalStructure().centerLeg ?? 0}]</text>
                {tripodCenterLegBubbles(this.props.mechData.getInternalStructure().centerLeg ?? 0, TRIPOD_INTERNAL_CENTER_LEG_LAYOUT).map((position, index) => {
                    return (
                        <DamageCircleSVG
                            key={`cl-${index}`}
                            isFilled={this.props.mechData.structureDamaged("cl", index)}
                            xLoc={this.isBoxLeft + this.isBoxWidth / 2 + position.x}
                            yLoc={this.isBoxTop + TRIPOD_INTERNAL_CENTER_LEG_LAYOUT.firstRowY + position.y}
                            {...drawnBubble(position.radius)}
                            inPlay={this.props.inPlay}
                            clickLocation="cl"
                            clickIndex={index}
                            clickFunction={this.toggleISBubble}
                        />
                    );
                })}
            </>
        ) : null}

        {this.props.inPlay && (this.props.currentPhase === 2 ||  this.props.currentPhase === 3) ?
            // A Tripod's Center Leg fills the gap between the legs, so its button goes on the left.
            <TakeDamageButtonSVG
                x={this.props.mechData.isTripod() ? this.isBoxLeft + 20 : this.isBoxLeft + this.isBoxWidth / 2 - 50}
                y={this.props.mechData.isTripod() ? this.isBoxTop + 420 : this.isBoxTop + 500}
                height={100}
                width={100}
                onClick={this.props.openTakeDamageDialog}
            />
        : null}
        </>
    ) : (
        <>
            <QuadInternalStructureDiagramSVG
                xLoc={1386}
                yLoc={1295}
                width={380}
            />

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 } y={this.isBoxTop + 60} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>HEAD [{ this.props.mechData.getInternalStructure().head }]</text>

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 - 65 - 115} y={this.isBoxTop + 105} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEFT TORSO</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 - 95 - 115 } y={this.isBoxTop + 125} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>[{ this.props.mechData.getInternalStructure().leftTorso }]</text>

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 65 + 115 } y={this.isBoxTop + 105} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>RIGHT TORSO</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 95 + 115 } y={this.isBoxTop + 125} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>[{ this.props.mechData.getInternalStructure().rightTorso }]</text>

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust +  this.isBoxWidth / 2 - 280 } y={this.isBoxTop + 540} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>FRONT</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust +  this.isBoxWidth / 2 - 280 } y={this.isBoxTop + 560} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEFT</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust +  this.isBoxWidth / 2 - 280 } y={this.isBoxTop + 580} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEG [{ this.props.mechData.getInternalStructure().frontLeftLeg }]</text>

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 280 } y={this.isBoxTop + 540} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>FRONT</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 280 } y={this.isBoxTop + 560} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>RIGHT</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 280 } y={this.isBoxTop + 580} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEG [{ this.props.mechData.getInternalStructure().frontRightLeg }]</text>

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust +  this.isBoxWidth / 2 - 80 } y={this.isBoxTop + 570} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>REAR</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust +  this.isBoxWidth / 2 - 80 } y={this.isBoxTop + 590} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEFT</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust +  this.isBoxWidth / 2 - 80 } y={this.isBoxTop + 610} textAnchor="start" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEG [{ this.props.mechData.getInternalStructure().leftLeg }]</text>

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 80 } y={this.isBoxTop + 570} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>REAR</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 80 } y={this.isBoxTop + 590} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>RIGHT</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2 + 80 } y={this.isBoxTop + 610} textAnchor="end" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={15}>LEG [{ this.props.mechData.getInternalStructure().rightLeg }]</text>

            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2  } y={this.isBoxTop + 360} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={13}>CENTER</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2  } y={this.isBoxTop + 380} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={13}>TORSO</text>
            <text x={ this.isBoxLeft + this.isQuadCenterAdjust + this.isBoxWidth / 2  } y={this.isBoxTop + 400} textAnchor="middle" fontFamily="sans-serif" fill={strokeColor} style={{fontWeight: 700}} fontSize={13}>[{ this.props.mechData.getInternalStructure().centerTorso }]</text>

            {renderStructureBubbles( QUAD_STRUCTURE_BUBBLES, {
                mechData: this.props.mechData,
                inPlay: this.props.inPlay,
                isBoxTop: this.isBoxTop,
                isBoxLeft: this.isBoxLeft,
                isBoxWidth: this.isBoxWidth,
                onClick: this.toggleISBubble,
            })}

{this.props.inPlay && (this.props.currentPhase === 2 ||  this.props.currentPhase === 3 ) ?
        <TakeDamageButtonSVG
            x={this.isBoxLeft + 25}
            y={this.isBoxTop + 250}
            height={125}
            width={125}
            onClick={this.props.openTakeDamageDialog}
        />
: null}
        </>
    )}
    </RecordSheetGroupBoxSVG>

    <RecordSheetGroupBoxSVG
        width={critBoxWidth}
        height={1215}
        xLoc={critBoxLeft}
        yLoc={critBoxTop}
        bgColor={bgColor}
        title="Critical Hit Table"
        strokeColor={this.props.currentPhase === 2 ? currentPhaseGroupColor : undefined}
    >

{/* // Left Arm */}
        <text
            x={critBoxLeft + critCol1Start}
            y={critBoxTop + 100}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30}
        >
            {hasArms ? (
                <>LEFT ARM</>
            ) : (
                <>LEFT FRONT LEG</>
            )}
        </text>

        <CritAllocationTableSVG
            strokeColor={strokeColor}
            critData={hasArms ? this.props.mechData.getCriticals().leftArm : this.props.mechData.getCriticals().frontLeftLeg}
            inPlay={inPlay}
            mechData={this.props.mechData}
            xLoc={critBoxLeft + critCol1Start}
            yLoc={critBoxTop + 140}
            location="la"
        />
	{/* // Head */}
        <text
            x={critBoxLeft + critCol2Start}
            y={(critBoxTop + 100)}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30}
        >
                HEAD
        </text>
        <CritAllocationTableSVG
            strokeColor={strokeColor}
            critData={this.props.mechData.getCriticals().head}
            inPlay={inPlay}
            mechData={this.props.mechData}
            xLoc={critBoxLeft + critCol2Start}
            yLoc={critBoxTop + 140}
            location="hd"
        />

        <text
            x={critBoxLeft + critCol3Start}
            y={critBoxTop + 100}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30}
        >
            {hasArms ? (
                <>RIGHT ARM</>
            ) : (
                <>RIGHT FRONT LEG</>
            )}
        </text>
        <CritAllocationTableSVG
            strokeColor={strokeColor}
            mechData={this.props.mechData}
            critData={hasArms ? this.props.mechData.getCriticals().rightArm : this.props.mechData.getCriticals().frontRightLeg}
            inPlay={inPlay}
            xLoc={critBoxLeft + critCol3Start}
            yLoc={critBoxTop + 140}
            location="ra"
        />

        <text
            x={critBoxLeft + critCol1Start}
            y={critBoxTop + 550}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30
        }>
            LEFT TORSO
        </text>
        <CritAllocationTableSVG
            strokeColor={strokeColor}
            mechData={this.props.mechData}
            critData={this.props.mechData.getCriticals().leftTorso}
            inPlay={inPlay}
            xLoc={critBoxLeft + critCol1Start}
            yLoc={critBoxTop + 575}
            location="lt"

        />

	{/* // Center Torso */}
        <text
            x={critBoxLeft + critCol2Start}
            y={critBoxTop + 350}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30}
        >
            CENTER TORSO
        </text>
        <CritAllocationTableSVG
            strokeColor={strokeColor}
            critData={this.props.mechData.getCriticals().centerTorso}
            inPlay={inPlay}
            mechData={this.props.mechData}
            xLoc={critBoxLeft + critCol2Start}
            yLoc={critBoxTop + 375}
            location="ct"

        />

	{/* // Right Torso */}
        <text
            x={critBoxLeft + critCol3Start}
            y={critBoxTop + 550}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30}
        >
            RIGHT TORSO
        </text>

        <CritAllocationTableSVG
            strokeColor={strokeColor}
            critData={this.props.mechData.getCriticals().rightTorso}
            inPlay={inPlay}
            mechData={this.props.mechData}
            xLoc={critBoxLeft + critCol3Start}
            yLoc={critBoxTop + 575}
            location="rt"
        />

	{/* // Left Leg */}
        <text
            x={critBoxLeft + critCol1Start}
            y={critBoxTop + 1010}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30}
        >
            {hasArms ? (
                <>LEFT LEG</>
            ) : (
                <>LEFT REAR LEG</>
            )}
        </text>

        <CritAllocationTableSVG
            strokeColor={strokeColor}
            mechData={this.props.mechData}
            critData={this.props.mechData.getCriticals().leftLeg}
            inPlay={inPlay}
            xLoc={critBoxLeft + critCol1Start}
            yLoc={critBoxTop + 1050}
            location="ll"
        />
        {/* // Right Leg */}
        <text
            x={critBoxLeft + critCol3Start}
            y={critBoxTop + 1010}
            textAnchor="start"
            fontFamily="sans-serif"
            fill={strokeColor}
            style={{fontWeight: 700}}
            fontSize={30}
        >
            {hasArms ? (
                <>RIGHT LEG</>
            ) : (
                <>RIGHT REAR LEG</>
            )}
        </text>
        <CritAllocationTableSVG
            strokeColor={strokeColor}
            critData={this.props.mechData.getCriticals().rightLeg}
            mechData={this.props.mechData}
            inPlay={inPlay}
            xLoc={critBoxLeft + critCol3Start}
            yLoc={critBoxTop + 1050}
            location="rl"
        />

        <ComponentDamageSVG
            xLoc={critBoxWidth / 3 }
            yLoc={critBoxTop + 750}
            mechData={this.props.mechData}
            width={critBoxWidth / 3}
            height={190}
            strokeColor={strokeColor}
            inPlay={this.props.inPlay}
        />

    {hasArms ? (
        <>
            {this.props.mechData.isTripod() ? (
                <TripodDamageTransferDiagramSVG
                    xLoc={critBoxLeft + critBoxWidth / 2 - damageTransferWidth / 2}
                    yLoc={critBoxTop + 950}
                    width={damageTransferWidth}
                    strokeColor={strokeColor}
                />
            ) : (
                <BipedDamageTransferDiagramSVG
                    xLoc={critBoxLeft + critBoxWidth / 2 - damageTransferWidth / 2}
                    yLoc={critBoxTop + 950}
                    width={damageTransferWidth}
                    strokeColor={strokeColor}
                />
            )}
            <text
                x={critBoxLeft + critBoxWidth / 2}
                y={critBoxTop + 1200}
                textAnchor="middle"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 700}}
                fontSize={25}
            >
                DAMAGE TRANSFER
            </text>
            <text
                x={critBoxLeft + critBoxWidth / 2}
                y={critBoxTop + 1220}
                textAnchor="middle"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 700}}
                fontSize={25}
            >
                DIAGRAM
            </text>
        </>
    ) : (
        <>
            <QuadDamageTransferDiagramSVG
                xLoc={critBoxLeft + critBoxWidth / 2 - damageTransferWidth / 2}
                yLoc={critBoxTop + 950}
                width={damageTransferWidth}
                strokeColor={strokeColor}
            />
            <text
                x={critBoxLeft + critBoxWidth / 2}
                y={critBoxTop + 1200}
                textAnchor="middle"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 700}}
                fontSize={25}
            >
                DAMAGE TRANSFER
            </text>
            <text
                x={critBoxLeft + critBoxWidth / 2}
                y={critBoxTop + 1220}
                textAnchor="middle"
                fontFamily="sans-serif"
                fill={strokeColor}
                style={{fontWeight: 700}}
                fontSize={25}
            >
                DIAGRAM
            </text>
        </>
    )}
    {this.props.inPlay && (this.props.currentPhase === 2 ||  this.props.currentPhase === 3 ) ?
    <TakeDamageButtonSVG
        x={critBoxLeft + critBoxWidth / 2 + 100}
        y={critBoxTop + 970}
        height={150}
        width={150}
        onClick={this.props.openSetCriticalDialog}
    />
: null}
    </RecordSheetGroupBoxSVG>

    <BattleMechHeatEffectsBoxSVG
        yLoc={1885}
        xLoc={1240}
        height={575}
        width={435}
        bgColor={bgColor}
        mechData={this.props.mechData}
        inPlay={this.props.inPlay}
    />
    

    {/* <RecordSheetGroupBoxSVG
        yLoc={1885}
        xLoc={1690}
        height={575}
        width={205}
        title="Sinks"
    />
    */}
    <HeatSinksSVG
        yLoc={1885}
        xLoc={1690}
        height={575}
        width={205}
        bgColor={bgColor}
        mechData={this.props.mechData}
        inPlay={this.props.inPlay}
    />

    <HeatTrackSVG
        xLoc={this.docWidth - 80}
        yLoc={1260}
    />

    {/* {this.props.inPlay ? (
        <>
            <rect
                x={300}
                y={300}
                width={1600}
                height={400}
                fill="white"
                fillOpacity={.8}
                stroke="black"
                strokeWidth={3}
            />
            <text
                x={1100}
                y={500}
                textAnchor="middle"
                fontFamily="sans-serif"
                fill={"red"}
                style={{fontWeight: 700}}
                fontSize={60}
            >
            TODO: IN-PLAY CONTROLS
            </text>
        </>
    ): null} */}

	{/* // Classic BattleTech Logo on bottom. */}
    <rect
        x={0}
        y={this.docHeight - 100}
        width={2000}
        height={100}
        fill={strokeColor}
    />
    <BattleTechLogo
        yLoc={this.docHeight - 85}
        xLoc={1500}
        width={500}
    />
    {/* <text
        x={20}
        y={this.docHeight - 25}
        textAnchor="start"
        fontFamily="sans-serif"
        fill={this.colorTan}
        style={{fontWeight: 700}}
        fontSize={60}
    >
    CLASSIC BATTLETECH
    </text> */}
    {/* The Special Rulesets the 'Mech is built under (#324), above the notices. */}
    {rulesetsAttributionSvg(450, this.docHeight - 80, rulesets, { fill: this.colorTan, size: 14, maxWidth: 1000 })}
    <text
        x={450}
        y={this.docHeight - noticeY[0]}
        textAnchor="start"
        fontFamily="sans-serif"
        fill={this.colorTan}
        style={{fontWeight: 100}}
        fontSize={14}
    >
    {TRADEMARK_NOTICE( new Date().getFullYear() )[0]}
    </text>
    <text
        x={450}
        y={this.docHeight - noticeY[1]}
        textAnchor="start"
        fontFamily="sans-serif"
        fill={this.colorTan}
        style={{fontWeight: 100}}
        fontSize={14}
    >
    {TRADEMARK_NOTICE( new Date().getFullYear() )[1]}
    </text>
    <text
        x={450}
        y={this.docHeight - noticeY[2]}
        textAnchor="start"
        fontFamily="sans-serif"
        fill={this.colorTan}
        style={{fontWeight: 100}}
        fontSize={14}
    >
    {NOT_ENDORSED}
    </text>
    {/* "Created with" on its own line and the name at 14 points: the beta site's longer name ("... ilClan Edition -
        BETA") ran into the notices at x 450 (issue 16). */}
    <text
        x={20}
        y={this.docHeight - 72}
        textAnchor="start"
        fontFamily="sans-serif"
        fill={this.colorTan}
        style={{fontWeight: 700}}
        fontSize={14}
    >
    Created with
    </text>
    <text
        x={20}
        y={this.docHeight - 50}
        textAnchor="start"
        fontFamily="sans-serif"
        fill={this.colorTan}
        style={{fontWeight: 700}}
        fontSize={14}
    >
    Jeff's BattleTech Tools IIC
    </text>
    <text
        x={20}
        y={this.docHeight - 25}
        textAnchor="start"
        fontFamily="sans-serif"
        fill={this.colorTan}
        style={{fontWeight: 700}}
        fontSize={14}
    >
    https://heysporky.github.io/battletech-tools/
    </text>
            </g>

            {this.props.inPlay && this.props.mechData.isWrecked() ? (
                <>
                    <rect
                        x={10}
                        y={100}
                        width={800}
                        height={300}
                        fill="rgba(200,0,0, .6)"
                        stroke='rgb(255,255,255)'
                        strokeWidth={4}
                        transform={"rotate( 30, " + 350 + ", " + 200 + ")"}
                    >
                    </rect>
                    <text y={250} x={400} textAnchor='middle' fontFamily="sans-serif" transform={"rotate( 30, " + 350 + ", " + 200 + ")"} fontSize="125" stroke="rgb(255,255,255)" strokeWidth="2" fill="rgb(255,255,255)">WRECKED</text>
                    {breakLines( this.props.mechData.isWreckedBlurb(), 38 ).map( (line, lineIndex) => {
                        const yLoc = 45 + 35 * lineIndex;
                        return(
                            <text key={lineIndex} y={250 + yLoc } x={400} textAnchor='middle' fontFamily="sans-serif" transform={"rotate( 30, " + 350 + ", " + 200 + ")"} fontSize="35" stroke="rgb(255,255,255)" strokeWidth="1" fill="rgb(255,255,255)">{line.toUpperCase()}</text>
                        )
                    })}

                </>
            ) : (
                <></>
            )}
        </svg>
        </>
        )

    }

}

interface IBattleMechSVGProps {
    bgColor?: string;
    strokeColor?: string;
    mechData: BattleMech;
    inPlay?: boolean;
    /** The game's "Use design quirks" switch, for the to-hit numbers in play. */
    quirksInPlay?: boolean;
    currentPhase?: number;

    onChange?( mech: BattleMech ): void;

    // openSetTarget?(): void;
    openTakeDamageDialog?(): void;
    openSetMovementDialog?(): void;
    openSetCriticalDialog?(): void;
    viewGATOR?( gator: IGATOR): void;
    openSetTargetDialog?(
        currentBM: BattleMech,
    ): void;
    // landscape?: boolean;
    // itemIDField
}

interface IBattleMechSVGState {
}