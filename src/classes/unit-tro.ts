import { IEquipmentItem } from "../data/data-interfaces";
import { ITroComponentRow, ITroConstructionRow, ITroEquipmentCopy, ITroSpecValues, ITroUnitAdapter } from "../data/technical-readout-interfaces";
import { generateUUID } from "../utils/generateUUID";
import AerospaceFighter from "./aerospace-fighter";
import BattleArmor from "./battle-armor";
import InfantryPlatoon from "./infantry-platoon";
import ProtoMech from "./protomech";
import Vehicle from "./vehicle";

// TRO fields round 2: the shared Technical Readout adapter for the Classic types other than 'Mechs (those have
// battlemech-tro.ts). Each type gives its spec block, component rows, equipment and construction table.

export type TroUnit = Vehicle | AerospaceFighter | InfantryPlatoon | BattleArmor | ProtoMech;

/** Modern TROs print speeds in kph: 10.8 kph per movement point, to the whole kph. */
const kph = (movementPoints: number): string => `${Math.round(movementPoints * 10.8)} kph`;

interface IUnitTroParts {
    spec: ITroSpecValues;
    components: ITroComponentRow[];
    construction: ITroConstructionRow[];
    /** The construction table's rows under "Weapons and Equipment", ammunition included; built from `equipment` when left out. */
    equipmentRows?: ITroConstructionRow[];
    /** Weapons and equipment, each with a uuid where the type keeps one. */
    equipment: { item: { uuid?: string; tag: string }; name: string; location: string; armament: boolean; mass?: string }[];
}

function buildAdapter(parts: () => IUnitTroParts): ITroUnitAdapter {
    const copies = (): ITroEquipmentCopy[] => parts().equipment.map((entry) => ({
        uuid: entry.item.uuid ?? "",
        tag: entry.item.tag,
        name: entry.name,
        locationLabel: entry.location,
        armament: entry.armament,
    }));
    return {
        getComponentRows: () => parts().components,
        getEquipmentCopies: copies,
        getKnownEquipmentUuids: () => parts().equipment.map((entry) => entry.item.uuid).filter((uuid): uuid is string => !!uuid),
        getKnownEquipmentTags: () => parts().equipment.map((entry) => entry.item.tag),
        ensureEquipmentUuid(copy: ITroEquipmentCopy): string {
            if (copy.uuid) {
                return copy.uuid;
            }
            const entry = parts().equipment.find((candidate) => !candidate.item.uuid && candidate.item.tag === copy.tag && candidate.location === copy.locationLabel);
            if (!entry) {
                return copy.uuid;
            }
            entry.item.uuid = generateUUID();
            return entry.item.uuid;
        },
        getSpecValues: () => parts().spec,
        getConstructionRows(): ITroConstructionRow[] {
            const { construction, equipment, equipmentRows } = parts();
            const rows = equipmentRows ?? equipment.map((entry) => ({ label: entry.name, value: entry.location, mass: entry.mass }));
            if (rows.length === 0) {
                return construction;
            }
            return [
                ...construction,
                { label: "Weapons and Equipment", value: "Location", mass: "Mass", heading: true },
                ...rows,
            ];
        },
    };
}

const catalogEquipment = (items: IEquipmentItem[], locationName: (location?: string) => string): IUnitTroParts["equipment"] => items
    .filter((item) => item && !item.isAmmo)
    .map((item) => ({ item, name: item.name, location: locationName(item.location?.toString()), armament: item.category !== "Miscellaneous Equipment", mass: `${item.weight}` }));

const subtitle = (...parts: (string | undefined)[]): string => parts.filter(Boolean).join(" · ");

/** A mass in tons, to the kilogram, without floating-point tails. */
const tonsText = (tons: number): string => `${Math.round(tons * 1000) / 1000}`;

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** One construction row per weight line, in the unit's own order, so the table adds up to the unit's mass. */
interface IWeightLine { name: string; weight: number; item?: IEquipmentItem }

/**
 * Splits a weight list into the rows above "Weapons and Equipment" and the rows under it. Equipment lines carry their
 * item; a line after the equipment (a support vehicle's kilogram items, rounded up together) stays with the equipment.
 */
function weightLineRows(
    lines: IWeightLine[],
    chassisRow: (line: IWeightLine) => ITroConstructionRow[],
    locationName: (location?: string) => string,
): { construction: ITroConstructionRow[]; equipmentRows: ITroConstructionRow[] } {
    const construction: ITroConstructionRow[] = [];
    const equipmentRows: ITroConstructionRow[] = [];
    let pastEquipment = false;
    for (const line of lines) {
        if (line.item) {
            pastEquipment = true;
            equipmentRows.push({ label: line.name, value: locationName(line.item.location?.toString()), mass: tonsText(line.weight) });
        } else if (pastEquipment) {
            equipmentRows.push({ label: line.name, mass: tonsText(line.weight) });
        } else {
            construction.push(...chassisRow(line));
        }
    }
    return { construction, equipmentRows };
}

function vehicleLocationName(vehicle: Vehicle, location?: string): string {
    if (!location || location === "body") {
        return "Body";
    }
    return vehicle.getLocations().find((entry) => entry.tag === location)?.name ?? capitalize(location);
}

/** TRO-style rows: the vehicle's weight list with engine rating, movement, heat sinks and armor factor, then armor by location. */
function vehicleConstruction(vehicle: Vehicle): { construction: ITroConstructionRow[]; equipmentRows: ITroConstructionRow[] } {
    const support = vehicle.isSupportVehicle();
    const lines: IWeightLine[] = vehicle.getWeights();
    const weightedHeatSinks = lines.some((line) => !line.item && line.name.includes("Heat Sinks"));
    const movement = (): ITroConstructionRow[] => [
        { label: "Cruising MP", value: `${vehicle.getCruiseMP()}`, indent: true },
        { label: "Flank MP", value: `${vehicle.getFlankMP()}`, indent: true },
        ...(vehicle.getJumpMP() > 0 ? [{ label: "Jumping MP", value: `${vehicle.getJumpMP()}`, indent: true }] : []),
    ];
    const chassisRow = (line: IWeightLine): ITroConstructionRow[] => {
        const mass = tonsText(line.weight);
        if (line.name === "Internal Structure") {
            const type = vehicle.getStructureType();
            return [{ label: type === "standard" ? "Internal Structure" : `Internal Structure (${capitalize(type)})`, mass }];
        }
        if (line.name === vehicle.getEngineType().name || (support && line.name.endsWith(" Engine"))) {
            const heatSinks: ITroConstructionRow[] = weightedHeatSinks || support ? [] : [{ label: "Heat Sinks", value: `${vehicle.getTotalHeatSinks()}`, mass: "0" }];
            return [{ label: line.name, value: `${vehicle.getEngineRating()}`, mass }, ...movement(), ...heatSinks];
        }
        if (line.name.includes("Heat Sinks")) {
            return [{ label: line.name, value: `${vehicle.getTotalHeatSinks()}`, mass }];
        }
        if (line.name === "Armor" || line.name.startsWith("Armor (BAR")) {
            const type = line.name === "Armor" ? vehicle.getArmorType().name : line.name.slice("Armor (".length, -1);
            return [{ label: `Armor Factor (${type})`, value: `${vehicle.getArmorPoints()}`, mass }];
        }
        if (line.name === "Jump Jets") {
            return [{ label: line.name, value: `${vehicle.getJumpMP()}`, mass }];
        }
        return [{ label: line.name, mass }];
    };
    const { construction, equipmentRows } = weightLineRows(lines, chassisRow, (location) => vehicleLocationName(vehicle, location));
    const structure = vehicle.getStructureAllocation();
    const armor = vehicle.getArmorAllocation();
    construction.push(
        { label: "Internal Structure / Armor by location", heading: true },
        ...vehicle.getLocations().map((location) => ({ label: location.name, value: `${structure[location.tag] ?? 0} / ${armor[location.tag] ?? 0}`, indent: true })),
    );
    return { construction, equipmentRows };
}

function vehicleParts(vehicle: Vehicle): IUnitTroParts {
    const tons = vehicle.getTonnage();
    const jump = vehicle.getJumpMP();
    const { construction, equipmentRows } = vehicleConstruction(vehicle);
    return {
        spec: {
            title: vehicle.getName(),
            subtitle: subtitle(vehicle.getModel(), vehicle.getTech().name, `${tons} tons`),
            mass: `${tons} tons`,
            cruisingSpeed: kph(vehicle.getCruiseMP()),
            maximumSpeed: kph(vehicle.getFlankMP()),
            jumpCapacity: jump > 0 ? `${jump * 30} meters` : undefined,
            armorType: vehicle.getArmorType().name,
        },
        components: [
            { key: "chassis", label: `Chassis (${capitalize(vehicle.getStructureType())})` },
            { key: "engine", label: `Engine (${vehicle.getEngineType().name} ${vehicle.getEngineRating()})` },
            { key: "armor", label: `Armor (${vehicle.getArmorType().name})` },
        ],
        construction,
        equipmentRows,
        equipment: catalogEquipment(vehicle.getEquipmentList(), (location) => vehicleLocationName(vehicle, location)),
    };
}

function fighterParts(fighter: AerospaceFighter): IUnitTroParts {
    const tons = fighter.getTonnage();
    return {
        spec: {
            title: fighter.getName(),
            subtitle: subtitle(fighter.getModel(), fighter.getTech().name, `${tons} tons`),
            mass: `${tons} tons`,
            cruisingSpeed: `Safe Thrust ${fighter.getSafeThrust()}`,
            maximumSpeed: `Maximum Thrust ${fighter.getMaxThrust()}`,
            armorType: fighter.getArmorType().name,
        },
        components: [
            { key: "chassis", label: "Chassis" },
            { key: "engine", label: `Engine (${fighter.getEngineType().name} ${fighter.getEngineRating()})` },
            { key: "armor", label: `Armor (${fighter.getArmorType().name})` },
        ],
        construction: [
            { label: "Structural Integrity", mass: `${fighter.getStructureWeight()}` },
            { label: fighter.getEngineType().name, value: `${fighter.getEngineRating()}`, mass: `${fighter.getEngineWeight()}` },
            { label: "Safe Thrust", value: `${fighter.getSafeThrust()}`, indent: true },
            { label: "Maximum Thrust", value: `${fighter.getMaxThrust()}`, indent: true },
            { label: `Armor (${fighter.getArmorType().name})`, mass: `${fighter.getArmorWeight()}` },
        ],
        equipment: catalogEquipment(fighter.getEquipmentList(), (location) => location ?? ""),
    };
}

function infantryParts(platoon: InfantryPlatoon): IUnitTroParts {
    const secondary = platoon.getSecondaryWeapon();
    const armor = platoon.getArmor();
    const equipment: IUnitTroParts["equipment"] = [
        { item: platoon.getPrimaryWeapon(), name: platoon.getPrimaryWeapon().name, location: `${platoon.getPrimaryCount()} troopers`, armament: true },
    ];
    if (secondary) {
        equipment.push({ item: secondary, name: secondary.name, location: `${platoon.getSecondaryCount()} troopers`, armament: true });
    }
    return {
        spec: {
            title: platoon.getName(),
            subtitle: subtitle(`${platoon.getMotive().name} infantry`, `${platoon.getTroopers()} troopers`),
            mass: `${platoon.getWeight()} tons`,
            armorType: armor?.name,
        },
        components: [{ key: "armor", label: `Armor (${armor?.name ?? "none"})` }],
        construction: [
            { label: "Motive", value: platoon.getMotive().name },
            { label: "Squads", value: `${platoon.getSquads()} × ${platoon.getSquadSize()}` },
            { label: "Armor Kit", value: armor?.name ?? "None" },
        ],
        equipment,
    };
}

function battleArmorParts(squad: BattleArmor): IUnitTroParts {
    const jump = squad.getJumpMP();
    return {
        spec: {
            title: squad.getName(),
            subtitle: subtitle(`${squad.getSquadSize()} troopers`),
            mass: `${squad.getWeight()} kg per trooper`,
            cruisingSpeed: kph(squad.getGroundMP()),
            jumpCapacity: jump > 0 ? `${jump * 30} meters` : undefined,
            armorType: squad.getArmor().name,
        },
        components: [
            { key: "chassis", label: "Chassis" },
            { key: "armor", label: `Armor (${squad.getArmor().name})` },
        ],
        construction: squad.getWeightLog().map((line) => ({ label: line.label, mass: `${line.kg} kg` })),
        equipment: squad.getItems().map((item) => ({ item, name: squad.getItemLabel(item), location: `${item.location}`, armament: true, mass: `${squad.getItemWeight(item)} kg` })),
    };
}

function protoMechParts(proto: ProtoMech): IUnitTroParts {
    const jump = proto.getJumpMP();
    return {
        spec: {
            title: proto.getName(),
            subtitle: subtitle(proto.getChassisName(), `${proto.getTons()} tons`),
            mass: `${proto.getTons()} tons`,
            cruisingSpeed: kph(proto.getWalkMP()),
            maximumSpeed: kph(proto.getRunMP()),
            jumpCapacity: jump > 0 ? `${jump * 30} meters` : undefined,
            armorType: proto.getArmorTypeName(),
        },
        components: [
            { key: "chassis", label: "Chassis" },
            { key: "engine", label: `Engine (${proto.getEngineRating()})` },
            { key: "armor", label: `Armor (${proto.getArmorTypeName()})` },
        ],
        construction: proto.getWeightLog().map((line) => ({ label: line.label, mass: `${line.kg} kg` })),
        equipment: proto.getWeaponLines().map((line) => ({ item: { tag: line.name }, name: line.name, location: line.location, armament: true })),
    };
}

/** What the shared Technical Readout section and sheet need to know about any non-'Mech Classic unit. */
export function getUnitTroAdapter(unit: TroUnit): ITroUnitAdapter {
    if (unit instanceof Vehicle) return buildAdapter(() => vehicleParts(unit));
    if (unit instanceof AerospaceFighter) return buildAdapter(() => fighterParts(unit));
    if (unit instanceof InfantryPlatoon) return buildAdapter(() => infantryParts(unit));
    if (unit instanceof BattleArmor) return buildAdapter(() => battleArmorParts(unit));
    return buildAdapter(() => protoMechParts(unit));
}
