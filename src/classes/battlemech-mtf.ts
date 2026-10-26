// Reads MegaMek's 'Mech files (".mtf"). The file is rewritten as a Skunk Werks save, so the SSW import does the
// building (chassis, equipment and slot placement in one place); its TRO text and quirks are read as a BLK file's.
// MegaMek's equipment names are on the catalog records (altNames), as findImportedEquipment expects (#118, #241).
import { IEquipmentItem } from "../data/data-interfaces";
import { findBlkAmmo, findBlkAmmoWeapon, parseBlkAmmoLine } from "../utils/blk-ammo";
import { IBlkFile } from "../utils/blk-file";
import { applyBlkQuirks, IBlkImportedItem } from "../utils/blk-quirks";
import { readBlkTechnicalReadout } from "../utils/blk-technical-readout";
import { findImportedEquipment, ImportFaction } from "../utils/importedEquipment";
import { BattleMech } from "./battlemech";

/** Largest file read, in characters. */
export const MAX_MTF_FILE_LENGTH = 400000;

const BIPED_LOCATIONS: Record<string, string> = {
    "Head": "hd", "Center Torso": "ct", "Left Torso": "lt", "Right Torso": "rt", "Left Arm": "la", "Right Arm": "ra",
    "Left Leg": "ll", "Right Leg": "rl",
};
// SSW gives a quad's front legs as la and ra.
const QUAD_LOCATIONS: Record<string, string> = {
    "Head": "hd", "Center Torso": "ct", "Left Torso": "lt", "Right Torso": "rt", "Front Left Leg": "la", "Front Right Leg": "ra",
    "Rear Left Leg": "ll", "Rear Right Leg": "rl",
};
const ARMOR_LOCATIONS: Record<string, string> = {
    HD: "hd", CT: "ct", LT: "lt", RT: "rt", LA: "la", RA: "ra", LL: "ll", RL: "rl", RTC: "ctr", RTL: "ltr", RTR: "rtr",
    FLL: "la", FRL: "ra", RLL: "ll", RRL: "rl",
};
/** Our crit table for an SSW location code. */
const CRIT_TABLE: Record<string, string> = {
    hd: "head", ct: "centerTorso", lt: "leftTorso", rt: "rightTorso", la: "leftArm", ra: "rightArm", ll: "leftLeg", rl: "rightLeg",
};
const QUAD_CRIT_TABLE: Record<string, string> = { ...CRIT_TABLE, la: "frontLeftLeg", ra: "frontRightLeg" };

const ENGINES: Record<string, string> = {
    "Fusion": "Fusion Engine", "XL": "XL Engine", "XXL": "XXL Engine", "Light": "Light Fusion Engine", "Compact": "Compact Fusion Engine",
    "ICE": "I.C.E. Engine", "Fuel Cell": "Fuel-Cell Engine", "Fission": "Fission Engine",
};
const STRUCTURES: Record<string, string> = {
    "Standard": "Standard Structure", "Endo Steel": "Endo-Steel", "Endo Steel Prototype": "Endo-Steel Prototype", "Industrial": "Industrial Structure",
    "Endo-Composite": "Endo-Composite", "Composite": "Composite Structure", "Reinforced": "Reinforced Structure",
};
const ARMORS: Record<string, string> = {
    "Standard": "Standard Armor", "Stealth": "Stealth Armor", "Reactive": "Reactive Armor", "Reflective": "Laser-Reflective",
    "Hardened": "Hardened Armor", "Industrial": "Industrial Armor", "Heavy Industrial": "Heavy Industrial Armor", "Commercial": "Commercial Armor",
    "Primitive": "Primitive Armor", "Ballistic-Reinforced": "Ballistic-Reinforced Armor", "Impact-Resistant": "Impact-Resistant Armor",
    "Heat-Dissipating": "Heat-Dissipating Armor", "Anti-Penetrative Ablation": "Ablation Armor", "Ferro-Fibrous Prototype": "Prototype Ferro-Fibrous",
};
const GYROS: Record<string, string> = { "": "Standard Gyro", "XL Gyro": "Extra-Light Gyro", "Heavy Duty Gyro": "Heavy-Duty Gyro" };
const HEAT_SINKS: Record<string, string> = { "Single": "Single Heat Sink", "Double": "Double Heat Sink", "Laser": "Laser Heat Sink", "Compact": "Compact Heat Sink" };
/** Jump jet slot names, their SSW type and slots a jet. */
const JUMP_JETS: Record<string, [string, number]> = {
    "Jump Jet": ["Standard Jump Jet", 1], "Improved Jump Jet": ["Improved Jump Jet", 2],
    "ISPrototypeImprovedJumpJet": ["Prototype Improved Jump Jet", 2], "UMU": ["Mech UMU", 1],
};
const FIXED_SLOTS = new Set(["Shoulder", "Upper Arm Actuator", "Lower Arm Actuator", "Hand Actuator", "Hip", "Upper Leg Actuator",
    "Lower Leg Actuator", "Foot Actuator", "Life Support", "Sensors", "Cockpit", "Fusion Engine", "Gyro", "-Empty-"]);
const ARMOR_SLOT = /Ferro|Stealth|Reactive|Reflective|Lamellor|Ballistic-Reinforced|Impact-Resistant|Anti-Penetrative|Heat-Dissipating|Hardened/i;
const STRUCTURE_SLOT = /Endo|Composite/i;
const HEAT_SINK_SLOT = /HeatSink|Heat Sink/i;
// Systems with a slot in several locations: SSW's <multislot name> (one location per slot).
const MULTISLOTS: [RegExp, string][] = [
    [/^Environmental Sealing/i, "Environmental Sealing"], [/^Tracks$/i, "Tracks"], [/Blue ?Shield/i, "Blue Shield PFD"],
    [/Chameleon/i, "Chameleon LPS"], [/Null ?Signature/i, "Null Signature System"], [/Void ?Signature/i, "Void Signature System"],
];
const FIRE_CONTROL: [RegExp, string][] = [[/ArtemisIV/i, "fcsa4"], [/ArtemisV/i, "fcsa5"], [/Apollo/i, "fcsapollo"]];

export interface IMtfFile {
    /** Each "key:value" line, by key in lower case; a key that repeats adds to the list. */
    values: Record<string, string[]>;
    /** Each location's slot names, as the file lists them. */
    slots: Record<string, string[]>;
}

export const parseMtfFile = (text: string): IMtfFile | null => {
    if (typeof text !== "string" || text.length === 0 || text.length > MAX_MTF_FILE_LENGTH) return null;
    const values: Record<string, string[]> = Object.create(null);
    const slots: Record<string, string[]> = Object.create(null);
    let location: string | null = null;
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (line.startsWith("#")) continue;
        if (!line) { location = null; continue; }
        if (location !== null) { slots[location].push(line); continue; }
        const section = /^([A-Za-z ]+):$/.exec(line);
        if (section && (BIPED_LOCATIONS[section[1]] || QUAD_LOCATIONS[section[1]] || section[1] === "Center Leg")) {
            location = section[1];
            slots[location] = [];
            continue;
        }
        const colon = line.indexOf(":");
        if (colon > 0) (values[line.slice(0, colon).trim().toLowerCase()] ??= []).push(line.slice(colon + 1).trim());
    }
    return values.chassis ? { values, slots } : null;
};

const value = (file: IMtfFile, key: string): string => file.values[key]?.[0] ?? "";
const xml = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A slot name without MegaMek's markers: rear, pod, turret and armored, and a variable size. */
const readSlot = (raw: string) => {
    let name = raw;
    const marks = { rear: false, turret: false, armored: false, pod: false, size: 0 };
    const size = /:SIZE:([\d.]+)/i.exec(name);
    if (size) { marks.size = +size[1]; name = name.replace(size[0], ""); }
    name = name.replace(/\s*\((R|OMNIPOD|T|ARMORED)\)/gi, (_match, mark: string) => {
        const key = mark.toUpperCase();
        if (key === "R") marks.rear = true;
        if (key === "T") marks.turret = true;
        if (key === "ARMORED") marks.armored = true;
        if (key === "OMNIPOD") marks.pod = true;
        return "";
    }).replace(/^Dumper \(Rear\)$/, "Dumper").trim();
    return { name, ...marks };
};

interface IMtfItem {
    record: IEquipmentItem;
    /** The file's slot name, for the report. */
    name: string;
    rear: boolean;
    /** In an OmniMech's pod space, not its base chassis. */
    pod: boolean;
    tons: number;
    half: boolean;
    places: { loc: string; index: number; count: number }[];
}

/**
 * Converts a MegaMek 'Mech file into an SSW save: what the SSW import reads. Issues name what could not be
 * carried over; a file with issues should not be trusted as converted.
 */
export function convertMtfToSSW(file: IMtfFile): { xml: string; issues: string[]; quad: boolean } {
    const issues: string[] = [];
    const config = value(file, "config");
    const techbase = value(file, "techbase");
    const clan = /^clan/i.test(techbase);
    const mixed = /^mixed/i.test(techbase);
    const faction: ImportFaction = clan || /clan chassis/i.test(techbase) ? "clan" : "is";
    const quad = /^quad/i.test(config) && !/quadvee/i.test(config);
    if (!/^(biped|quad)( omnimek)?$/i.test(config)) issues.push(`'Mech configuration '${config}' is not converted yet`);
    const locations = quad ? QUAD_LOCATIONS : BIPED_LOCATIONS;
    const tons = +value(file, "mass");
    if (tons > 100) issues.push("Superheavy 'Mechs are not converted yet");
    for (const key of ["lam", "motive"]) if (value(file, key)) issues.push(`'${key}: ${value(file, key)}' is not converted yet`);

    // Chassis components.
    const engine = /^(\d+)\s+(.+?)\s*(\((Clan|IS)\))?\s*Engine\s*(\((Clan|IS)\))?$/i.exec(value(file, "engine"));
    const engineName = engine ? ENGINES[engine[2].trim()] : undefined;
    if (!engine || !engineName) issues.push(`Engine '${value(file, "engine")}' is not converted yet`);
    // An engine of the design's own tech base carries no marker: SSW writes its tech base all the same.
    const engineTech = engine?.[4] ?? engine?.[6] ?? (faction === "clan" ? "Clan" : "IS");
    const structureTech = /^clan /i.test(value(file, "structure")) ? "1" : /^is /i.test(value(file, "structure")) ? "0" : "2";
    const structureName = STRUCTURES[value(file, "structure").replace(/^(IS|Clan) /i, "")] ?? value(file, "structure");
    const armor = /^(.+?)\((Clan|Inner Sphere)\)$/.exec(value(file, "armor"));
    const armorName = armor ? ARMORS[armor[1]] ?? armor[1] : value(file, "armor");
    if (/patchwork/i.test(armorName)) issues.push("Patchwork armor is not converted yet");
    const sinks = /^(\d+)\s+(IS |Clan )?(\w+)$/i.exec(value(file, "heat sinks"));
    const sinkType = sinks ? HEAT_SINKS[sinks[3]] : undefined;
    if (!sinks || !sinkType) issues.push(`Heat sinks '${value(file, "heat sinks")}' are not converted yet`);
    const sinkClan = sinks?.[2] ? /clan/i.test(sinks[2]) : clan;
    const sinkSlots = sinkType === "Double Heat Sink" ? (sinkClan ? 2 : 3) : sinkType === "Laser Heat Sink" ? 2 : 1;
    if (sinkType === "Compact Heat Sink") issues.push("Compact heat sinks are not converted yet");
    const cockpit = value(file, "cockpit") || "Standard Cockpit";
    const gyro = GYROS[value(file, "gyro")] ?? value(file, "gyro");
    const myomer = value(file, "myomer");
    const industrial = /industrial/i.test(cockpit) || /industrial/i.test(value(file, "structure"));
    const mechType = /^primitive/i.test(cockpit) ? (industrial ? "PrimitiveIndustrialMech" : "PrimitiveBattleMech") : industrial ? "IndustrialMech" : "BattleMech";

    // The slots: each location's equipment, in runs of one item's slots.
    const items: IMtfItem[] = [];
    const structureSlots: string[] = [];
    const armorSlots: string[] = [];
    const sinkSlotsAt: string[] = [];
    const jetSlotsAt: string[] = [];
    const myomerSlots: string[] = [];
    const armoredSlots: string[] = [];
    const armAES: string[] = [];
    const legAES: string[] = [];
    const fireControl = new Set<string>();
    const actuators = { la: { lla: false, lh: false }, ra: { lla: false, lh: false } };
    let jetType = "";
    // An OmniMech's pod heat sinks and jump jets: the rest are its base chassis'.
    let podSinks = 0;
    let podJets = 0;
    const multislots: Record<string, string[]> = {};
    const wing = { tech: -1, lt: -1, rt: -1 };
    let boosterMP = 0;
    const leftovers: { item: IMtfItem; have: number }[] = [];
    const weapons: IEquipmentItem[] = [];
    const ammoSlots: { name: string; loc: string; index: number; rear: boolean; pod: boolean }[] = [];
    const place = (loc: string, index: number) => `<location index="${index}">${loc.toUpperCase()}</location>`;

    for (const [section, list] of Object.entries(file.slots)) {
        const loc = locations[section];
        if (!loc) { issues.push(`Location '${section}' is not converted yet`); continue; }
        if (list.length > 12) issues.push(`${section} lists more than 12 slots`);
        for (let index = 0; index < list.length;) {
            const raw = list[index];
            const slot = readSlot(raw);
            const name = slot.name;
            if (slot.armored) armoredSlots.push(place(loc, index));
            if (slot.turret) issues.push(`Turret-mounted '${name}' is not converted yet`);
            if (FIXED_SLOTS.has(name)) {
                if ((loc === "la" || loc === "ra") && !quad) {
                    if (name === "Lower Arm Actuator") actuators[loc].lla = true;
                    if (name === "Hand Actuator") actuators[loc].lh = true;
                }
                index++; continue;
            }
            const fcs = FIRE_CONTROL.find(([test]) => test.test(name));
            if (fcs) { fireControl.add(fcs[1]); index++; continue; }
            if (/ammo|Pods$/i.test(name)) { ammoSlots.push({ name, loc, index, rear: slot.rear, pod: slot.pod }); index++; continue; }
            if (HEAT_SINK_SLOT.test(name)) {
                if (/prototype/i.test(name)) issues.push(`'${name}' is not converted yet`);
                // Each sink lists its own slots (a mixed-tech 'Mech can carry both IS and Clan doubles).
                const per = /double/i.test(name) ? (/^(CL|Clan)/i.test(name) ? 2 : /^IS/i.test(name) ? 3 : sinkSlots) : /laser/i.test(name) ? 2 : 1;
                let run = 1;
                while (list[index + run] === raw) run++;
                for (let sink = 0; sink + per <= run; sink += per) {
                    sinkSlotsAt.push(place(loc, index + sink));
                    if (slot.pod) podSinks++;
                }
                if (run % per !== 0) issues.push(`'${name}' in ${section} is split in a way not converted yet`);
                index += run; continue;
            }
            if (JUMP_JETS[name]) {
                jetType = JUMP_JETS[name][0]; jetSlotsAt.push(place(loc, index)); index += JUMP_JETS[name][1];
                if (slot.pod) podJets++;
                continue;
            }
            if (/Triple Strength Myomer/i.test(name)) { myomerSlots.push(place(loc, index)); index++; continue; }
            if (STRUCTURE_SLOT.test(name)) { structureSlots.push(place(loc, index)); index++; continue; }
            if (ARMOR_SLOT.test(name)) { armorSlots.push(place(loc, index)); index++; continue; }
            const multi = MULTISLOTS.find(([test]) => test.test(name));
            if (multi) { (multislots[multi[1]] ??= []).push(place(loc, index)); index++; continue; }
            // A partial wing is <partialwing tech lsstart rsstart>; Mechanical Jump Boosters are <jumpbooster mp>, its size.
            if (/PartialWing$/i.test(name)) {
                wing.tech = /^CL/i.test(name) ? 1 : 0;
                if (loc === "lt" && wing.lt < 0) wing.lt = index;
                if (loc === "rt" && wing.rt < 0) wing.rt = index;
                index++; continue;
            }
            if (/^MechanicalJumpBooster$/i.test(name)) { boosterMP = slot.size || boosterMP; index++; continue; }
            if (name === "ISAES" || name === "CLAES") {
                if (loc === "la" || loc === "ra") armAES.push(`<arm_aes location="${loc.toUpperCase()}" index="${index}"/>`);
                else legAES.push(place(loc, index));
                let run = 1;
                while (list[index + run] === raw) run++;
                index += run; continue;
            }

            // One-shot launchers: MegaMek's "(OS)", "(IOS)" and "(I-OS)" are our records' "-os" and "-ios".
            const oneShot = /\s*\((OS|IOS|I-OS)\)$/i.exec(name);
            const baseName = oneShot ? name.replace(oneShot[0], "") : name;
            const itemFaction: ImportFaction = /^(CL|Clan )/.test(baseName) ? "clan" : /^IS/.test(baseName) ? "is" : faction;
            let record = findImportedEquipment(baseName, itemFaction, true)?.item;
            if (record && oneShot) {
                const suffix = /^OS$/i.test(oneShot[1]) ? "-os" : "-ios";
                record = findImportedEquipment(record.tag + suffix, itemFaction, true)?.item;
            }
            let run = 1;
            while (list[index + run] === raw) run++;
            // A PPC Capacitor's slot follows its PPC: the catalog holds the pair as one record.
            if (/^(IS|CL)?PPC ?Capacitor$/i.test(name)) {
                const ppc = [...items].reverse().find((item) => item.places[0]?.loc === loc && /ppc/.test(item.record.tag));
                const paired = ppc && (findImportedEquipment(ppc.record.tag + "-capacitor", itemFaction, true)
                    ?? findImportedEquipment("clan-" + ppc.record.tag.replace(/-clan$/, "") + "-capacitor", itemFaction, true));
                if (ppc && paired) ppc.record = paired.item;
                else issues.push("Cannot pair a PPC Capacitor with its PPC");
                index += run; continue;
            }
            if (!record) { issues.push(`Cannot find any equipment named '${name}'`); index += run; continue; }
            // An item spread over several locations (Talons: every leg) is listed once, as SSW does; the import spreads it.
            if (record.spreadSlots && items.some((item) => item.record.tag === record!.tag)) { index += run; continue; }
            const size = record.space?.battlemech ?? 1;
            // Sized items (cargo) and variable-size ones (hatchets, targeting computers, MASC) fill their run; a whole
            // number of others fill theirs, the rest is split.
            const each = slot.size > 0 || size <= 0 || record.variableSize ? run : size;
            let left = run;
            while (left > 0) {
                const count = Math.min(each, left);
                const item: IMtfItem = { record, name, rear: slot.rear, pod: slot.pod, tons: slot.size, half: false, places: [{ loc, index: index + run - left, count }] };
                if (count < each) leftovers.push({ item, have: count });
                else items.push(item);
                left -= count;
            }
            if (!record.isAmmo) weapons.push(record);
            index += run;
        }
    }

    // A split item lists part of its slots in each of two locations.
    while (leftovers.length > 0) {
        const first = leftovers.shift()!;
        const need = (first.item.record.space?.battlemech ?? 1) - first.have;
        const other = leftovers.findIndex((piece) => piece.item.record.tag === first.item.record.tag && piece.have === need);
        if (other < 0) { issues.push(`Cannot place '${first.item.name}': its slots are split in a way not converted yet`); continue; }
        const [second] = leftovers.splice(other, 1);
        items.push({ ...first.item, places: [...first.item.places, ...second.item.places] });
    }

    // Ammunition: the weapon each bin feeds picks the round.
    for (const ammo of ammoSlots) {
        const line = parseBlkAmmoLine(/Pods$/i.test(ammo.name) ? ammo.name.replace(/Pods$/i, "Ammo") : ammo.name);
        const weapon = line ? findBlkAmmoWeapon(line, weapons) : undefined;
        const round = line && weapon ? findBlkAmmo(line, weapon) : undefined;
        if (!line || !round) { issues.push(`Cannot find the ammunition '${ammo.name}'`); continue; }
        items.push({ record: round, name: ammo.name, rear: ammo.rear, pod: ammo.pod, tons: 0, half: line.half, places: [{ loc: ammo.loc, index: ammo.index, count: 1 }] });
    }

    const tech = (record: IEquipmentItem) => record.techBase === "clan" || /^clan|-clan$|clan_/.test(record.tag) ? "(CL) " : "(IS) ";
    const equipment = items.map((item) => {
        const name = (item.rear ? "(R) " : "") + tech(item.record) + item.record.tag + (item.half ? " (1/2)" : "");
        const where = item.places.length === 1
            ? place(item.places[0].loc, item.places[0].index)
            : item.places.map((part) => `<splitlocation index="${part.index}" number="${part.count}">${part.loc.toUpperCase()}</splitlocation>`).join("");
        return `<equipment${item.pod ? ' omnipod="TRUE"' : ""}><name manufacturer="">${xml(name)}</name><type>${item.record.isAmmo ? "ammunition" : "equipment"}</type>`
            + (item.tons > 0 ? `<tons>${item.tons}</tons>` : "") + where + "</equipment>";
    });

    const armorValues = Object.entries(file.values).filter(([key]) => / armor$/.test(key)).map(([key, list]) => {
        const loc = ARMOR_LOCATIONS[key.replace(/ armor$/, "").toUpperCase()];
        if (!loc) issues.push(`Armor location '${key}' is not converted yet`);
        const points = /(\d+)$/.exec(list[0])?.[1] ?? "0";
        return loc ? `<${loc}>${points}</${loc}>` : "";
    });
    const jumpMP = +value(file, "jump mp") || 0;
    const tb = (tag: string | undefined) => tag === undefined ? "2" : /clan/i.test(tag) ? "1" : "0";
    const name = value(file, "clanname") ? `${value(file, "clanname")} (${value(file, "chassis")})` : value(file, "chassis");
    const ejection = /full head/i.test(value(file, "ejection")) ? ` fhes="TRUE"` : "";
    const fcs = [...FIRE_CONTROL.map(([, flag]) => ` ${flag}="${fireControl.has(flag) ? "TRUE" : "FALSE"}"`)].join("");
    const sswTech = mixed ? "Mixed" : clan ? "Clan" : "Inner Sphere";

    const out = `<?xml version="1.0" encoding="UTF-8"?>
<mech name="${xml(name)}" model="${xml(value(file, "model"))}" tons="${tons}" omnimech="${/omnimek/i.test(config) ? "TRUE" : "FALSE"}">
<mech_type>${mechType}</mech_type>
<techbase manufacturer="" location="">${sswTech}</techbase>
<year>${xml(value(file, "era"))}</year>
<motive_type>${quad ? "Quad" : "Biped"}</motive_type>
<structure techbase="${structureTech}"><type>${xml(structureName)}</type>${structureSlots.join("")}</structure>
<engine rating="${engine?.[1] ?? 0}" techbase="${tb(engineTech)}">${xml(engineName ?? "")}</engine>
<gyro techbase="2">${xml(gyro)}</gyro>
<cockpit><type${ejection}${value(file, "cockpit") === "Command Console" ? ` commandconsole="TRUE"` : ""}>${xml(value(file, "cockpit") === "Command Console" ? "Standard Cockpit" : cockpit)}</type></cockpit>
${myomer && !/^standard$/i.test(myomer) ? `<enhancement techbase="${clan ? 1 : 0}"><type>${/industrial/i.test(myomer) ? "Industrial TSM" : "TSM"}</type>${myomerSlots.join("")}</enhancement>` : ""}
<armor techbase="${armor ? (armor[2] === "Clan" ? 1 : 0) : 2}"><type>${xml(armorName)}</type>${armorValues.join("")}${armorSlots.join("")}</armor>
${/omnimek/i.test(config) ? `<omnibase heatsinks="${Math.max(0, +(sinks?.[1] ?? 0) - podSinks)}" jumpjets="${Math.max(0, (jetType === "Mech UMU" ? jetSlotsAt.length : jumpMP) - podJets)}" />` : ""}
<baseloadout${fcs}>
${quad ? "" : `<actuators lla="${actuators.la.lla ? "TRUE" : "FALSE"}" lh="${actuators.la.lh ? "TRUE" : "FALSE"}" rla="${actuators.ra.lla ? "TRUE" : "FALSE"}" rh="${actuators.ra.lh ? "TRUE" : "FALSE"}"/>`}
<clancase>${mixed && faction === "clan" ? "TRUE" : "FALSE"}</clancase>
<heatsinks number="${sinks?.[1] ?? 0}" techbase="${sinkClan ? 1 : 0}"><type>${sinkType ?? ""}</type>${sinkSlotsAt.join("")}</heatsinks>
${jetSlotsAt.length > 0 || jumpMP > 0 ? `<jumpjets number="${jetType === "Mech UMU" ? jetSlotsAt.length : jumpMP}"><type>${jetType || "Standard Jump Jet"}</type>${jetSlotsAt.join("")}</jumpjets>` : ""}
${equipment.join("\n")}
${Object.entries(multislots).map(([name, list]) => `<multislot name="${name}">${list.join("")}</multislot>`).join("\n")}
${wing.tech >= 0 ? `<partialwing tech="${wing.tech}" lsstart="${Math.max(0, wing.lt)}" rsstart="${Math.max(0, wing.rt)}" />` : ""}
${boosterMP > 0 ? `<jumpbooster mp="${boosterMP}" />` : ""}
${armAES.join("")}${legAES.length > 0 ? `<leg_aes>${legAES.join("")}</leg_aes>` : ""}
${armoredSlots.length > 0 ? `<armored_locations>${armoredSlots.join("")}</armored_locations>` : ""}
</baseloadout>
</mech>`;
    return { xml: out, issues, quad };
}

/** The file's fluff, production lines and quirks, laid out as a BLK file's blocks. */
const asBlkFile = (file: IMtfFile): IBlkFile => {
    const systems = (key: string) => (file.values[key] ?? []).map((line) => line.replace(/^([A-Z_]+):/, "$1:"));
    const list = (key: string) => (file.values[key] ?? []).map((line) => line.split("|").filter(Boolean).join(", "));
    return {
        blocks: {
            overview: file.values.overview ?? [], capabilities: file.values.capabilities ?? [], deployment: file.values.deployment ?? [],
            history: file.values.history ?? [], notes: file.values.notes ?? [],
            manufacturer: list("manufacturer"), primaryfactory: list("primaryfactory"),
            systemmanufacturers: systems("systemmanufacturer"), systemmodels: systems("systemmode"),
            quirks: file.values.quirk ?? [], weaponquirks: file.values.weaponquirk ?? [],
        },
    };
};

/** Imports a MegaMek 'Mech file. Issues name what could not be carried over. */
export function importBattleMechMtf(text: string): { mech: BattleMech | null; issues: string[]; xml: string } {
    const file = parseMtfFile(text);
    if (!file) return { mech: null, issues: ["Not a MegaMek 'Mech file"], xml: "" };
    const { xml: sswXml, issues, quad } = convertMtfToSSW(file);
    const mech = new BattleMech();
    mech.importSSWXML(sswXml);
    issues.push(...mech.sswImportErrors);
    const blk = asBlkFile(file);
    mech.tro.import(readBlkTechnicalReadout(blk));
    // A weapon quirk names its weapon by slot: the item in that slot (or the multi-slot item it is part of).
    const tables = mech.getCriticals() as unknown as Record<string, ({ uuid?: string; placeholder?: boolean } | null)[]>;
    const items: IBlkImportedItem[] = [];
    for (const line of blk.blocks.weaponquirks) {
        const [, location, slot, name] = line.split(":");
        const loc = quad ? QUAD_LOCATIONS[location] ?? ARMOR_LOCATIONS[location] : ARMOR_LOCATIONS[location];
        const table = loc ? tables[(quad ? QUAD_CRIT_TABLE : CRIT_TABLE)[loc]] : undefined;
        let index = Number(slot);
        while (table && index > 0 && table[index]?.placeholder) index--;
        const uuid = table?.[index]?.uuid?.replace(/:\d+$/, "");
        if (uuid && name) items.push({ name, location: loc!, uuid });
    }
    applyBlkQuirks(blk, mech, items, issues, (abbr) => ARMOR_LOCATIONS[abbr.toUpperCase()]);
    return { mech, issues, xml: sswXml };
}
