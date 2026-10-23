// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtoMech from "../../../../classes/protomech";
import type { IAppGlobals } from "../../../app-router";
import ProtoMechCreatorSideMenu from "../../../components/protomech-creator-side-menu";
import ProtoMechCreatorEquipment from "./equipment";
import ProtoMechCreatorSummary from "./summary";
import ProtoMechCreatorTechnicalReadout from "./technical-readout";

afterEach(cleanup);

const makeGlobals = (proto: ProtoMech) => ({
    appSettings: { developerMenu: false, uiTheme: "", equipmentFilter: "", installEquipCategory: "", mechRulesFilter: "" },
    currentProtoMech: proto,
    saveCurrentProtoMech: vi.fn(),
    makeDocumentTitle: vi.fn(),
    toggleMobile: vi.fn(),
    closeMobile: vi.fn(),
    siteAlerts: { activeAlerts: [] },
} as unknown as IAppGlobals);

const hrefs = () => screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");

describe("ProtoMech Creator: Technical Readout step (TRO round 2, #78)", () => {
    it("edits the ProtoMech's TRO record and saves it", () => {
        const proto = new ProtoMech();
        const globals = makeGlobals(proto);
        render(<MemoryRouter><ProtoMechCreatorTechnicalReadout appGlobals={globals} /></MemoryRouter>);
        expect(screen.getByText("Step 6: Technical Readout (optional)")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Manufacturer"), { target: { value: "Coventry Metal Works" } });
        expect(proto.tro.getProduction("manufacturer")).toBe("Coventry Metal Works");
        expect(globals.saveCurrentProtoMech).toHaveBeenCalledWith(proto);
    });

    it("links back to Equipment, on to Summary, and to the printed TRO sheet", () => {
        render(<MemoryRouter><ProtoMechCreatorTechnicalReadout appGlobals={makeGlobals(new ProtoMech())} /></MemoryRouter>);
        const links = hrefs();
        expect(links.some((href) => href.endsWith("/protomech-creator/equipment"))).toBe(true);
        expect(links.some((href) => href.endsWith("/protomech-creator/summary"))).toBe(true);
        expect(links.some((href) => href.endsWith("/protomech-creator/print-tro"))).toBe(true);
    });

    it("has a side menu entry between Equipment and Summary", () => {
        render(<MemoryRouter><ProtoMechCreatorSideMenu appGlobals={makeGlobals(new ProtoMech())} current="technical-readout" /></MemoryRouter>);
        const links = hrefs();
        const placement = links.findIndex((href) => href.endsWith("/equipment"));
        const tro = links.findIndex((href) => href.endsWith("/technical-readout"));
        const summary = links.findIndex((href) => href.endsWith("/summary"));
        expect(tro).toBeGreaterThan(placement);
        expect(tro).toBeLessThan(summary);
        expect(screen.getByText("Technical Readout").closest("a")?.className).toContain("btn-primary");
    });

    it("the summary offers the printed TRO sheet", () => {
        render(<MemoryRouter><ProtoMechCreatorSummary appGlobals={makeGlobals(new ProtoMech())} /></MemoryRouter>);
        expect(hrefs().some((href) => href.endsWith("/protomech-creator/print-tro"))).toBe(true);
    });

    it("Equipment leads on to the Technical Readout step", () => {
        render(<MemoryRouter><ProtoMechCreatorEquipment appGlobals={makeGlobals(new ProtoMech())} /></MemoryRouter>);
        expect(screen.getByRole("link", { name: /Next: Technical Readout/ }).getAttribute("href")).toMatch(/\/protomech-creator\/technical-readout$/);
    });
});
