import { expect, test } from '../fixtures/test-fixtures';

test.describe('Public pages', () => {
  test('landing page loads with auth links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cadastrar' })).toBeVisible();
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page.getByText('Entrar', { exact: true }).first()).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto('/cadastro');
    await expect(page.getByText('Criar conta', { exact: true }).first()).toBeVisible();
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });
});
