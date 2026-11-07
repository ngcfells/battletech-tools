// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { TOP_UP_LIMIT } from "../utils/mordel/mordel-api";
import { saveMordelKey, setMordelServer } from "../utils/mordel/mordel-key";
import { hideMordelUnit, loadMordelList, MORDEL_TOP_UP_STORAGE, mordelListShipped, mordelTopUpDue, topUpMordelList, TOP_UP_EVERY_MS } from "./mordel-list";

// Made-up units with ids above any mordel.net id, so the shipped list does not get in the way.
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

    it("goes on from the newest row fetched when a top-up is cut short", async () => {
        const rows = Array.from({ length: TOP_UP_LIMIT }, (_, i) => row(990000001 + i, 2000000000 + i));
        const f = fake({ units: rows, server_time: 99999 });
        expect(await topUpMordelList(f)).toEqual({ fetched: TOP_UP_LIMIT, tooMany: true });
        expect(JSON.parse(localStorage.getItem(MORDEL_TOP_UP_STORAGE)!).since).toBe(2000000000 + TOP_UP_LIMIT - 2);
    }, 30000);

    it("is due once a day", async () => {
        expect(mordelTopUpDue(TOP_UP_EVERY_MS)).toBe(true);
        await topUpMordelList(fake({ units: [], server_time: 5 }), TOP_UP_EVERY_MS);
        expect(mordelTopUpDue(2 * TOP_UP_EVERY_MS - 1)).toBe(false);
        expect(mordelTopUpDue(2 * TOP_UP_EVERY_MS)).toBe(true);
    }, 30000);

    it("hides a unit the sandbox has not got only while the sandbox is chosen", async () => {
        localStorage.setItem(MORDEL_TOP_UP_STORAGE, JSON.stringify({ since: 100, rows: [row(990000001, 110)] }));
        setMordelServer("sandbox");
        hideMordelUnit("bm/990000001");
        expect(await ours()).toEqual([]);
        setMordelServer("production");
        expect((await ours()).map((r) => r.id)).toEqual([990000001]);
    }, 30000);

    it("ships the list", () => {
        expect(mordelListShipped()).toBe(true);
    });

    it("reads broken saved data as empty", async () => {
        localStorage.setItem(MORDEL_TOP_UP_STORAGE, "{not json");
        localStorage.setItem("mordelHiddenUnits", "{\"x\":1}");
        expect(await ours()).toEqual([]);
    }, 30000);
});
