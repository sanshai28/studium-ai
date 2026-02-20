import { type Page, expect } from '@playwright/test';

const TEST_PASSWORD = 'TestPass123!';

export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@e2e.test`;
}

export async function signUp(
  page: Page,
  options?: { email?: string; password?: string; name?: string }
): Promise<{ email: string; password: string }> {
  const email = options?.email ?? generateTestEmail();
  const password = options?.password ?? TEST_PASSWORD;
  const name = options?.name ?? 'Test User';

  await page.goto('/signup');
  await page.fill('#name', name);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button.auth-button');

  await expect(page).toHaveURL('/notebooks', { timeout: 10_000 });

  return { email, password };
}

export async function signIn(
  page: Page,
  email: string,
  password: string = TEST_PASSWORD
): Promise<void> {
  await page.goto('/signin');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button.auth-button');

  await expect(page).toHaveURL('/notebooks', { timeout: 10_000 });
}

export async function createNotebookViaAPI(
  page: Page,
  title: string
): Promise<string> {
  const token = await page.evaluate(() => localStorage.getItem('token'));

  const response = await page.request.post('/api/notebooks', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { title, content: '' },
  });

  const data = await response.json();
  return data.notebook.id;
}

export async function deleteNotebookViaAPI(
  page: Page,
  notebookId: string
): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('token'));

  await page.request.delete(`/api/notebooks/${notebookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
