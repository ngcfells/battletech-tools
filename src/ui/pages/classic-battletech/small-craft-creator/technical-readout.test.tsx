// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import SmallCraft from "../../../../classes/small-craft";
import type { IAppGlobals } from "../../../app-router";
import SmallCraftCreatorSideMenu from "../../../components/small-craft-creator-side-menu";
import SmallCraftCreatorCrew from "./crew";
import SmallCraftCreatorSummary from "./summary";
import SmallCraftCreatorTechnicalReadout from "./technical-readout";

afterEach(cleanup);

const makeGlobals = (craft: SmallCraft) => ({
    appSettings: { developerMenu: false, uiTheme: "", equipmentFilter: "", installEquipCategory: "", mechRulesFilter: "" },
    currentSmallCraft: craft,
    saveCurrentSmallCraft: vi.fn(),
    makeDocumentTitle: vi.fn(),
    toggleMobile: vi.fn(),
    closeMobile: vi.fn(),
    siteAlerts: { activeAlerts: [] },
} as unknown as IAppGlobals);

const hrefs = () => screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");

describe("Small Craft Creator: Technical Readout step (TRO round 2, #78)", () => {
    it("edits the SmallCraft's TRO record and saves it", () => {
        const craft = new SmallCraft();
        const globals = makeGlobals(craft);
        render(<MemoryRouter><SmallCraftCreatorTechnicalReadout appGlobals={globals} /></MemoryRouter>);
        expect(screen.getByText("Step 7: Technical Readout (optional)")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Manufacturer"), { target: { value: "Coventry Metal Works" } });
        expect(craft.tro.getProduction("manufacturer")).toBe("Coventry Metal Works");
        expect(globals.saveCurrentSmallCraft).toHaveBeenCalledWith(craft);
    });

    it("links back to Crew, on to Summary, and to the printed TRO sheet", () => {
        render(<MemoryRouter><SmallCraftCreatorTechnicalReadout appGlobals={makeGlobals(new SmallCraft())} /></MemoryRouter>);
        const links = hrefs();
        expect(links.some((href) => href.endsWith("/small-craft-creator/crew"))).toBe(true);
        expect(links.some((href) => href.endsWith("/small-craft-creator/summary"))).toBe(true);
        expect(links.some((href) => href.endsWith("/small-craft-creator/print-tro"))).toBe(true);
    });

    it("has a side menu entry between Crew and Summary", () => {
        render(<MemoryRouter><SmallCraftCreatorSideMenu appGlobals={makeGlobals(new SmallCraft())} current="technical-readout" /></MemoryRouter>);
        const links = hrefs();
        const placement = links.findIndex((href) => href.endsWith("/crew"));
        const tro = links.findIndex((href) => href.endsWith("/technical-readout"));
        const summary = links.findIndex((href) => href.endsWith("/summary"));
        expect(tro).toBeGreaterThan(placement);
        expect(tro).toBeLessThan(summary);
        expect(screen.getByText("Technical Readout").closest("a")?.className).toContain("btn-primary");
    });

    it("the summary offers the printed TRO sheet", () => {
        render(<MemoryRouter><SmallCraftCreatorSummary appGlobals={makeGlobals(new SmallCraft())} /></MemoryRouter>);
        expect(hrefs().some((href) => href.endsWith("/small-craft-creator/print-tro"))).toBe(true);
    });

    it("Crew leads on to the Technical Readout step", () => {
        render(<MemoryRouter><SmallCraftCreatorCrew appGlobals={makeGlobals(new SmallCraft())} /></MemoryRouter>);
        expect(screen.getByRole("link", { name: /Next: Technical Readout/ }).getAttribute("href")).toMatch(/\/small-craft-creator\/technical-readout$/);
    });
});

describe("Small Craft Technical Readout sheet: construction table", () => {
    it("prints thrust, armor by side and the weapons by arc", async () => {
        const { getUnitTroAdapter } = await import("../../../../classes/unit-tro");
        const { default: TechnicalReadoutSheet } = await import("../../../components/technical-readout-sheet");
        const craft = new SmallCraft();
        craft.setTonnage(200);
        craft.setSafeThrust(4);
        craft.setArmorTons(36);
        craft.setArmorAllocation("nose", 183);
        craft.addEquipmentFromTag("large-laser", "nose");
        const { container } = render(<TechnicalReadoutSheet tro={craft.tro} adapter={getUnitTroAdapter(craft)} />);
        const text = container.textContent ?? "";
        expect(text).toContain("Safe Thrust");
        expect(text).toContain("Armor by location");
        expect(text).toContain("183");
        expect(text).toContain("Large Laser");
        expect(text).toContain("Nose");
    });
});
