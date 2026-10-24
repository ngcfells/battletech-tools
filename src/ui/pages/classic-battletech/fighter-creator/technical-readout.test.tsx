// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import AerospaceFighter from "../../../../classes/aerospace-fighter";
import type { IAppGlobals } from "../../../app-router";
import FighterCreatorSideMenu from "../../../components/fighter-creator-side-menu";
import FighterCreatorSummary from "./summary";
import FighterCreatorTechnicalReadout from "./technical-readout";

afterEach(cleanup);

const makeGlobals = (fighter: AerospaceFighter) => ({
    appSettings: { developerMenu: false, uiTheme: "", equipmentFilter: "", installEquipCategory: "", mechRulesFilter: "" },
    currentFighter: fighter,
    saveCurrentFighter: vi.fn(),
    makeDocumentTitle: vi.fn(),
    toggleMobile: vi.fn(),
    closeMobile: vi.fn(),
    siteAlerts: { activeAlerts: [] },
} as unknown as IAppGlobals);

const hrefs = () => screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");

describe("Fighter Creator: Technical Readout step (TRO round 2, #78)", () => {
    it("edits the fighter's TRO record and saves the fighter", () => {
        const fighter = new AerospaceFighter();
        const globals = makeGlobals(fighter);
        render(<MemoryRouter><FighterCreatorTechnicalReadout appGlobals={globals} /></MemoryRouter>);
        expect(screen.getByText("Step 4: Technical Readout (optional)")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Manufacturer"), { target: { value: "Wakazashi Enterprises" } });
        expect(fighter.tro.getProduction("manufacturer")).toBe("Wakazashi Enterprises");
        expect(globals.saveCurrentFighter).toHaveBeenCalledWith(fighter);
    });

    it("links back to Step 3, on to Summary, and to the printed TRO sheet", () => {
        render(<MemoryRouter><FighterCreatorTechnicalReadout appGlobals={makeGlobals(new AerospaceFighter())} /></MemoryRouter>);
        const links = hrefs();
        expect(links.some((href) => href.endsWith("/fighter-creator/equipment"))).toBe(true);
        expect(links.some((href) => href.endsWith("/fighter-creator/summary"))).toBe(true);
        expect(links.some((href) => href.endsWith("/fighter-creator/print-tro"))).toBe(true);
    });

    it("has a side menu entry between Step 3 and Summary", () => {
        render(<MemoryRouter><FighterCreatorSideMenu appGlobals={makeGlobals(new AerospaceFighter())} current="technical-readout" /></MemoryRouter>);
        const links = hrefs();
        const placement = links.findIndex((href) => href.endsWith("/equipment"));
        const tro = links.findIndex((href) => href.endsWith("/technical-readout"));
        const summary = links.findIndex((href) => href.endsWith("/summary"));
        expect(tro).toBeGreaterThan(placement);
        expect(tro).toBeLessThan(summary);
        expect(screen.getByText("Technical Readout").closest("a")?.className).toContain("btn-primary");
    });

    it("the summary offers the printed TRO sheet", () => {
        render(<MemoryRouter><FighterCreatorSummary appGlobals={makeGlobals(new AerospaceFighter())} /></MemoryRouter>);
        expect(hrefs().some((href) => href.endsWith("/fighter-creator/print-tro"))).toBe(true);
    });
});

describe("Fighter Technical Readout sheet: construction table", () => {
    it("prints the cockpit, fuel, heat sinks, armor by arc and ammunition", async () => {
        const { getUnitTroAdapter } = await import("../../../../classes/unit-tro");
        const { default: TechnicalReadoutSheet } = await import("../../../components/technical-readout-sheet");
        const fighter = new AerospaceFighter();
        fighter.setTonnage(50);
        fighter.setSafeThrust(5);
        fighter.setArmorAllocation("nose", 30);
        fighter.addEquipmentFromTag("lrm-10", "nose");
        fighter.addEquipmentFromTag("ammo-lrm-standard");
        const { container } = render(<TechnicalReadoutSheet tro={fighter.tro} adapter={getUnitTroAdapter(fighter)} />);
        const text = container.textContent ?? "";
        expect(text).toContain("Cockpit and Controls");
        expect(text).toContain("Fuel (");
        expect(text).toContain("Heat Sinks (");
        expect(text).toContain("Armor by location");
        expect(text).toContain("Fuselage");
    });
});
