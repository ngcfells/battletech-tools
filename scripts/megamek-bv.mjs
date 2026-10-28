// Records MegaMek's own BV for the unit files whose Master Unit List entry gives none, in src/data/megamek-bv.json:
// the build checks our BV against it instead (#241). Run after `npm run build:bundled -- units`, with MegaMek built:
//   node scripts/megamek-bv.mjs [MegaMek checkout, default C:/repo/megamek/megamek]
// It reads the files the reports list as not recorded, runs scripts/megamek-bv/MmBv.java on them, adds their BVs, and
// the next build checks them.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEGAMEK = process.argv[2] ?? "C:/repo/megamek/megamek";
const TABLE = path.join(ROOT, "src/data/megamek-bv.json");
const BUNDLED = path.join(ROOT, "src/data/bundled");
const UNIT_FILES = "data/mekfiles/unit_files/";

const files = fs.readdirSync(BUNDLED).filter((file) => file.endsWith("-report.md"))
    .flatMap((file) => fs.readFileSync(path.join(BUNDLED, file), "utf8").split("\n"))
    .map((line) => /^- `([^`]+)`: its Master Unit List entry gives no BV, and MegaMek's is not recorded/.exec(line)?.[1])
    .filter(Boolean);
if (files.length === 0) {
    console.log("No unit file is waiting for MegaMek's BV.");
    process.exit(0);
}
const output = execFileSync("java", ["-cp", "build/libs/MegaMek.jar" + path.delimiter + "build/launch4j/lib/*", path.join(ROOT, "scripts/megamek-bv/MmBv.java"),
    ...files.map((file) => UNIT_FILES + file)], { cwd: MEGAMEK, encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "ignore"] });
const table = fs.existsSync(TABLE) ? JSON.parse(fs.readFileSync(TABLE, "utf8")) : {};
for (const line of output.split(/\r?\n/)) {
    const [file, bv] = line.split("\t");
    if (!file?.startsWith(UNIT_FILES)) continue;
    if (/^\d+$/.test(bv ?? "")) table[file.slice(UNIT_FILES.length)] = +bv;
    else console.warn(`MegaMek could not rate ${file}: ${bv}`);
}
const sorted = Object.keys(table).sort().map((file) => `    ${JSON.stringify(file)}: ${table[file]}`);
fs.writeFileSync(TABLE, "{\n" + sorted.join(",\n") + "\n}\n");
console.log(`${files.length} unit files rated; ${sorted.length} in ${path.relative(ROOT, TABLE)}.`);
