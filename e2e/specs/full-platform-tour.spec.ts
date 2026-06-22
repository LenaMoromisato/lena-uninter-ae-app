import { getE2eCredentials } from '../seed/seed-data';
import { loginAs } from '../helpers/auth';
import { tourScene } from '../helpers/tour-navigate';
import { expect, test } from '../fixtures/test-fixtures';
import { waitForSwagger } from '../helpers/wait-for-app';

const creds = getE2eCredentials();

test.describe('Full platform tour', () => {
  test('all roles and routes in one recording', async ({ page, seedState }) => {
    test.setTimeout(360_000);

    // --- Público ---
    await tourScene(page, '/');
    await tourScene(page, '/entrar');
    await tourScene(page, '/cadastro');

    // --- Estudante (login após telas públicas) ---
    await loginAs(page, creds.studentEmail, creds.studentPassword, '/app');
    await tourScene(page, '/app');

    const studentRoutes = [
      '/app/descobrir',
      `/app/descobrir/${seedState.mentorUserId}`,
      '/app/eventos',
      '/app/mentorias',
      '/app/conversas',
      `/app/conversas/${seedState.conversationId}`,
      '/app/notificacoes',
      '/app/perfil',
    ];

    for (const route of studentRoutes) {
      await tourScene(page, route);
    }

    // --- Mentora ---
    await loginAs(page, creds.mentorEmail, creds.mentorPassword, '/app');
    await tourScene(page, '/app');

    for (const route of ['/app/mentorias', '/app/conversas', `/app/conversas/${seedState.conversationId}`]) {
      await tourScene(page, route);
    }

    // --- Admin ---
    await loginAs(page, creds.adminEmail, creds.adminPassword, '/admin');

    const adminRoutes = [
      '/admin',
      '/admin/roles',
      '/admin/roles/nova',
      `/admin/roles/${seedState.roleId}`,
      '/admin/usuarias',
      '/admin/usuarias/nova',
      `/admin/usuarias/${seedState.studentUserId}`,
    ];

    for (const route of adminRoutes) {
      await tourScene(page, route);
    }

    // --- Sem permissão (estudante) ---
    await loginAs(page, creds.studentEmail, creds.studentPassword, '/admin/sem-permissao');
    await tourScene(page, '/admin/sem-permissao', 1_500);

    // --- API / Swagger (RNF07) ---
    await page.goto('/api', { waitUntil: 'load' });
    await tourScene(page, '/api', 800);
    await page.goto('/api/docs', { waitUntil: 'load' });
    await waitForSwagger(page);
    await expect(page.locator('.swagger-ui')).toBeVisible();
    await page.waitForTimeout(1_500);
  });
});
