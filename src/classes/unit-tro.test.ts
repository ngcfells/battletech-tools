import { describe, expect, it } from "vitest";
import AerospaceFighter from "./aerospace-fighter";
import BattleArmor from "./battle-armor";
import InfantryPlatoon from "./infantry-platoon";
import ProtoMech from "./protomech";
import Vehicle from "./vehicle";
import { getUnitTroAdapter } from "./unit-tro";

// TRO fields round 2: every other Classic type carries a Technical Readout and gives the shared sheet an adapter.
describe("Technical Readout on the other Classic unit types", () => {
    const makers = [
        { label: "vehicle", make: () => new Vehicle(), load: (json: string) => new Vehicle(json) },
        { label: "fighter", make: () => new AerospaceFighter(), load: (json: string) => new AerospaceFighter(json) },
        { label: "infantry platoon", make: () => new InfantryPlatoon(), load: (json: string) => new InfantryPlatoon(json) },
        { label: "battle armor", make: () => new BattleArmor(), load: (json: string) => new BattleArmor(json) },
        { label: "ProtoMech", make: () => new ProtoMech(), load: (json: string) => new ProtoMech(json) },
    ];
    for (const { label, make, load } of makers) {
        it("saves and loads a " + label + "'s TRO and gives the sheet a title and construction rows", () => {
            const unit = make();
            unit.setName("Testudo");
            unit.tro.setProduction("manufacturer", "Kallon Industries");
            unit.tro.setText("overview", "A test design.");
            const loaded = load(unit.exportJSON());
            expect(loaded.tro.getProduction("manufacturer")).toBe("Kallon Industries");
            expect(loaded.tro.getText("overview")).toBe("A test design.");
            const adapter = getUnitTroAdapter(loaded);
            expect(adapter.getSpecValues().title).toBe("Testudo");
            expect(adapter.getConstructionRows().length).toBeGreaterThan(0);
        });
    }
});
