import { describe, expect, it } from "vitest";
import AerospaceFighter from "./aerospace-fighter";
import BattleArmor from "./battle-armor";
import Building from "./building";
import CapitalShip from "./capital-ship";
import InfantryPlatoon from "./infantry-platoon";
import ProtoMech from "./protomech";
import SmallCraft from "./small-craft";
import { applyUnitGameSettings, getUnitGameSettings, IGameSettingsUnit, keepUnitGameSettings } from "./unit-game-settings";
import Vehicle from "./vehicle";

type Unit = IGameSettingsUnit & { export(): object };
const units: [string, (json?: string) => Unit][] = [
    ["Vehicle", (json = "") => new Vehicle(json)],
    ["AerospaceFighter", (json = "") => new AerospaceFighter(json)],
    ["SmallCraft", (json = "") => new SmallCraft(json)],
    ["CapitalShip", (json = "") => new CapitalShip(json)],
    ["BattleArmor", (json = "") => new BattleArmor(json)],
    ["ProtoMech", (json = "") => new ProtoMech(json)],
    ["InfantryPlatoon", (json = "") => new InfantryPlatoon(json)],
    ["Building", (json = "") => new Building(json)],
];

describe("the eight Classic unit classes keep their own game settings (#324)", () => {
    describe.each(units)("%s", (_name, make) => {
        it("an old save shows the app-wide level and exports no settings", () => {
            const unit = make(JSON.stringify(make().export()));
            expect(getUnitGameSettings(unit, 3).rulesLevel).toBe(3);
            expect(unit.export()).not.toHaveProperty("rulesLevel");
            expect(unit.export()).not.toHaveProperty("rulesets");
        });

        it("keeps its level and rulesets through a save", () => {
            const unit = make();
            applyUnitGameSettings(unit, { ...getUnitGameSettings(unit, 2), rulesLevel: 4, rulesets: ["sample-no-clans"] });
            const loaded = make(JSON.stringify(unit.export()));
            expect(getUnitGameSettings(loaded, 2)).toMatchObject({ rulesLevel: 4, rulesets: ["sample-no-clans"] });
        });
    });

    it("a vehicle applies tech base then era", () => {
        const vehicle = new Vehicle();
        applyUnitGameSettings(vehicle, { ...getUnitGameSettings(vehicle, 2), techBase: "clan", era: "clan-inv" });
        expect(vehicle.getTech().tag).toBe("clan");
        expect(vehicle.getEra().tag).toBe("clan-inv");
    });

    it("a Mixed-tech suit loses Mixed in an era without it", () => {
        const suit = new BattleArmor();
        suit.setEra("jihad");
        suit.setMixedTech(true);
        expect(suit.isMixedTech()).toBe(true);
        applyUnitGameSettings(suit, { ...getUnitGameSettings(suit, 3), era: "late-sw-rn" });
        expect(suit.isMixedTech()).toBe(false);
        expect(suit.getTechTag()).toBe("is");
        expect(suit.getEra().tag).toBe("late-sw-rn");
    });

    it("a ProtoMech is always Clan", () => {
        const proto = new ProtoMech();
        proto.setTechTag("is");
        expect(proto.getTechTag()).toBe("clan");
    });

    it("keepUnitGameSettings carries the level and rulesets onto a loaded sample", () => {
        const from = new Vehicle();
        from.gameSettings.set(4, ["sample-no-clans"]);
        const next = new Vehicle();
        keepUnitGameSettings(from, next, 2);
        expect(getUnitGameSettings(next, 2)).toMatchObject({ rulesLevel: 4, rulesets: ["sample-no-clans"] });
        keepUnitGameSettings(undefined, next, 2);
        expect(getUnitGameSettings(next, 1)).toMatchObject({ rulesLevel: 2, rulesets: [] });
    });
});
