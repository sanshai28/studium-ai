import { test, expect } from '@playwright/test';
import {
  signUp,
  createNotebookViaAPI,
} from './helpers/auth';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  test('dashboard loads with header and search bar', async ({ page }) => {
    await expect(page.locator('.logo-text')).toContainText('NotebookLM');
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.btn-signout')).toBeVisible();
  });

  test('empty dashboard shows hero section', async ({ page }) => {
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-content h1')).toContainText(
      'Welcome to NotebookLM'
    );
    await expect(
      page.locator('.btn-create-hero')
    ).toContainText('Create your first notebook');
  });

  test('create notebook via modal', async ({ page }) => {
    // Click the hero create button
    await page.click('.btn-create-hero');

    // Modal should appear
    await expect(page.locator('.modal')).toBeVisible();

    // Fill in title and create
    await page.fill('#notebook-title', 'My Test Notebook');
    await page.click('.btn-create');

    // Should navigate to the notebook editor
    await expect(page.locator('.notebook-editor-view')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('.header-title')).toContainText(
      'My Test Notebook'
    );
  });

  test('create notebook via FAB', async ({ page }) => {
    // First create a notebook so FAB appears
    await createNotebookViaAPI(page, 'First Notebook');
    await page.reload();

    // Wait for the notebook card to appear
    await expect(
      page.locator('.notebook-card-title', { hasText: 'First Notebook' })
    ).toBeVisible({ timeout: 10_000 });

    // Wait for FAB to be visible
    await expect(page.locator('.fab')).toBeVisible({ timeout: 10_000 });

    // Click FAB
    await page.click('.fab');

    // Should navigate to editor with "Untitled notebook"
    await expect(page.locator('.notebook-editor-view')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('.header-title')).toContainText(
      'Untitled notebook'
    );
  });

  test('search filters notebooks by title', async ({ page }) => {
    // Create multiple notebooks via API
    await createNotebookViaAPI(page, 'React Tutorial');
    await createNotebookViaAPI(page, 'Python Guide');
    await createNotebookViaAPI(page, 'React Hooks Deep Dive');
    await createNotebookViaAPI(page, 'Machine Learning 101');
    await createNotebookViaAPI(page, 'Another Notebook');
    await page.reload();

    // Wait for notebooks to load
    await expect(
      page.locator('.notebook-card-title', { hasText: 'React Tutorial' })
    ).toBeVisible({ timeout: 10_000 });

    // Search for "React"
    await page.fill('.search-input', 'React');

    // Should show only React notebooks in search results
    const searchResults = page.locator(
      '.notebooks-section:has(h2:text("Search results")) .notebook-card-title'
    );
    await expect(searchResults).toHaveCount(2);
    await expect(searchResults.nth(0)).toContainText('React');
    await expect(searchResults.nth(1)).toContainText('React');

    // Clear search
    await page.click('.search-clear');
    await expect(page.locator('.search-input')).toHaveValue('');
  });

  test('delete notebook removes card from dashboard', async ({ page }) => {
    await createNotebookViaAPI(page, 'Delete Me');
    await page.reload();

    await expect(
      page.locator('.notebook-card-title', { hasText: 'Delete Me' })
    ).toBeVisible({ timeout: 10_000 });

    // Set up dialog handler to accept confirmation
    page.on('dialog', (dialog) => dialog.accept());

    // Click the delete button on the card
    await page
      .locator('.notebook-card', { hasText: 'Delete Me' })
      .locator('.notebook-card-menu')
      .click();

    // Card should be removed
    await expect(
      page.locator('.notebook-card-title', { hasText: 'Delete Me' })
    ).not.toBeVisible({ timeout: 10_000 });
  });

  test('sign out clears auth state', async ({ page }) => {
    await page.click('.btn-signout');

    // App clears auth state — sign-out button disappears
    await expect(page.locator('.btn-signout')).not.toBeVisible({ timeout: 10_000 });

    // Navigating to dashboard without auth should show no user data
    await page.goto('/signin');
    await expect(page.locator('h1')).toContainText('Sign in');
  });

  test('clicking notebook card opens editor', async ({ page }) => {
    await createNotebookViaAPI(page, 'Open Me');
    await page.reload();

    await expect(
      page.locator('.notebook-card-title', { hasText: 'Open Me' })
    ).toBeVisible({ timeout: 10_000 });

    // Click the notebook card body (not the delete button)
    await page
      .locator('.notebook-card', { hasText: 'Open Me' })
      .locator('.notebook-card-body')
      .click();

    // Should navigate to the editor
    await expect(page.locator('.notebook-editor-view')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('.header-title')).toContainText('Open Me');
  });
});
