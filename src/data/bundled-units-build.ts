// Build support, not app code: converts MegaMek's unit files into the bundled designs of the types other than 'Mechs
// (#241 round 2). Run by
//   npm run build:bundled -- units
// (bundled-build-runner.ts) with BUNDLED_MEGAMEK_DIR set to MegaMek's unit_files folder when it is not the default below.
import fs from "node:fs";
import path from "node:path";
import type { IASMULUnit } from "../classes/alpha-strike-unit";
import { importBattleArmorBlk } from "../classes/battle-armor-blk";
import { importProtoMechBlk } from "../classes/protomech-blk";
import { importSmallCraftBlk } from "../classes/small-craft-blk";
import { importSupportVehicleBlk } from "../classes/support-vehicle-blk";
import { blkValue, parseBlkFile } from "../utils/blk-file";
import { compactUnit, IBundledDesignHeader, loadBundledUnit } from "../utils/bundled-designs";
import { getClassicUnitEntries, getMULMatchKeys, isMULCapitalShip, isMULLargeAerospaceCraft } from "../utils/classicMULMatch";
import { getBundledStanding, IBundledBuild, loadMULIndex, seedRandom } from "./bundled-mechs-build";
import { BundledUnit, BundledUnitType, getBundledUnitClass } from "./bundled-units";

export { DEFAULT_MEGAMEK_DIR, MEGAMEK_NOTICE } from "./bundled-mechs-build";

interface IBlkKind {
    title: string;
    /** The file's UnitType, lower case. */
    unitTypes: string[];
    load: (text: string) => { unit: BundledUnit | null; issues: string[] };
    /** The Master Unit List entries of the type, as the Classic MUL search files them. */
    mul: (unit: IASMULUnit) => boolean;
}

export const BLK_KINDS: Record<BundledUnitType, IBlkKind> = {
    "battle-armor": { title: "battle armor", unitTypes: ["battlearmor"], mul: (unit) => unit.Type?.Id === 22,
        load: (text) => { const { suit, issues } = importBattleArmorBlk(text); return { unit: suit, issues }; } },
    "protomechs": { title: "ProtoMechs", unitTypes: ["protomek", "protomech"], mul: (unit) => unit.Type?.Id === 23,
        load: (text) => { const { proto, issues } = importProtoMechBlk(text); return { unit: proto, issues }; } },
    "small-craft": { title: "Small Craft and DropShips", unitTypes: ["smallcraft", "dropship"],
        mul: (unit) => isMULLargeAerospaceCraft(unit) && !isMULCapitalShip(unit),
        load: (text) => { const { craft, issues } = importSmallCraftBlk(text); return { unit: craft, issues }; } },
    "support-vehicles": { title: "Support Vehicles", unitTypes: ["supporttank", "largesupporttank", "supportvtol"], mul: (unit) => [19, 24].includes(unit.Type?.Id),
        load: (text) => { const { vehicle, issues } = importSupportVehicleBlk(text); return { unit: vehicle, issues }; } },
};

/** MegaMek's rules levels ("IS Level 2", "Mixed (IS Chassis) Advanced") as Skunk Werks' (0 Introductory to 4). */
export function getBlkRulesLevel(type: string): number {
    const level = /Level (\d)/i.exec(type);
    if (level) return Math.min(+level[1] - 1, 4);
    return /experimental/i.test(type) ? 3 : /advanced/i.test(type) ? 2 : 1;
}

const listFiles = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => entry.isDirectory() ? listFiles(path.join(dir, entry.name)) : /\.blk$/i.test(entry.name) ? [path.join(dir, entry.name)] : []);

const getCost = (unit: BundledUnit): number => unit.getCBillCost();

/** A MegaMek unit file, in build order. */
export interface IUnitJob { file: string; name: string }

export const listUnitJobs = (megamekDir: string): IUnitJob[] =>
    listFiles(megamekDir).sort().map((file) => ({ file, name: path.relative(megamekDir, file).replace(/\\/g, "/") }));

/**
 * What a file gives on its own, before the other files are weighed: its type, the import, its BV and the compact
 * design with its round trip. The slow part, so it runs on the build runner's workers and is cached.
 */
export interface IPreparedUnit {
    /** None when the file is not of a bundled type. */
    type?: BundledUnitType;
    leaves: { reason: string; detail: string }[];
    rejected?: boolean;
    /** The full name's match key first, then the alternate names'. */
    keys?: string[];
    /** The MUL 1.0 id the file names. */
    mulId?: number;
    bv?: number;
    /** The unit's own tonnage, if it has one (battle armor takes the MUL's). */
    tons?: number;
    /** The tech base the file's type gives, for a MUL entry that names none. */
    tech?: string;
    survives?: boolean;
    header?: Pick<IBundledDesignHeader, "name" | "model" | "cost" | "rulesLevel" | "year" | "standing">;
    design?: Record<string, unknown>;
}

export function prepareUnitFile(job: IUnitJob): IPreparedUnit {
    const text = fs.readFileSync(job.file, "utf8");
    const blk = parseBlkFile(text);
    const type = blk ? (Object.keys(BLK_KINDS) as BundledUnitType[]).find((key) => BLK_KINDS[key].unitTypes.includes(blkValue(blk, "UnitType").toLowerCase())) : undefined;
    const leaves: IPreparedUnit["leaves"] = [];
    if (!blk || !type) return { leaves };
    const leave = (reason: string, detail = "") => { leaves.push({ reason, detail }); };
    const { warn, log } = console;
    const random = Math.random;
    console.warn = () => {};
    console.log = () => {};
    try {
        seedRandom(job.name);
        let imported: ReturnType<IBlkKind["load"]>;
        try {
            imported = BLK_KINDS[type].load(text);
        } catch (error) {
            leave("import threw", String(error)); return { type, leaves, rejected: true };
        }
        const unit = imported.unit;
        if (!unit) { leave("import failed", imported.issues.join("; ")); return { type, leaves, rejected: true }; }
        if (imported.issues.length > 0) { leave("the import could not carry all of it over", imported.issues.join("; ")); return { type, leaves, rejected: true }; }
        const Unit = getBundledUnitClass(type);
        const bv = unit.getBattleValue();
        const design = compactUnit(unit, Unit);
        const reload = loadBundledUnit(design, Unit);
        const blkType = blkValue(blk, "type");
        return {
            type, leaves, keys: getClassicUnitEntries([unit]).flatMap((entry) => getMULMatchKeys(entry.chassis, entry.model)),
            ...(+blkValue(blk, "mul id:") ? { mulId: +blkValue(blk, "mul id:") } : {}), bv,
            ...("getTonnage" in unit ? { tons: unit.getTonnage() } : {}),
            tech: /^clan/i.test(blkType) ? "Clan" : /^mixed/i.test(blkType) ? "Mixed" : "Inner Sphere",
            survives: reload.getBattleValue() === bv && getCost(reload) === getCost(unit) && JSON.stringify(compactUnit(reload, Unit)) === JSON.stringify(design),
            header: {
                name: unit.getName(), model: "getModel" in unit ? unit.getModel() : "", cost: getCost(unit),
                rulesLevel: getBlkRulesLevel(blkType), year: +blkValue(blk, "year") || 0, ...getBundledStanding(job.name, unit),
            },
            design,
        };
    } finally {
        console.warn = warn;
        console.log = log;
        Math.random = random;
    }
}

/**
 * Every MegaMek file of each type, kept when the import carried all of it over and its BV matches the Master Unit
 * List's (the files hold no BV of their own). A file's MUL id is MUL 1.0's, which only our MUL 1.0 entries still
 * carry; the rest are matched by name. `prepare` gives each file's prepared design (the build runner's workers and
 * cache); by default each is prepared here.
 */
export function buildBundledUnits(megamekDir: string, mulDir: string, prepare: (job: IUnitJob) => IPreparedUnit = prepareUnitFile): Record<BundledUnitType, IBundledBuild> {
    const types = Object.keys(BLK_KINDS) as BundledUnitType[];
    const mul1 = new Map<number, IASMULUnit>();
    for (const file of fs.readdirSync(path.join(mulDir, "mul1"))) {
        for (const unit of JSON.parse(fs.readFileSync(path.join(mulDir, "mul1", file), "utf8")) as IASMULUnit[]) mul1.set(unit.Id, unit);
    }
    const work = Object.fromEntries(types.map((type) => [type, { kind: BLK_KINDS[type], mul: loadMULIndex(mulDir, BLK_KINDS[type].mul), taken: new Set<string>(),
        kept: [] as { header: Omit<IBundledDesignHeader, "id">; design: Record<string, unknown> }[], leftOut: [] as IBundledBuild["leftOut"] }])) as
        Record<BundledUnitType, { kind: IBlkKind; mul: Map<string, IASMULUnit>; taken: Set<string>; kept: { header: Omit<IBundledDesignHeader, "id">; design: Record<string, unknown> }[]; leftOut: IBundledBuild["leftOut"] }>;
    for (const file of listUnitJobs(megamekDir)) {
        const unit = prepare(file);
        if (!unit.type) continue;
        const job = work[unit.type];
        const leave = (reason: string, detail = "") => job.leftOut.push({ file: file.name, reason, detail });
        unit.leaves.forEach(({ reason, detail }) => leave(reason, detail));
        if (unit.rejected) continue;
        const keys = unit.keys!;
        // The full name alone: a battle armor name ends in its squad size, "(Sqd4)", which the alternate-name keys
        // read as a second chassis name.
        if (job.taken.has(keys[0])) { leave("duplicate of a design already kept"); continue; }
        const byId = unit.mulId ? mul1.get(unit.mulId) : undefined;
        const match = (byId && job.kind.mul(byId) ? byId : undefined) ?? keys.map((key) => job.mul.get(key)).find(Boolean);
        if (!match || !(match.BattleValue > 0)) { leave("no Master Unit List entry to check its BV against"); continue; }
        if (unit.bv !== match.BattleValue) { leave("BV differs from the MUL", `BV ${unit.bv}, MUL ${match.BattleValue}`); continue; }
        if (!unit.survives) { leave("does not survive the compact format"); continue; }
        job.taken.add(keys[0]);
        const { name, model, cost, rulesLevel, year, standing } = unit.header!;
        job.kept.push({
            header: {
                name, model, tons: unit.tons ?? +match.Tonnage, bv: unit.bv, cost, rulesLevel, year, tech: match.Technology?.Name ?? unit.tech!,
                mulId: match.Id, source: "megamek", ...(standing ? { standing } : {}),
            },
            design: unit.design!,
        });
    }
    return Object.fromEntries(types.map((type) => {
        const { kept, leftOut } = work[type];
        kept.sort((a, b) => (a.header.name + " " + a.header.model).localeCompare(b.header.name + " " + b.header.model));
        return [type, { headers: kept.map(({ header }, id) => ({ id, ...header })), designs: kept.map(({ design }) => design), leftOut }];
    })) as Record<BundledUnitType, IBundledBuild>;
}
