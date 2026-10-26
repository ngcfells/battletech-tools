// Build support, not app code: converts MegaMek's unit files into the bundled designs of the types other than 'Mechs
// (#241 round 2). Run by
//   WRITE_BUNDLED_UNITS=1 npx vitest run src/data/bundled-units.test.ts
// with BUNDLED_MEGAMEK_DIR set to MegaMek's unit_files folder when it is not the default below.
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
import { IBundledBuild, loadMULIndex, seedRandom } from "./bundled-mechs-build";
import { BundledUnit, BundledUnitType, getBundledUnitClass } from "./bundled-units";

export const DEFAULT_MEGAMEK_DIR = "C:/repo/megamek/megamek/data/mekfiles/unit_files";
export const MEGAMEK_NOTICE = "The data here is/may be copyrighted and NOT included in the GPLv3 license. Converted from MegaMek's "
    + "unit files (https://github.com/MegaMek/megamek): MegaMek Data (C) 2025-2026 by The MegaMek Team, licensed under "
    + "CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/).";

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
const getTons = (unit: BundledUnit, mul: IASMULUnit): number => "getTonnage" in unit ? unit.getTonnage() : +mul.Tonnage;

/**
 * Every MegaMek file of each type, imported and kept when the import carried all of it over and its BV matches the
 * Master Unit List's (the files hold no BV of their own). A file's MUL id is MUL 1.0's, which only our MUL 1.0
 * entries still carry; the rest are matched by name.
 */
export function buildBundledUnits(megamekDir: string, mulDir: string): Record<BundledUnitType, IBundledBuild> {
    const types = Object.keys(BLK_KINDS) as BundledUnitType[];
    const mul1 = new Map<number, IASMULUnit>();
    for (const file of fs.readdirSync(path.join(mulDir, "mul1"))) {
        for (const unit of JSON.parse(fs.readFileSync(path.join(mulDir, "mul1", file), "utf8")) as IASMULUnit[]) mul1.set(unit.Id, unit);
    }
    const work = types.map((type) => ({ type, kind: BLK_KINDS[type], mul: loadMULIndex(mulDir, BLK_KINDS[type].mul), taken: new Set<string>(),
        kept: [] as { header: Omit<IBundledDesignHeader, "id">; design: Record<string, unknown> }[], leftOut: [] as IBundledBuild["leftOut"] }));
    const { warn, log } = console;
    const random = Math.random;
    console.warn = () => {};
    console.log = () => {};
    try {
        for (const file of listFiles(megamekDir).sort()) {
            const text = fs.readFileSync(file, "utf8");
            const blk = parseBlkFile(text);
            const job = blk && work.find(({ kind }) => kind.unitTypes.includes(blkValue(blk, "UnitType").toLowerCase()));
            if (!blk || !job) continue;
            const name = path.relative(megamekDir, file).replace(/\\/g, "/");
            const leave = (reason: string, detail = "") => job.leftOut.push({ file: name, reason, detail });
            seedRandom(name);
            let imported: ReturnType<IBlkKind["load"]>;
            try {
                imported = job.kind.load(text);
            } catch (error) {
                leave("import threw", String(error)); continue;
            }
            const unit = imported.unit;
            if (!unit) { leave("import failed", imported.issues.join("; ")); continue; }
            if (imported.issues.length > 0) { leave("the import could not carry all of it over", imported.issues.join("; ")); continue; }

            const keys = getClassicUnitEntries([unit]).flatMap((entry) => getMULMatchKeys(entry.chassis, entry.model));
            // The full name alone: a battle armor name ends in its squad size, "(Sqd4)", which the alternate-name keys
            // read as a second chassis name.
            if (job.taken.has(keys[0])) { leave("duplicate of a design already kept"); continue; }
            const byId = mul1.get(+blkValue(blk, "mul id:"));
            const match = (byId && job.kind.mul(byId) ? byId : undefined) ?? keys.map((key) => job.mul.get(key)).find(Boolean);
            if (!match || !(match.BattleValue > 0)) { leave("no Master Unit List entry to check its BV against"); continue; }
            const bv = unit.getBattleValue();
            if (bv !== match.BattleValue) { leave("BV differs from the MUL", `BV ${bv}, MUL ${match.BattleValue}`); continue; }

            const Unit = getBundledUnitClass(job.type);
            const design = compactUnit(unit, Unit);
            const reload = loadBundledUnit(design, Unit);
            if (reload.getBattleValue() !== bv || getCost(reload) !== getCost(unit) || JSON.stringify(compactUnit(reload, Unit)) !== JSON.stringify(design)) {
                leave("does not survive the compact format"); continue;
            }
            job.taken.add(keys[0]);
            const type = blkValue(blk, "type");
            job.kept.push({
                header: {
                    name: unit.getName(), model: "getModel" in unit ? unit.getModel() : "", tons: getTons(unit, match), bv, cost: getCost(unit),
                    rulesLevel: getBlkRulesLevel(type), year: +blkValue(blk, "year") || 0,
                    tech: match.Technology?.Name ?? (/^clan/i.test(type) ? "Clan" : /^mixed/i.test(type) ? "Mixed" : "Inner Sphere"),
                    mulId: match.Id, source: "megamek",
                },
                design,
            });
        }
    } finally {
        console.warn = warn;
        console.log = log;
        Math.random = random;
    }
    return Object.fromEntries(work.map(({ type, kept, leftOut }) => {
        kept.sort((a, b) => (a.header.name + " " + a.header.model).localeCompare(b.header.name + " " + b.header.model));
        return [type, { headers: kept.map(({ header }, id) => ({ id, ...header })), designs: kept.map(({ design }) => design), leftOut }];
    })) as Record<BundledUnitType, IBundledBuild>;
}
