import { BattleMech } from "../classes/battlemech";
import { BUNDLED_CHUNK_SIZE, IBundledDesignHeader, loadBundledMech } from "../utils/bundled-designs";
import type { IClassicDesignEntry } from "../utils/classicMULMatch";

/*
    The data here is/may be copyrighted and NOT included in the GPLv3 license.
    The 'Mechs are converted from the Solaris Skunk Werks project's files at https://github.com/Solaris-Skunk-Werks/SSW-Master
    (regenerate with WRITE_BUNDLED_MECHS=1 npx vitest run src/data/bundled-mechs.test.ts).
*/

type ChunkLoaders = Record<string, () => Promise<unknown>>;

const chunkLoaders = import.meta.glob("./bundled/mechs/*.json", { import: "default" }) as ChunkLoaders;

let index: Promise<IBundledDesignHeader[]> | null = null;
const chunks = new Map<number, Promise<Record<string, Record<string, unknown>>>>();

/** The bundled 'Mechs' headers, fetched the first time a list needs them. */
export const loadBundledMechIndex = (): Promise<IBundledDesignHeader[]> =>
    index ??= import("./bundled/mechs-index.json").then((module) => (module.default as { designs: IBundledDesignHeader[] }).designs);

const loadChunk = (chunk: number) => {
    if (!chunks.has(chunk)) {
        const loader = chunkLoaders[`./bundled/mechs/${chunk}.json`];
        chunks.set(chunk, loader().then((data) => (data as { designs: Record<string, Record<string, unknown>> }).designs));
    }
    return chunks.get(chunk)!;
};

/** Imports one bundled 'Mech; an OmniMech comes in the configuration asked for, else its own. */
export async function loadBundledMechDesign(header: Pick<IBundledDesignHeader, "id">, configuration?: string): Promise<BattleMech> {
    const designs = await loadChunk(Math.floor(header.id / BUNDLED_CHUNK_SIZE));
    const mech = loadBundledMech(designs[header.id]);
    return configuration ? mech.cloneOmniConfiguration(configuration) as BattleMech : mech;
}

/** A bundled 'Mech as the Master Unit List search matches it: an OmniMech's configuration is its own entry. */
export interface IBundledMechRef {
    header: IBundledDesignHeader;
    configuration?: string;
    bv: number;
}

/** Index entries for the bundled 'Mechs, as getClassicMechEntries gives them for designs already imported. */
export const getBundledMechEntries = (headers: IBundledDesignHeader[]): IClassicDesignEntry<IBundledMechRef>[] => headers.flatMap((header) => [
    ...(header.configs ?? []).flatMap((config) => {
        const design = { header, configuration: config.name, bv: config.bv };
        return [{ chassis: header.name, model: config.name, design }, { chassis: header.name, model: header.model + " " + config.name, design }];
    }),
    { chassis: header.name, model: header.model, design: { header, bv: header.bv } },
]);
