// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { saveMordelKey } from "../utils/mordel/mordel-key";
import { hideMordelUnit, loadMordelList, MORDEL_TOP_UP_STORAGE, topUpMordelList } from "./mordel-list";

// Made-up units with ids above any mordel.net id, so the test works with or without the shipped (local-only) chunks.
const row = (id: number, updated: number, name = `Testunit ${id}`) => ({
    unit_type: "BattleMech", unit_type_short: "bm", id, name, canon: false, tech_base: "Inner Sphere", year: 3075, tons: 35,
    battle_value: 800, point_value: 20, updated,
});
const ours = async () => (await loadMordelList()).filter((r) => r.id >= 990000000);

function fake(body: unknown) {
    const urls: string[] = [];
    const fetchImpl = async (url: string) => {
        urls.push(url);
        return new Response(JSON.stringify(body), { status: 200 });
    };
    return { urls, fetchImpl, base: "https://api.example/v1" };
}

beforeEach(() => {
    localStorage.clear();
    saveMordelKey("made-up-key-1234");
});

describe("mordel list", () => {
    it("adds the rows a top-up fetched, keeps the newest change of a unit, and moves the starting point on", async () => {
        localStorage.setItem(MORDEL_TOP_UP_STORAGE, JSON.stringify({ since: 100, rows: [row(990000001, 110, "Old name")] }));
        const f = fake({ units: [row(990000001, 150, "New name"), row(990000002, 160)], server_time: 170 });
        expect(await topUpMordelList(f)).toEqual({ fetched: 2, tooMany: false });
        expect(f.urls[0]).toContain("updated_since=100");
        expect((await ours()).map((r) => r.name)).toEqual(["New name", "Testunit 990000002"]);
        expect(JSON.parse(localStorage.getItem(MORDEL_TOP_UP_STORAGE)!).since).toBe(170);
    }, 30000);

    it("leaves out a unit hidden on this device", async () => {
        localStorage.setItem(MORDEL_TOP_UP_STORAGE, JSON.stringify({ since: 100, rows: [row(990000001, 110), row(990000002, 120)] }));
        hideMordelUnit("bm/990000001");
        hideMordelUnit("bm/990000001");
        expect((await ours()).map((r) => r.id)).toEqual([990000002]);
        expect(JSON.parse(localStorage.getItem("mordelHiddenUnits")!)).toEqual(["bm/990000001"]);
    }, 30000);

    it("reads broken saved data as empty", async () => {
        localStorage.setItem(MORDEL_TOP_UP_STORAGE, "{not json");
        localStorage.setItem("mordelHiddenUnits", "{\"x\":1}");
        expect(await ours()).toEqual([]);
    }, 30000);
});
