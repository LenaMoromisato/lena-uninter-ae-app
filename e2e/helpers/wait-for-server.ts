import { getBaseUrl } from './env';

export async function waitForServerReady(baseURL = getBaseUrl()) {
  const deadline = Date.now() + 120_000;
  let lastError = 'unknown';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseURL}/api`);
      if (response.ok) {
        return;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `Servidor indisponivel em ${baseURL}/api (${lastError}). ` +
      'Inicie com `pnpm dev:e2e` ou deixe o Playwright subir o webServer.'
  );
}
