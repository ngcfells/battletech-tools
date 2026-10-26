// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import AerospaceFighter from "../../../classes/aerospace-fighter";
import BattleArmor from "../../../classes/battle-armor";
import Building from "../../../classes/building";
import CapitalShip from "../../../classes/capital-ship";
import InfantryPlatoon from "../../../classes/infantry-platoon";
import ProtoMech from "../../../classes/protomech";
import SmallCraft from "../../../classes/small-craft";
import type { IAppGlobals } from "../../app-router";
import BattleArmorCreatorChassis from "./battle-armor-creator/chassis";
import BuildingCreatorStructure from "./building-creator/structure";
import CapitalShipCreatorChassis from "./capital-ship-creator/chassis";
import FighterCreatorChassis from "./fighter-creator/chassis";
import InfantryCreatorPlatoon from "./infantry-creator/platoon";
import ProtoMechCreatorChassis from "./protomech-creator/chassis";
import SmallCraftCreatorChassis from "./small-craft-creator/chassis";

afterEach(cleanup);

// Step 1 of each builder other than the 'Mech's and the vehicle's, with a fresh design of each type loaded.
function renderStep1(Page: ComponentType<{ appGlobals: IAppGlobals }>, mechRulesFilter = 2) {
    const appGlobals = {
        appSettings: { developerMenu: false, uiTheme: "", mechNameFilter: "", mechRulesFilter },
        currentFighter: new AerospaceFighter(),
        currentSmallCraft: new SmallCraft(),
        currentCapitalShip: new CapitalShip(),
        currentBattleArmor: new BattleArmor(),
        currentProtoMech: new ProtoMech(),
        currentInfantry: new InfantryPlatoon(),
        currentBuilding: new Building(),
        saveCurrentFighter: vi.fn(),
        saveCurrentSmallCraft: vi.fn(),
        saveCurrentCapitalShip: vi.fn(),
        saveCurrentBattleArmor: vi.fn(),
        saveCurrentProtoMech: vi.fn(),
        saveCurrentInfantry: vi.fn(),
        saveCurrentBuilding: vi.fn(),
        makeDocumentTitle: vi.fn(),
        saveAppSettings: vi.fn(),
        toggleMobile: vi.fn(),
        closeMobile: vi.fn(),
        siteAlerts: { activeAlerts: [] },
    } as unknown as IAppGlobals;
    const { container } = render(<MemoryRouter><Page appGlobals={appGlobals} /></MemoryRouter>);
    return { appGlobals, text: container.textContent ?? "" };
}

const ORDER = ["Special Rulesets:", "Rules Edition:", "Rules Level:", "Technology Base:", "Era:"];

describe("each builder's step 1 opens with the shared game settings block (#324 round 3)", () => {
    it.each([
        ["Fighter", FighterCreatorChassis],
        ["Small Craft", SmallCraftCreatorChassis],
        ["Capital Ship", CapitalShipCreatorChassis],
        ["Battle Armor", BattleArmorCreatorChassis],
        ["Infantry", InfantryCreatorPlatoon],
        ["Building", BuildingCreatorStructure],
    ])("%s: the steps in order, one of each", (_name, Page) => {
        const { text } = renderStep1(Page);
        const at = ORDER.map((label) => text.indexOf(label));
        expect(at.every((index) => index >= 0)).toBe(true);
        expect([...at].sort((a, b) => a - b)).toEqual(at);
        expect(screen.getAllByLabelText(/Rules Level/)).toHaveLength(1);
        expect(screen.getAllByLabelText(/^Era/)).toHaveLength(1);
    });

    it("ProtoMech: no Technology Base step, one of each other step", () => {
        const { text } = renderStep1(ProtoMechCreatorChassis);
        const at = ["Special Rulesets:", "Rules Edition:", "Rules Level:", "Era:"].map((label) => text.indexOf(label));
        expect([...at].sort((a, b) => a - b)).toEqual(at);
        expect(at.every((index) => index >= 0)).toBe(true);
        expect((screen.getByLabelText(/Technology Base/).closest("div") as HTMLElement).style.display).toBe("none");
        expect(screen.getAllByLabelText(/^Era/)).toHaveLength(1);
    });

    it("Battle Armor: Inner Sphere or Clan, and the Mixed technology option stays at Advanced", () => {
        renderStep1(BattleArmorCreatorChassis, 3);
        const tech = screen.getByLabelText(/Technology Base/) as HTMLSelectElement;
        expect(Array.from(tech.options).map((option) => option.textContent)).toEqual(["Inner Sphere", "Clan"]);
        expect(screen.getByTestId("ba-mixed-tech")).toBeTruthy();
    });
});
