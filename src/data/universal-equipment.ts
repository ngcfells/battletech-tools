import { IEquipmentItem } from "./data-interfaces";
import { equipmentArtillery } from "./equipment-artillery";
import { ammoCatalog } from "./ammo";

function hasUniversalMetrics(item: IEquipmentItem, counterpart: IEquipmentItem): boolean {
    return item.name === counterpart.name
        && item.weight === counterpart.weight
        && item.space.battlemech === counterpart.space.battlemech
        && JSON.stringify(item.damage) === JSON.stringify(counterpart.damage)
        && JSON.stringify(item.range) === JSON.stringify(counterpart.range);
}

// The universal records (techBase "universal") join both the Inner Sphere and the Clan lists.
const universalEquipmentTags = new Set([
    ...[...equipmentArtillery, ...ammoCatalog].filter(item => item.techBase === "universal").map(item => item.tag),
]);

export function isUniversalEquipment(item: IEquipmentItem): boolean {
    return item.catalog === "universal" || universalEquipmentTags.has(item.tag);
}

export function hasUniversalEquipmentMetrics(item: IEquipmentItem, counterpart: IEquipmentItem): boolean {
    return hasUniversalMetrics(item, counterpart);
}
