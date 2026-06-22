import { fetchApiIndex, fetchOpenApiSpec } from '../helpers/api';
import { expect, test } from '../fixtures/test-fixtures';
import { waitForSwagger } from '../helpers/wait-for-app';

test.describe('Swagger / API docs', () => {
  test('RNF07 — OpenAPI JSON is available', async () => {
    const spec = await fetchOpenApiSpec();
    expect(spec.paths['/v1/auth/login']).toBeDefined();
    expect(spec.paths['/v1/mentorship-requests']).toBeDefined();
    expect(spec.paths['/v1/conversations/{conversationId}/messages']).toBeDefined();
  });

  test('RNF07 — API index returns metadata', async () => {
    const index = (await fetchApiIndex()) as { docs?: string; openapi?: string };
    expect(index.docs).toContain('/api/docs');
    expect(index.openapi).toContain('/api/v1/openapi.json');
  });

  test('Swagger UI loads at /api/docs', async ({ page }) => {
    await page.goto('/api/docs');
    await waitForSwagger(page);
    await expect(page.locator('.swagger-ui')).toBeVisible();
    await expect(page.locator('.information-container')).toBeVisible();
  });
});
