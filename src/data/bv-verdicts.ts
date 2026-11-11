/**
 * Verdicts on the units whose Battle Value differs from the Master Unit List's (#599), kept by hand.
 *
 * The bundle build records every difference in src/data/bundled/<type>-accuracy.json. A difference stays "open" until
 * someone has read the rule and decided what it is: our bug (with the issue that tracks it), a fault in the file we
 * import, or a Master Unit List figure the rules do not support (with the citation). Nothing here changes a number.
 */
import type { IBundledMiss } from "./bundled-mechs-build";
import type { ICalcCitation } from "./calc-steps";

export type BvVerdict = "open" | "our-bug" | "import" | "mul-suspect";

export interface IBvVerdict {
    verdict: Exclude<BvVerdict, "open">;
    /** What was found, in our words. */
    note: string;
    /** The issue that tracks it; an our-bug verdict must have one. */
    issue?: number;
    /** The rule read; a mul-suspect verdict must have one. */
    cites?: ICalcCitation[];
}

/** The count of Master Unit List 'Mech entries with a matching design that the last build wrote. A round that raises the count raises this. */
export const MECH_MATCHED_FLOOR = 3924;

/** Keyed by bvVerdictKey. */
export const BV_VERDICTS: Record<string, IBvVerdict> = {};

/** "mul:<id>", "mul:<id>:<configuration>", or "file:<path>" where the Master Unit List has no entry. */
export const bvVerdictKey = (miss: IBundledMiss): string => {
    if (miss.mulId === null) return `file:${miss.file}`;
    return miss.config ? `mul:${miss.mulId}:${miss.config}` : `mul:${miss.mulId}`;
};

const lookUp = (verdicts: Record<string, IBvVerdict>, key: string): IBvVerdict | undefined =>
    Object.prototype.hasOwnProperty.call(verdicts, key) ? verdicts[key] : undefined;

/** The verdict entry for a miss, if one has been written. */
export const getBvVerdictEntry = (miss: IBundledMiss, verdicts: Record<string, IBvVerdict> = BV_VERDICTS): IBvVerdict | undefined =>
    lookUp(verdicts, bvVerdictKey(miss));

/** "open" when no verdict has been written for the miss. */
export const getBvVerdict = (miss: IBundledMiss, verdicts: Record<string, IBvVerdict> = BV_VERDICTS): BvVerdict =>
    getBvVerdictEntry(miss, verdicts)?.verdict ?? "open";

/** Verdict keys that match no unit in the record: the unit now matches, or its key changed. */
export const findStaleVerdictKeys = (verdicts: Record<string, IBvVerdict>, differs: IBundledMiss[]): string[] => {
    const keys = new Set(differs.map(bvVerdictKey));
    return Object.keys(verdicts).filter((key) => !keys.has(key));
};

/** What is wrong with the verdict entries, in words. Empty when they are clean. */
export const findVerdictProblems = (verdicts: Record<string, IBvVerdict>): string[] => {
    const problems: string[] = [];
    for (const [key, entry] of Object.entries(verdicts)) {
        if (!entry.note.trim()) problems.push(`${key}: no note`);
        if (entry.verdict === "mul-suspect" && !entry.cites?.length) problems.push(`${key}: mul-suspect needs a citation`);
        if (entry.verdict === "our-bug" && typeof entry.issue !== "number") problems.push(`${key}: our-bug needs an issue`);
    }
    return problems;
};
