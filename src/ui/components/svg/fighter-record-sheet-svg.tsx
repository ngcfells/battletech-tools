import React, { type JSX } from 'react';
import AerospaceFighter, { FighterLocation } from '../../../classes/aerospace-fighter';
import {
    AEROSPACE_FIGHTER_CRITICAL_BLOCK,
    AEROSPACE_HEAT_SCALE,
    AEROSPACE_PILOT_HITS,
    FIGHTER_RETURN_TABLE,
    GROUND_MAP_STRAIGHT_MOVEMENT,
} from '../../../data/aerospace-record-sheet';
import { SUPPORT_VEHICLE_CHASSIS_MODIFICATIONS, SUPPORT_VEHICLE_FIRE_CONTROL } from '../../../data/support-vehicle-construction';
import { aerospaceInventoryRows } from '../aerospace-sheet-blocks';
import { getUnitQuirkSheetLines, weaponQuirkSuffix } from '../quirk-sheet-block';
import { getRulesLevelName } from '../rules-level-print';
import FighterDiagramSVG from './fighter-diagram-svg';
import { DOC_HEIGHT, DOC_WIDTH, GRAY, INK, SHADE, blank, checkbox, groupBox, hitBox, rollTable, sheetFooter, text, titleBanner, wrapText } from './record-sheet-svg-kit';

// A full-page fighter record sheet, laid out like the Total Warfare Aerospace and Conventional Fighter record sheets:
// fighter data with the weapons inventory, external stores, notes and the armor diagram on top; critical damage,
// pilot data and the velocity record below, with the heat data and heat scale (aerospace fighters) or the ground map
// straight movement and fighter return tables (conventional fighters) on the right. Fixed-wing support vehicles use
// the conventional layout. Our own title block and craft silhouette; no official art or logo.

const LEFT = { x: 25, w: 790 };
const MIDDLE_X = 835;
const RIGHT_X = 1325;
const TOP = 140;
const BOTTOM = 1690;

// Location codes, keyed under the inventory.
const LOCATION_CODES: Record<FighterLocation, string> = { nose: "N", leftWing: "LW", rightWing: "RW", aft: "A", fuselage: "FU" };

/**
 * The code written in an external stores box. The four the official sheet's key gives (HE, LG, C, RL) come from the
 * names' initials; a store with an acronym in its name uses that (TAG, LAA, FASCAM); a size is added after a dash.
 */
export const externalStoreCode = (name: string): string => {
    const base = name.replace(/^Bomb - /, "").replace(/\((C|Standard|Air-Launched)\)/g, "").trim();
    const acronym = /\(([A-Z]{2,})\)/.exec(base)?.[1];
    if (acronym) return acronym;
    const size = /\((Large|Small)\)/.exec(base)?.[1];
    const words = base.replace(/\(.*?\)/g, "").split(/[\s-]+/).filter((word) => word && !["Pod", "Missile"].includes(word));
    const code = words.map((word) => (/^[A-Z]{2,}$/.test(word) ? word : word[0].toUpperCase())).join("");
    return size ? `${code}-${size[0]}` : code;
};

export default class FighterRecordSheetSVG extends React.Component<IFighterRecordSheetSVGProps> {
    get fighter(): AerospaceFighter { return this.props.fighter; }

    get play() { return this.props.showDamage ? this.fighter.getInPlay() : null; }

    get title(): string { return `${this.fighter.getFighterTypeName().toUpperCase()} RECORD SHEET`; }

    renderFighterData(): JSX.Element {
        const fighter = this.fighter;
        const play = this.play;
        const { x, w } = LEFT;
        const y = TOP, h = 1090;
        const label = (lx: number, ly: number, value: string) => text(lx, ly, value, { size: 22, weight: 700 });
        const value = (lx: number, ly: number, v: React.ReactNode) => text(lx, ly, v, { size: 24 });
        const name = `${fighter.getName()} ${fighter.getModel()}`.trim();
        const engine = fighter.isSupportVehicle() ? fighter.getSupportEngine()?.name ?? "" : fighter.getEngineType().name;

        const quirkLines = getUnitQuirkSheetLines(fighter.quirks, fighter.getEquipmentList().map((item) => ({ uuid: item.uuid, label: item.name })), fighter.getQuirkTargets().locations);
        const rows = aerospaceInventoryRows(
            fighter.getEquipmentList(),
            (tag) => LOCATION_CODES[tag as FighterLocation] ?? tag,
            (item) => (fighter.isPodMounted(item.uuid ?? "") ? " (pod)" : "") + (play && fighter.isWeaponDestroyed(item.uuid ?? "") ? " (destroyed)" : "") + weaponQuirkSuffix(quirkLines, item.uuid),
        );
        const col = { qty: x + 30, type: x + 65, loc: x + 440, ht: x + 495, srv: x + 565, mrv: x + 630, lrv: x + 695, erv: x + 755 };
        const tableTop = y + 400;
        const lineHeight = 34;
        const typeWidth = col.loc - 30 - col.type;

        return groupBox(x, y, w, h, "FIGHTER DATA", (
            <>
                {label(x + 20, y + 75, "Type:")}
                {text(x + 95, y + 75, (fighter.isOmni() ? "Omni: " : "") + (name || fighter.getFighterTypeName()), { size: name.length > 34 ? 22 : 26, weight: 700 })}
                {label(x + 20, y + 115, "Thrust:")}
                {label(x + 40, y + 150, "Safe Thrust:")}{value(x + 245, y + 150, fighter.getSafeThrust())}
                {label(x + 40, y + 185, "Maximum Thrust:")}{value(x + 245, y + 185, fighter.getMaxThrust())}
                {label(x + 400, y + 115, "Tonnage:")}{value(x + 545, y + 115, fighter.getTonnage())}
                {label(x + 400, y + 150, "Tech Base:")}{value(x + 545, y + 150, fighter.getTech().name)}
                {label(x + 400, y + 185, "Rules Level:")}{value(x + 545, y + 185, getRulesLevelName(fighter.getRequiredRulesLevel()))}
                {label(x + 40, y + 220, "Engine:")}{text(x + 140, y + 220, `${engine} ${fighter.getEngineRating()}`, { size: engine.length > 18 ? 18 : 22 })}
                {label(x + 400, y + 220, "Fuel:")}{value(x + 545, y + 220, `${fighter.getFuelPoints()} points`)}
                {fighter.tracksHeat() ? null : (
                    <g>
                        {label(x + 40, y + 260, "VSTOL")}{checkbox(x + 130, y + 258)}
                        {fighter.hasVSTOL() ? text(x + 142, y + 257, "X", { size: 22, weight: 700, anchor: "middle" }) : null}
                        {label(x + 200, y + 260, "STOL")}{checkbox(x + 270, y + 258)}
                    </g>
                )}
                <line x1={x + 10} y1={y + 290} x2={x + w - 10} y2={y + 290} stroke={INK} strokeWidth={2} />

                {text(x + 20, y + 330, "Weapons & Equipment Inventory", { size: 26, weight: 700 })}
                {text(x + 20, y + 355, "Standard Scale", { size: 16 })}
                {(["(0-6)", "(7-12)", "(13-20)", "(21-25)"] as const).map((bracket, i) =>
                    text([col.srv, col.mrv, col.lrv, col.erv][i], y + 355, bracket, { size: 16, anchor: "middle" }, bracket))}
                {text(col.qty, y + 385, "Qty", { size: 20, weight: 700, anchor: "middle" })}
                {text(col.type, y + 385, "Type", { size: 20, weight: 700 })}
                {text(col.loc, y + 385, "Loc.", { size: 20, weight: 700, anchor: "middle" })}
                {text(col.ht, y + 385, "Ht", { size: 20, weight: 700, anchor: "middle" })}
                {(["SRV", "MRV", "LRV", "ERV"] as const).map((head, i) => text([col.srv, col.mrv, col.lrv, col.erv][i], y + 385, head, { size: 20, weight: 700, anchor: "middle" }, head))}
                {/* Shaded write-in rows below the printed ones, as on the official sheet. */}
                {Array.from({ length: 17 }, (_, index) => index >= rows.length && index % 2 === 0
                    ? <rect key={`blank${index}`} x={x + 10} y={tableTop + index * lineHeight} width={w - 20} height={lineHeight} fill={SHADE} /> : null)}
                {rows.length === 0 ? text(x + w / 2, tableTop + 60, "No Weapons or Equipment", { size: 24, anchor: "middle", fill: GRAY }) : null}
                {rows.slice(0, 17).map((row, index) => {
                    const ry = tableTop + index * lineHeight;
                    const fit = Math.min(20, Math.floor(typeWidth / (row.name.length * 0.55)));
                    const cell = (cx: number, v: React.ReactNode, key: string) => text(cx, ry + 25, v, { size: 20, anchor: "middle" }, key);
                    return (
                        <g key={index}>
                            {index % 2 === 0 ? <rect x={x + 10} y={ry} width={w - 20} height={lineHeight} fill={SHADE} /> : null}
                            {cell(col.qty, row.quantity, "q")}{text(col.type, ry + 25, row.name, { size: Math.max(13, fit) }, "n")}
                            {cell(col.loc, row.location, "l")}{cell(col.ht, row.heat, "h")}
                            {[col.srv, col.mrv, col.lrv, col.erv].map((cx, i) => cell(cx, row.values ? (row.values[i] || "—") : "?", `v${i}`))}
                        </g>
                    );
                })}
                {rows.length > 17 ? text(x + 20, tableTop + 17 * lineHeight + 22, `…and ${rows.length - 17} more (see Notes)`, { size: 18, fill: GRAY }) : null}
                {text(x + 20, y + 1010, "Loc.: N Nose, LW Left Wing, RW Right Wing, A Aft, FU Fuselage", { size: 17, fill: GRAY })}
                {label(x + 20, y + 1060, "Cost:")}{value(x + 95, y + 1060, `${fighter.getCBillCost().toLocaleString("en-US")} C-Bills`)}
                {label(x + 420, y + 1060, "BV:")}{value(x + 470, y + 1060, this.props.showPilot ? `${fighter.getBattleValue()} (${fighter.getPilotAdjustedBattleValue()} adj.)` : fighter.getBattleValue())}
            </>
        ));
    }

    renderNotes(): JSX.Element {
        const fighter = this.fighter;
        const play = this.play;
        const { x, w } = LEFT;
        const y = 1250, h = 420;
        const notes: string[] = [];
        const quirkLines = getUnitQuirkSheetLines(fighter.quirks, fighter.getEquipmentList().map((item) => ({ uuid: item.uuid, label: item.name })), fighter.getQuirkTargets().locations);
        if (quirkLines.unit.length) notes.push(`Quirks: ${quirkLines.unit.join(", ")}`);
        const ammo = fighter.getEquipmentList().filter((item) => item.isAmmo).map((item) => item.name);
        if (ammo.length) notes.push(`Ammo: ${ammo.join(", ")}`);
        if (fighter.getExternalStores().length) {
            notes.push(`External stores: ${fighter.getExternalStores().map((store) => `${store.count} x ${store.name.replace(/^Bomb - /, "")}`).join(", ")}; Thrust ${fighter.getLoadedSafeThrust()}/${fighter.getLoadedMaxThrust()} while loaded`);
        }
        if (fighter.isSupportVehicle()) {
            const fireControl = SUPPORT_VEHICLE_FIRE_CONTROL[fighter.getSupportFireControl()].name;
            notes.push(`Tech Rating ${fighter.getSupportOverallTechRating()?.toUpperCase()}; Crew ${fighter.getCrew()}; BAR ${fighter.getBAR()}`);
            notes.push(`${fireControl.includes("Fire Control") ? fireControl : `Fire Control: ${fireControl}`}${fighter.getFireControlToHitModifier() > 0 ? ` (+${fighter.getFireControlToHitModifier()} to-hit)` : ""}`);
            const mods = fighter.getSupportChassisModifications().map((tag) => SUPPORT_VEHICLE_CHASSIS_MODIFICATIONS.find((mod) => mod.tag === tag)?.name).filter(Boolean);
            if (mods.length) notes.push(`Chassis: ${mods.join(", ")}`);
        }
        if (fighter.getBays().length) notes.push(`Bays: ${fighter.getBays().map((bay) => `${fighter.getBayName(bay)} ${bay.amount}`).join(", ")}`);
        if (play && play.heatSinks > 0) notes.push(`Heat sinks lost: ${play.heatSinks}`);

        let cursor = y + 80;
        const lines: JSX.Element[] = [];
        notes.forEach((note, index) => {
            const wrapped = wrapText(note, 66);
            lines.push(
                <text key={index} x={x + 20} y={cursor} fontFamily="sans-serif" fontSize={20} fill={INK}>
                    {wrapped.map((line, li) => <tspan key={li} x={x + 20} dy={li === 0 ? 0 : 24}>{line}</tspan>)}
                </text>
            );
            cursor += wrapped.length * 24 + 8;
        });
        for (let ly = cursor + 20; ly < y + h - 15; ly += 38) {
            lines.push(<line key={`rule-${ly}`} x1={x + 20} y1={ly} x2={x + w - 20} y2={ly} stroke={SHADE} strokeWidth={2} />);
        }
        return groupBox(x, y, w, h, "NOTES", lines);
    }

    // Bombs and pods: a box a hardpoint, the boxes past the fighter's hardpoints shaded, with the codes keyed below.
    renderExternalStores(): JSX.Element {
        const fighter = this.fighter;
        const x = 1440, y = TOP, w = 535, h = 460;
        const hardpoints = Math.min(20, fighter.getExternalStoresHardpoints());
        const codes: string[] = [];
        const key = new Map<string, string>([["HE", "High-Explosive"], ["LG", "Laser-Guided"], ["C", "Cluster"], ["RL", "Rocket Launcher"]]);
        for (const store of fighter.getExternalStores()) {
            const code = externalStoreCode(store.name);
            if (!key.has(code)) key.set(code, store.name.replace(/^Bomb - /, ""));
            for (let i = 0; i < store.hardpoints; i++) codes.push(code);
        }
        const boxW = 88, boxH = 66, gap = 10;
        const left = x + (w - (5 * boxW + 4 * gap)) / 2;
        const keyLines = [...key.entries()].map(([code, name]) => `${code} - ${name}`);
        return groupBox(x, y, w, h, "EXTERNAL STORES/BOMBS", (
            <>
                {Array.from({ length: 20 }, (_, i) => {
                    const bx = left + (i % 5) * (boxW + gap), by = y + 60 + Math.floor(i / 5) * (boxH + gap);
                    return (
                        <g key={i}>
                            <rect data-testid="store-box" data-hardpoint={i < hardpoints ? "true" : "false"} x={bx} y={by} width={boxW} height={boxH} rx={10}
                                fill={i < hardpoints ? "white" : SHADE} stroke={INK} strokeWidth={2} />
                            {codes[i] ? text(bx + boxW / 2, by + 44, codes[i], { size: codes[i].length > 3 ? 18 : 26, weight: 700, anchor: "middle" }) : null}
                        </g>
                    );
                })}
                {text(x + 20, y + 385, "Key:", { size: 18, weight: 700 })}
                {keyLines.slice(0, 6).map((line, i) => text(x + 75 + (i % 2) * 230, y + 385 + Math.floor(i / 2) * 24, line, { size: 16 }, line))}
            </>
        ));
    }

    renderArmorData(): JSX.Element {
        const fighter = this.fighter;
        const x = MIDDLE_X, y = TOP, w = 590, h = 460;
        const armor = fighter.getArmorAllocation();
        const thresholds = fighter.getDamageThresholds();
        const arcs: { tag: keyof typeof armor; name: string }[] = [
            { tag: "nose", name: "Nose" }, { tag: "leftWing", name: "Left Wing" }, { tag: "rightWing", name: "Right Wing" }, { tag: "aft", name: "Aft" },
        ];
        return groupBox(x, y, w, h, "ARMOR DATA", (
            <>
                {text(x + 20, y + 75, "Damage Threshold (Total Armor)", { size: 22, weight: 700 })}
                {arcs.map((arc, i) => (
                    <g key={arc.tag}>
                        {i % 2 === 0 ? <rect x={x + 15} y={y + 92 + i * 40} width={w - 30} height={40} fill={SHADE} /> : null}
                        {text(x + 30, y + 120 + i * 40, arc.name, { size: 22 })}
                        {text(x + 330, y + 120 + i * 40, `${thresholds[arc.tag]} (${armor[arc.tag]})`, { size: 24, weight: 700, anchor: "middle" })}
                    </g>
                ))}
                {text(x + 20, y + 290, "Structural Integrity:", { size: 22, weight: 700 })}{text(x + 260, y + 290, fighter.getStructuralIntegrity(), { size: 24 })}
                {text(x + 20, y + 330, "Armor:", { size: 22, weight: 700 })}
                {text(x + 105, y + 330, fighter.getArmorDescription(), { size: fighter.getArmorDescription().length > 36 ? 17 : 22 })}
                {fighter.tracksHeat() ? null : <>{text(x + 20, y + 370, "BAR:", { size: 22, weight: 700 })}{text(x + 85, y + 370, fighter.getBAR(), { size: 24 })}</>}
            </>
        ));
    }

    renderArmorDiagram(): JSX.Element {
        const fighter = this.fighter;
        const play = this.play;
        const y = 620, h = 1050;
        const w = (fighter.tracksHeat() ? 1835 : 1975) - MIDDLE_X;
        const diagramW = w - 40;
        const diagramH = Math.round(diagramW / 600 * 470);
        return groupBox(MIDDLE_X, y, w, h, "ARMOR DIAGRAM", (
            <FighterDiagramSVG
                x={MIDDLE_X + 20}
                y={y + 50 + (h - 50 - diagramH) / 2}
                width={diagramW}
                silhouette
                maxPipSpacing={24}
                armor={fighter.getArmorAllocation()}
                structuralIntegrity={fighter.getStructuralIntegrity()}
                thresholds={fighter.getDamageThresholds()}
                armorDamage={play?.armorDamage}
                structureDamage={play?.structureDamage}
            />
        ));
    }

    renderCriticalDamage(): JSX.Element {
        const play = this.play;
        const { x, w } = LEFT;
        const y = BOTTOM, h = 360;
        const filled = (name: string): number => {
            if (!play) return 0;
            switch (name) {
                case "Avionics": return play.avionics;
                case "Engine": return play.engine;
                case "FCS": return play.fcs;
                case "Sensors": return play.sensors;
                case "Gear": return play.gear ? 1 : 0;
                default: return 0;
            }
        };
        // As on the official sheet: Avionics, FCS and Sensors on the left; Engine, Gear and Life Support on the right.
        const columns = [["Avionics", "FCS", "Sensors"], ["Engine", "Gear", "Life Support"]];
        return groupBox(x, y, w, h, "CRITICAL DAMAGE", columns.map((names, c) => names.map((name, r) => {
            const track = AEROSPACE_FIGHTER_CRITICAL_BLOCK.find((entry) => entry.name === name)!;
            const lx = x + 30 + c * 390, ly = y + 110 + r * 85;
            return (
                <g key={name}>
                    {text(lx, ly, name, { size: 24, weight: 700 })}
                    {track.boxes.map((box, i) => hitBox(lx + 175 + i * 52, ly, box, `${name}${i}`, i < filled(name)))}
                </g>
            );
        })));
    }

    renderPilotData(): JSX.Element {
        const pilot = this.fighter.getPilot();
        const hits = this.play?.pilotHits ?? 0;
        const x = MIDDLE_X, y = BOTTOM, w = 470, h = 360;
        const show = this.props.showPilot;
        const cellX = (i: number) => x + 190 + i * 44;
        const row = (ry: number, title: string, values: string[], marks: boolean) => (
            <g>
                {text(x + 180, ry + 30, title, { size: 18, weight: 700, anchor: "end" })}
                {values.map((v, i) => (
                    <g key={i} data-hit={marks && i < hits ? "filled" : undefined}>
                        <rect x={cellX(i)} y={ry} width={44} height={44} fill={marks && i < hits ? INK : "white"} stroke={INK} strokeWidth={2} />
                        {text(cellX(i) + 22, ry + 30, v, { size: v.length > 2 ? 15 : 22, weight: 700, anchor: "middle", fill: marks && i < hits ? "white" : INK })}
                    </g>
                ))}
            </g>
        );
        return groupBox(x, y, w, h, "PILOT DATA", (
            <>
                {text(x + 20, y + 80, "Name:", { size: 22, weight: 700 })}
                {show && pilot.name ? text(x + 100, y + 80, pilot.name, { size: 22 }) : blank(x + 100, y + 80, w - 120)}
                {text(x + 20, y + 125, "Gunnery Skill:", { size: 20, weight: 700 })}
                {show ? text(x + 170, y + 125, pilot.gunnery, { size: 22 }) : blank(x + 170, y + 125, 40)}
                {text(x + 240, y + 125, "Piloting Skill:", { size: 20, weight: 700 })}
                {show ? text(x + 385, y + 125, pilot.piloting, { size: 22 }) : blank(x + 385, y + 125, 40)}
                {row(y + 155, "Hits Taken", AEROSPACE_PILOT_HITS.map((entry) => `${entry.hit}`), true)}
                {row(y + 210, "Consciousness #", AEROSPACE_PILOT_HITS.map((entry) => entry.consciousness), false)}
                {row(y + 265, "Modifier", AEROSPACE_PILOT_HITS.map((entry) => entry.modifier), false)}
            </>
        ));
    }

    renderVelocityRecord(): JSX.Element {
        const { x } = LEFT;
        const y = 2070, w = RIGHT_X - 20 - x, h = 430;
        const rows = ["Turn #", "Thrust", "Velocity", "Effective Velocity", "Altitude"];
        const labelW = 220, cellH = 30;
        const cellW = (w - 40 - labelW) / 10;
        const cells: JSX.Element[] = [];
        for (let band = 0; band < 2; band++) {
            const by = y + 60 + band * 180;
            rows.forEach((name, r) => {
                cells.push(text(x + 25, by + r * cellH + 22, name, { size: 18, weight: 700 }, `l${band}-${r}`));
                cells.push(<rect key={`r${band}-${r}`} x={x + 20 + labelW} y={by + r * cellH} width={w - 40 - labelW} height={cellH} fill={r === 0 ? SHADE : "white"} stroke={INK} strokeWidth={1.5} />);
            });
            for (let i = 0; i < 10; i++) {
                const cx = x + 20 + labelW + i * cellW;
                cells.push(<line key={`c${band}-${i}`} x1={cx} y1={by} x2={cx} y2={by + rows.length * cellH} stroke={INK} strokeWidth={1.5} />);
                cells.push(text(cx + cellW / 2, by + 22, band * 10 + i + 1, { size: 18, anchor: "middle" }, `n${band}-${i}`));
            }
        }
        return groupBox(x, y, w, h, "VELOCITY RECORD", cells);
    }

    renderHeatData(): JSX.Element {
        const fighter = this.fighter;
        const play = this.play;
        const x = RIGHT_X, y = BOTTOM, w = 510, h = 810;
        const rowH = (h - 130) / AEROSPACE_HEAT_SCALE.length;
        const sinks = fighter.getTotalHeatSinks();
        const lost = play?.heatSinks ?? 0;
        const perRow = 4, spacing = 28;
        const isDouble = fighter.getHeatSinkType().tag !== "single";
        return groupBox(x, y, w, h, "HEAT DATA", (
            <>
                {text(x + 20, y + 70, "Heat", { size: 18, weight: 700 })}
                {text(x + 20, y + 90, "Level*", { size: 18, weight: 700 })}
                {text(x + 95, y + 90, "Effects", { size: 20, weight: 700 })}
                {AEROSPACE_HEAT_SCALE.map((entry, i) => (
                    <g key={entry.heat}>
                        {text(x + 50, y + 125 + i * rowH, entry.heat, { size: 18, anchor: "end" })}
                        {text(x + 62, y + 125 + i * rowH, entry.effect, { size: 18 })}
                    </g>
                ))}
                {text(x + 440, y + 70, "Heat Sinks:", { size: 18, weight: 700, anchor: "middle" })}
                {text(x + 440, y + 100, `${sinks} (${fighter.getHeatDissipation()})`, { size: 22, weight: 700, anchor: "middle" })}
                {Array.from({ length: sinks }, (_, i) => (
                    <circle key={i} cx={x + 398 + (i % perRow) * spacing} cy={y + 130 + Math.floor(i / perRow) * spacing} r={Math.min(11, 300 / Math.max(sinks, 1))}
                        fill={i < lost ? INK : "white"} stroke={INK} strokeWidth={1.5} />
                ))}
                {text(x + 400, y + 735, "Single", { size: 18 })}{checkbox(x + 465, y + 735)}
                {text(x + 400, y + 775, "Double", { size: 18 })}{checkbox(x + 465, y + 775)}
                {text(x + 477, isDouble ? y + 774 : y + 734, "X", { size: 22, weight: 700, anchor: "middle" })}
            </>
        ));
    }

    // The heat scale column: an Overflow box, then 30 down to 0, levels with an effect starred.
    renderHeatScale(): JSX.Element {
        const x = 1855, w = 120, top = 1270, rowH = 37;
        const heat = this.play?.heat ?? -1;
        const starred = new Set(AEROSPACE_HEAT_SCALE.map((entry) => entry.heat));
        return (
            <g>
                {text(x + w / 2, top - 40, "Heat", { size: 22, weight: 700, anchor: "middle" })}
                {text(x + w / 2, top - 14, "Scale", { size: 22, weight: 700, anchor: "middle" })}
                <rect x={x} y={top} width={w} height={44} rx={10} fill={heat > 30 ? INK : "white"} stroke={INK} strokeWidth={2} />
                {text(x + w / 2, top + 28, "Overflow", { size: 18, anchor: "middle", fill: heat > 30 ? "white" : INK })}
                {Array.from({ length: 31 }, (_, i) => {
                    const level = 30 - i;
                    const ry = top + 52 + i * rowH;
                    const lit = level <= heat && level > 0;
                    return (
                        <g key={level}>
                            <rect x={x} y={ry} width={w} height={rowH} fill={lit ? INK : "white"} stroke={INK} strokeWidth={2} />
                            {text(x + w / 2, ry + 27, starred.has(level) ? `${level}*` : `${level}`, { size: 22, weight: 700, anchor: "middle", fill: lit ? "white" : INK })}
                        </g>
                    );
                })}
            </g>
        );
    }

    renderGroundMapMovement(): JSX.Element {
        const x = RIGHT_X, y = BOTTOM, w = 650, h = 525;
        const table = {
            columns: ["Fighter", "Small Craft"],
            rows: GROUND_MAP_STRAIGHT_MOVEMENT.map((row) => ({ roll: `${row.velocity}`, cells: [`${row.fighter}`, `${row.smallCraft}`] })),
        };
        return groupBox(x, y, w, h, "GROUND MAP STRAIGHT MOVEMENT", (
            <>
                {text(x + w / 2, y + 68, "Minimum Straight Movement (in hexes)", { size: 20, weight: 700, anchor: "middle" })}
                {rollTable(table, x, y + 70, w, "", 29, 160, "VELOCITY")}
                {text(x + 20, y + 490, "Velocity above 12 is not possible on ground maps.", { size: 17 })}
                {text(x + 20, y + 515, "Fixed-wing support vehicles: double the Fighter column (TW p. 84).", { size: 17 })}
            </>
        ));
    }

    renderFighterReturn(): JSX.Element {
        const x = RIGHT_X, y = 2230, w = 650, h = 270;
        const table = { columns: ["Turns Before Return"], rows: FIGHTER_RETURN_TABLE.map((row) => ({ roll: row.safeThrust, cells: [`${row.turns}`] })) };
        return groupBox(x, y, w, h, "FIGHTER RETURN TABLE", (
            <>
                {rollTable(table, x, y + 55, w, "", 34, 250, "SAFE THRUST")}
                {text(x + 20, y + 255, "As printed on the Total Warfare conventional fighter record sheet.", { size: 16, fill: GRAY })}
            </>
        ));
    }

    render = (): JSX.Element => (
        <svg
            version="1.1"
            viewBox={`0 0 ${DOC_WIDTH} ${DOC_HEIGHT}`}
            xmlns="http://www.w3.org/2000/svg"
            data-testid="fighter-record-sheet-svg"
        >
            <rect x={0} y={0} width={DOC_WIDTH} height={DOC_HEIGHT} fill="white" />
            {titleBanner(LEFT.x, 1395, this.title)}
            {this.renderFighterData()}
            {this.renderExternalStores()}
            {this.renderArmorData()}
            {this.renderArmorDiagram()}
            {this.renderNotes()}
            {this.renderCriticalDamage()}
            {this.renderPilotData()}
            {this.renderVelocityRecord()}
            {this.fighter.tracksHeat() ? <>{this.renderHeatData()}{this.renderHeatScale()}</> : <>{this.renderGroundMapMovement()}{this.renderFighterReturn()}</>}
            {sheetFooter("Tables: Total Warfare pp. 92, 161.")}
        </svg>
    );
}

interface IFighterRecordSheetSVGProps {
    fighter: AerospaceFighter;
    showPilot?: boolean;
    showDamage?: boolean;
}
