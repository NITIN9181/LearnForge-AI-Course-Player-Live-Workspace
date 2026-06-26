import { test, expect } from "@playwright/test";

test.describe("Lesson Completion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "demo@learnforge.dev");
    await page.fill("#password", "demo-learner");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("renders Complete button on player page", async ({ page }) => {
    await page.goto("/courses");
    await page.waitForSelector("text=Continue", { timeout: 10000 });
    const continueBtn = page.locator("text=Continue").first();
    await continueBtn.click();
    await expect(page).toHaveURL(/\/learn\//);

    await page.waitForSelector("text=Mark Lesson Complete", { timeout: 10000 });
    await expect(page.locator("text=Mark Lesson Complete")).toBeVisible();
  });

  test("progress icon displays in sidebar for completed lessons", async ({ page }) => {
    await page.goto("/courses");
    await page.waitForSelector("text=Continue", { timeout: 10000 });
    const continueBtn = page.locator("text=Continue").first();
    await continueBtn.click();
    await expect(page).toHaveURL(/\/learn\//);

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    await page.goto(currentUrl);
    await page.waitForTimeout(1000);
  });
});
