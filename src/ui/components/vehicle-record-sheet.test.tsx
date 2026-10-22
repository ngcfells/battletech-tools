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

    it("prints ammunition in the Body, BD, with its shots, not as unallocated (TM p. 107)", () => {
        const tank = new Vehicle();
        tank.setMotiveType("tracked");
        tank.setTonnage(60);
        tank.addEquipmentFromTag("autocannon-standard-b");
        tank.setEquipmentLocation(tank.getEquipmentList()[tank.getEquipmentList().length - 1].uuid!, "front");
        tank.addEquipmentFromTag("ammo-is-ac-5-standard");
        const markup = renderToStaticMarkup(<VehicleRecordSheet vehicle={tank} />);
        expect(markup).toContain("<td>Body (BD)</td><td>AC/5 - Standard Ammo (IS) (20 shots)</td>");
        expect(markup).toContain("<td>Unallocated</td><td>-</td>");
    });
});
