import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in with demo credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "demo@learnforge.dev");
    await page.fill("#password", "demo-learner");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });

  test("redirects authenticated user from /login to /dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "demo@learnforge.dev");
    await page.fill("#password", "demo-learner");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("can register a new account", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@e2e-test.dev`;
    await page.goto("/register");
    await page.fill("#name", "E2E Test User");
    await page.fill("#email", uniqueEmail);
    await page.fill("#password", "test-password-123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);
  });
});
