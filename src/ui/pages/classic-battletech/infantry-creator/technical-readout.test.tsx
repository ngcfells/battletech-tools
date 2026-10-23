// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import InfantryPlatoon from "../../../../classes/infantry-platoon";
import type { IAppGlobals } from "../../../app-router";
import InfantryCreatorSideMenu from "../../../components/infantry-creator-side-menu";
import InfantryCreatorSummary from "./summary";
import InfantryCreatorTechnicalReadout from "./technical-readout";

afterEach(cleanup);

const makeGlobals = (platoon: InfantryPlatoon) => ({
    appSettings: { developerMenu: false, uiTheme: "", equipmentFilter: "", installEquipCategory: "", mechRulesFilter: "" },
    currentInfantry: platoon,
    saveCurrentInfantry: vi.fn(),
    makeDocumentTitle: vi.fn(),
    toggleMobile: vi.fn(),
    closeMobile: vi.fn(),
    siteAlerts: { activeAlerts: [] },
} as unknown as IAppGlobals);

const hrefs = () => screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");

describe("Infantry Creator: Technical Readout step (TRO round 2, #78)", () => {
    it("edits the platoon's TRO record and saves the platoon", () => {
        const platoon = new InfantryPlatoon();
        const globals = makeGlobals(platoon);
        render(<MemoryRouter><InfantryCreatorTechnicalReadout appGlobals={globals} /></MemoryRouter>);
        expect(screen.getByText("Step 3: Technical Readout (optional)")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Manufacturer"), { target: { value: "Coventry Metal Works" } });
        expect(platoon.tro.getProduction("manufacturer")).toBe("Coventry Metal Works");
        expect(globals.saveCurrentInfantry).toHaveBeenCalledWith(platoon);
    });

    it("links back to Step 2, on to Summary, and to the printed TRO sheet", () => {
        render(<MemoryRouter><InfantryCreatorTechnicalReadout appGlobals={makeGlobals(new InfantryPlatoon())} /></MemoryRouter>);
        const links = hrefs();
        expect(links.some((href) => href.endsWith("/infantry-creator/weapons"))).toBe(true);
        expect(links.some((href) => href.endsWith("/infantry-creator/summary"))).toBe(true);
        expect(links.some((href) => href.endsWith("/infantry-creator/print-tro"))).toBe(true);
    });

    it("has a side menu entry between Step 2 and Summary", () => {
        render(<MemoryRouter><InfantryCreatorSideMenu appGlobals={makeGlobals(new InfantryPlatoon())} current="technical-readout" /></MemoryRouter>);
        const links = hrefs();
        const placement = links.findIndex((href) => href.endsWith("/weapons"));
        const tro = links.findIndex((href) => href.endsWith("/technical-readout"));
        const summary = links.findIndex((href) => href.endsWith("/summary"));
        expect(tro).toBeGreaterThan(placement);
        expect(tro).toBeLessThan(summary);
        expect(screen.getByText("Technical Readout").closest("a")?.className).toContain("btn-primary");
    });

    it("the summary offers the printed TRO sheet", () => {
        render(<MemoryRouter><InfantryCreatorSummary appGlobals={makeGlobals(new InfantryPlatoon())} /></MemoryRouter>);
        expect(hrefs().some((href) => href.endsWith("/infantry-creator/print-tro"))).toBe(true);
    });
});
