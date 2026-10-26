// Build support, not app code: converts a folder of Skunk Werks files into the bundled 'Mech data (#241). Run by
//   WRITE_BUNDLED_MECHS=1 npx vitest run src/data/bundled-mechs.test.ts
// with BUNDLED_SSW_DIR set to the SSW data folder when it is not the default below.
import fs from "node:fs";
import path from "node:path";
import { BattleMech } from "../classes/battlemech";
import type { IASMULUnit } from "../classes/alpha-strike-unit";
import { BUNDLED_CHUNK_SIZE, compactMech, IBundledDesignHeader, loadBundledMech } from "../utils/bundled-designs";
import { getClassicMechEntries, getMULMatchKeys } from "../utils/classicMULMatch";
import { getSSWXMLBasicInfo } from "../utils/getSSWXMLBasicInfo";

export const DEFAULT_SSW_DIR = "C:/repo/battletech-tools/WorkingData_DEV/SSWdata";
export const BUNDLED_MECHS_NOTICE = "The data here is/may be copyrighted and NOT included in the GPLv3 license. "
    + "Converted from the Solaris Skunk Werks project's files at https://github.com/Solaris-Skunk-Werks/SSW-Master";

const MECH_CLASSES = ["BattleMech", "IndustrialMech"];
const MECH_TYPE_IDS = [18, 20];

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

/** A crit table as text, without the UUIDs and object links a reload changes. */
export const describeCriticals = (mech: BattleMech): string =>
    JSON.stringify(mech.getCriticals(), (key, value) => key === "obj" || key === "uuid" ? undefined : value);

const listFiles = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory() ? listFiles(path.join(dir, entry.name)) : /\.ssw$/i.test(entry.name) ? [path.join(dir, entry.name)] : []);

/** Every Master Unit List entry the test picks, by match key: live entries first, then MUL 1.0's, then our own. */
export function loadMULIndex(mulDir: string, test: (unit: IASMULUnit) => boolean): Map<string, IASMULUnit> {
    const index = new Map<string, IASMULUnit>();
    for (const list of ["live", "mul1", "custom"]) {
        for (const file of fs.readdirSync(path.join(mulDir, list)).sort()) {
            for (const unit of JSON.parse(fs.readFileSync(path.join(mulDir, list, file), "utf8")) as IASMULUnit[]) {
                if (!test(unit)) continue;
                for (const key of getMULMatchKeys(unit.Name ?? "", unit.Variant ?? "")) if (!index.has(key)) index.set(key, unit);
            }
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

export function buildBundledMechs(sswDir: string, mulDir: string): IBundledBuild {
    const mul = loadMULIndex(mulDir, (unit) => MECH_CLASSES.includes(unit.Class) || MECH_TYPE_IDS.includes(unit.Type?.Id));
    const kept: { header: Omit<IBundledDesignHeader, "id">; design: Record<string, unknown> }[] = [];
    const leftOut: IBundledBuild["leftOut"] = [];
    const taken = new Set<string>();
    const { warn, log } = console;
    const random = Math.random;
    let failedAllocations = 0;
    console.warn = (message?: unknown) => { if (String(message).startsWith("_allocateCritical failed")) failedAllocations++; };
    console.log = () => {};
    try {
        for (const file of listFiles(sswDir).sort()) {
            const name = path.relative(sswDir, file).replace(/\\/g, "/");
            const leave = (reason: string, detail = "") => leftOut.push({ file: name, reason, detail });
            seedRandom(name);
            const xml = fs.readFileSync(file, "utf8");
            const info = getSSWXMLBasicInfo(xml);
            if (!info) { leave("not a Skunk Werks 'Mech file"); continue; }
            if (info.omnimech) { leave("OmniMech: the import does not read its configurations yet (#112)"); continue; }
            const mech = new BattleMech();
            failedAllocations = 0;
            try {
                mech.importSSWXML(xml);
            } catch (error) {
                leave("import threw", String(error)); continue;
            }
            if (mech.sswImportErrors.length > 0) { leave("import errors", mech.sswImportErrors.join("; ")); continue; }
            if (failedAllocations > 0) { leave("crit slots failed to place", String(failedAllocations)); continue; }
            if (mech.getTonnage() !== +info.tonnage) { leave("tonnage differs", `${mech.getTonnage()} t, file says ${info.tonnage}`); continue; }
            const components = checkComponents(xml, mech);
            if (components.length > 0) { leave("chassis components differ", components.join("; ")); continue; }

            const entries = getClassicMechEntries([mech]);
            const keys = entries.flatMap((entry) => getMULMatchKeys(entry.chassis, entry.model));
            if (keys.some((key) => taken.has(key))) { leave("duplicate of a design already kept"); continue; }
            const matched = entries.map((entry) => ({ entry, unit: getMULMatchKeys(entry.chassis, entry.model).map((key) => mul.get(key)).find(Boolean) }))
                .filter((match) => match.unit && match.unit.BattleValue > 0);
            const wrong = matched.filter(({ entry, unit }) => entry.design.getBattleValue() !== unit!.BattleValue);
            if (wrong.length > 0) {
                leave("BV differs from the MUL", wrong.map(({ entry, unit }) => `${entry.model}: BV ${entry.design.getBattleValue()}, MUL ${unit!.BattleValue}`).join("; ")); continue;
            }
            if (matched.length === 0 && mech.getBattleValue() !== +info.bv2) { leave("BV differs from the file (no MUL entry)", `BV ${mech.getBattleValue()}, file ${info.bv2}`); continue; }

            const design = compactMech(mech);
            const reload = loadBundledMech(design);
            const configurations = mech.getOmniConfigurationNames();
            const configs = configurations.length > 1
                ? configurations.map((config) => ({ name: config, bv: (mech.cloneOmniConfiguration(config) as BattleMech).getBattleValue() }))
                : undefined;
            const reloadConfigs = configs?.map((config) => (reload.cloneOmniConfiguration(config.name) as BattleMech).getBattleValue());
            if (reload.getBattleValue() !== mech.getBattleValue() || reload.getCBillCostNumeric() !== mech.getCBillCostNumeric()
                || reload.getTonnage() !== mech.getTonnage() || describeCriticals(reload) !== describeCriticals(mech)
                || (configs && reloadConfigs!.some((bv, index) => bv !== configs[index].bv))) {
                leave("does not survive the compact format"); continue;
            }
            keys.forEach((key) => taken.add(key));
            const mulId = matched.find(({ entry }) => entry.design === mech)?.unit?.Id ?? matched[0]?.unit?.Id;
            kept.push({
                header: {
                    name: mech.getChassisName(), model: mech.getModelName(), tons: mech.getTonnage(), bv: mech.getBattleValue(),
                    cost: mech.getCBillCostNumeric(), rulesLevel: +info.rules_level_ssw, year: +info.year, tech: mech.getTech().name,
                    ...(mulId ? { mulId } : {}), source: "ssw", ...(configs ? { configs } : {}),
                },
                design,
            });
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
    fs.writeFileSync(path.join(dataDir, `${type}-index.json`), lines(build.headers.map((header) => ["", header]), `{${head}"designs":[`, "]}\n"));
    for (let chunk = 0; chunk * BUNDLED_CHUNK_SIZE < build.designs.length; chunk++) {
        const ids = build.headers.slice(chunk * BUNDLED_CHUNK_SIZE, (chunk + 1) * BUNDLED_CHUNK_SIZE).map((header) => header.id);
        fs.writeFileSync(path.join(chunkDir, `${chunk}.json`), lines(ids.map((id) => [String(id), build.designs[id]]), `{${head}"designs":{`, "}}\n"));
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
