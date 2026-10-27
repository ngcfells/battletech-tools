// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BattleMech } from "../../classes/battlemech";
import MechViewPanel from "./mech-view-panel";

afterEach(cleanup);

describe("MechViewPanel", () => {
    // The roster's view kept the record sheet off to the side of the TRO (#372): a click on it fills the width.
    it("shows the record sheet alone when clicked, and the TRO again on a second click", () => {
        const mech = new BattleMech();
        mech.setName("Atlas");
        const { container } = render(<MechViewPanel mech={mech} />);
        const sheet = screen.getByRole("button", { name: "Record sheet, full width" });
        expect(container.querySelectorAll(".col")).toHaveLength(2);
        fireEvent.click(sheet);
        expect(sheet.getAttribute("aria-pressed")).toBe("true");
        expect(container.querySelectorAll(".col")).toHaveLength(1);
        fireEvent.click(sheet);
        expect(container.querySelectorAll(".col")).toHaveLength(2);
    });
});
