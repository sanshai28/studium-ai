import { test, expect } from '@playwright/test';
import path from 'path';
import { generateTestEmail } from './helpers/auth';

test.describe('Full User Journey', () => {
  test('complete flow: sign up → create notebook → upload → Q&A → notes → delete → sign out', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const email = generateTestEmail();
    const password = 'JourneyTest123!';

    // --- Step 1: Sign up ---
    await page.goto('/signup');
    await page.fill('#name', 'Journey User');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button.auth-button');

    await expect(page).toHaveURL('/notebooks', { timeout: 10_000 });

    // --- Step 2: See empty dashboard with hero ---
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-content h1')).toContainText(
      'Welcome to NotebookLM'
    );

    // --- Step 3: Create first notebook via hero button ---
    await page.click('.btn-create-hero');
    await expect(page.locator('.modal')).toBeVisible();
    await page.fill('#notebook-title', 'My Research');
    await page.click('.btn-create');

    await expect(page.locator('.notebook-editor-view')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('.header-title')).toContainText('My Research');

    // --- Step 4: Upload a test document ---
    const testFilePath = path.resolve(
      __dirname,
      'fixtures/test-document.txt'
    );
    await page.locator('#file-input').setInputFiles(testFilePath);

    await expect(
      page.locator('.source-name', { hasText: 'test-document.txt' })
    ).toBeVisible({ timeout: 15_000 });

    // --- Step 5: Ask a Q&A question ---
    const qaInput = page.locator('.qa-pane textarea');
    await qaInput.fill('What are the key concepts mentioned in this document?');
    await page.click('.qa-pane .input-container button[type="submit"]');

    // Wait for user message to appear
    await expect(
      page.locator('.message.user .message-content')
    ).toContainText('key concepts');

    // Wait for AI response
    await expect(
      page.locator('.message.assistant .message-content')
    ).toBeVisible({ timeout: 60_000 });

    // --- Step 6: Add AI response to notes ---
    await page
      .locator('.message.assistant .message-actions button')
      .nth(1)
      .click();

    const notesTextarea = page.locator('.notes-pane .notes-editor textarea');
    // Notes should now have content
    const notesValue = await notesTextarea.inputValue();
    expect(notesValue.length).toBeGreaterThan(0);

    // --- Step 7: Save notes ---
    await page.click('.save-btn');
    await expect(page.locator('.save-btn')).not.toContainText('Saving...', {
      timeout: 10_000,
    });

    // --- Step 8: Navigate back to dashboard ---
    await page.click('.btn-back');
    await expect(page).toHaveURL('/notebooks');
    await expect(page.locator('.dashboard')).toBeVisible({ timeout: 10_000 });

    // Verify notebook card exists
    await expect(
      page.locator('.notebook-card-title', { hasText: 'My Research' })
    ).toBeVisible();

    // --- Step 9: Delete the notebook ---
    page.on('dialog', (dialog) => dialog.accept());

    await page
      .locator('.notebook-card', { hasText: 'My Research' })
      .locator('.notebook-card-menu')
      .click();

    await expect(
      page.locator('.notebook-card-title', { hasText: 'My Research' })
    ).not.toBeVisible({ timeout: 10_000 });

    // --- Step 10: Sign out ---
    await page.click('.btn-signout');
    await expect(page).toHaveURL('/signin');
    await expect(page.locator('h1')).toContainText('Sign in');
  });
});
