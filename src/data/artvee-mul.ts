import type { IASMULUnit } from "../classes/alpha-strike-unit";
import Vehicle from "../classes/vehicle";
import { mulEras } from "../utils/mulUtilities";
import { ARTVEE_SAMPLES } from "./artvee-samples";
import { buildCustomMULRecord, CUSTOM_MUL_ID_START, CUSTOM_MUL_KEY_PREFIX, CUSTOM_TECHNOLOGIES, emptyCustomMULForm } from "./custom-mul";

// The sample ArtVees as entries in the shared custom unit list (src/data/mul/custom/custom-units.json), so the Alpha
// Strike and Classic roster searches find them when "Custom units" is ticked. Stats come from the Vehicle Creator's
// own Alpha Strike conversion; custom-units.test.ts checks the list still matches it.

/** ArtVee entries take the ids after the editor's first custom id, in sample order. */
export const ARTVEE_MUL_ID_START = CUSTOM_MUL_ID_START + 9000;
export const ARTVEE_MUL_DATE = "2026-10-23T00:00:00.000Z";

function getMULEraIdForYear(year: number): number {
    return mulEras.find((era) => year >= era.yearStart && (era.yearEnd === null || year <= era.yearEnd))?.id ?? 0;
}

export function buildArtVeeMULRecords(): IASMULUnit[] {
    return ARTVEE_SAMPLES.map((sample, index) => {
        const vehicle = new Vehicle(JSON.stringify(sample.save));
        const stats = vehicle.getAlphaStrikeStats();
        const techName = vehicle.getTech().name;
        const form = {
            ...emptyCustomMULForm(),
            name: sample.save.name,
            variant: sample.save.model,
            unitType: "Combat Vehicle",
            technology: CUSTOM_TECHNOLOGIES.some((tech) => tech.name === techName) ? techName : "Inner Sphere",
            rules: "Experimental",
            eraId: String(getMULEraIdForYear(vehicle.getEra().yearStart)),
            tonnage: String(vehicle.getTonnage()),
            battleValue: String(vehicle.getBattleValue()),
            pointValue: String(stats.pointValue),
            size: String(stats.size),
            // Written the way Vehicle.getAlphaStrikeUnit() writes BFMove.
            move: `${stats.movement}"${stats.movementType}` + (stats.jumpMovement ? `/${stats.jumpMovement}"j` : ""),
            tmm: String(stats.tmm),
            armor: String(stats.armor),
            structure: String(stats.structure),
            damageShort: stats.damageValues.short.minimal ? "0*" : String(stats.damageValues.short.damage),
            damageMedium: stats.damageValues.medium.minimal ? "0*" : String(stats.damageValues.medium.damage),
            damageLong: stats.damageValues.long.minimal ? "0*" : String(stats.damageValues.long.damage),
            damageExtreme: stats.damageValues.extreme.minimal ? "0*" : String(stats.damageValues.extreme.damage),
            abilities: stats.specialAbilities.join(","),
            author: "Jeff's BattleTech Tools",
            source: "ArtVee samples (Vehicle Creator, Custom Homebrew)",
            notes: "Custom Homebrew ArtVee (Artillery Vehicle), an idea put forward on the Star League Discord by kris (helvedes heste).",
        };
        return buildCustomMULRecord(form, {
            id: ARTVEE_MUL_ID_START + index,
            key: `${CUSTOM_MUL_KEY_PREFIX}ARTVEE-${sample.id.toUpperCase()}`,
            createdAt: ARTVEE_MUL_DATE,
        }, ARTVEE_MUL_DATE);
    });
}
