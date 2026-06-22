import { expect, type Page } from '@playwright/test';
import { gotoAndSettle } from './wait-for-app';

type AcceptMentorshipInput = {
  studentFullName?: string;
  message?: string;
};

export async function acceptMentorshipRequest(page: Page, input: AcceptMentorshipInput) {
  await gotoAndSettle(page, '/app/mentorias');
  await expect(page.getByRole('heading', { name: 'Recebidas' })).toBeVisible({ timeout: 15_000 });

  const received = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Recebidas' }),
  });

  let card = received.locator('[data-slot="card"]').filter({
    has: page.getByRole('button', { name: 'Aceitar' }),
  });

  if (input.studentFullName) {
    card = card.filter({ hasText: `De: ${input.studentFullName}` });
  }

  if (input.message) {
    card = card.filter({ hasText: input.message });
  }

  const target = card.last();
  await expect(target).toBeVisible({ timeout: 15_000 });
  await target.getByRole('button', { name: 'Aceitar' }).click();
  await page.waitForURL('**/app/conversas/**', { timeout: 15_000 });
}
