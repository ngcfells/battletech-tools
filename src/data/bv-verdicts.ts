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
export const MECH_MATCHED_FLOOR = 3940;

/** Keyed by bvVerdictKey. */
export const BV_VERDICTS: Record<string, IBvVerdict> = {
    // Bombard BMB-1X
    "mul:103586": { verdict: "mul-suspect", note: "The list's value equals ours when the M-Pods are not counted as explosive. The Battle Value table marks the M-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot (a mark added in a later printing).", cites: [{ source: "toaue", page: "195" }] },
    // Hachiwara HCA-3T
    "mul:100753": { verdict: "mul-suspect", note: "The list's value equals ours when the M-Pods are not counted as explosive. The Battle Value table marks the M-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot (a mark added in a later printing).", cites: [{ source: "toaue", page: "195" }] },
    // Hachiwara HCA-4T
    "mul:107252": { verdict: "mul-suspect", note: "The list's value equals ours when the M-Pods are not counted as explosive. The Battle Value table marks the M-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot (a mark added in a later printing).", cites: [{ source: "toaue", page: "195" }] },
    // Hachiwara HCA-4U
    "mul:103158": { verdict: "mul-suspect", note: "The list's value equals ours when the M-Pods are not counted as explosive. The Battle Value table marks the M-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot (a mark added in a later printing).", cites: [{ source: "toaue", page: "195" }] },
    // Juggernaut JG-R9TX1 'Leapin' Lil'
    "mul:104550": { verdict: "mul-suspect", note: "The list's value equals ours when the M-Pods are not counted as explosive. The Battle Value table marks the M-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot (a mark added in a later printing).", cites: [{ source: "toaue", page: "195" }] },
    // Neanderthal NTL-AG
    "mul:100409": { verdict: "mul-suspect", note: "The list's value equals ours when the M-Pods are not counted as explosive. The Battle Value table marks the M-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot (a mark added in a later printing).", cites: [{ source: "toaue", page: "195" }] },
    // Ronin SA-RN7
    "mul:106825": { verdict: "mul-suspect", note: "The list's value equals ours when the M-Pods are not counted as explosive. The Battle Value table marks the M-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot (a mark added in a later printing).", cites: [{ source: "toaue", page: "195" }] },
    // Scarecrow UCU-F4
    "mul:101662": { verdict: "mul-suspect", note: "The list's value equals ours when the B-Pods are not counted as explosive. The Battle Value table marks the B-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot.", cites: [{ source: "tm", page: "317" }] },
    // Thunderbolt TDR-9Nr
    "mul:107546": { verdict: "mul-suspect", note: "The list's value equals ours when the B-Pods are not counted as explosive. The Battle Value table marks the B-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot.", cites: [{ source: "tm", page: "317" }] },
    // Minsk 2
    "mul:108489": { verdict: "mul-suspect", note: "The list's value equals ours when the B-Pods are not counted as explosive. The Battle Value table marks the B-Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot.", cites: [{ source: "tm", page: "317" }] },
    // Ti Ts'ang TSG-10L
    "mul:100218": { verdict: "mul-suspect", note: "The list's value equals ours when the Chaff Pod is not counted as explosive. The Battle Value table marks the Chaff Pod to be treated as a Gauss weapon in the defensive rating, 1 point a slot.", cites: [{ source: "toaue", page: "195" }] },
    // Berserker BRZ-C3
    "mul:104953": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Black Knight BL-6-KNT (Ian)
    "mul:105347": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Centurion CN9-YLW2 'Yen Lo Wang'
    "mul:104260": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Charger CGR-3Kr
    "mul:103187": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Mantis MTS-L
    "mul:101745": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Atlas AS7-S2
    "mul:105418": { verdict: "mul-suspect", note: "The list's value equals ours when every slot of the split Heavy Gauss Rifle is counted as explosive. The rule counts a Gauss weapon slot only in the center torso, legs or head, or where CASE does not protect it; the slots in the CASE-protected side torso are spared.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Banshee BNC-6S
    "mul:100691": { verdict: "mul-suspect", note: "The list's value equals ours when every slot of the split Heavy Gauss Rifle is counted as explosive. The rule counts a Gauss weapon slot only in the center torso, legs or head, or where CASE does not protect it; the slots in the CASE-protected side torso are spared.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Caesar CES-4S
    "mul:104378": { verdict: "mul-suspect", note: "The list's value equals ours when every slot of the split Heavy Gauss Rifle is counted as explosive. The rule counts a Gauss weapon slot only in the center torso, legs or head, or where CASE does not protect it; the slots in the CASE-protected side torso are spared.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Goliath GOL-4S
    "mul:107105": { verdict: "mul-suspect", note: "The list's value equals ours when every slot of the split Heavy Gauss Rifle is counted as explosive. The rule counts a Gauss weapon slot only in the center torso, legs or head, or where CASE does not protect it; the slots in the CASE-protected side torso are spared.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Hauptmann HA1-OC
    "mul:106426": { verdict: "mul-suspect", note: "The list's value equals ours when every slot of the split Heavy Gauss Rifle is counted as explosive. The rule counts a Gauss weapon slot only in the center torso, legs or head, or where CASE does not protect it; the slots in the CASE-protected side torso are spared.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Blood Asp (Star Adder) I
    "mul:101859:I": { verdict: "mul-suspect", note: "The list's value equals ours when every slot of the split Heavy Gauss Rifle is counted as explosive. The rule counts a Gauss weapon slot only in the center torso, legs or head, or where CASE does not protect it; the slots in the CASE-protected side torso are spared.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Hellbringer (Loki) G
    "mul:106138:G": { verdict: "mul-suspect", note: "The list's value equals ours when every slot of the split Heavy Gauss Rifle is counted as explosive. The rule counts a Gauss weapon slot only in the center torso, legs or head, or where CASE does not protect it; the slots in the CASE-protected side torso are spared.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Devastator DVS-2-EC
    "mul:104733": { verdict: "mul-suspect", note: "The list's value equals ours when the Improved Gauss Rifles are not counted as explosive. The rule takes 1 point for each Gauss weapon slot that CASE does not protect.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Excalibur EXC-B2b-EC
    "mul:103102": { verdict: "mul-suspect", note: "The list's value equals ours when the Improved Gauss Rifles are not counted as explosive. The rule takes 1 point for each Gauss weapon slot that CASE does not protect.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "303" }] },
    // Awesome AWS-11V
    "mul:107437": { verdict: "mul-suspect", note: "The list's value equals ours when the four slots of the ER PPC and its capacitor are counted as explosive. The Battle Value table marks a PPC with a capacitor to be treated as a Gauss weapon in the defensive rating, and no reduction is made for a Gauss weapon in a location with CASE II (the same in the 2008 printing, the 2019 errata and the 7th printing).", cites: [{ source: "toaue", page: "193" }, { source: "toaue", page: "194" }] },
    // Revenant UBM-1A
    "mul:106408": { verdict: "mul-suspect", note: "The list's value equals ours when the final value is multiplied by 0.95. The rule for a Smart Robotic Control System multiplies it by 0.85.", cites: [{ source: "ioae", page: "187" }] },
    // Wasp WSP-3L
    "mul:103134": { verdict: "mul-suspect", note: "The list's value equals ours when every heat-generating weapon is halved. Heat efficiency here is zero or less, and the rule still counts the first weapon chosen at its full value before halving the rest.", cites: [{ source: "tm", page: "303" }, { source: "tm", page: "304" }] },
    // Wulfen C
    "mul:108098": { verdict: "mul-suspect", note: "The list's value equals ours when every heat-generating weapon is halved. Heat efficiency here is zero or less, and the rule still counts the first weapon chosen at its full value before halving the rest.", cites: [{ source: "tm", page: "303" }, { source: "tm", page: "304" }] },
    // Skinwalker (Ryoken III-XP) B
    "mul:108133": { verdict: "mul-suspect", note: "The list's value equals ours when no gyro is counted. The rule for a 'Mech whose interface cockpit replaces the gyro counts it as having a standard gyro.", cites: [{ source: "ioae", page: "187" }] },
    // Skinwalker (Ryoken III-XP) D
    "mul:102511": { verdict: "mul-suspect", note: "The list's value equals ours when no gyro is counted. The rule for a 'Mech whose interface cockpit replaces the gyro counts it as having a standard gyro.", cites: [{ source: "ioae", page: "187" }] },
    // Skinwalker (Ryoken III-XP) Prime
    "mul:108669": { verdict: "mul-suspect", note: "The list's value equals ours when no gyro is counted. The rule for a 'Mech whose interface cockpit replaces the gyro counts it as having a standard gyro.", cites: [{ source: "ioae", page: "187" }] },
    // Parash 3
    "mul:104943": { verdict: "mul-suspect", note: "The list's value equals ours when no gyro is counted. The rule for a 'Mech whose interface cockpit replaces the gyro counts it as having a standard gyro.", cites: [{ source: "ioae", page: "187" }] },
    // Seraph C-SRP-O Invictus
    "mul:100663": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Seraph C-SRP-OA Dominus
    "mul:107321": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Seraph C-SRP-OR (Ravana)
    "mul:107272": { verdict: "mul-suspect", note: "The list's value equals ours when the physical weapon's Battle Value is worked from its damage without Triple-Strength Myomer. The table's footnote takes the damage after all modifications such as Triple-Strength Myomer, which doubles it.", cites: [{ source: "tm", page: "317" }, { source: "toaue", page: "195" }] },
    // Raider JL-3B
    "mul:100204": { verdict: "mul-suspect", note: "The list's value equals ours when movement heat is zero. The rule gives zero movement heat to IndustrialMechs with an internal combustion engine only, and this design is a BattleMech.", cites: [{ source: "tm", page: "303" }] },
    // Triskelion TRK-4V
    "mul:104220": { verdict: "mul-suspect", note: "The list's value equals ours multiplied by 1.05. The rule works a tripod's Battle Value as a biped BattleMech's, with no multiplier.", cites: [{ source: "ioae", page: "188" }] },
    // Pwwka S-PW-1LAM
    "mul:104131": { verdict: "mul-suspect", note: "The list's value equals ours when the defensive factor leaves out the extra +1 for an airborne target. The rule for a Land-Air 'Mech takes the AirMech flank speed and adds that +1.", cites: [{ source: "ioae", page: "186" }] },
    // Waneta S-WN-2LAM
    "mul:105075": { verdict: "mul-suspect", note: "The list's value equals ours when the defensive factor leaves out the extra +1 for an airborne target. The rule for a Land-Air 'Mech takes the AirMech flank speed and adds that +1.", cites: [{ source: "ioae", page: "186" }] },
    // Screamer LAM SCR-1X-LAM
    "mul:104075": { verdict: "mul-suspect", note: "The list's value equals a plain BattleMech's: ground movement for the defensive factor and the speed factor, and bomb bays not counted as explosive. The rule for a Land-Air 'Mech takes its AirMech flank speed for both, with +1 for an airborne target.", cites: [{ source: "ioae", page: "186" }] },
    // Alpha Wolf A
    "mul:107017": { verdict: "mul-suspect", note: "The list's value equals ours when the Coolant Pod adds nothing to the heat sink capacity. The rule adds the number of heat sinks times a fifth of the number of pods, rounded up: 4 here.", cites: [{ source: "toaue", page: "193" }] },
    // Grand Dragon DRG-5K (Emory)
    "mul:100783": { verdict: "mul-suspect", note: "The list's value equals ours when the Prototype ER Large Laser takes the standard ER Large Laser's Battle Value. The table gives the prototype its own, lower value.", cites: [{ source: "ioae", page: "186" }, { source: "ioae", page: "189" }] },
    // Hunchback HBK-4G (Shakir)
    "mul:102608": { verdict: "mul-suspect", note: "The list's value equals ours when the Prototype Medium Pulse Lasers take the standard laser's Battle Value and heat. The table gives the prototype its own, lower value, and the rule counts 7 heat for it.", cites: [{ source: "ioae", page: "186" }, { source: "ioae", page: "189" }] },
    // Super Griffin GRF-2N-X
    "mul:102800": { verdict: "mul-suspect", note: "The list's value equals ours when no weapon's Battle Value is halved for heat. The rule gives prototype improved jump jets twice a standard jump jet's heat, so this design's six make 12 movement heat and its weapons pass the heat it can sink.", cites: [{ source: "ioae", page: "97" }] },
    // Cataphract CTF-2X (George)
    "mul:103219": { verdict: "mul-suspect", note: "The list's value equals ours when the three prototype double heat sinks each sink 1 heat. The rule has them work as Inner Sphere double heat sinks, and the Battle Value table gives them no adjustment.", cites: [{ source: "ioae", page: "65" }, { source: "ioae", page: "189" }] },
    // Griffin GRF-1RG
    "mul:108074": { verdict: "import", note: "The file we import carries fewer armor points than the published record sheet (Recognition Guide: ilClan, vol. 1). With the sheet's armor our value equals the list's." },
    // Osprey OSP-36
    "mul:102563": { verdict: "mul-suspect", note: "The list's value equals ours when the engine modifier is 1.0. The design carries an Inner Sphere XL engine, for which the table gives 0.5.", cites: [{ source: "tm", page: "302" }, { source: "tm", page: "315" }] },
};

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
