import { E2E_AUTH_FILES } from '../helpers/auth-paths';
import { expect, test } from '../fixtures/test-fixtures';

test.describe('App pages — student', () => {
  test.use({ storageState: E2E_AUTH_FILES.student });

  test('dashboard loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/app');
    await expect(page.getByText('Resumo da sua jornada de mentoria.')).toBeVisible();
  });

  test('RF04/RNF03 — discover page loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/app/descobrir');
    await expect(page.getByRole('heading', { name: 'Descobrir' })).toBeVisible();
  });

  test('RF04 — mentor profile page', async ({ page, gotoSettled, seedState }) => {
    await gotoSettled(`/app/descobrir/${seedState.mentorUserId}`);
    await expect(page.getByText('E2E Mentor')).toBeVisible();
  });

  test('RF03 — profile page loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/app/perfil');
    await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar perfil' })).toBeVisible();
  });

  test('mentorships page loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/app/mentorias');
    await expect(page.getByRole('heading', { name: 'Mentorias' })).toBeVisible();
  });

  test('RF08 — conversations list', async ({ page, gotoSettled }) => {
    await gotoSettled('/app/conversas');
    await expect(page.getByRole('heading', { name: 'Conversas' })).toBeVisible();
  });

  test('RF08 — conversation thread', async ({ page, gotoSettled, seedState }) => {
    await gotoSettled(`/app/conversas/${seedState.conversationId}`);
    await expect(page.getByPlaceholder('Escreva uma mensagem...')).toBeVisible();
  });

  test('notifications page loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/app/notificacoes');
    await expect(page.getByRole('heading', { name: 'Notificacoes' })).toBeVisible();
  });

  test('events page loads', async ({ page, gotoSettled }) => {
    await gotoSettled('/app/eventos');
    await expect(page.getByRole('heading', { name: 'Eventos' })).toBeVisible();
  });
});

test.describe('App pages — mentor', () => {
  test.use({ storageState: E2E_AUTH_FILES.mentor });

  test('mentor mentorships shows received section', async ({ page, gotoSettled }) => {
    await gotoSettled('/app/mentorias');
    await expect(page.getByRole('heading', { name: 'Recebidas' })).toBeVisible();
  });
});
