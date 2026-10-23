// @vitest-environment happy-dom
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BattleMech } from "../../../../classes/battlemech";
import { BattleMechForce } from "../../../../classes/battlemech-force";
import { BattleMechGroup } from "../../../../classes/battlemech-group";
import type { IAppGlobals } from "../../../app-router";
import BattleMechAddMechDialog from "./_addMechDialog";
import BattleMechRosterHome from "./home";

afterEach(cleanup);

const makeAppGlobals = () => {
    const force = new BattleMechForce();
    force.newGroup();
    const favorite = new BattleMechGroup();
    favorite.members.push(new BattleMech());
    return {
        appSettings: { developerMenu: false, uiTheme: "", mechNameFilter: "", mechRulesFilter: -1 },
        currentCBTForce: force,
        favoriteCBTGroups: [favorite],
        battleMechSaves: [],
        vehicleSaves: [], fighterSaves: [], smallCraftSaves: [], capitalShipSaves: [],
        infantrySaves: [], battleArmorSaves: [], protoMechSaves: [], buildingSaves: [],
        sswMechObjects: [],
        makeDocumentTitle: vi.fn(),
        saveAppSettings: vi.fn(),
        toggleMobile: vi.fn(),
        closeMobile: vi.fn(),
        siteAlerts: { activeAlerts: [] },
    } as unknown as IAppGlobals;
};

// Issue 18: review of the Classic BattleTech roster and its 2022 wording.
describe("Classic BattleTech roster page (issue 18)", () => {
    it("is titled as the Classic BattleTech roster, not the Alpha Strike one", () => {
        const appGlobals = makeAppGlobals();
        render(<MemoryRouter><BattleMechRosterHome appGlobals={appGlobals} /></MemoryRouter>);
        expect(appGlobals.makeDocumentTitle).toHaveBeenCalledWith("Classic BattleTech Roster");
    });

    it("drops the 2022 In Development banner and names every unit type", () => {
        const { container } = render(<MemoryRouter><BattleMechRosterHome appGlobals={makeAppGlobals()} /></MemoryRouter>);
        const text = container.textContent ?? "";
        expect(text).not.toContain("In Development");
        expect(text).not.toContain("2022");
        for (const unitType of ["'Mechs", "vehicles", "fighters", "Small Craft", "capital ships", "infantry", "battle armor", "ProtoMechs", "buildings", "Battledroids"]) {
            expect(text).toContain(unitType);
        }
    });

    it("counts a one-unit favorite as One Unit and names the export file correctly", () => {
        const { container } = render(<MemoryRouter><BattleMechRosterHome appGlobals={makeAppGlobals()} /></MemoryRouter>);
        const text = container.textContent ?? "";
        expect(text).toContain("One Unit");
        expect(text).not.toContain("1 Units");
        expect(text).toContain("cbt-group-favorite-export-*.json");
    });
});

describe("Classic BattleTech roster: adding 'Mechs (issue 18)", () => {
    it("explains the Skunk Werks check instead of trusting only Introductory 'Mechs", () => {
        const appGlobals = makeAppGlobals();
        const { container } = render(
            <MemoryRouter>
                <BattleMechAddMechDialog appGlobals={appGlobals} currentForce={appGlobals.currentCBTForce!.groups[0]} currentForceIndex={0} onChange={vi.fn()} />
            </MemoryRouter>
        );
        const text = container.textContent ?? "";
        expect(text).not.toContain("only Introductory Mechs");
        expect(text).toContain("Battle Value and cost match");
        // The empty-list message spans all six columns.
        expect(container.querySelector("td[colspan='6']")).toBeTruthy();
    });
});
