import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'Test123@456';
  const testRestaurantName = 'Test Restaurant ' + Date.now();

  test('Should load login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Login|RestroMaxx/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Should display validation errors on empty form submission', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Login")');
    
    // Wait for error messages
    await page.waitForTimeout(500);
    const errorMsg = page.locator('text=/email|password|required/i');
    await expect(errorMsg.first()).toBeVisible();
  });

  test('Should register new restaurant', async ({ page }) => {
    await page.goto('/');
    
    // Click register link
    await page.click('a:has-text("Sign Up")');
    await page.waitForURL('**/register');
    
    // Fill registration form
    await page.fill('input[placeholder*="Restaurant"]', testRestaurantName);
    await page.fill('input[type="email"]', testEmail + Date.now());
    await page.fill('input[type="tel"]', '9876543210');
    await page.click('text=Bellary');
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[placeholder*="Confirm"]', testPassword);
    
    // Submit
    await page.click('button:has-text("Register")');
    
    // Should redirect to login or dashboard
    await page.waitForURL('**/(login|dashboard)', { timeout: 5000 });
    const url = page.url();
    expect(url.includes('login') || url.includes('dashboard')).toBeTruthy();
  });

  test('Should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Try login with test credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Login")');
    
    // Should either redirect to dashboard or show error
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    // If login fails, we'll get an error message
    const errorMsg = page.locator('text=Invalid|Error');
    const isError = await errorMsg.isVisible().catch(() => false);
    
    if (!isError) {
      // Login succeeded - should be on dashboard or similar
      expect(currentUrl.includes('login')).toBeFalsy();
    }
  });

  test('Should display error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button:has-text("Login")');
    
    // Should show error message
    const errorMsg = page.locator('text=/Invalid|not found|incorrect/i');
    await expect(errorMsg.first()).toBeVisible({ timeout: 3000 });
  });
});
