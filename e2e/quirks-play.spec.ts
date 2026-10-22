import { expect, test } from "@playwright/test";

// Design quirks in play (quirks design, plan 3): a per-game switch on the roster, off by default.
test("the roster's design quirks switch is off by default and is saved with the force", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
    page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
    });

    await page.goto("classic-battletech/mech-creator");
    await page.getByTitle("Click here to clear out your current 'mech and start over.").click();
    await page.getByTitle("Click here to save a a new 'mech row").click();

    await page.goto("classic-battletech/roster");
    await page.getByTitle("Click here to open the add 'mech dialog").first().click();
    await page.locator(".modal button.btn-xs.btn-primary").nth(1).click();
    await page.goto("classic-battletech/roster");

    // InputCheckbox is a label with a square icon, green when on.
    const quirks = page.locator("label.checkbox-input", { hasText: "Use design quirks" });
    await expect(quirks.locator("svg.color-green")).toHaveCount(0);
    await quirks.click();
    await expect(quirks.locator("svg.color-green")).toHaveCount(1);
    await page.reload();
    await expect(page.locator("label.checkbox-input", { hasText: "Use design quirks" }).locator("svg.color-green")).toHaveCount(1);

    expect(errors).toEqual([]);
});
