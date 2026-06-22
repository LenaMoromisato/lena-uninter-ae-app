import { acceptMentorshipRequest } from '../helpers/accept-mentorship';
import { getE2eCredentials } from '../seed/seed-data';
import { loginAs, registerViaApi } from '../helpers/auth';
import { expect, test } from '../fixtures/test-fixtures';
import { waitForSwagger } from '../helpers/wait-for-app';

const creds = getE2eCredentials();

test.describe('MVP journey RF01–RF08', () => {
  test('full platform flow with video evidence', async ({ page, browser, seedState }) => {
    test.setTimeout(180_000);

    const journeyEmail = `e2e-journey-${Date.now()}@test.local`;
    const journeyPassword = 'Journey123!';
    const journeyMessage = `Quero aprender sobre testes E2E com Playwright (${journeyEmail}).`;

    // RF01 — cadastro (API + tela)
    await page.goto('/cadastro');
    await expect(page.getByText('Criar conta', { exact: true }).first()).toBeVisible();
    await registerViaApi({
      firstName: 'Journey',
      lastName: 'Student',
      email: journeyEmail,
      password: journeyPassword,
      roleCode: 'STUDENT',
      profile: { workArea: 'QA', programmingLanguages: ['TypeScript'] },
    });

    // RF02 — login via UI
    await page.goto('/entrar');
    await page.locator('#email').fill(journeyEmail);
    await page.locator('#password').fill(journeyPassword);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('**/app**');

    // RF03 — perfil
    await page.goto('/app/perfil');
    await page.locator('#workArea').fill('Quality Assurance');
    await page.locator('#languages').fill('TypeScript, Playwright');
    await page.locator('#linkedinUrl').fill('https://www.linkedin.com/in/journey-student');
    const profileSave = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/users/me') && response.request().method() === 'PATCH'
    );
    await page.getByRole('button', { name: 'Salvar perfil' }).click();
    expect((await profileSave).ok()).toBeTruthy();

    // RF04/RNF05 — descobrir e abrir perfil da mentora
    await page.goto('/app/descobrir');
    await page.locator('#q').fill('E2E');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await page.goto(`/app/descobrir/${seedState.mentorUserId}`);

    // RF06 — solicitar mentoria
    await expect(page.getByText('Solicitar mentoria')).toBeVisible();
    await page.getByPlaceholder('Conte o que voce gostaria de aprender').fill(journeyMessage);
    await page.getByRole('button', { name: 'Enviar solicitacao' }).click();
    await expect(page.getByText('Solicitacao enviada', { exact: false })).toBeVisible({ timeout: 10_000 });

    // RF07 — mentora aceita (novo contexto)
    const mentorContext = await browser.newContext();
    const mentorPage = await mentorContext.newPage();
    await loginAs(mentorPage, creds.mentorEmail, creds.mentorPassword);
    await acceptMentorshipRequest(mentorPage, {
      studentFullName: 'Journey Student',
      message: journeyMessage,
    });

    // RF08 — mensagens assincronas
    const conversationUrl = mentorPage.url();
    await mentorPage.getByPlaceholder('Escreva uma mensagem...').fill('Ola! Vamos comecar a mentoria E2E.');
    await mentorPage.getByRole('button', { name: 'Enviar' }).click();
    await expect(mentorPage.getByText('Ola! Vamos comecar a mentoria E2E.')).toBeVisible({
      timeout: 10_000,
    });

    await page.goto(conversationUrl);
    await expect(page.getByText('Ola! Vamos comecar a mentoria E2E.')).toBeVisible({
      timeout: 10_000,
    });
    await page.reload();
    await expect(page.getByText('Ola! Vamos comecar a mentoria E2E.')).toBeVisible();

    // RNF07 — Swagger
    await page.goto('/api/docs');
    await waitForSwagger(page);
    await expect(page.locator('.swagger-ui')).toBeVisible();

    await mentorContext.close();
  });
});
