import { E2E_AUTH_FILES } from '../helpers/auth-paths';
import { expect, test } from '../fixtures/test-fixtures';

test.describe('Admin pages', () => {
  test.use({ storageState: E2E_AUTH_FILES.admin });

  test('admin dashboard loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/admin');
    await expect(page.getByRole('heading', { name: 'Administracao' })).toBeVisible({ timeout: 15_000 });
  });

  test('roles list loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/admin/roles');
    await expect(page.getByRole('heading', { name: 'Papeis' })).toBeVisible({ timeout: 15_000 });
  });

  test('new role form loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/admin/roles/nova');
    await expect(page.getByRole('heading', { name: 'Novo papel' })).toBeVisible({ timeout: 15_000 });
  });

  test('role detail loads', async ({ page, gotoSettled, seedState }) => {
    await gotoSettled(`/admin/roles/${seedState.roleId}`);
    await expect(page.getByRole('heading', { name: 'Editar papel' })).toBeVisible();
  });

  test('users list loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/admin/usuarias');
    await expect(page.getByRole('heading', { name: 'Usuarias' })).toBeVisible();
  });

  test('new user form loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/admin/usuarias/nova');
    await expect(page.getByRole('heading', { name: 'Provisionar usuaria' })).toBeVisible();
  });

  test('user detail loads', async ({ page, gotoSettled, seedState }) => {
    await gotoSettled(`/admin/usuarias/${seedState.studentUserId}`);
    await expect(page.getByText('E2E Student')).toBeVisible();
  });
});

test.describe('Admin sem-permissao', () => {
  test.use({ storageState: E2E_AUTH_FILES.student });

  test('sem-permissao for student role', async ({ page, gotoSettled }) => {
    await gotoSettled('/admin/sem-permissao');
    await expect(page.getByRole('heading', { name: 'Acesso restrito' })).toBeVisible();
  });
});
