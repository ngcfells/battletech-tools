// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BattleMech } from "../../../../classes/battlemech";
import { BattleMechForce } from "../../../../classes/battlemech-force";
import { BattleMechGroup } from "../../../../classes/battlemech-group";
import type { IAppGlobals } from "../../../app-router";
import BattleMechAddMechDialog from "./_addMechDialog";
import BattleMechRosterHome from "./home";
import { newMULSearchFilters } from "../../../../utils/mulSearchFilters";
import { sswTestFixtures } from "../../../../data/ssw/sswTestFixtures";

afterEach(cleanup);

const makeAppGlobals = () => {
    const force = new BattleMechForce();
    force.newGroup();
    const favorite = new BattleMechGroup();
    favorite.members.push(new BattleMech());
    return {
        appSettings: { developerMenu: false, uiTheme: "", mechNameFilter: "", mechRulesFilter: -1, cbtMULSearch: newMULSearchFilters({ type: 18 }) },
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
        const emptyCells = [...container.querySelectorAll("td[colspan='6']")];
        expect(emptyCells.some((cell) => cell.textContent?.includes("No 'mechs found for import"))).toBe(true);
    });
});

// Ideas #84 (Camille, Centrella-Sworn, Star League Discord): search the MUL from the Classic roster.
describe("Classic roster Master Unit List search", () => {
    it("finds a 'Mech on the MUL and adds its Skunk Werks design to the group", async () => {
        const appGlobals = makeAppGlobals();
        const champion = new BattleMech();
        champion.importSSWXML(sswTestFixtures["Champion C"]);
        (appGlobals.sswMechObjects as BattleMech[]).push(champion);
        appGlobals.appSettings.cbtMULSearch = newMULSearchFilters({ type: 18, term: "Champion" });
        const onChange = vi.fn();
        render(
            <MemoryRouter>
                <BattleMechAddMechDialog appGlobals={appGlobals} currentForce={appGlobals.currentCBTForce!.groups[0]} currentForceIndex={0} onChange={onChange} />
            </MemoryRouter>
        );
        const add = await screen.findByRole("button", { name: "Add " + champion.getChassisName() + " " + champion.getModelName() }, { timeout: 20_000 });
        fireEvent.click(add);
        expect(onChange).toHaveBeenCalledTimes(1);
        const group: BattleMechGroup = onChange.mock.calls[0][0];
        expect(group.members.map((member) => member.getName())).toContain(champion.getName());
    }, 30_000);

    it("offers the creator for a MUL 'Mech with no Classic design", async () => {
        const appGlobals = makeAppGlobals();
        appGlobals.appSettings.cbtMULSearch = newMULSearchFilters({ type: 18, term: "Atlas AS7-D" });
        render(
            <MemoryRouter>
                <BattleMechAddMechDialog appGlobals={appGlobals} currentForce={appGlobals.currentCBTForce!.groups[0]} currentForceIndex={0} onChange={vi.fn()} />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getAllByText(/No Classic design yet/).length).toBeGreaterThan(0), { timeout: 20_000 });
        expect(screen.getAllByRole("link", { name: "build it" })[0].getAttribute("href")).toContain("/classic-battletech/mech-creator");
    }, 30_000);
});
