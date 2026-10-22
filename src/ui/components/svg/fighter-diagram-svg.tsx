import React, { type JSX } from 'react';
import { FighterArc, IFighterArmorAllocation } from '../../../classes/aerospace-fighter';
import DamageCircleSVG from './damage-circle-svg';

// Schematic top-down fighter record sheet diagram (hand-built shapes, not traced artwork): nose at the top,
// a wing on each side, aft at the bottom and the Structural Integrity track in the fuselage between them.
export default class FighterDiagramSVG extends React.Component<IFighterDiagramSVGProps> {
    outlineColor = "rgb(170,170,170)";

    // Pips inside a w x h area, from maxPipSpacing apart (14 by default) shrinking until they fit. In play, damaged pips are filled and clicking a pip
    // marks (or clears) damage up to it.
    renderPips(count: number, damaged: number, x: number, y: number, w: number, h: number, keyPrefix: string, onClick?: (index: number) => void): JSX.Element[] {
        let spacing = this.props.maxPipSpacing ?? 14;
        let perRow = Math.max(1, Math.floor(w / spacing));
        while (spacing > 3.5 && Math.ceil(count / perRow) * spacing > h) {
            spacing -= 0.5;
            perRow = Math.max(1, Math.floor(w / spacing));
        }
        const radius = Math.max(1.4, spacing * 0.42);
        return Array.from({ length: count }, (_, i) => (
            <DamageCircleSVG
                key={`${keyPrefix}${i}`}
                xLoc={x + (i % perRow) * spacing + radius}
                yLoc={y + Math.floor(i / perRow) * spacing + radius}
                radius={radius}
                isFilled={i < damaged}
                inPlay={!!onClick}
                clickLocation={keyPrefix}
                clickIndex={i}
                clickFunction={(_location: string, index: number) => onClick?.(index)}
            />
        ));
    }

    renderArc(arc: FighterArc, label: string, x: number, y: number, width: number, height: number): JSX.Element {
        const armor = this.props.armor[arc];
        const toggle = this.props.onToggleArmor;
        return (
            <g data-testid={`armor-diagram-${arc}`} data-damage={this.props.armorDamage?.[arc] ?? 0}>
                <rect x={x} y={y} width={width} height={height} fill="rgb(255,255,255)" stroke="rgb(0,0,0)" strokeWidth={1.5} />
                <text x={x + 4} y={y + 12} fontSize={10} fontWeight="bold">{label} ({armor})</text>
                {this.props.thresholds ? <text x={x + width - 4} y={y + 12} fontSize={9} textAnchor="end">Threshold {this.props.thresholds[arc]}</text> : null}
                {this.renderPips(armor, this.props.armorDamage?.[arc] ?? 0, x + 5, y + 18, width - 10, height - 22, arc, toggle ? (index) => toggle(arc, index) : undefined)}
            </g>
        );
    }

    // Our own craft, drawn for the printed sheet, or a dashed outline in play mode.
    renderOutline(): JSX.Element {
        const fill = "rgb(222,222,222)", stroke = "rgb(150,150,150)";
        switch (this.props.silhouette) {
            case true:
            case "fighter":
                // A cranked delta with canards and twin fins.
                return <path data-testid="fighter-silhouette" fill={fill} stroke={stroke} strokeWidth={2}
                    d="M300,2 L322,70 L330,120 L390,128 L392,146 L345,152 L560,262 L596,300 L596,318 L345,312 L338,392 L392,446 L392,466 L322,452 L300,468 L278,452 L208,466 L208,446 L262,392 L255,312 L4,318 L4,300 L40,262 L255,152 L208,146 L210,128 L270,120 L278,70 Z" />;
            case "aerodyne":
                // A blunt lifting body with swept wings and a single dorsal fin.
                return <path data-testid="aerodyne-silhouette" fill={fill} stroke={stroke} strokeWidth={2}
                    d="M300,4 C342,10 362,64 368,130 L372,196 L560,326 L594,372 L594,396 L372,388 L362,436 L334,466 L266,466 L238,436 L228,388 L6,396 L6,372 L40,326 L228,196 L232,130 C238,64 258,10 300,4 Z" />;
            case "spheroid":
                // A sphere on three landing legs.
                return (
                    <g data-testid="spheroid-silhouette" fill={fill} stroke={stroke} strokeWidth={2}>
                        <path d="M140,360 L96,462 L130,462 L176,380 Z M460,360 L504,462 L470,462 L424,380 Z M282,420 L282,466 L318,466 L318,420 Z" />
                        <ellipse cx={300} cy={222} rx={280} ry={218} />
                    </g>
                );
            default:
                return (
                    <polygon points="300,4 345,150 590,250 590,300 345,300 330,440 380,462 220,462 270,440 255,300 10,300 10,250 255,150"
                        fill="none" stroke={this.outlineColor} strokeWidth={2} strokeDasharray="6 4" />
                );
        }
    }

    render = (): JSX.Element => {
        const toggleSI = this.props.onToggleStructure;
        const width = this.props.width ?? 600;
        // Placed at x, y inside a record sheet's own SVG rather than scaled to the page.
        const embedded = this.props.x !== undefined;
        return (
            <svg
                x={embedded ? this.props.x : undefined}
                y={embedded ? this.props.y : undefined}
                viewBox="0 0 600 470"
                width={width}
                height={embedded ? Math.round(width / 600 * 470) : undefined}
                xmlns="http://www.w3.org/2000/svg"
                style={embedded ? undefined : { maxWidth: "100%", height: "auto" }}
            >
                {this.renderOutline()}
                {this.renderArc("nose", "Nose", 215, 20, 170, 130)}
                {this.renderArc("leftWing", this.props.sideLabels?.left ?? "Left Wing", 15, 160, 190, 135)}
                {this.renderArc("rightWing", this.props.sideLabels?.right ?? "Right Wing", 395, 160, 190, 135)}
                {this.renderArc("aft", "Aft", 215, 320, 170, 130)}
                <g>
                    <rect x={215} y={160} width={170} height={150} fill="rgb(245,245,245)" stroke="rgb(0,0,0)" strokeWidth={1.5} />
                    <text x={219} y={172} fontSize={10} fontWeight="bold">Structural Integrity ({this.props.structuralIntegrity})</text>
                    {this.renderPips(this.props.structuralIntegrity, this.props.structureDamage ?? 0, 220, 180, 160, 124, "si", toggleSI ? (index) => toggleSI(index) : undefined)}
                </g>
            </svg>
        );
    }
}

interface IFighterDiagramSVGProps {
    armor: IFighterArmorAllocation;
    structuralIntegrity: number;
    width?: number;
    /** Where to place the diagram inside a record sheet's own SVG; it stands alone when not given. */
    x?: number;
    y?: number;
    /** The widest pip spacing to start from; a printed sheet gives its pips more room than play mode. */
    maxPipSpacing?: number;
    /** A solid craft silhouette behind the boxes, as on a printed record sheet, in place of the dashed outline; true is a fighter. */
    silhouette?: boolean | "fighter" | "aerodyne" | "spheroid";
    /** Damage thresholds by arc, shown when given. */
    thresholds?: IFighterArmorAllocation;
    armorDamage?: IFighterArmorAllocation;
    structureDamage?: number;
    onToggleArmor?: (arc: FighterArc, index: number) => void;
    onToggleStructure?: (index: number) => void;
    /** Names for the two side arcs when the craft has no wings (a spheroid Small Craft's "Left Side"). */
    sideLabels?: { left: string; right: string };
}
