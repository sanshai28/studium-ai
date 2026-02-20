import { test, expect } from '@playwright/test';
import { signUp } from './helpers/auth';

test.describe('Auth Flow', () => {
  test('sign up creates account and redirects to dashboard', async ({ page }) => {
    await signUp(page);

    // Should be on the notebooks dashboard
    await expect(page.locator('.dashboard')).toBeVisible();
    // User avatar should show first letter of name
    await expect(page.locator('.user-avatar')).toContainText('T');
  });

  test('sign in with valid credentials redirects to dashboard', async ({ page }) => {
    // First sign up to create the account
    const { email, password } = await signUp(page);

    // Sign out
    await page.click('.btn-signout');
    await expect(page).toHaveURL('/signin');

    // Sign back in
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button.auth-button');

    await expect(page).toHaveURL('/notebooks', { timeout: 10_000 });
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  test('sign in with wrong password shows error', async ({ page }) => {
    await page.goto('/signin');
    await page.fill('#email', 'nonexistent@test.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button.auth-button');

    await expect(page.locator('.error-message')).toBeVisible({ timeout: 10_000 });
  });

  test('navigate to sign up from sign in', async ({ page }) => {
    await page.goto('/signin');

    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('h1')).toContainText('Create account');
    await expect(page.locator('#name')).toBeVisible();
  });

  test('navigate to forgot password from sign in', async ({ page }) => {
    await page.goto('/signin');

    await page.click('a[href="/request-password-reset"]');
    await expect(page).toHaveURL('/request-password-reset');
  });
});
