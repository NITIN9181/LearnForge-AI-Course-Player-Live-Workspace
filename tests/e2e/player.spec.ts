import { test, expect } from "@playwright/test";

test.describe("Player", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "demo@learnforge.dev");
    await page.fill("#password", "demo-learner");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("critical flow: visit / → login → dashboard → course → lesson", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);

    await page.fill("#email", "demo@learnforge.dev");
    await page.fill("#password", "demo-learner");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.waitForSelector("text=Continue Learning", { timeout: 10000 });
    const continueLink = page.locator("text=Continue →").first();
    await continueLink.click();

    await expect(page).toHaveURL(/\/learn\//);

    await page.waitForSelector("text=AI Workspace", { timeout: 10000 });
    await expect(page.locator("text=AI Workspace")).toBeVisible();
  });

  test("split-pane renders with lesson content and workspace", async ({ page }) => {
    await page.goto("/courses");
    await page.waitForSelector("text=Continue", { timeout: 10000 });
    const continueBtn = page.locator("text=Continue").first();
    await continueBtn.click();
    await expect(page).toHaveURL(/\/learn\//);

    await expect(page.locator("text=AI Workspace")).toBeVisible();
  });
});
