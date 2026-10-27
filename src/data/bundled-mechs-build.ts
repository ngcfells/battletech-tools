// Build support, not app code: converts a folder of Skunk Werks files, then MegaMek's 'Mech files for the 'Mechs those
// lack, into the bundled 'Mech data (#241). Run by
//   WRITE_BUNDLED_MECHS=1 npx vitest run src/data/bundled-mechs.test.ts
// with BUNDLED_SSW_DIR and BUNDLED_MEGAMEK_DIR set when they are not the defaults below.
import fs from "node:fs";
import path from "node:path";
import { BattleMech } from "../classes/battlemech";
import { importBattleMechMtf } from "../classes/battlemech-mtf";
import type { IASMULUnit } from "../classes/alpha-strike-unit";
import { correctMULBattleValue } from "./mul-bv-corrections";
import { BUNDLED_CHUNK_SIZE, BundledDesignSource, compactMech, compareDesigns, describeCriticals, getMechFingerprint, IBundledDesignHeader, IDesignSummary, loadBundledMech, shareChunk, summarizeDesign } from "../utils/bundled-designs";
import { getClassicMechEntries, getMULMatchKeys } from "../utils/classicMULMatch";
import { stringifyTable, untabulate } from "../utils/packed-json";
import { getRulesLevelStanding, UnitStanding } from "../utils/unit-standing";
import { getSSWXMLBasicInfo, ISSWBasicInfo, parseSSWXML } from "../utils/getSSWXMLBasicInfo";

export const DEFAULT_SSW_DIR = "C:/repo/battletech-tools/WorkingData_DEV/SSWdata";
export const DEFAULT_MEGAMEK_DIR = "C:/repo/megamek/megamek/data/mekfiles/unit_files";

// MegaMek's files for these IndustrialMechs have no cockpit line, which MegaMek (and the converter, #371) reads as a
// Standard cockpit with Advanced Fire Control; their record sheets have a plain Industrial cockpit. The Quasit's RS:3075
// sheet shows one, and the MUL's Battle Values (MUL: Battle Values v1.0 p.174 for the Quasit; the live MUL for the
// Hyena) are the no-AFC figures. Each gets the Industrial cockpit line it is missing.
export const MEGAMEK_INDUSTRIAL_COCKPIT = new Set([
    "megamek/3075/Quasit QUA-51M MilitiaMech.mtf",
    "megamek/3075/Quasit QUA-51P MilitiaMech.mtf",
    "megamek/3075/Quasit QUA-51T MilitiaMech.mtf",
    "megamek/3075/Hyena HYN-4A SalvageMech .mtf",
    "megamek/3075/Hyena HYN-4B SalvageMech.mtf",
]);

function withIndustrialCockpit(name: string, text: string): string {
    return MEGAMEK_INDUSTRIAL_COCKPIT.has(name) && !/^cockpit:/im.test(text) ? "cockpit:Industrial Cockpit\n" + text : text;
}
const COPYRIGHT_NOTICE = "The data here is/may be copyrighted and NOT included in the GPLv3 license. ";
const SSW_CREDIT = "the Solaris Skunk Werks project's files at https://github.com/Solaris-Skunk-Werks/SSW-Master";
const MEGAMEK_CREDIT = "MegaMek's unit files (https://github.com/MegaMek/megamek): MegaMek Data (C) 2025-2026 by The MegaMek Team, "
    + "licensed under CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/).";
export const MEGAMEK_NOTICE = COPYRIGHT_NOTICE + "Converted from " + MEGAMEK_CREDIT;
export const BUNDLED_MECHS_NOTICE = COPYRIGHT_NOTICE + "Converted from " + SSW_CREDIT + ", and from " + MEGAMEK_CREDIT;

const MECH_CLASSES = ["BattleMech", "IndustrialMech"];
const MECH_TYPE_IDS = [18, 20];
const isMULMech = (unit: IASMULUnit) => MECH_CLASSES.includes(unit.Class) || MECH_TYPE_IDS.includes(unit.Type?.Id);
type Leave = (reason: string, detail?: string) => void;

/**
 * A bundled design's standing, left out when canon: a file from an apocryphal folder (MegaMek's "Videogame
 * (Apocryphal)"), else what the gear's rules level makes it. Canon is what the live MUL or MUL 1.0 lists, or an
 * official FASA, FanPro or Catalyst record sheet (#241): Shrapnel, Field Manual pilot variants and the Classic
 * MechWarrior: Dark Age sheets stay canon off the MUL, until a check of the record sheet books fails to find one.
 */
export function getBundledStanding(file: string, unit: { getRequiredRulesLevel(): number }): { standing?: UnitStanding } {
    const standing = /apocryphal/i.test(file) ? "apocryphal" : getRulesLevelStanding(unit.getRequiredRulesLevel());
    return standing === "canon" ? {} : { standing };
}

/** A MUL record from the live MUL or MUL 1.0, not our own custom list. */
export const isOfficialMULRecord = (unit: IASMULUnit | undefined): boolean => !!unit && unit.MulSource !== "custom";

const squash = (text: string): string => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
// The quoted or bracketed name a model carries ("Yen Lo Wang", (Jasminda)), squashed.
const nicknameOf = (text: string): string => squash(/["'“”‘’(]([^"'“”‘’()]+)["'“”‘’)]/.exec(text)?.[1] ?? "");
// A model's code, its first word ("CN9-YLW2", none for "(Jasminda)"), with a letter O after a digit read as zero (SCP-1O).
const codeOf = (model: string): string => {
    const first = model.trim().split(/\s+/)[0] ?? "";
    return /^["'“‘(]/.test(first) ? "" : squash(first).replace(/(?<=\d)o/g, "0");
};
const commonPrefix = (a: string, b: string): number => {
    let length = 0;
    while (length < a.length && a[length] === b[length]) length++;
    return length;
};

/**
 * The MUL record of a 'Mech whose name the MUL spells another way ("Yen-lo-wang", a SecurityMech suffix, ABS-5Y for
 * ANB-5Y), among records of the same tonnage whose name holds the chassis's first word. A record matches on the same
 * BV when the codes' numbers agree (or one has none, or both carry the same nickname); on the same code when this
 * model names no pilot or nickname the record lacks; or on the same nickname when the numbers agree. Best first:
 * BV, nickname, code, then the closest and shortest variant.
 */
export function findLooseMULMatch(chassis: string, model: string, tons: number, bv: number, units: IASMULUnit[]): IASMULUnit | undefined {
    const root = squash(chassis.replace(/^["'“‘]+/, "").split(/[\s("'“‘]/)[0] ?? "");
    if (!root) return undefined;
    const code = codeOf(model);
    const ownNickname = nicknameOf(model);
    const anyNickname = nicknameOf(chassis + " " + model);
    const digits = (text: string) => text.replace(/\D/g, "");
    let best: { unit: IASMULUnit; rank: number[] } | undefined;
    for (const unit of units) {
        if (unit.Tonnage !== tons || !squash(unit.Name ?? "").includes(root)) continue;
        const variant = unit.Variant ?? "";
        const theirCode = codeOf(variant);
        const theirNickname = nicknameOf(variant);
        const sameNickname = anyNickname !== "" && anyNickname === theirNickname;
        const numbersAgree = !digits(code) || !digits(theirCode) || digits(code) === digits(theirCode);
        const byBV = bv > 0 && unit.BattleValue === bv && (numbersAgree || sameNickname);
        const byNickname = sameNickname && numbersAgree;
        const byCode = code !== "" && code === theirCode && (ownNickname === "" || ownNickname === theirNickname);
        if (!byBV && !byNickname && !byCode) continue;
        const rank = [+byBV, +byNickname, +byCode, commonPrefix(squash(model), squash(variant)), -variant.length];
        const differs = best ? rank.findIndex((value, index) => value !== best!.rank[index]) : -1;
        if (!best || (differs >= 0 && rank[differs] > best.rank[differs])) best = { unit, rank };
    }
    return best?.unit;
}
interface IKeptLayout { summary: IDesignSummary; name: string }

// SSW's names for chassis components ("XL Engine", "Extra-Light Gyro", "Endo-Steel"). SSW's engine techbase
// attribute (0 Inner Sphere, 1 Clan) picks the Inner Sphere or Clan XL/XXL engine. Primitive I.C.E. and fuel cell
// engines are the plain ones on a Primitive 'Mech.
const ENGINES: Record<string, string> = {
    "Fusion Engine": "standard", "XL Engine/0": "xl", "XL Engine/1": "clan_xl", "XXL Engine/0": "xxl",
    "XXL Engine/1": "clan_xxl", "Light Fusion Engine": "light", "Compact Fusion Engine": "compact",
    "I.C.E. Engine": "ice", "Fuel-Cell Engine": "cell", "Fission Engine": "fission",
    "Primitive Fusion Engine": "primitive", "Primitive I.C.E. Engine": "ice", "Primitive Fuel-Cell Engine": "cell",
};
const GYROS: Record<string, string> = {
    "Standard Gyro": "standard", "Extra-Light Gyro": "xl", "Compact Gyro": "compact", "Heavy-Duty Gyro": "heavy-duty",
};
const STRUCTURES: Record<string, string> = {
    "Standard Structure": "standard", "Endo-Steel": "endo-steel", "Endo-Composite": "endo-composite",
    "Composite Structure": "composite", "Reinforced Structure": "reinforced", "Industrial Structure": "industrial",
    // A Primitive 'Mech's structure is the standard or industrial one with the Primitive flag.
    "Primitive Structure": "standard", "Primitive Industrial Structure": "industrial",
};

/** An engine, gyro or structure imported as another type, or structure slots left unplaced. */
function checkComponents(xml: string, mech: BattleMech): string[] {
    const wrong: string[] = [];
    const engine = /<engine [^>]*techbase="(\d)"[^>]*>([^<]+)</.exec(xml);
    const gyro = /<gyro[^>]*>([^<]+)</.exec(xml)?.[1] ?? "";
    const structure = /<structure[^>]*>\s*<type>([^<]+)</.exec(xml)?.[1] ?? "";
    const expectedEngine = engine ? ENGINES[`${engine[2]}/${engine[1]}`] ?? ENGINES[engine[2]] : undefined;
    if (mech.getEngineType().tag !== expectedEngine) wrong.push(`${engine?.[2]} -> ${mech.getEngineType().tag}`);
    if (mech.getGyro().tag !== GYROS[gyro]) wrong.push(`${gyro} -> ${mech.getGyro().tag}`);
    if (mech.getInternalStructureType() !== STRUCTURES[structure]) wrong.push(`${structure} -> ${mech.getInternalStructureType()}`);
    const unplaced = mech.getUnallocatedCriticals().filter((slot) => slot?.tag === STRUCTURES[structure]).length;
    if (unplaced > 0) wrong.push(`${unplaced} ${structure} slots unplaced`);
    return wrong;
}

const listFiles = (dir: string, extension: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory() ? listFiles(path.join(dir, entry.name), extension)
        : entry.name.toLowerCase().endsWith(extension) ? [path.join(dir, entry.name)] : []);

/** Every Master Unit List entry the test picks, by match key: live entries first, then MUL 1.0's, then our own. */
export function loadMULIndex(mulDir: string, test: (unit: IASMULUnit) => boolean): Map<string, IASMULUnit> {
    const index = new Map<string, IASMULUnit>();
    for (const list of ["live", "mul1", "custom"]) {
        for (const file of fs.readdirSync(path.join(mulDir, list)).sort()) {
            for (const entry of untabulate(JSON.parse(fs.readFileSync(path.join(mulDir, list, file), "utf8"))) as IASMULUnit[]) {
                const unit = { ...(list === "live" ? correctMULBattleValue(entry) : entry), MulSource: list === "live" ? "mul2" as const : list as "mul1" | "custom" };
                if (!test(unit)) continue;
                for (const key of getMULMatchKeys(unit.Name ?? "", unit.Variant ?? "")) if (!index.has(key)) index.set(key, unit);
            }
        }
    }
    return index;
}

/** MUL 1.0's entries the test picks, by id: a MegaMek file's `mul id` is MUL 1.0's, not the live MUL's. */
function loadMUL1ById(mulDir: string, test: (unit: IASMULUnit) => boolean): Map<number, IASMULUnit> {
    const index = new Map<number, IASMULUnit>();
    for (const file of fs.readdirSync(path.join(mulDir, "mul1")).sort()) {
        for (const unit of JSON.parse(fs.readFileSync(path.join(mulDir, "mul1", file), "utf8")) as IASMULUnit[]) {
            if (test(unit)) index.set(unit.Id, unit);
        }
    }
    return index;
}

/**
 * Seeds Math.random from a file's name while it is built (mulberry32), so the UUIDs a design is given, and any order
 * they decide, come out the same every build and a rebuild's diff shows only the designs that changed.
 */
export function seedRandom(seed: string): void {
    let state = [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
    Math.random = () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = Math.imul(state ^ (state >>> 15), state | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export interface IBundledBuild {
    headers: IBundledDesignHeader[];
    designs: Record<string, unknown>[];
    /** Files left out: why, and the particulars. */
    leftOut: { file: string; reason: string; detail: string }[];
}

/**
 * An OmniMech keeps the configurations whose BV matches the MUL's, or the loadout's own in the file where the MUL has
 * no entry; the others are left out one by one (#112). False when none is left.
 */
function keepMatchingConfigurations(mech: BattleMech, xml: string, mul: Map<string, IASMULUnit>, leave: Leave): boolean {
    const names = mech.getOmniConfigurationNames();
    if (names.length < 2) return true;
    const loadouts = ([] as Record<string, unknown>[]).concat(parseSSWXML(xml)?.mech?.loadout ?? []);
    const fileBV = new Map(loadouts.map((loadout) => [String(loadout["@_name"] ?? "").trim(), Number(loadout.battle_value)]));
    const wrong = getClassicMechEntries([mech]).filter((entry) => names.includes(entry.model) && entry.design.getActiveOmniConfiguration() === entry.model)
        .flatMap(({ chassis, model, design }) => {
            const unit = [model, mech.getModelName() + " " + model].flatMap((variant) => getMULMatchKeys(chassis, variant)).map((key) => mul.get(key)).find((found) => found && found.BattleValue > 0);
            const expected = unit ? unit.BattleValue : fileBV.get(model);
            return design.getBattleValue() === expected ? [] : [`${model}: BV ${design.getBattleValue()}, ${unit ? "MUL" : "file"} ${expected}`];
        });
    if (wrong.length === names.length) { leave("BV differs from the MUL in every configuration", wrong.join("; ")); return false; }
    for (const detail of wrong) {
        leave("configuration BV differs from the MUL", detail);
        mech.deleteOmniConfiguration(detail.slice(0, detail.indexOf(": BV ")));
    }
    return true;
}

export function buildBundledMechs(sswDir: string, mulDir: string, megamekDir?: string): IBundledBuild {
    const mul = loadMULIndex(mulDir, isMULMech);
    const mul1ById = loadMUL1ById(mulDir, isMULMech);
    const officialMechs = [...new Set(mul.values())].filter(isOfficialMULRecord);
    const kept: { header: Omit<IBundledDesignHeader, "id">; design: Record<string, unknown> }[] = [];
    const leftOut: IBundledBuild["leftOut"] = [];
    // The kept design each match key and MUL id belongs to, with its layouts, to tell a duplicate from a variant.
    const taken = new Map<string, IKeptLayout>();
    const takenIds = new Map<number, IKeptLayout>();
    const { warn, log } = console;
    const random = Math.random;
    let failedAllocations = 0;
    console.warn = (message?: unknown) => { if (String(message).startsWith("_allocateCritical failed")) failedAllocations++; };
    console.log = () => {};

    /**
     * Checks an imported design and keeps it if it passes. A MegaMek file may name its MUL 1.0 entry (mulUnit), else it
     * is matched by name like a Skunk Werks file; it is kept only on a MUL BV match, having no BV of its own. A Skunk
     * Werks file without a MUL entry is checked against its own BV.
     */
    const keep = (mech: BattleMech, xml: string, info: ISSWBasicInfo, source: BundledDesignSource, file: string, leave: Leave, mulUnit?: IASMULUnit) => {
        if (failedAllocations > 0) { leave("crit slots failed to place", String(failedAllocations)); return; }
        if (mech.getTonnage() !== +info.tonnage) { leave("tonnage differs", `${mech.getTonnage()} t, file says ${info.tonnage}`); return; }
        const components = checkComponents(xml, mech);
        if (components.length > 0) { leave("chassis components differ", components.join("; ")); return; }
        if (!keepMatchingConfigurations(mech, xml, mul, leave)) return;

        // Each entry (an OmniMech's configurations too) with its own layout: MegaMek's one-configuration file is
        // compared with that configuration of a kept OmniMech, not with its base.
        const entries = getClassicMechEntries([mech]);
        const layoutOf = (design: BattleMech, name: string): IKeptLayout => ({ summary: summarizeDesign(design), name });
        const own = entries.map((entry) => ({ keys: getMULMatchKeys(entry.chassis, entry.model), layout: layoutOf(entry.design, entry.chassis + " " + entry.model) }));
        const named = entries.map((entry) => ({ entry, unit: getMULMatchKeys(entry.chassis, entry.model).map((key) => mul.get(key)).find(Boolean) }));
        // A 'Mech the MUL names another way is found by chassis, tonnage, BV and model code (#241).
        const loose = !mulUnit && !info.omnimech && !named.some(({ unit }) => unit)
            ? findLooseMULMatch(mech.getChassisName(), mech.getModelName(), mech.getTonnage(), mech.getBattleValue(), officialMechs) : undefined;
        const listed = mulUnit || loose ? [{ entry: entries[entries.length - 1], unit: (mulUnit ?? loose)! }] : named.filter((match) => match.unit);
        // One copy of each MUL record: a design checked against a record already taken, by any name, is a twin.
        const clash = own.flatMap(({ keys, layout }) => keys.map((key) => ({ layout, twin: taken.get(key) }))).find(({ twin }) => twin)
            ?? listed.map(({ entry, unit }) => ({ layout: own[entries.indexOf(entry)].layout, twin: takenIds.get(unit!.Id) })).find(({ twin }) => twin);
        if (clash) {
            const { layout, twin } = clash as { layout: IKeptLayout; twin: IKeptLayout };
            // A duplicate names what it differs in; a different submodel waits for its renumbered model.
            const { duplicate, why } = compareDesigns(twin.summary, layout.summary);
            leave(duplicate ? "duplicate of a design already kept" + (why ? ", differs only in " + why : "") : "different submodel, same name and model: " + why, twin.name);
            return;
        }
        const matched = listed.filter((match) => match.unit!.BattleValue > 0);
        const wrong = matched.filter(({ entry, unit }) => entry.design.getBattleValue() !== unit!.BattleValue);
        if (wrong.length > 0) {
            leave("BV differs from the MUL", wrong.map(({ entry, unit }) => `${entry.model}: BV ${entry.design.getBattleValue()}, MUL ${unit!.BattleValue}`).join("; ")); return;
        }
        if (matched.length === 0 && source === "megamek") { leave("no Master Unit List entry to check its BV against"); return; }
        // An OmniMech's configurations were checked one by one.
        if (matched.length === 0 && !info.omnimech && mech.getBattleValue() !== +info.bv2) { leave("BV differs from the file (no MUL entry)", `BV ${mech.getBattleValue()}, file ${info.bv2}`); return; }

        const design = compactMech(mech);
        const reload = loadBundledMech(design);
        const configurations = mech.getOmniConfigurationNames();
        const configs = configurations.length > 1
            ? configurations.map((config) => {
                const configured = mech.cloneOmniConfiguration(config) as BattleMech;
                return { name: config, bv: configured.getBattleValue(), layout: getMechFingerprint(configured) };
            })
            : undefined;
        const reloadConfigs = configs?.map((config) => (reload.cloneOmniConfiguration(config.name) as BattleMech).getBattleValue());
        if (reload.getBattleValue() !== mech.getBattleValue() || reload.getCBillCostNumeric() !== mech.getCBillCostNumeric()
            || reload.getTonnage() !== mech.getTonnage() || describeCriticals(reload) !== describeCriticals(mech)
            || (configs && reloadConfigs!.some((bv, index) => bv !== configs[index].bv))) {
            leave("does not survive the compact format"); return;
        }
        own.forEach(({ keys, layout }) => keys.forEach((key) => taken.set(key, layout)));
        listed.forEach(({ entry, unit }) => takenIds.set(unit!.Id, own[entries.indexOf(entry)].layout));
        const mulId = matched.find(({ entry }) => entry.design === mech)?.unit?.Id ?? matched[0]?.unit?.Id;
        kept.push({
            header: {
                name: mech.getChassisName(), model: mech.getModelName(), tons: mech.getTonnage(), bv: mech.getBattleValue(),
                cost: mech.getCBillCostNumeric(), rulesLevel: +info.rules_level_ssw, year: +info.year, tech: mech.getTech().name,
                ...(mulId ? { mulId } : {}), source, ...(configs ? { configs } : {}), layout: getMechFingerprint(mech), ...getBundledStanding(file, mech),
            },
            design,
        });
    };

    try {
        // Skunk Werks first; MegaMek's files fill in the 'Mechs it has no design for (#241 round 3).
        for (const file of listFiles(sswDir, ".ssw").sort()) {
            const name = path.relative(sswDir, file).replace(/\\/g, "/");
            const leave = (reason: string, detail = "") => leftOut.push({ file: name, reason, detail });
            seedRandom(name);
            const xml = fs.readFileSync(file, "utf8");
            const info = getSSWXMLBasicInfo(xml);
            if (!info) { leave("not a Skunk Werks 'Mech file"); continue; }
            const mech = new BattleMech();
            failedAllocations = 0;
            try {
                mech.importSSWXML(xml);
            } catch (error) {
                leave("import threw", String(error)); continue;
            }
            if (mech.sswImportErrors.length > 0) { leave("import errors", mech.sswImportErrors.join("; ")); continue; }
            keep(mech, xml, info, "ssw", name, leave);
        }
        for (const file of megamekDir ? listFiles(megamekDir, ".mtf").sort() : []) {
            const name = "megamek/" + path.relative(megamekDir!, file).replace(/\\/g, "/");
            const leave = (reason: string, detail = "") => leftOut.push({ file: name, reason, detail });
            seedRandom(name);
            const text = withIndustrialCockpit(name, fs.readFileSync(file, "utf8"));
            const byId = mul1ById.get(Number(/^mul id:\s*(\d+)/m.exec(text)?.[1]));
            const mulUnit = byId && byId.BattleValue > 0 ? byId : undefined;
            failedAllocations = 0;
            let imported: ReturnType<typeof importBattleMechMtf>;
            try {
                imported = importBattleMechMtf(text);
            } catch (error) {
                leave("import threw", String(error)); continue;
            }
            const info = getSSWXMLBasicInfo(imported.xml);
            if (!imported.mech || !info) { leave("import failed", imported.issues.join("; ")); continue; }
            if (imported.issues.length > 0) { leave("the import could not carry all of it over", imported.issues.join("; ")); continue; }
            keep(imported.mech, imported.xml, info, "megamek", name, leave, mulUnit);
        }
    } finally {
        console.warn = warn;
        console.log = log;
        Math.random = random;
    }
    kept.sort((a, b) => (a.header.name + " " + a.header.model).localeCompare(b.header.name + " " + b.header.model));
    return { headers: kept.map(({ header }, id) => ({ id, ...header })), designs: kept.map(({ design }) => design), leftOut };
}

/** One record a line, so a rebuild's diff shows which designs changed. */
const lines = (records: [string, unknown][], open: string, close: string) =>
    open + "\n" + records.map(([key, value]) => (key ? JSON.stringify(key) + ":" : "") + JSON.stringify(value)).join(",\n") + "\n" + close;

/** Writes a type's index, its chunks and its report under dataDir, replacing the last build. */
export function writeBundledDesigns(type: string, title: string, notice: string, build: IBundledBuild, dataDir: string): void {
    const chunkDir = path.join(dataDir, type);
    fs.rmSync(chunkDir, { recursive: true, force: true });
    fs.mkdirSync(chunkDir, { recursive: true });
    const head = `"notice":${JSON.stringify(notice)},`;
    fs.writeFileSync(path.join(dataDir, `${type}-index.json`), `{${head}"designs":${stringifyTable(build.headers).trimEnd()}}\n`);
    for (let chunk = 0; chunk * BUNDLED_CHUNK_SIZE < build.designs.length; chunk++) {
        const ids = build.headers.slice(chunk * BUNDLED_CHUNK_SIZE, (chunk + 1) * BUNDLED_CHUNK_SIZE).map((header) => header.id);
        const { shared, designs } = shareChunk(Object.fromEntries(ids.map((id) => [String(id), build.designs[id]])));
        fs.writeFileSync(path.join(chunkDir, `${chunk}.json`), lines(shared.map((value) => ["", value]), `{${head}"shared":[`, "],")
            + lines(Object.entries(designs), `"designs":{`, "}}\n"));
    }
    const reasons = new Map<string, number>();
    for (const { reason } of build.leftOut) {
        reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
    }
    fs.writeFileSync(path.join(dataDir, `${type}-report.md`), [
        `# Bundled ${title}: build report`, "",
        `${build.headers.length} designs kept, ${build.leftOut.length} files left out.`, "",
        "| Reason | Files |", "|---|---|", ...[...reasons].sort((a, b) => b[1] - a[1]).map(([reason, count]) => `| ${reason} | ${count} |`), "",
        "## Left out", "", ...build.leftOut.map(({ file, reason, detail }) => `- \`${file}\`: ${reason}${detail ? ": " + detail : ""}`), "",
    ].join("\n"));
}

export const writeBundledMechs = (build: IBundledBuild, dataDir: string): void => writeBundledDesigns("mechs", "'Mechs", BUNDLED_MECHS_NOTICE, build, dataDir);
