// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BattleMech } from "../../../../classes/battlemech";
import type { IAppGlobals } from "../../../app-router";
import { getMULGroundRoles } from "../../../../utils/mulUtilities";
import MechCreatorSummary from "./summary";

afterEach(cleanup);

const renderSummary = (mech: BattleMech) => {
    const appGlobals = {
        appSettings: { developerMenu: false, uiTheme: "", equipmentFilter: "", installEquipCategory: "" },
        currentBattleMech: mech,
        saveCurrentBattleMech: vi.fn(),
        makeDocumentTitle: vi.fn(),
        toggleMobile: vi.fn(),
        closeMobile: vi.fn(),
        siteAlerts: { activeAlerts: [] },
    } as unknown as IAppGlobals;
    render(<MemoryRouter><MechCreatorSummary appGlobals={appGlobals} /></MemoryRouter>);
};

describe("'Mech Creator summary: Alpha Strike Role (issue 15)", () => {
    it("is a drop-down of the published ground roles, and sets the role picked", () => {
        const mech = new BattleMech();
        renderSummary(mech);
        const select = screen.getByLabelText("Alpha Strike Role") as HTMLSelectElement;
        expect(select.tagName).toBe("SELECT");
        expect([...select.options].map((option) => option.value)).toEqual(["", ...getMULGroundRoles()]);
        fireEvent.change(select, { target: { value: "Sniper" } });
        expect(mech.getASRole()).toBe("Sniper");
    });

    it("keeps a role saved before the drop-down as an option, so it is not lost", () => {
        const mech = new BattleMech();
        mech.setASRole("Brawler-ish");
        renderSummary(mech);
        const select = screen.getByLabelText("Alpha Strike Role") as HTMLSelectElement;
        expect(select.value).toBe("Brawler-ish");
    });
});
