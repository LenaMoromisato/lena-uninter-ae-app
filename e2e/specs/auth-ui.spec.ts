import { getE2eCredentials } from '../seed/seed-data';
import { expect, test } from '../fixtures/test-fixtures';

const creds = getE2eCredentials();

test.describe('Auth UI', () => {
  test('RF02 — login via UI redirects to app', async ({ page }) => {
    await page.goto('/entrar');
    await page.locator('#email').fill(creds.studentEmail);
    await page.locator('#password').fill(creds.studentPassword);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('**/app**');
    await expect(page).toHaveURL(/\/app/);
  });

  test('RF01 — register page accepts student role selection', async ({ page }) => {
    await page.goto('/cadastro');
    await expect(page.getByText('Tipo de conta')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  });
});
