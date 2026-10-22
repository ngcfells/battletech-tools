import { IAssignedQuirk, IQuirkTargets } from "../data/quirk-interfaces";
import { getQuirk } from "../data/quirk-registry";
import { blkLines, IBlkFile } from "./blk-file";

/** The value a MegaMek quirk code carries in its last part: "rugged_2", "battle_fists_la", "imp_target_med". */
const codeValue = (code: string): Pick<IAssignedQuirk, "parameter" | "location"> => {
    const suffix = /_([^_]+)$/.exec(code)?.[1] ?? "";
    if (/^[1-5]$/.test(suffix)) return { parameter: Number(suffix) };
    if (suffix === "la" || suffix === "ra") return { location: suffix };
    const band: Record<string, string> = { short: "short", med: "medium", long: "long" };
    if (band[suffix] && /^(imp|poor)_target_/.test(code)) return { parameter: band[suffix] };
    if (code === "vtol_rotor_coaxial") return { parameter: "co-axial" };
    if (code === "vtol_rotor_dual") return { parameter: "dual" };
    return {};
};

/** One piece of equipment an importer placed: the BLK file's name for it, our location tag, and its uuid. */
export interface IBlkImportedItem {
    name: string;
    location: string;
    uuid: string;
}

/**
 * A weapon finder for readBlkQuirks: the imported item with the file's equipment name, in the location the file's
 * location abbreviation stands for (any location when the importer cannot place the abbreviation). Of several
 * identical weapons there, the first.
 */
export const blkWeaponFinder = (items: IBlkImportedItem[], locationOf: (abbr: string) => string | undefined = () => undefined) =>
    (location: string, _slot: number, name: string): string | undefined => {
        const where = locationOf(location);
        return items.find((item) => item.name.toLowerCase() === name.toLowerCase() && (!where || item.location === where))?.uuid;
    };

/** The quirks a BLK file lists, placed on the imported unit; a line it cannot place goes in issues. */
export const readBlkQuirks = (file: IBlkFile, unit: {
    targets: IQuirkTargets;
    weaponAt: (location: string, slot: number, name: string) => string | undefined;
}): { quirks: IAssignedQuirk[]; issues: string[] } => {
    const quirks: IAssignedQuirk[] = [];
    const issues: string[] = [];
    const unknown = (code: string) => issues.push(`Quirk '${code.slice(0, 60)}' is not one this builder knows: left off.`);
    for (const code of blkLines(file, "quirks")) {
        const record = getQuirk(code);
        if (!record) {
            unknown(code);
            continue;
        }
        quirks.push({ tag: record.tag, ...codeValue(code.toLowerCase()) });
    }
    for (const line of blkLines(file, "weaponQuirks")) {
        const [code, location, slot, name] = line.split(":");
        if (!name || !/^\d+$/.test(slot)) {
            issues.push(`Weapon quirk line '${line.slice(0, 60)}' could not be read: left off.`);
            continue;
        }
        const record = getQuirk(code);
        if (!record) {
            unknown(code);
            continue;
        }
        const uuid = unit.weaponAt(location, Number(slot), name);
        const bay = uuid ? unit.targets.bays?.find((entry) => entry.uuids.includes(uuid)) : undefined;
        if (bay) quirks.push({ tag: record.tag, bayUuids: [...bay.uuids] });
        else if (uuid && unit.targets.weapons.some((weapon) => weapon.uuid === uuid)) quirks.push({ tag: record.tag, equipmentUuid: uuid });
        else issues.push(`${record.name}: no ${name.slice(0, 60)} in ${location.slice(0, 20)} on this unit, left off.`);
    }
    return { quirks, issues };
};

/**
 * Reads the file's quirks onto an imported unit, after its equipment is placed; what cannot be placed, and what the
 * quirk rules refuse, goes in issues.
 */
export const applyBlkQuirks = (file: IBlkFile, unit: {
    quirks: { add: (quirk: IAssignedQuirk) => string | null };
    getQuirkTargets: () => IQuirkTargets;
}, items: IBlkImportedItem[], issues: string[], locationOf?: (abbr: string) => string | undefined): void => {
    const result = readBlkQuirks(file, { targets: unit.getQuirkTargets(), weaponAt: blkWeaponFinder(items, locationOf) });
    issues.push(...result.issues);
    for (const quirk of result.quirks) {
        const refused = unit.quirks.add(quirk);
        if (refused) issues.push(`Quirk ${getQuirk(quirk.tag)?.name ?? quirk.tag}: ${refused}`);
    }
};
