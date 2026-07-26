import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SignBridge/);
  });

  test('displays hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Breaking Communication')).toBeVisible();
  });

  test('has navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Sign in')).toBeVisible();
    await expect(page.locator('text=Get started')).toBeVisible();
  });
});

test.describe('Authentication Pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Sign in')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('text=Create account')).toBeVisible();
    await expect(page.locator('input[autocomplete="given-name"]')).toBeVisible();
  });

  test('demo login works', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@signbridge.ai');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.url()).toContain('/dashboard');
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@signbridge.ai');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('displays stat cards', async ({ page }) => {
    await expect(page.locator('text=Courses Enrolled')).toBeVisible();
    await expect(page.locator('text=Practice Sessions')).toBeVisible();
    await expect(page.locator('text=Translations')).toBeVisible();
  });

  test('displays quick actions', async ({ page }) => {
    await expect(page.locator('text=Start Learning')).toBeVisible();
    await expect(page.locator('text=Practice Signs')).toBeVisible();
    await expect(page.locator('text=Translate')).toBeVisible();
  });
});

test.describe('Practice Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/practice');
    await expect(page.locator('text=AI Practice')).toBeVisible();
  });
});

test.describe('Translation Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/translation');
    await expect(page.locator('text=Translation')).toBeVisible();
  });
});

test.describe('Settings Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('text=Settings')).toBeVisible();
  });
});

test.describe('Profile Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=My Profile')).toBeVisible();
  });
});

test.describe('Dictionary Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/dictionary');
    await expect(page.locator('text=Dictionary')).toBeVisible();
  });
});

test.describe('Learn Page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/learn');
    await expect(page.locator('text=Learn')).toBeVisible();
  });
});

test.describe('404 Page', () => {
  test('shows not found for unknown routes', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    expect(response?.status()).toBe(404);
  });
});
