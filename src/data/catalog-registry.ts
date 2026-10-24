import { aerospaceArmorTypes } from "./aerospace-armor-types";
import { battleArmorArmorTypes } from "./battle-armor-armor-types";
import { battleArmorEquipment } from "./battle-armor-equipment";
import { getBattleArmorScaleEquipment } from "./battle-armor-scale-equipment";
import { capitalWeapons } from "./capital-weapons";
import { COMBAT_VEHICLE_CHASSIS_MODIFICATIONS } from "./combat-vehicle-chassis-modifications";
import type { ICatalogStanding } from "./data-interfaces";
import { getEquipmentCatalogDefinitions } from "./equipment-registry";
import { infantryArmor } from "./infantry-armor";
import { infantryWeapons } from "./infantry-weapons";
import { mechArmorTypes } from "./mech-armor-types";
import { mechCockpitTypes } from "./mech-cockpit-types";
import { mechEngineTypes, mechLargeEngineTypes } from "./mech-engine-types";
import { mechGyroTypes } from "./mech-gyro-types";
import { mechHeatSinkTypes } from "./mech-heat-sink-types";
import { mechInternalStructureTypes } from "./mech-internal-structure-types";
import { mechJumpJetTypes } from "./mech-jump-jet-types";
import { mechMyomerTypes } from "./mech-myomer-types";
import { protoMechComponents } from "./protomech-components";
import { protoMechEquipment } from "./protomech-construction";
import { subCapitalWeapons } from "./sub-capital-weapons";
import { supportVehicleArmor } from "./support-vehicle-armor";
import { vehicleMotiveTypes } from "./vehicle-motive-types";

export interface ICatalogEntry {
    /** Stable id, e.g. "equipment-energy", "mech-armor", "infantry-weapons". */
    id: string;
    records: ICatalogStanding[];
    custom: boolean;
    /** One of the equipment catalogs (equipment-registry.ts), whose tags are looked up together. */
    equipment?: boolean;
    /** Rounds 3-5 move the catalog onto the full core; until then its records may lack editions or techBase (the 'Mech components lack techBase). */
    pendingStanding?: boolean;
}

/**
 * Every catalog of records that can be given to a unit or a member of one (design 2026-10-24-catalog-consolidation
 * §1). Construction options that are not items (tonnages, 'Mech types) are not listed. Records whose type spells the
 * shared tech base "both" are cast until rounds 3-5 rename it.
 */
export function getAllCatalogs(): ICatalogEntry[] {
    const both = (records: unknown[]) => records as ICatalogStanding[];
    return [
        ...getEquipmentCatalogDefinitions().map((definition) => ({ id: definition.id, records: definition.equipment, custom: !!definition.custom, equipment: true })),
        { id: "mech-engine", records: [...mechEngineTypes, ...mechLargeEngineTypes], custom: false, pendingStanding: true },
        { id: "mech-gyro", records: mechGyroTypes, custom: false, pendingStanding: true },
        { id: "mech-cockpit", records: mechCockpitTypes, custom: false, pendingStanding: true },
        { id: "mech-heat-sink", records: mechHeatSinkTypes, custom: false, pendingStanding: true },
        { id: "mech-jump-jet", records: mechJumpJetTypes, custom: false, pendingStanding: true },
        { id: "mech-armor", records: mechArmorTypes, custom: false, pendingStanding: true },
        { id: "mech-internal-structure", records: mechInternalStructureTypes, custom: false, pendingStanding: true },
        { id: "mech-myomer", records: mechMyomerTypes, custom: false, pendingStanding: true },
        { id: "infantry-weapons", records: both(infantryWeapons), custom: false, pendingStanding: true },
        { id: "infantry-armor", records: both(infantryArmor), custom: false, pendingStanding: true },
        { id: "battle-armor-equipment", records: battleArmorEquipment, custom: false, pendingStanding: true },
        { id: "battle-armor-armor", records: both(battleArmorArmorTypes), custom: false, pendingStanding: true },
        { id: "battle-armor-scale-is", records: getBattleArmorScaleEquipment("is"), custom: false, pendingStanding: true },
        { id: "battle-armor-scale-clan", records: getBattleArmorScaleEquipment("clan"), custom: false, pendingStanding: true },
        { id: "aerospace-armor", records: both(aerospaceArmorTypes), custom: false, pendingStanding: true },
        { id: "support-vehicle-armor", records: supportVehicleArmor, custom: false, pendingStanding: true },
        { id: "vehicle-motive", records: vehicleMotiveTypes, custom: false, pendingStanding: true },
        { id: "combat-vehicle-chassis-modifications", records: COMBAT_VEHICLE_CHASSIS_MODIFICATIONS, custom: false, pendingStanding: true },
        { id: "protomech-components", records: both(protoMechComponents), custom: false, pendingStanding: true },
        { id: "protomech-equipment", records: both(protoMechEquipment), custom: false, pendingStanding: true },
        { id: "capital-weapons", records: both(capitalWeapons), custom: false, pendingStanding: true },
        { id: "sub-capital-weapons", records: both(subCapitalWeapons), custom: false, pendingStanding: true },
    ];
}
