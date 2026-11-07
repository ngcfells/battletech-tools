// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MordelKeyError } from "../../utils/mordel/mordel-api";
import type { IMordelListRow } from "../../utils/mordel/mordel-types";
import MordelUnitsPanel from "./mordel-units-panel";

// Made-up rows. Canon or made-up units only.
const row = (id: number, name: string, over: Partial<IMordelListRow> = {}): IMordelListRow => ({
    unit_type: "BattleMech", unit_type_short: "bm", id, name, canon: false, designer: "Tester", tech_base: "Inner Sphere",
    year: 3050, tons: 50, battle_value: 1000, point_value: 20, updated: 100, ...over,
});
const ROWS = [
    row(1, "Hornet HNT-1"),
    row(2, "Hornet HNT-2"),
    row(3, "Wasp Hover Tank", { unit_type: "Combat Vehicle", unit_type_short: "cv" }),
    row(4, "Lynx LNX-1", {
        alpha_strike: { type: "BM", size: 2, move: "10\"", tmm: 2, armor: 4, structure: 4, damage: { short: "2", medium: "2", long: "1" }, overheat: 0, point_value: 25, specials: [] },
    }),
];

const mocks = vi.hoisted(() => ({
    key: { value: "key" as string | null },
    fetchMordelDetail: vi.fn(),
    hideMordelUnit: vi.fn(),
    importMordelMech: vi.fn(),
}));

vi.mock("../../data/mordel-list", () => ({ loadMordelList: vi.fn(async () => ROWS), hideMordelUnit: mocks.hideMordelUnit }));
vi.mock("../../utils/mordel/mordel-key", () => ({ getMordelKey: () => mocks.key.value }));
vi.mock("../../utils/mordel/mordel-mtf", () => ({ importMordelMech: mocks.importMordelMech }));
vi.mock("../../utils/mordel/mordel-api", async (actual) => ({
    ...(await actual<typeof import("../../utils/mordel/mordel-api")>()),
    fetchMordelDetail: mocks.fetchMordelDetail,
}));

const mech = { getName: () => "Hornet" };

beforeEach(() => {
    mocks.key.value = "key";
    mocks.fetchMordelDetail.mockReset();
    mocks.hideMordelUnit.mockReset();
    mocks.importMordelMech.mockReset();
});
afterEach(cleanup);

const search = async (text: string) => {
    fireEvent.change(await screen.findByRole("searchbox"), { target: { value: text } });
};
const renderPanel = (props: Partial<React.ComponentProps<typeof MordelUnitsPanel>> = {}) => {
    const onAddMech = vi.fn();
    render(<MemoryRouter><MordelUnitsPanel mode="classic" onAddMech={onAddMech} {...props} /></MemoryRouter>);
    return { onAddMech };
};

describe("MordelUnitsPanel", () => {
    it("finds units by name and model, and only the types the page takes", async () => {
        renderPanel();
        await search("hnt-2");
        expect(screen.getByRole("button", { name: "Add Hornet HNT-2" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Add Hornet HNT-1" })).toBeNull();
        await search("wasp");
        // No vehicle handler: the vehicle is not offered.
        expect(screen.getByText("No mordel.net units match.")).toBeTruthy();
    });

    it("sends the user to Settings when no key is saved", async () => {
        mocks.key.value = null;
        renderPanel();
        await search("hornet");
        fireEvent.click(screen.getByRole("button", { name: "Add Hornet HNT-1" }));
        expect(await screen.findByText(/needs your own mordel.net API key/)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Open Settings" }).getAttribute("href")).toMatch(/\/settings$/);
        expect(mocks.fetchMordelDetail).not.toHaveBeenCalled();
    });

    it("says so when mordel.net refuses the key", async () => {
        mocks.fetchMordelDetail.mockRejectedValue(new MordelKeyError("rejected"));
        renderPanel();
        await search("hornet");
        fireEvent.click(screen.getByRole("button", { name: "Add Hornet HNT-1" }));
        expect(await screen.findByText(/refused the saved API key/)).toBeTruthy();
    });

    it("hides a unit mordel.net no longer has, with a note", async () => {
        mocks.fetchMordelDetail.mockResolvedValue(null);
        const { onAddMech } = renderPanel();
        await search("hornet");
        fireEvent.click(screen.getByRole("button", { name: "Add Hornet HNT-1" }));
        expect(await screen.findByText(/no longer has Hornet HNT-1/)).toBeTruthy();
        expect(mocks.hideMordelUnit).toHaveBeenCalledWith("bm/1");
        expect(screen.queryByRole("button", { name: "Add Hornet HNT-1" })).toBeNull();
        expect(onAddMech).not.toHaveBeenCalled();
    });

    it("adds a unit whose Battle Value is not mordel.net's, with a warning", async () => {
        mocks.fetchMordelDetail.mockResolvedValue({ ...ROWS[0] });
        mocks.importMordelMech.mockReturnValue({ mech, issues: ["'Quantum Flux' has no match"], bvOk: false, ourBV: 990 });
        const { onAddMech } = renderPanel();
        await search("hornet");
        fireEvent.click(screen.getByRole("button", { name: "Add Hornet HNT-1" }));
        expect(await screen.findByText(/our Battle Value is 990 and mordel.net's is 1000/)).toBeTruthy();
        expect(screen.getByText("'Quantum Flux' has no match")).toBeTruthy();
        expect(onAddMech).toHaveBeenCalledWith(mech);
    });

    it("adds an Alpha Strike card straight from the list, without a key", async () => {
        mocks.key.value = null;
        const onAddAS = vi.fn();
        render(<MemoryRouter><MordelUnitsPanel mode="alpha-strike" onAddAS={onAddAS} /></MemoryRouter>);
        await search("lnx");
        fireEvent.click(screen.getByRole("button", { name: "Add Lynx LNX-1" }));
        await waitFor(() => expect(onAddAS).toHaveBeenCalledTimes(1));
        expect(onAddAS.mock.calls[0][0].basePoints).toBe(25);
        // Rows without a card are not offered for Alpha Strike.
        await search("hornet");
        expect(screen.getByText("No mordel.net units match.")).toBeTruthy();
    });

    it("explains when mordel.net has no list of the user's designs yet", async () => {
        const api = await import("../../utils/mordel/mordel-api");
        vi.spyOn(api, "fetchMyMordelUnits").mockResolvedValue(null);
        renderPanel();
        fireEvent.click(screen.getByRole("tab", { name: "My Mordel designs" }));
        fireEvent.click(screen.getByRole("button", { name: "Load my designs" }));
        expect(await screen.findByText(/does not offer a list of your designs yet/)).toBeTruthy();
    });
});
