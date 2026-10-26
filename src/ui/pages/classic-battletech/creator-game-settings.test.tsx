// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import AerospaceFighter from "../../../classes/aerospace-fighter";
import CapitalShip from "../../../classes/capital-ship";
import SmallCraft from "../../../classes/small-craft";
import type { IAppGlobals } from "../../app-router";
import CapitalShipCreatorChassis from "./capital-ship-creator/chassis";
import FighterCreatorChassis from "./fighter-creator/chassis";
import SmallCraftCreatorChassis from "./small-craft-creator/chassis";

afterEach(cleanup);

// Step 1 of each builder other than the 'Mech's and the vehicle's, with a fresh design of each type loaded.
function renderStep1(Page: ComponentType<{ appGlobals: IAppGlobals }>, mechRulesFilter = 2) {
    const appGlobals = {
        appSettings: { developerMenu: false, uiTheme: "", mechNameFilter: "", mechRulesFilter },
        currentFighter: new AerospaceFighter(),
        currentSmallCraft: new SmallCraft(),
        currentCapitalShip: new CapitalShip(),
        saveCurrentFighter: vi.fn(),
        saveCurrentSmallCraft: vi.fn(),
        saveCurrentCapitalShip: vi.fn(),
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
    ])("%s: the steps in order, one of each", (_name, Page) => {
        const { text } = renderStep1(Page);
        const at = ORDER.map((label) => text.indexOf(label));
        expect(at.every((index) => index >= 0)).toBe(true);
        expect([...at].sort((a, b) => a - b)).toEqual(at);
        expect(screen.getAllByLabelText(/Rules Level/)).toHaveLength(1);
        expect(screen.getAllByLabelText(/^Era/)).toHaveLength(1);
    });
});
