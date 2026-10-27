// Build runner, not app code: rebuilds the bundled 'Mechs (#241) on every core. scripts/bundled-build.mjs bundles this
// file with Vite into one Node script and runs it:
//   npm run build:bundled
// Each file's import, checks and compact round trip (prepareMechFile) runs on a worker thread and is cached by the
// file, its name, the MUL data and the bundled script itself, so a rebuild after a code change redoes every file in
// parallel and one after a data change redoes only the files that changed. The order-dependent part (duplicates,
// renamed submodels, MUL ids) runs on the main thread from the prepared results. BUNDLED_SSW_DIR,
// BUNDLED_MEGAMEK_DIR, BUNDLED_MORDEL_DIR and BUNDLED_WORKERS override the defaults.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import {
    buildBundledMechs, DEFAULT_MEGAMEK_DIR, DEFAULT_MORDEL_DIR, DEFAULT_SSW_DIR, IMechJob, IPreparedMech, listMechJobs,
    loadCanonMechs, loadMechMUL, prepareMechFile, writeBundledMechs,
} from "./bundled-mechs-build";

const ROOT = process.cwd();
const MUL_DIR = path.join(ROOT, "src/data/mul");
const DATA_DIR = path.join(ROOT, "src/data/bundled");
const CACHE_DIR = path.join(ROOT, "node_modules/.cache/bundled-mechs");

interface IWorkerJob { index: number; job: IMechJob }
interface IWorkerResult { index: number; prepared: IPreparedMech }

/** A hash of every file under dir: the bundled script's own code, or the MUL data. */
function hashTree(dir: string): string {
    const hash = crypto.createHash("sha1");
    const walk = (at: string) => {
        for (const entry of fs.readdirSync(at, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
            const full = path.join(at, entry.name);
            if (entry.isDirectory()) walk(full);
            else hash.update(entry.name).update(fs.readFileSync(full));
        }
    };
    walk(dir);
    return hash.digest("hex");
}

/** Prepares the jobs it is sent, one at a time, so a fast worker takes more of them. */
function runWorker(): void {
    const indexes = loadMechMUL(workerData.mulDir as string);
    parentPort!.on("message", ({ index, job }: IWorkerJob) => {
        parentPort!.postMessage({ index, prepared: prepareMechFile(job, indexes) } satisfies IWorkerResult);
    });
    parentPort!.postMessage(null);
}

async function prepareAll(jobs: IMechJob[], workers: number): Promise<IPreparedMech[]> {
    const results: IPreparedMech[] = [];
    let next = 0, done = 0;
    const started = Date.now();
    await Promise.all(Array.from({ length: Math.min(workers, jobs.length) }, () => new Promise<void>((resolve, reject) => {
        const worker = new Worker(fileURLToPath(import.meta.url), { workerData: { mulDir: MUL_DIR } });
        const send = () => {
            if (next >= jobs.length) { void worker.terminate().then(() => resolve()); return; }
            const index = next++;
            worker.postMessage({ index, job: jobs[index] } satisfies IWorkerJob);
        };
        worker.on("message", (message: IWorkerResult | null) => {
            if (message) {
                results[message.index] = message.prepared;
                if (++done % 500 === 0) console.log(`  ${done}/${jobs.length} prepared, ${Math.round((Date.now() - started) / 1000)} s`);
            }
            send();
        });
        worker.on("error", reject);
    })));
    return results;
}

async function main(): Promise<void> {
    const started = Date.now();
    const jobs = listMechJobs(process.env.BUNDLED_SSW_DIR ?? DEFAULT_SSW_DIR,
        path.join(process.env.BUNDLED_MEGAMEK_DIR ?? DEFAULT_MEGAMEK_DIR, "meks"), process.env.BUNDLED_MORDEL_DIR ?? DEFAULT_MORDEL_DIR);
    const version = hashTree(path.dirname(fileURLToPath(import.meta.url))) + hashTree(MUL_DIR);
    const keys = jobs.map((job) => crypto.createHash("sha1").update(version).update(job.source).update(job.name).update(fs.readFileSync(job.file)).digest("hex"));
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const prepared = new Map<string, IPreparedMech>();
    const missing: number[] = [];
    keys.forEach((key, index) => {
        const file = path.join(CACHE_DIR, key + ".json");
        if (fs.existsSync(file)) prepared.set(jobs[index].name, JSON.parse(fs.readFileSync(file, "utf8")));
        else missing.push(index);
    });
    const workers = Number(process.env.BUNDLED_WORKERS) || Math.max(1, os.availableParallelism() - 2);
    console.log(`${jobs.length} files: ${jobs.length - missing.length} cached, ${missing.length} to prepare on ${Math.min(workers, missing.length)} workers`);
    const fresh = await prepareAll(missing.map((index) => jobs[index]), workers);
    missing.forEach((index, at) => {
        prepared.set(jobs[index].name, fresh[at]);
        fs.writeFileSync(path.join(CACHE_DIR, keys[index] + ".json"), JSON.stringify(fresh[at]));
    });
    // Entries no file uses any more go.
    const used = new Set(keys.map((key) => key + ".json"));
    for (const file of fs.readdirSync(CACHE_DIR)) if (!used.has(file)) fs.rmSync(path.join(CACHE_DIR, file));

    const build = buildBundledMechs(process.env.BUNDLED_SSW_DIR ?? DEFAULT_SSW_DIR, MUL_DIR, path.join(process.env.BUNDLED_MEGAMEK_DIR ?? DEFAULT_MEGAMEK_DIR, "meks"),
        loadCanonMechs(path.join(ROOT, "src/data/mordel/canon-mechs.csv")), process.env.BUNDLED_MORDEL_DIR ?? DEFAULT_MORDEL_DIR, (job) => prepared.get(job.name)!);
    writeBundledMechs(build, DATA_DIR);
    console.log(`${build.headers.length} designs kept${build.renamed?.length ? ` (${build.renamed.length} renamed)` : ""}, ${build.leftOut.length} files left out, `
        + `${Math.round((Date.now() - started) / 1000)} s`);
}

if (isMainThread) {
    main().catch((error) => { console.error(error); process.exitCode = 1; });
} else {
    runWorker();
}
