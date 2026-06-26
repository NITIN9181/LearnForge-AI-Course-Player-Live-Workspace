import { test, expect } from "@playwright/test";

test.describe("Enrollment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "demo@learnforge.dev");
    await page.fill("#password", "demo-learner");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("browses course catalog", async ({ page }) => {
    await page.click("text=Courses");
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.locator("text=Course Catalog")).toBeVisible();
  });

  test("enrolls in a course and lands on player", async ({ page }) => {
    await page.goto("/courses");
    await page.waitForSelector("text=Enroll", { timeout: 10000 });
    const enrollLink = page.locator("text=Enroll").first();
    await enrollLink.click();
    await expect(page).toHaveURL(/\/learn\//);
  });

  test("shows enrolled courses on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Your Courses")).toBeVisible();
  });
});
