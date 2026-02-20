import { test, expect } from '@playwright/test';
import path from 'path';
import {
  signUp,
  createNotebookViaAPI,
  deleteNotebookViaAPI,
} from './helpers/auth';

test.describe('Notebook Editor', () => {
  let notebookId: string;

  test.beforeEach(async ({ page }) => {
    await signUp(page);
    notebookId = await createNotebookViaAPI(page, 'Test Notebook');
    await page.goto(`/notebooks/${notebookId}`);
    await expect(page.locator('.notebook-editor-view')).toBeVisible({
      timeout: 10_000,
    });
  });

  test.afterEach(async ({ page }) => {
    try {
      await deleteNotebookViaAPI(page, notebookId);
    } catch {
      // Notebook may already be deleted by the test
    }
  });

  test('three-pane layout renders', async ({ page }) => {
    await expect(page.locator('.sources-pane')).toBeVisible();
    await expect(page.locator('.qa-pane')).toBeVisible();
    await expect(page.locator('.notes-pane')).toBeVisible();

    // Check pane headers
    await expect(
      page.locator('.sources-pane .pane-header h3')
    ).toContainText('Sources');
    await expect(
      page.locator('.qa-pane .pane-header h3')
    ).toContainText('Ask Questions');
    await expect(
      page.locator('.notes-pane .pane-header h3')
    ).toContainText('Notes');
  });

  test('rename notebook by clicking title', async ({ page }) => {
    // Click the title to start editing
    await page.click('.header-title');

    // Input should appear
    const titleInput = page.locator('.header-title-input');
    await expect(titleInput).toBeVisible();

    // Clear and type new name
    await titleInput.fill('Renamed Notebook');
    await titleInput.press('Enter');

    // Title should update
    await expect(page.locator('.header-title')).toContainText(
      'Renamed Notebook'
    );
  });

  test('upload source file', async ({ page }) => {
    const testFilePath = path.resolve(
      __dirname,
      'fixtures/test-document.txt'
    );

    // Upload file via the file input
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(testFilePath);

    // Wait for upload to complete and source to appear
    await expect(
      page.locator('.source-name', { hasText: 'test-document.txt' })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('send Q&A message and receive AI response', async ({ page }) => {
    // First upload a source so Q&A is enabled
    const testFilePath = path.resolve(
      __dirname,
      'fixtures/test-document.txt'
    );
    await page.locator('#file-input').setInputFiles(testFilePath);
    await expect(
      page.locator('.source-name', { hasText: 'test-document.txt' })
    ).toBeVisible({ timeout: 15_000 });

    // Type a question in the Q&A pane
    const qaInput = page.locator('.qa-pane textarea');
    await qaInput.fill('What is machine learning?');

    // Click send button
    await page.click('.qa-pane .input-container button[type="submit"]');

    // Should see the user message
    await expect(
      page.locator('.message.user .message-content')
    ).toContainText('What is machine learning?');

    // Should see the typing indicator then the assistant response
    await expect(
      page.locator('.message.assistant .message-content')
    ).toBeVisible({ timeout: 60_000 });

    // Assistant message should have action buttons
    await expect(
      page.locator('.message.assistant .message-actions')
    ).toBeVisible();
  });

  test('add AI response to notes', async ({ page }) => {
    // Upload source
    const testFilePath = path.resolve(
      __dirname,
      'fixtures/test-document.txt'
    );
    await page.locator('#file-input').setInputFiles(testFilePath);
    await expect(
      page.locator('.source-name', { hasText: 'test-document.txt' })
    ).toBeVisible({ timeout: 15_000 });

    // Send a question
    await page.locator('.qa-pane textarea').fill('Summarize this document');
    await page.click('.qa-pane .input-container button[type="submit"]');

    // Wait for assistant response
    await expect(
      page.locator('.message.assistant .message-content')
    ).toBeVisible({ timeout: 60_000 });

    // Get the assistant message text
    const assistantText = await page
      .locator('.message.assistant .message-content')
      .first()
      .textContent();

    // Click "Add to Notes" button on the assistant message
    await page
      .locator('.message.assistant .message-actions button')
      .nth(1)
      .click();

    // Notes pane should contain the assistant's response
    const notesTextarea = page.locator('.notes-pane .notes-editor textarea');
    await expect(notesTextarea).toHaveValue(new RegExp(assistantText!.slice(0, 30)));
  });

  test('save notes manually', async ({ page }) => {
    const notesTextarea = page.locator('.notes-pane .notes-editor textarea');

    // Type some notes
    await notesTextarea.fill('My important research notes');

    // Click save button
    await page.click('.save-btn');

    // Should show saving state then saved
    await expect(page.locator('.save-btn')).not.toContainText('Saving...', {
      timeout: 10_000,
    });

    // Reload page and check notes persisted
    await page.reload();
    await expect(page.locator('.notebook-editor-view')).toBeVisible({
      timeout: 10_000,
    });
    await expect(notesTextarea).toHaveValue('My important research notes');
  });

  test('back button returns to dashboard', async ({ page }) => {
    await page.click('.btn-back');

    await expect(page).toHaveURL('/notebooks');
    await expect(page.locator('.dashboard')).toBeVisible({ timeout: 10_000 });
  });
});
