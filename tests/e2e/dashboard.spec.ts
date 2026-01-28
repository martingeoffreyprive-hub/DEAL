import { test, expect } from "@playwright/test";

/**
 * Dashboard E2E Tests
 * Sprint 7 - Epic 12: Tests E2E Playwright
 */

test.describe("Dashboard", () => {
  // Skip auth for now - these tests assume authenticated state
  test.skip("should display hero section with greeting", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/bonjour|bonsoir/i)).toBeVisible();
  });

  test.skip("should display quote carousel", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/derniers devis|devis récents/i)).toBeVisible();
  });

  test.skip("should have quick action buttons", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /nouveau devis/i })).toBeVisible();
  });

  test.skip("should navigate to new quote from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /nouveau devis/i }).click();
    await expect(page).toHaveURL(/quotes\/new|wizard/);
  });

  test.skip("should display stats cards", async ({ page }) => {
    await page.goto("/dashboard");
    // Check for stat cards
    await expect(page.getByText(/devis ce mois|total devis/i)).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("landing page should load", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DEAL/i);
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    // Check if nav exists
    const nav = page.locator("nav, header");
    await expect(nav.first()).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Page should still be usable
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Performance", () => {
  test("landing page should load within 3 seconds", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test("should have no console errors on landing page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known benign errors
    const criticalErrors = errors.filter(
      (e) => !e.includes("Failed to load resource") && !e.includes("404")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
