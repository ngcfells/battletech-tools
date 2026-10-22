import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Vehicle from "../../classes/vehicle";
import VehicleRecordSheet from "./vehicle-record-sheet";

describe("vehicle record sheet", () => {
    it("marks a weapon in a sponson turret", () => {
        const tank = new Vehicle();
        tank.setMotiveType("tracked");
        tank.setTonnage(60);
        tank.setSponsonTurrets(true);
        tank.addEquipmentFromTag("large-laser");
        const laser = tank.getEquipmentList()[tank.getEquipmentList().length - 1];
        tank.setEquipmentLocation(laser.uuid!, "left");
        tank.setEquipmentSponson(laser.uuid!, true);
        expect(renderToStaticMarkup(<VehicleRecordSheet vehicle={tank} />)).toContain("Large Laser (sponson)");
    });
});
