import { expect, test } from "@playwright/test";

// The optional Technical Readout step of the 'Mech Creator: fields saved with the design, a printed sheet,
// and the TRO text importer leaving them alone.
test("Step 7 keeps the Technical Readout fields, prints them, and the TRO text importer does not wipe them", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
    page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
    });

    await page.goto("classic-battletech/mech-creator/step1");
    await page.getByLabel("Mech Tonnage").selectOption("50");

    await page.getByRole("link", { name: /Step 7/ }).first().click();
    await expect(page.getByText("Step 7: Technical Readout (optional)")).toBeVisible();
    await page.getByLabel("Manufacturer", { exact: true }).fill("Earthwerks Incorporated");
    await page.getByLabel("Overview").fill("Test overview");

    await page.reload();
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveValue("Earthwerks Incorporated");
    await expect(page.getByLabel("Overview")).toHaveValue("Test overview");

    await page.getByRole("link", { name: /Print TRO sheet/ }).click();
    await expect(page.locator(".tro-sheet")).toContainText("Earthwerks Incorporated");
    await expect(page.locator(".tro-sheet")).toContainText("Test overview");

    await page.goto("classic-battletech/mech-creator/imports");
    await page.getByRole("button", { name: /Try the TRO text importer/ }).click();
    await page.locator("textarea").first().fill("Type: Test TRO\nTechnology Base: Inner Sphere\nTonnage: 50\n");
    await page.getByRole("button", { name: "Import and Replace" }).first().click();
    // The design in hand has unsaved changes, so replacing it asks first.
    await page.getByRole("dialog").getByRole("button", { name: "Discard it" }).click();

    // The imported unit took over, and the TRO fields entered before it are still there.
    await page.goto("classic-battletech/mech-creator/summary");
    await expect(page.locator(".mech-tro").first()).toContainText("Type: Test TRO");
    await page.goto("classic-battletech/mech-creator/step7");
    await expect(page.getByLabel("Manufacturer", { exact: true })).toHaveValue("Earthwerks Incorporated");

    expect(errors).toEqual([]);
});
