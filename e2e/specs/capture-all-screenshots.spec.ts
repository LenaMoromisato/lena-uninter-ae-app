import { E2E_AUTH_FILES } from '../helpers/auth-paths';
import { screenshotPage, screenshotSlug } from '../helpers/screenshot-page';
import { navigateForEvidence, waitForSwagger } from '../helpers/wait-for-app';
import { test } from '../fixtures/test-fixtures';

test.describe('Capture all screens', () => {
  test('public and API pages', async ({ page }) => {
    await navigateForEvidence(page, '/');
    await screenshotPage(page, screenshotSlug('public', '/'));

    await navigateForEvidence(page, '/entrar');
    await screenshotPage(page, screenshotSlug('public', '/entrar'));

    await navigateForEvidence(page, '/cadastro');
    await screenshotPage(page, screenshotSlug('public', '/cadastro'));

    await navigateForEvidence(page, '/api');
    await screenshotPage(page, screenshotSlug('api', '/api'));

    await navigateForEvidence(page, '/api/docs');
    await waitForSwagger(page);
    await screenshotPage(page, screenshotSlug('api', '/api/docs'));
  });
});

test.describe('Capture app pages — student', () => {
  test.use({ storageState: E2E_AUTH_FILES.student });

  test('app pages — student', async ({ page, seedState }) => {
    test.setTimeout(120_000);
    const routes = [
      '/app',
      '/app/descobrir',
      `/app/descobrir/${seedState.mentorUserId}`,
      '/app/eventos',
      '/app/mentorias',
      '/app/conversas',
      `/app/conversas/${seedState.conversationId}`,
      '/app/notificacoes',
      '/app/perfil',
    ];

    for (const route of routes) {
      await navigateForEvidence(page, route);
      await screenshotPage(page, screenshotSlug('app-student', route));
    }
  });
});

test.describe('Capture app pages — mentor', () => {
  test.use({ storageState: E2E_AUTH_FILES.mentor });

  test('app pages — mentor', async ({ page, seedState }) => {
    const routes = ['/app', '/app/mentorias', '/app/conversas', `/app/conversas/${seedState.conversationId}`];

    for (const route of routes) {
      await navigateForEvidence(page, route);
      await screenshotPage(page, screenshotSlug('app-mentor', route));
    }
  });
});

test.describe('Capture admin pages', () => {
  test.use({ storageState: E2E_AUTH_FILES.admin });

  test('admin pages', async ({ page, seedState }) => {
    test.setTimeout(120_000);
    const routes = [
      '/admin',
      '/admin/roles',
      '/admin/roles/nova',
      `/admin/roles/${seedState.roleId}`,
      '/admin/usuarias',
      '/admin/usuarias/nova',
      `/admin/usuarias/${seedState.studentUserId}`,
    ];

    for (const route of routes) {
      await navigateForEvidence(page, route);
      await screenshotPage(page, screenshotSlug('admin', route));
    }
  });
});

test.describe('Capture admin sem-permissao', () => {
  test.use({ storageState: E2E_AUTH_FILES.student });

  test('admin sem-permissao — student', async ({ page }) => {
    await navigateForEvidence(page, '/admin/sem-permissao');
    await screenshotPage(page, screenshotSlug('admin', '/admin/sem-permissao'));
  });
});
