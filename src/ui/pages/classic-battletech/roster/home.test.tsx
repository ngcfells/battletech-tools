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
import { getMULDisplayName } from "../../../../classes/alpha-strike-unit";
import Vehicle from "../../../../classes/vehicle";
import AerospaceFighter from "../../../../classes/aerospace-fighter";
import InfantryPlatoon from "../../../../classes/infantry-platoon";
import BattleArmor from "../../../../classes/battle-armor";
import ProtoMech from "../../../../classes/protomech";
import { searchBundledMUL } from "../../../../utils";

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
        fireEvent.click(screen.getByRole("button", { name: "TRO " + champion.getChassisName() + " " + champion.getModelName() }));
        expect(screen.getByRole("heading", { name: /^Technical Readout: / })).toBeTruthy();
        fireEvent.click(screen.getAllByRole("button", { name: /^(Cancel|Close)$/ })[0]);
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

    it("adds the bundled Classic design for an ArtVee found in the custom units, with nothing saved", async () => {
        const appGlobals = makeAppGlobals();
        appGlobals.appSettings.cbtMULSearch = newMULSearchFilters({ type: 19, term: "Falconet", sources: ["custom"] });
        const onChange = vi.fn();
        render(
            <MemoryRouter>
                <BattleMechAddMechDialog appGlobals={appGlobals} currentForce={appGlobals.currentCBTForce!.groups[0]} currentForceIndex={0} onChange={onChange} />
            </MemoryRouter>
        );
        const add = await screen.findByRole("button", { name: /^Add Falconet ArtVee/ }, { timeout: 20_000 });
        fireEvent.click(add);
        const group: BattleMechGroup = onChange.mock.calls[0][0];
        expect(group.vehicles.map((vehicle) => vehicle.getName() + " " + vehicle.getModel())).toEqual(["Falconet ArtVee FLC-1"]);
    }, 30_000);

    // Round 2: each other Classic type matches a saved design by name and lands in its own table in the group.
    const otherTypes: { label: string; type: number; saves: keyof IAppGlobals; table: keyof BattleMechGroup; make: (name: string, model: string) => { exportJSON(): string } }[] = [
        { label: "combat vehicle", type: 19, saves: "vehicleSaves", table: "vehicles", make: (name, model) => { const unit = new Vehicle(); unit.setName(name); unit.setModel(model); return unit; } },
        { label: "fighter", type: 17, saves: "fighterSaves", table: "fighters", make: (name, model) => { const unit = new AerospaceFighter(); unit.setName(name); unit.setModel(model); return unit; } },
        { label: "infantry platoon", type: 21, saves: "infantrySaves", table: "infantry", make: (name, model) => { const unit = new InfantryPlatoon(); unit.setName(name + " " + model); return unit; } },
        { label: "battle armor squad", type: 22, saves: "battleArmorSaves", table: "battleArmor", make: (name, model) => { const unit = new BattleArmor(); unit.setName(name + " " + model); return unit; } },
        { label: "ProtoMech point", type: 23, saves: "protoMechSaves", table: "protoMechs", make: (name, model) => { const unit = new ProtoMech(); unit.setName(name + " " + model); return unit; } },
        { label: "support vehicle", type: 24, saves: "vehicleSaves", table: "vehicles", make: (name, model) => { const unit = new Vehicle(); unit.setName(name); unit.setModel(model); return unit; } },
    ];
    for (const kind of otherTypes) {
        it("finds a saved " + kind.label + " on the MUL and adds it to the group's " + String(kind.table) + " table", async () => {
            const appGlobals = makeAppGlobals();
            const hit = (await searchBundledMUL(newMULSearchFilters({ type: kind.type }))).find((unit) => (unit.Variant ?? "").trim() !== "")!;
            const design = kind.make(hit.Name, hit.Variant ?? "");
            (appGlobals[kind.saves] as unknown[]).push(JSON.parse(design.exportJSON()));
            appGlobals.appSettings.cbtMULSearch = newMULSearchFilters({ type: kind.type, term: hit.Name + " " + hit.Variant });
            const onChange = vi.fn();
            render(
                <MemoryRouter>
                    <BattleMechAddMechDialog appGlobals={appGlobals} currentForce={appGlobals.currentCBTForce!.groups[0]} currentForceIndex={0} onChange={onChange} />
                </MemoryRouter>
            );
            const view = (await screen.findAllByRole("button", { name: "View " + getMULDisplayName(hit) }, { timeout: 20_000 }))[0];
            fireEvent.click(view);
            expect(screen.getByRole("heading", { name: /^Viewing / })).toBeTruthy();
            fireEvent.click(screen.getAllByRole("button", { name: /^(Cancel|Close)$/ })[0]);
            fireEvent.click((await screen.findAllByRole("button", { name: "TRO " + getMULDisplayName(hit) }))[0]);
            expect(screen.getByRole("heading", { name: /^Technical Readout: / })).toBeTruthy();
            fireEvent.click(screen.getAllByRole("button", { name: /^(Cancel|Close)$/ })[0]);
            const add = (await screen.findAllByRole("button", { name: "Add " + getMULDisplayName(hit) }, { timeout: 20_000 }))[0];
            fireEvent.click(add);
            expect(onChange).toHaveBeenCalledTimes(1);
            const group: BattleMechGroup = onChange.mock.calls[0][0];
            expect((group[kind.table] as unknown[]).length).toBe(1);
            expect(group.members.length).toBe(0);
        }, 30_000);
    }
});
