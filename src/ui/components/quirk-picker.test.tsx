// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuirkList } from "../../classes/quirk-list";
import { BattleMech } from "../../classes/battlemech";
import Vehicle from "../../classes/vehicle";
import { getOfferedQuirks } from "../../data/quirk-registry";
import QuirkPicker from "./quirk-picker";

afterEach(cleanup);

const picker = (quirks: QuirkList, editionTag: string, onChange = vi.fn()) => render(
    <QuirkPicker
        quirks={quirks}
        unitType="mech"
        editionTag={editionTag}
        rulesLevel={3}
        locations={[{ tag: "ra", label: "Right Arm" }]}
        weapons={[{ uuid: "w1", label: "Medium Laser (RA)", maxDamage: 5 }]}
        unitMaxDamage={5}
        onChange={onChange}
    />,
);

const quirkSelect = () => screen.getByLabelText("Quirk") as HTMLSelectElement;

describe("getOfferedQuirks", () => {
    it("offers no quirks under Battledroids", () => {
        expect(getOfferedQuirks("mech", "battledroids", 3)).toEqual([]);
    });

    it("offers quirks under Total Warfare, positive first, then by name", () => {
        const offered = getOfferedQuirks("mech", "total-warfare", 3);
        expect(offered.length).toBeGreaterThan(0);
        const firstNegative = offered.findIndex((quirk) => quirk.kind === "negative");
        expect(offered.slice(firstNegative).every((quirk) => quirk.kind === "negative")).toBe(true);
        const positives = offered.slice(0, firstNegative).map((quirk) => quirk.name);
        expect(positives).toEqual([...positives].sort((a, b) => a.localeCompare(b)));
    });

    it("offers nothing below the Advanced level", () => {
        expect(getOfferedQuirks("mech", "total-warfare", 2)).toEqual([]);
    });
});

describe("QuirkPicker", () => {
    it("keeps a quirk the edition does not offer, with a note, and offers nothing to add", () => {
        const quirks = new QuirkList();
        quirks.add({ tag: "quirk-command-mech" });
        picker(quirks, "battledroids");
        expect(screen.getByText(/Command 'Mech/).textContent).toBeTruthy();
        expect(screen.getByText(/not offered in Battledroids/)).toBeTruthy();
        expect(Array.from(quirkSelect().options).filter((option) => option.value)).toEqual([]);
    });

    it("shows why Battle Computer cannot join Command 'Mech", () => {
        const quirks = new QuirkList();
        quirks.add({ tag: "quirk-command-mech" });
        const onChange = vi.fn();
        picker(quirks, "total-warfare", onChange);
        fireEvent.change(quirkSelect(), { target: { value: "quirk-battle-computer" } });
        fireEvent.click(screen.getByRole("button", { name: "Add quirk" }));
        expect(screen.getByText(/excluded by Command 'Mech/)).toBeTruthy();
        expect(quirks.getAll()).toHaveLength(1);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("adds a weapon quirk to the chosen weapon", () => {
        const quirks = new QuirkList();
        const onChange = vi.fn();
        picker(quirks, "total-warfare", onChange);
        fireEvent.change(quirkSelect(), { target: { value: "quirk-accurate-weapon" } });
        fireEvent.change(screen.getByLabelText("Weapon"), { target: { value: "w1" } });
        fireEvent.click(screen.getByRole("button", { name: "Add quirk" }));
        expect(quirks.getAll()).toEqual([{ tag: "quirk-accurate-weapon", equipmentUuid: "w1" }]);
        expect(onChange).toHaveBeenCalled();
    });

    it("notes a weapon quirk whose weapon is not installed", () => {
        const quirks = new QuirkList();
        quirks.add({ tag: "quirk-accurate-weapon", equipmentUuid: "gone" });
        picker(quirks, "total-warfare");
        expect(screen.getByText(/not installed/)).toBeTruthy();
    });

    it("totals the points and removes a quirk", () => {
        const quirks = new QuirkList();
        quirks.add({ tag: "quirk-command-mech" });
        const onChange = vi.fn();
        picker(quirks, "total-warfare", onChange);
        expect(screen.getByText(/Positive 2/)).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Remove Command 'Mech" }));
        expect(quirks.getAll()).toEqual([]);
        expect(onChange).toHaveBeenCalled();
    });
});

describe("quirk issue lines", () => {
    it("names a quirk a Battledroids 'Mech cannot have", () => {
        const mech = new BattleMech();
        mech.quirks.add({ tag: "quirk-command-mech" });
        mech.setRulesEdition("battledroids");
        expect(mech.getRulesEditionIssues(3)).toContain("Quirk: Command 'Mech (not in Battledroids)");
    });

    it("names a quirk above the selected rules level", () => {
        const vehicle = new Vehicle();
        vehicle.quirks.add({ tag: "quirk-rugged", parameter: 1 });
        expect(vehicle.getQuirkIssues(2)).toEqual(["Quirk: Rugged (above the selected rules level)"]);
        expect(vehicle.getQuirkIssues(3)).toEqual([]);
    });
});
