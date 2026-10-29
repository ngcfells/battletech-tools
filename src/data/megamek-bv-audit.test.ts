import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import type { IASMULUnit } from "../classes/alpha-strike-unit";
import { untabulate } from "../utils/packed-json";
import { CUSTOM_MUL_FILE_PATH } from "./custom-mul";
import { MEGAMEK_CUSTOM_KEY_PREFIX } from "./bundled-mechs-build";

// A developer's check, never part of the app or a gate on the build: our BV is certified by the rules, books and
// errata. With a built MegaMek checkout it compares the BV of every MegaMek-sourced custom unit list entry with
// MegaMek's and writes the differences to src/data/bundled/megamek-bv-audit.md, as leads for our BV work.
//   MEGAMEK_AUDIT=C:/repo/megamek/megamek npx vitest run --project unit src/data/megamek-bv-audit.test.ts
// MMREPORT=1 with scripts/megamek-bv/MmBv.java by hand prints MegaMek's working for one file.
const MEGAMEK = process.env.MEGAMEK_AUDIT;
const UNIT_FILES = "data/mekfiles/unit_files/";
const ROOT = path.resolve(__dirname, "../..");

it.skipIf(!MEGAMEK)("compares our BV with MegaMek's for the MegaMek units the MUL lacks", () => {
    const records = (untabulate(JSON.parse(fs.readFileSync(path.join(ROOT, CUSTOM_MUL_FILE_PATH), "utf8"))) as IASMULUnit[])
        .filter((record) => record.MulUnitKey?.startsWith(MEGAMEK_CUSTOM_KEY_PREFIX));
    const files = new Map(records.flatMap((record) => {
        const file = /converted from MegaMek's (.+?) \(MegaMek Data/.exec(record.CustomInfo?.notes ?? "")?.[1];
        return file ? [[file, record] as const] : [];
    }));
    const output = execFileSync("java", ["-cp", "build/libs/MegaMek.jar" + path.delimiter + "build/launch4j/lib/*", path.join(ROOT, "scripts/megamek-bv/MmBv.java"),
        ...[...files.keys()].map((file) => UNIT_FILES + file)], { cwd: MEGAMEK, encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "ignore"] });
    const rows: string[] = [];
    for (const line of output.split(/\r?\n/)) {
        const [at, value] = line.split("\t");
        const record = files.get(at?.slice(UNIT_FILES.length) ?? "");
        if (!record) continue;
        if (!/^\d+$/.test(value ?? "")) rows.push(`| ${record.Name} ${record.Variant ?? ""} | ${record.BattleValue} | ${value} | |`);
        else if (+value !== record.BattleValue) rows.push(`| ${record.Name} ${record.Variant ?? ""} | ${record.BattleValue} | ${value} | ${+value - record.BattleValue} |`);
    }
    fs.writeFileSync(path.join(ROOT, "src/data/bundled/megamek-bv-audit.md"), [
        "# MegaMek BV audit", "",
        `MegaMek-sourced custom units whose BV differs from MegaMek's: ${rows.length} of ${files.size}. Leads only: our BV, by the rules and errata, is the one we certify.`, "",
        "| Unit | Ours | MegaMek | Difference |", "|---|---|---|---|", ...rows.sort(), "",
    ].join("\n"));
    expect(files.size).toBeGreaterThan(0);
}, 600_000);
