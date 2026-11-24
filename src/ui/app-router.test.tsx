// @vitest-environment happy-dom
import { screen } from "@testing-library/react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { APOLOGY_SEEN_KEY, APOLOGY_TITLE } from "../data/apology-2026-11-24";
import AppRouter from "./app-router";
import { loadUnitClasses } from "./app-unit-classes";

// AppRouter is the root component, so it only unmounts on hot reload and in tests. It still has to take its
// window listeners with it, or each remount leaves a copy running.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mount = async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
        root.render(<AppRouter />);
    });
    // The router builds the saved units after mounting (#589): let those imports finish, or they load after teardown.
    await act(async () => {
        await Promise.all([loadUnitClasses(), import("../dataSaves")]);
    });
    return root;
};

describe("AppRouter cleanup on unmount", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("removes the online and offline listeners it added", async () => {
        const added = vi.spyOn(window, "addEventListener");
        const removed = vi.spyOn(window, "removeEventListener");
        const root = await mount();
        await act(async () => root.unmount());

        for (const type of ["online", "offline"]) {
            const listeners = added.mock.calls.filter((call) => call[0] === type).map((call) => call[1]);
            expect(listeners).toHaveLength(1);
            expect(removed.mock.calls.some((call) => call[0] === type && call[1] === listeners[0])).toBe(true);
        }
    });
});

describe("the apology at the app's root", () => {
    afterEach(() => window.localStorage.clear());

    it("opens on a first visit", async () => {
        window.localStorage.clear();
        const root = await mount();
        expect(screen.getByRole("dialog", { name: APOLOGY_TITLE })).toBeTruthy();
        await act(async () => root.unmount());
    });

    it("stays shut in a browser that has closed it", async () => {
        window.localStorage.setItem(APOLOGY_SEEN_KEY, "seen");
        const root = await mount();
        expect(screen.queryByRole("dialog")).toBeNull();
        await act(async () => root.unmount());
    });
});
