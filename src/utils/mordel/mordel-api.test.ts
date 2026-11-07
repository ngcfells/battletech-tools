// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { AppSettings } from "../../ui/classes/app_settings";
import { getFullBackup } from "../../dataSaves";
import { DETAIL_CACHE_SIZE, fetchMordelDetail, fetchMordelListSince, fetchMyMordelUnits, MordelKeyError, MordelUnavailableError, parseMordelUnitRef, testMordelKey } from "./mordel-api";
import { getMordelKey, isMordelKeyRejected, maskMordelKey, MORDEL_BASES, MORDEL_DEV_PROXIES, mordelBaseUrl, removeMordelKey, saveMordelKey } from "./mordel-key";

const KEY = "made-up-key-1234";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function fake(answer: (url: string) => Response | Promise<Response>) {
    const calls: { url: string; headers: Record<string, string> }[] = [];
    const fetchImpl = async (url: string, init: { headers: Record<string, string> }) => {
        calls.push({ url, headers: init.headers });
        return answer(url);
    };
    return { calls, fetchImpl, base: "https://api.example/v1" };
}

const unit = (id: number, updated: number | null = null) => ({ unit_type_short: "bm", id, name: `Test ${id}`, created: 10, updated });

beforeEach(() => {
    localStorage.clear();
    saveMordelKey(KEY);
});

describe("mordel key store", () => {
    it("keeps the key trimmed, masks it, and removes it", () => {
        saveMordelKey("  abcdefgh  ");
        expect(getMordelKey()).toBe("abcdefgh");
        expect(maskMordelKey("abcdefgh")).toBe("••••efgh");
        removeMordelKey();
        expect(getMordelKey()).toBeNull();
    });

    it("uses the dev proxy under vite dev and the site otherwise", () => {
        expect(mordelBaseUrl(true, "sandbox")).toBe(MORDEL_DEV_PROXIES.sandbox);
        expect(mordelBaseUrl(false, "production")).toBe(MORDEL_BASES.production);
    });

    it("never puts the key in a backup", async () => {
        const backup = await getFullBackup(new AppSettings(null));
        expect(backup).not.toContain(KEY);
        expect(backup).not.toContain("mordelApiKey");
    });
});

describe("mordel browser client", () => {
    it("sends the key only in the X-API-Key header, with no User-Agent", async () => {
        const f = fake(() => json({ status: "OK", unit: unit(1) }));
        await fetchMordelDetail("bm", 1, null, f);
        expect(f.calls[0].url).toBe("https://api.example/v1/units/bm/1");
        expect(f.calls[0].url).not.toContain(KEY);
        expect(f.calls[0].headers["X-API-Key"]).toBe(KEY);
        expect("User-Agent" in f.calls[0].headers).toBe(false);
    });

    it("asks for a key when none is saved", async () => {
        removeMordelKey();
        await expect(fetchMordelDetail("bm", 1, null, fake(() => json({})))).rejects.toThrow(MordelKeyError);
    });

    it("marks the saved key rejected on 401", async () => {
        const f = fake(() => json({ status: "Error", message: "Invalid API key" }, 401));
        await expect(fetchMordelDetail("bm", 1, null, f)).rejects.toMatchObject({ reason: "rejected" });
        expect(isMordelKeyRejected()).toBe(true);
        saveMordelKey("new-key-9999");
        expect(isMordelKeyRejected()).toBe(false);
    });

    it("reads a network or CORS failure as mordel.net being unreachable", async () => {
        const f = fake(() => { throw new TypeError("Failed to fetch"); });
        const error = await fetchMordelDetail("bm", 1, null, f).catch((e) => e);
        expect(error).toBeInstanceOf(MordelUnavailableError);
        expect(error.message).toMatch(/does not allow this site yet/);
        expect(error.message).not.toContain(KEY);
    });

    it("says busy on 503 without retrying for long", async () => {
        const f = fake(() => json({ message: "busy" }, 503));
        await expect(fetchMordelDetail("bm", 1, null, f)).rejects.toThrow(/busy/);
        expect(f.calls).toHaveLength(1);
    });

    it("gives null for a unit mordel.net does not have (404)", async () => {
        expect(await fetchMordelDetail("bm", 1, null, fake(() => json({ message: "Not found" }, 404)))).toBeNull();
    });

    it("serves the cached copy until the list has a newer one", async () => {
        const f = fake(() => json({ status: "OK", unit: unit(1, 100) }));
        await fetchMordelDetail("bm", 1, 100, f);
        await fetchMordelDetail("bm", 1, 100, f);
        expect(f.calls).toHaveLength(1);
        await fetchMordelDetail("bm", 1, 200, f);
        expect(f.calls).toHaveLength(2);
    });

    it(`keeps the newest ${DETAIL_CACHE_SIZE} details`, async () => {
        const f = fake((url) => json({ status: "OK", unit: unit(+url.split("/").pop()!) }));
        for (let id = 1; id <= DETAIL_CACHE_SIZE + 1; id++) await fetchMordelDetail("bm", id, null, { ...f });
        const before = f.calls.length;
        await fetchMordelDetail("bm", DETAIL_CACHE_SIZE + 1, null, f);
        expect(f.calls.length).toBe(before);
        await fetchMordelDetail("bm", 1, null, f);
        expect(f.calls.length).toBe(before + 1);
    });

    it("tests a key without saving or rejecting the saved one", async () => {
        expect(await testMordelKey("other", fake(() => json({ units: [] })))).toBe("ok");
        expect(await testMordelKey("other", fake(() => json({}, 401)))).toBe("rejected");
        expect(isMordelKeyRejected()).toBe(false);
        expect(await testMordelKey("other", fake(() => { throw new TypeError("Failed to fetch"); }))).toBe("unavailable");
    });

    it("pages the list since a time", async () => {
        const f = fake((url) => url.includes("cursor=") ? json({ units: [unit(2)], server_time: 50 })
            : json({ units: [unit(1)], next_cursor: "c2", server_time: 40 }));
        const { rows, serverTime } = await fetchMordelListSince(30, f);
        expect(rows.map((row) => row.id)).toEqual([1, 2]);
        expect(serverTime).toBe(50);
        expect(f.calls[0].url).toContain("updated_since=30");
    });

    it("gives null for my designs while mordel.net does not offer them", async () => {
        expect(await fetchMyMordelUnits(fake(() => json({ message: "Not found" }, 404)))).toBeNull();
        expect(await fetchMyMordelUnits(fake(() => json({ message: "Bad id" }, 400)))).toBeNull();
        expect(await fetchMyMordelUnits(fake(() => json({ units: [unit(7)] })))).toHaveLength(1);
    });
});

describe("mordel unit references", () => {
    it("reads type/id, API links and site links", () => {
        expect(parseMordelUnitRef("bm/23454")).toEqual({ type: "bm", id: 23454 });
        expect(parseMordelUnitRef("https://sandbox.mordel.net/api/v1/units/cv/12")).toEqual({ type: "cv", id: 12 });
        expect(parseMordelUnitRef("https://mordel.net/tro.php?a=vt&ut=pm&id=9")).toEqual({ type: "pm", id: 9 });
        expect(parseMordelUnitRef("Atlas AS7-D")).toBeNull();
    });
});
