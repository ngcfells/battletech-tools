// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import BattleArmor from "../../../../classes/battle-armor";
import type { IAppGlobals } from "../../../app-router";
import BattleArmorCreatorSideMenu from "../../../components/battle-armor-creator-side-menu";
import BattleArmorCreatorLoadouts from "./loadouts";
import BattleArmorCreatorSummary from "./summary";
import BattleArmorCreatorTechnicalReadout from "./technical-readout";

afterEach(cleanup);

const makeGlobals = (suit: BattleArmor) => ({
    appSettings: { developerMenu: false, uiTheme: "", equipmentFilter: "", installEquipCategory: "", mechRulesFilter: "" },
    currentBattleArmor: suit,
    saveCurrentBattleArmor: vi.fn(),
    makeDocumentTitle: vi.fn(),
    toggleMobile: vi.fn(),
    closeMobile: vi.fn(),
    siteAlerts: { activeAlerts: [] },
} as unknown as IAppGlobals);

const hrefs = () => screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");

describe("Battle Armor Creator: Technical Readout step (TRO round 2, #78)", () => {
    it("edits the suit's TRO record and saves the suit", () => {
        const suit = new BattleArmor();
        const globals = makeGlobals(suit);
        render(<MemoryRouter><BattleArmorCreatorTechnicalReadout appGlobals={globals} /></MemoryRouter>);
        expect(screen.getByText("Step 6: Technical Readout (optional)")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Manufacturer"), { target: { value: "Coventry Metal Works" } });
        expect(suit.tro.getProduction("manufacturer")).toBe("Coventry Metal Works");
        expect(globals.saveCurrentBattleArmor).toHaveBeenCalledWith(suit);
    });

    it("links back to Loadouts, on to Summary, and to the printed TRO sheet", () => {
        render(<MemoryRouter><BattleArmorCreatorTechnicalReadout appGlobals={makeGlobals(new BattleArmor())} /></MemoryRouter>);
        const links = hrefs();
        expect(links.some((href) => href.endsWith("/battle-armor-creator/loadouts"))).toBe(true);
        expect(links.some((href) => href.endsWith("/battle-armor-creator/summary"))).toBe(true);
        expect(links.some((href) => href.endsWith("/battle-armor-creator/print-tro"))).toBe(true);
    });

    it("has a side menu entry between Loadouts and Summary", () => {
        render(<MemoryRouter><BattleArmorCreatorSideMenu appGlobals={makeGlobals(new BattleArmor())} current="technical-readout" /></MemoryRouter>);
        const links = hrefs();
        const placement = links.findIndex((href) => href.endsWith("/loadouts"));
        const tro = links.findIndex((href) => href.endsWith("/technical-readout"));
        const summary = links.findIndex((href) => href.endsWith("/summary"));
        expect(tro).toBeGreaterThan(placement);
        expect(tro).toBeLessThan(summary);
        expect(screen.getByText("Technical Readout").closest("a")?.className).toContain("btn-primary");
    });

    it("the summary offers the printed TRO sheet", () => {
        render(<MemoryRouter><BattleArmorCreatorSummary appGlobals={makeGlobals(new BattleArmor())} /></MemoryRouter>);
        expect(hrefs().some((href) => href.endsWith("/battle-armor-creator/print-tro"))).toBe(true);
    });

    it("Loadouts leads on to the Technical Readout step", () => {
        render(<MemoryRouter><BattleArmorCreatorLoadouts appGlobals={makeGlobals(new BattleArmor())} /></MemoryRouter>);
        expect(screen.getByRole("link", { name: /Next: Technical Readout/ }).getAttribute("href")).toMatch(/\/battle-armor-creator\/technical-readout$/);
    });
});
