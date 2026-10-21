import { IEquipmentItem } from "./data-interfaces";
import { mechISEquipmentBallistic } from "./mech-is-equipment-weapons-ballistic";
import { mechUniversalEquipment } from "./mech-universal-equipment";

/*
 * ArtVee design 2026-10-20 (Custom Homebrew): the combo guns, an artillery tube with a drop-in autocannon breech.
 * In Vehicle Mode the gun fires as the autocannon (the top-level stats here, range +1/+2/+3 over the AC); in Siege
 * Mode it fires as the canon artillery piece named by `comboArtilleryTag`. Each bin feeds from either family.
 *
 * Battle value: the AC's BV x 1.33, the gun counted once at the higher profile. Ammo BV is not set here, so each
 * bin counts its own ammunition's BV.
 */

interface IComboGunRow {
    name: string;
    label: string;
    pieceTag: string;
    acTag: string;
    acAmmo: string;
    artilleryAmmo: string;
    asCode: string;
    damage: number;
    heat: number;
    range: { min: number; short: number; medium: number; long: number };
    weight: number;
    cbills: number;
    battleValue: number;
    shotsPerTon: number;
}

const comboRows: IComboGunRow[] = [
    { name: "thumper", label: "Thumper", pieceTag: "thumper-artillery", acTag: "autocannon-standard-b", acAmmo: "ac-5", artilleryAmmo: "ammo-thumper-standard", asCode: "ARTTH-1", damage: 5, heat: 1, range: { min: 3, short: 7, medium: 14, long: 21 }, weight: 15, cbills: 187500, battleValue: 93, shotsPerTon: 20 },
    { name: "sniper", label: "Sniper", pieceTag: "sniper-artillery", acTag: "autocannon-standard-c", acAmmo: "ac-10", artilleryAmmo: "ammo-sniper-standard", asCode: "ARTSN-1", damage: 10, heat: 3, range: { min: 0, short: 6, medium: 12, long: 18 }, weight: 20, cbills: 300000, battleValue: 164, shotsPerTon: 10 },
    { name: "long-tom", label: "Long Tom", pieceTag: "long-tom-artillery", acTag: "autocannon-standard-d", acAmmo: "ac-20", artilleryAmmo: "ammo-long-tom-standard", asCode: "ARTLT-1", damage: 20, heat: 7, range: { min: 0, short: 4, medium: 8, long: 12 }, weight: 30, cbills: 450000, battleValue: 368, shotsPerTon: 5 },
];

function comboGun(row: IComboGunRow, techBase: "is" | "clan"): IEquipmentItem {
    const ac = mechISEquipmentBallistic.find((item) => item.tag === row.acTag);
    if (!ac) throw new Error(`Combo gun: AC record ${row.acTag} not found`);
    const clan = techBase === "clan";
    const acAmmoTag = `ammo-${techBase}-${row.acAmmo}-standard`;
    return {
        isAmmo: false,
        name: `ArtVee ${row.label} Combo Gun${clan ? " (Clan)" : ""}`,
        tag: `custom-${clan ? "clan-" : ""}artvee-${row.name}-combo`,
        techBase,
        catalog: "custom",
        comboArtilleryTag: row.pieceTag,
        sort: `artillery, artvee ${row.name} combo`,
        category: "Artillery Weapons",
        weaponType: ["ART"],
        notes: `ArtVee combo gun (ArtVee design 2026-10-20): fires as ${ac.name} in Vehicle Mode and as the ${row.label} artillery piece in Siege Mode. Feeds from artillery and autocannon ammunition bins.`,
        damage: row.damage,
        damageAero: row.damage,
        accuracyModifier: 0,
        cbills: row.cbills,
        prototype: 2690,
        introduced: 2700,
        extinct: clan ? null : 2865,
        reintroduced: clan ? null : 3071,
        battleValue: row.battleValue,
        heat: row.heat,
        heatAero: row.heat,
        weight: row.weight,
        range: { ...row.range },
        space: { battlemech: -1, protomech: -1, combatVehicle: 1, supportVehicle: -1, aerospaceFighter: -1, smallCraft: -1, dropShip: -1 },
        shotsPerTon: row.shotsPerTon,
        ammoTypes: [row.artilleryAmmo, acAmmoTag],
        shotsPerTonByAmmo: { [row.artilleryAmmo]: row.shotsPerTon, [acAmmoTag]: row.shotsPerTon },
        minAmmoTons: 1,
        explosive: false,
        techRating: "e",
        rulesLevel: 6,
        book: "Custom",
        page: 0,
        alphaStrike: {
            ...JSON.parse(JSON.stringify(ac.alphaStrike)),
            specialAbility: [row.asCode],
            notes: ["Artillery special: Siege Mode only"],
        },
    };
}

export const artilleryCustom: IEquipmentItem[] = [
    ...comboRows.map((row) => comboGun(row, "is")),
    ...comboRows.map((row) => comboGun(row, "clan")),
];

/** The canon artillery piece a combo gun fires as in Siege Mode, or undefined for any other item. */
export function getComboArtillery(item: IEquipmentItem): IEquipmentItem | undefined {
    if (!item.comboArtilleryTag) return undefined;
    return mechUniversalEquipment.find((piece) => piece.tag === item.comboArtilleryTag);
}
