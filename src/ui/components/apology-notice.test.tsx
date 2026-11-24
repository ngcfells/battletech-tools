// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { APOLOGY_DISCUSSION_URL, APOLOGY_SEEN_KEY, APOLOGY_SIGNATURE, APOLOGY_TITLE } from "../../data/apology-2026-11-24";
import ApologyNotice, { ApologyLink } from "./apology-notice";

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("the apology pop-up", () => {
    it("shows on a first visit, as a dialog named by its title", () => {
        render(<ApologyNotice />);
        const dialog = screen.getByRole("dialog", { name: APOLOGY_TITLE });
        expect(dialog.textContent).toContain(APOLOGY_SIGNATURE);
    });

    it("links to the copy posted on GitHub", () => {
        render(<ApologyNotice />);
        expect(screen.getByRole("link", { name: "the project's Discussions on GitHub" }).getAttribute("href")).toBe(APOLOGY_DISCUSSION_URL);
    });

    it("closes, and stays closed in this browser from then on", async () => {
        render(<ApologyNotice />);
        fireEvent.click(screen.getByRole("button", { name: "Close the apology" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(window.localStorage.getItem(APOLOGY_SEEN_KEY)).toBe("seen");
        cleanup();
        render(<ApologyNotice />);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("opens again from the reopen link after it was closed", () => {
        window.localStorage.setItem(APOLOGY_SEEN_KEY, "seen");
        render(<ApologyLink />);
        expect(screen.queryByRole("dialog")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Read the apology" }));
        expect(screen.getByRole("dialog", { name: APOLOGY_TITLE })).toBeTruthy();
    });

    it("still shows when the browser will not store that it was seen", () => {
        const getItem = window.localStorage.getItem;
        window.localStorage.getItem = () => { throw new Error("storage blocked"); };
        try {
            render(<ApologyNotice />);
            expect(screen.getByRole("dialog", { name: APOLOGY_TITLE })).toBeTruthy();
        } finally {
            window.localStorage.getItem = getItem;
        }
    });
});
