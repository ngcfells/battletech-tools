import { afterEach, describe, expect, it } from "vitest";
import { setLocalCustomEquipment } from "../data/equipment-registry";
import type { IEquipmentItem } from "../data/data-interfaces";
import { mechCustomEquipmentEnergy } from "../data/mech-custom-equipment-weapons-energy";
import Vehicle from "./vehicle";

describe("custom records by tech base", () => {
    const template = mechCustomEquipmentEnergy[0];
    const fixture = (tag: string, techBase: "is" | "clan"): IEquipmentItem => ({
        ...structuredClone(template),
        name: tag,
        tag,
        techBase,
        category: "Custom Equipment",
        rulesLevel: 6,
        introduced: 2000,
        prototype: undefined,
        extinct: null,
        reintroduced: null
    });
    const offered = (tech: string): string[] => {
        const vehicle = new Vehicle();
        vehicle.setTech(tech);
        return vehicle.getAvailableEquipment(true, 6)
            .map((item) => item.tag)
            .filter((tag) => tag === "artvee-test-is" || tag === "artvee-test-clan");
    };

    afterEach(() => setLocalCustomEquipment([]));

    it("offers an IS custom record to IS and mixed vehicles, a Clan one to Clan and mixed vehicles", () => {
        setLocalCustomEquipment([fixture("artvee-test-is", "is"), fixture("artvee-test-clan", "clan")]);
        expect(offered("is")).toEqual(["artvee-test-is"]);
        expect(offered("clan")).toEqual(["artvee-test-clan"]);
        expect(offered("mis").sort()).toEqual(["artvee-test-clan", "artvee-test-is"]);
        expect(offered("mclan").sort()).toEqual(["artvee-test-clan", "artvee-test-is"]);
    });
});
