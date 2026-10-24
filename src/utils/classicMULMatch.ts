import { BattleMech } from "../classes/battlemech";
import { IASMULUnit } from "../classes/alpha-strike-unit";

// Matches Master Unit List entries to Classic designs by chassis + model. The MUL writes nicknames and alternate
// names with quotes and parentheses ('STK-3F (Jamison)', '"Butterbee"'), Skunk Werks with HTML entities, so both
// sides are reduced to the same plain words.

export interface IClassicDesignEntry<T> {
    chassis: string;
    model: string;
    design: T;
}

export type ClassicDesignIndex<T> = Map<string, T>;

function normalise(text: string): string {
    return text
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&amp;/gi, "&")
        .toLowerCase()
        .replace(/["()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Every key a chassis + model is known by: "Mad Cat (Timber Wolf)" also gives one for each of its two names. */
export function getMULMatchKeys(chassis: string, model: string): string[] {
    const keys = [normalise(chassis + " " + model)];
    const alternate = chassis.match(/^(.*?)\s*\((.*)\)\s*$/);
    if (alternate) {
        keys.push(normalise(alternate[1] + " " + model), normalise(alternate[2] + " " + model));
    }
    return keys.filter((key, index) => keys.indexOf(key) === index);
}

/** Earlier entries win a shared key, so list saved designs before bundled ones. */
export function buildClassicDesignIndex<T>(entries: IClassicDesignEntry<T>[]): ClassicDesignIndex<T> {
    const index: ClassicDesignIndex<T> = new Map();
    for (const entry of entries) {
        for (const key of getMULMatchKeys(entry.chassis, entry.model)) {
            if (!index.has(key)) {
                index.set(key, entry.design);
            }
        }
    }
    return index;
}

export function findClassicDesign<T>(unit: Pick<IASMULUnit, "Name" | "Variant">, index: ClassicDesignIndex<T>): T | null {
    for (const key of getMULMatchKeys(unit.Name ?? "", unit.Variant ?? "")) {
        const design = index.get(key);
        if (design !== undefined) {
            return design;
        }
    }
    return null;
}

/**
 * Index entries for the other Classic types. Vehicles and fighters carry a name and a model; infantry, battle armor
 * and ProtoMechs only a name, which the user writes as the MUL's chassis and variant together.
 */
export function getClassicUnitEntries<T extends { getName(): string; getModel?(): string }>(units: T[]): IClassicDesignEntry<T>[] {
    return units.map((unit) => ({ chassis: unit.getName(), model: unit.getModel ? unit.getModel() : "", design: unit }));
}

/** Index entries for 'Mechs; an OmniMech gives one per configuration, which the MUL lists as its own variant. */
export function getClassicMechEntries(mechs: BattleMech[]): IClassicDesignEntry<BattleMech>[] {
    const entries: IClassicDesignEntry<BattleMech>[] = [];
    for (const mech of mechs) {
        const chassis = mech.getChassisName();
        const model = mech.getModelName();
        const configurations = mech.getOmniConfigurationNames();
        if (configurations.length > 1) {
            for (const name of configurations) {
                const configured = mech.cloneOmniConfiguration(name) as BattleMech;
                entries.push({ chassis, model: name, design: configured });
                entries.push({ chassis, model: model + " " + name, design: configured });
            }
        }
        entries.push({ chassis, model, design: mech });
    }
    return entries;
}

/**
 * The MUL files fighters and the larger aerospace craft (Small Craft, DropShips, capital ships) under the same type,
 * 17. The live MUL names the larger ones "Aerospace Craft" (fighters are "Fighter Craft"); the older MUL calls both
 * "Aerospace" and gives the kind in its page's Unit Type, else the tonnage tells (a fighter is 100 tons at most).
 */
export function isMULLargeAerospaceCraft(unit: Pick<IASMULUnit, "Type" | "Tonnage">): boolean {
    if (unit.Type?.Id !== 17) {
        return false;
    }
    if (unit.Type.Name === "Aerospace Craft") {
        return true;
    }
    if (unit.Type.Name === "Fighter Craft") {
        return false;
    }
    const unitType = (unit as { Mul1Page?: { Fields?: Record<string, string> } }).Mul1Page?.Fields?.["Unit Type"] ?? "";
    if (/fighter/i.test(unitType)) {
        return false;
    }
    return /small craft|dropship|jumpship|warship|station/i.test(unitType) || +unit.Tonnage > 100;
}
