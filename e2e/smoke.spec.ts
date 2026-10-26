import { expect, test } from "@playwright/test";

// Every top-level area of the app must load from a cold start without a JavaScript error or the 404 page.
// This is the regression net for toolchain and dependency upgrades (bundler, React, router), not a feature test.
const ROUTES = [
    "",
    "about",
    "classic-battletech",
    "mech-creator",
    "classic-battletech/mech-creator/ssw-file-import",
    "alpha-strike",
    "alpha-strike-roster",
    "equipment-editor",
    "game-management",
    "settings",
    "dev-status",
    "other-tools",
];

for (const route of ROUTES) {
    test(`/${route} renders without crashing`, async ({ page }) => {
        // Uncaught exceptions and console.error output both fail the test.
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
        page.on("console", (message) => {
            if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
        });

        await page.goto(route);
        await expect(page.locator("#root")).not.toBeEmpty();
        await page.waitForLoadState("networkidle");

        await expect(page).not.toHaveTitle(/404/);
        expect(errors).toEqual([]);
    });
}

// The bundled 'Mechs (#241) load when a list shows them: the index, then one design's chunk when it is opened.
test("the 'Mech Creator imports page lists the bundled 'Mechs and opens one", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
    await page.goto("classic-battletech/mech-creator/imports");
    await page.getByPlaceholder("Filter").fill("Atlas AS7-D");
    await page.getByRole("button", { name: "View Atlas AS7-D", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Viewing AS7-D" })).toBeVisible();
    expect(errors).toEqual([]);
});

test("deep links resolve under the GitHub Pages base path", async ({ page }) => {
    await page.goto("about");
    await expect(page).toHaveURL(/\/battletech-tools\/about$/);
    await expect(page.locator("#root")).not.toBeEmpty();
});
