import { test, expect } from '@playwright/test';

test.describe('BISUM Conference E2E Smoke Tests', () => {
  test('Landing page loads with hero section, BOAZ theme, and register button', async ({ page }) => {
    await page.goto('/');

    // Check title contains BISUM
    await expect(page).toHaveTitle(/BISUM/i);

    // Verify Hero content
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toContainText('BOAZ');

    // Verify registration link is present
    const registerLink = page.locator('a[href*="register"]').first();
    await expect(registerLink).toBeVisible();
  });

  test('Registration page renders with 4 updated breakout session options', async ({ page }) => {
    await page.goto('/register');

    // Verify form header
    await expect(page.getByText('Personal & Conference Details')).toBeVisible();

    // Verify breakout session dropdown has the 4 new tracks
    const breakoutSelect = page.locator('select[name="breakoutSessionChoice"]');
    await expect(breakoutSelect).toBeVisible();

    const options = await breakoutSelect.locator('option').allInnerTexts();
    expect(options).toContain('Food');
    expect(options).toContain('Craft');
    expect(options).toContain('Online Visibility');
    expect(options).toContain('Real Estate');
  });

  test('Client-side form validation highlights missing fields', async ({ page }) => {
    await page.goto('/register');

    // Click submit button without filling fields
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify validation errors appear
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Phone number is required')).toBeVisible();
    await expect(page.getByText('Please select a breakout session')).toBeVisible();
  });
});
