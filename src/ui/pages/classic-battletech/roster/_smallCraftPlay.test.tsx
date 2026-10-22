// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SmallCraft from "../../../../classes/small-craft";
import SmallCraftPlayPanel from "./_smallCraftPlay";

afterEach(cleanup);

const craft = (): SmallCraft => {
    const built = new SmallCraft();
    built.addEquipmentFromTag("large-laser", "nose");
    built.addEquipmentFromTag("medium-laser", "nose");
    return built;
};

describe("DropShip play panel: K-F boom and docking collar (AT2R pp.29-30, 48-49)", () => {
    const dropShip = (): SmallCraft => {
        const built = craft();
        built.setCraftType("dropShip");
        built.setTonnage(3000);
        return built;
    };

    it("marks the boom and the collar, and shows what they mean for docking", () => {
        const built = dropShip();
        // The roster re-renders the panel on each change.
        const { rerender } = render(<SmallCraftPlayPanel craft={built} onChange={vi.fn()} />);
        fireEvent.click(screen.getByLabelText("K-F boom destroyed"));
        expect(built.getInPlay().kfBoom).toBe(true);
        fireEvent.change(screen.getByLabelText("Docking collar"), { target: { value: "damaged" } });
        expect(built.getInPlay().dockingCollar).toBe("damaged");
        rerender(<SmallCraftPlayPanel craft={built} onChange={vi.fn()} />);
        expect(screen.getByText(/takes twice as long/)).toBeTruthy();
        expect(screen.getByText(/Docking unit is a DropShip under 5,000 tons: -1/)).toBeTruthy();
    });

    it("offers neither on a Small Craft", () => {
        render(<SmallCraftPlayPanel craft={craft()} onChange={vi.fn()} />);
        expect(screen.queryByLabelText("K-F boom destroyed")).toBeNull();
        expect(screen.queryByLabelText("Docking collar")).toBeNull();
    });
});

describe("Small Craft play panel: weapon bays (TM pp.195, 199; user ruling 2026-10-22)", () => {
    it("fires a whole bay from one box", () => {
        const built = craft();
        render(<SmallCraftPlayPanel craft={built} onChange={vi.fn()} />);
        expect(screen.queryByLabelText("Large Laser fired")).toBeNull();
        fireEvent.click(screen.getByLabelText("Lasers: 1 Large Laser, 1 Medium Laser fired"));
        expect(built.isBayFired("nose", 0)).toBe(true);
        expect(built.getEquipmentList().every((item) => built.isWeaponFired(item.uuid ?? ""))).toBe(true);
    });

    it("still destroys one weapon of a bay at a time (TW p.240)", () => {
        const built = craft();
        render(<SmallCraftPlayPanel craft={built} onChange={vi.fn()} />);
        fireEvent.click(screen.getByLabelText("Medium Laser destroyed"));
        const [large, medium] = built.getArcFiringBays("nose")[0].items;
        expect(built.isWeaponDestroyed(medium.uuid ?? "")).toBe(true);
        expect(built.isWeaponDestroyed(large.uuid ?? "")).toBe(false);
    });
});
