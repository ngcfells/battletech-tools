// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import Vehicle from "../../../../classes/vehicle";
import type { IAppGlobals } from "../../../app-router";
import VehicleCreatorSideMenu from "../../../components/vehicle-creator-side-menu";
import VehicleCreatorSummary from "./summary";
import VehicleCreatorTechnicalReadout from "./technical-readout";

afterEach(cleanup);

const makeGlobals = (vehicle: Vehicle) => ({
    appSettings: { developerMenu: false, uiTheme: "", equipmentFilter: "", installEquipCategory: "", mechRulesFilter: "" },
    currentVehicle: vehicle,
    saveCurrentVehicle: vi.fn(),
    makeDocumentTitle: vi.fn(),
    toggleMobile: vi.fn(),
    closeMobile: vi.fn(),
    siteAlerts: { activeAlerts: [] },
} as unknown as IAppGlobals);

const hrefs = () => screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");

describe("Vehicle Creator: Technical Readout step (TRO round 2, #78)", () => {
    it("edits the vehicle's TRO record and saves the vehicle", () => {
        const vehicle = new Vehicle();
        const globals = makeGlobals(vehicle);
        render(<MemoryRouter><VehicleCreatorTechnicalReadout appGlobals={globals} /></MemoryRouter>);
        expect(screen.getByText("Step 5: Technical Readout (optional)")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Manufacturer"), { target: { value: "Brooks Incorporated" } });
        expect(vehicle.tro.getProduction("manufacturer")).toBe("Brooks Incorporated");
        expect(globals.saveCurrentVehicle).toHaveBeenCalledWith(vehicle);
    });

    it("links back to Step 4, on to Summary, and to the printed TRO sheet", () => {
        render(<MemoryRouter><VehicleCreatorTechnicalReadout appGlobals={makeGlobals(new Vehicle())} /></MemoryRouter>);
        const links = hrefs();
        expect(links.some((href) => href.endsWith("/vehicle-creator/equipment-placement"))).toBe(true);
        expect(links.some((href) => href.endsWith("/vehicle-creator/summary"))).toBe(true);
        expect(links.some((href) => href.endsWith("/vehicle-creator/print-tro"))).toBe(true);
    });

    it("has a side menu entry between Step 4 and Summary", () => {
        render(<MemoryRouter><VehicleCreatorSideMenu appGlobals={makeGlobals(new Vehicle())} current="technical-readout" /></MemoryRouter>);
        const links = hrefs();
        const placement = links.findIndex((href) => href.endsWith("/equipment-placement"));
        const tro = links.findIndex((href) => href.endsWith("/technical-readout"));
        const summary = links.findIndex((href) => href.endsWith("/summary"));
        expect(tro).toBeGreaterThan(placement);
        expect(tro).toBeLessThan(summary);
        expect(screen.getByText("Technical Readout").closest("a")?.className).toContain("btn-primary");
    });

    it("the summary offers the printed TRO sheet", () => {
        render(<MemoryRouter><VehicleCreatorSummary appGlobals={makeGlobals(new Vehicle())} /></MemoryRouter>);
        expect(hrefs().some((href) => href.endsWith("/vehicle-creator/print-tro"))).toBe(true);
    });
});

describe("Vehicle Technical Readout sheet: construction table", () => {
    it("prints the control systems, turret, armor by location and ammunition", async () => {
        const { getUnitTroAdapter } = await import("../../../../classes/unit-tro");
        const { default: TechnicalReadoutSheet } = await import("../../../components/technical-readout-sheet");
        const vehicle = new Vehicle();
        vehicle.setTonnage(25);
        vehicle.setEngineType("ice");
        vehicle.setCruiseMP(4);
        vehicle.setArmorAllocation("front", 16);
        vehicle.addEquipmentFromTag("autocannon-standard-b");
        vehicle.setEquipmentLocation(vehicle.getEquipmentList().at(-1)!.uuid!, "turret");
        vehicle.addEquipmentFromTag("ammo-is-ac-5-standard");
        const { container } = render(<TechnicalReadoutSheet tro={vehicle.tro} adapter={getUnitTroAdapter(vehicle)} />);
        const text = container.textContent ?? "";
        expect(text).toContain("Control Systems");
        expect(text).toContain("Internal Structure / Armor by location");
        expect(text).toContain("3 / 16");
        expect(text).toContain("AC/5 - Standard Ammo (IS)");
        expect(text).toContain("Body");
    });
});
