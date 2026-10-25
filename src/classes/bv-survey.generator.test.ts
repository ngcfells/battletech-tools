import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { it, vi } from "vitest";
import { BattleMech } from "./battlemech";
import { getSSWXMLBasicInfo } from "../utils/getSSWXMLBasicInfo";
import { importBattleArmorBlk } from "./battle-armor-blk";
import { importProtoMechBlk } from "./protomech-blk";
import { importSmallCraftBlk } from "./small-craft-blk";
import { importSupportVehicleBlk, importFixedWingSupportBlk } from "./support-vehicle-blk";

// BV survey for data rounds (design 2026-10-24-catalog-consolidation): every SSW 'Mech and every MegaMek battle armor,
// ProtoMech, Small Craft, DropShip, support vehicle and fixed-wing support file, one "kind, file, BV" row each. Run with
// BV_SURVEY_OUT=<file.tsv> before and after a change and diff the two; skipped otherwise.
const OUT = process.env.BV_SURVEY_OUT;
const SSW = process.env.SSW_ROOT ?? "C:/repo/battletech-tools/WorkingData_DEV/SSWdata";
const MM = process.env.MM_UNITS ?? "C:/repo/megamek/megamek/data/mekfiles/unit_files";
const walk = (dir: string, ext: string): string[] => readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path, ext) : name.toLowerCase().endsWith(ext) ? [path] : [];
});
const bv = (unit: any): unknown => { try { return unit?.getBattleValue?.() ?? null; } catch (e) { return `ERR ${String(e).slice(0, 60)}`; } };

it.skipIf(!OUT)("surveys BV", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const rows: string[] = [];
    for (const file of existsSync(SSW) ? walk(SSW, ".ssw") : []) {
        try {
            const xml = readFileSync(file, "utf8");
            const info = getSSWXMLBasicInfo(xml);
            if (!info) continue;
            const mech = new BattleMech();
            mech.importSSWXML(xml);
            rows.push(`ssw\t${file.slice(SSW.length + 1)}\t${bv(mech)}`);
        } catch (e) { rows.push(`ssw\t${file.slice(SSW.length + 1)}\tCRASH ${String(e).slice(0, 60)}`); }
    }
    const blk: [string, (text: string) => unknown][] = [
        ["battlearmor", (t) => importBattleArmorBlk(t).suit],
        ["protomeks", (t) => importProtoMechBlk(t).proto],
        ["smallcraft", (t) => importSmallCraftBlk(t).craft],
        ["dropships", (t) => importSmallCraftBlk(t).craft],
        ["vehicles", (t) => importSupportVehicleBlk(t).vehicle],
        ["convfighter", (t) => importFixedWingSupportBlk(t).fighter],
    ];
    for (const [dir, load] of blk) {
        for (const file of existsSync(join(MM, dir)) ? walk(join(MM, dir), ".blk") : []) {
            try { rows.push(`${dir}\t${file.slice(MM.length + 1)}\t${bv(load(readFileSync(file, "utf8")))}`); }
            catch (e) { rows.push(`${dir}\t${file.slice(MM.length + 1)}\tCRASH ${String(e).slice(0, 60)}`); }
        }
    }
    writeFileSync(OUT!, rows.join("\n"));
}, 3_600_000);
