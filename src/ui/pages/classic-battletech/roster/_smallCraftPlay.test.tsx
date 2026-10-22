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
