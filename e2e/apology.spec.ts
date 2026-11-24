import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { APOLOGY_TITLE } from "../src/data/apology-2026-11-24";

// NGCFells's apology of 24 November 2026 shows once per browser (src/ui/components/apology-notice.tsx). Every other
// spec starts with it marked as seen (playwright.config.ts); these start from a browser that has never closed it.
test.use({ storageState: { cookies: [], origins: [] } });

test("the apology shows on a first visit, stays closed once closed, and opens again from the news", async ({ page }) => {
    await page.goto("");
    const dialog = page.getByRole("dialog", { name: APOLOGY_TITLE });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Close the apology" }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole("region", { name: "News" })).toBeVisible();
    await expect(dialog).toBeHidden();

    await page.getByRole("region", { name: "News" }).getByRole("button", { name: "Read the apology" }).click();
    await expect(dialog).toBeVisible();
});

test("the open apology has no accessibility violations", async ({ page, browserName, isMobile }) => {
    test.skip(browserName !== "chromium" || !!isMobile, "one engine is enough for the rules");
    await page.goto("");
    await expect(page.getByRole("dialog", { name: APOLOGY_TITLE })).toBeVisible();
    const results = await new AxeBuilder({ page }).include(".modal").analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});
