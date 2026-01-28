import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 * Sprint 7 - Epic 12: Tests E2E Playwright
 */

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("invalid@test.com");
    await page.getByLabel(/mot de passe/i).fill("wrongpassword");
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page.getByText(/identifiants invalides|email ou mot de passe incorrect/i)).toBeVisible();
  });

  test("should display signup page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /créer un compte|inscription/i })).toBeVisible();
  });

  test("should navigate between login and signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /créer un compte|s'inscrire/i }).click();
    await expect(page).toHaveURL(/signup/);

    await page.getByRole("link", { name: /se connecter|connexion/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("should display forgot password option", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /mot de passe oublié/i })).toBeVisible();
  });
});

test.describe("Protected Routes", () => {
  test("should redirect /quotes to login when not authenticated", async ({ page }) => {
    await page.goto("/quotes");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect /settings to login when not authenticated", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/login/);
  });

  test("should redirect /admin to login when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/);
  });
});
