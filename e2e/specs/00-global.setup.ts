import { config as loadEnv } from 'dotenv';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as setup } from '@playwright/test';
import { loginViaApi } from '../helpers/auth';
import { E2E_AUTH_DIR, E2E_AUTH_FILES } from '../helpers/auth-paths';
import { saveStorageStateFromSession } from '../helpers/save-storage-state';
import { waitForServerReady } from '../helpers/wait-for-server';
import { writeTraceabilityReport } from '../helpers/write-traceability-report';
import { getE2eCredentials } from '../seed/seed-data';

const specsDir = path.dirname(fileURLToPath(import.meta.url));
const e2eDir = path.resolve(specsDir, '..');
const rootDir = path.resolve(e2eDir, '..');

loadEnv({ path: path.join(rootDir, '.env') });
loadEnv({ path: path.join(e2eDir, '.env'), override: true });

setup('prepare e2e data and output dirs', async () => {
  mkdirSync(path.join(e2eDir, 'output/screenshots'), { recursive: true });
  mkdirSync(path.join(e2eDir, 'output/videos'), { recursive: true });
  mkdirSync(path.join(e2eDir, 'output/report'), { recursive: true });
  mkdirSync(E2E_AUTH_DIR, { recursive: true });

  const seedStatePath = path.join(e2eDir, '.seed-state.json');

  if (process.env.E2E_SKIP_SEED === '1') {
    if (!existsSync(seedStatePath)) {
      throw new Error(
        'E2E_SKIP_SEED=1, mas e2e/.seed-state.json nao existe. Rode `pnpm e2e:seed` antes dos testes.'
      );
    }
  } else {
    execSync('pnpm e2e:seed', { stdio: 'inherit', cwd: rootDir, env: process.env });
  }

  writeTraceabilityReport();
});

setup('verify application server and admin login', async () => {
  await waitForServerReady();

  const creds = getE2eCredentials();
  try {
    await loginViaApi(creds.adminEmail, creds.adminPassword);
  } catch (error) {
    const hint =
      process.env.E2E_USE_EXTERNAL_SERVER === '1'
        ? 'Confirme que `pnpm dev:e2e` esta rodando (nao use `pnpm dev`/Turbopack).'
        : 'Pare qualquer `pnpm dev` na porta 3000 e deixe o Playwright subir `pnpm dev:e2e`.';

    throw new Error(`${error instanceof Error ? error.message : error}\n${hint}`);
  }
});

setup('save authenticated storage states', async () => {
  await waitForServerReady();

  const creds = getE2eCredentials();
  const roles = [
    { name: 'student' as const, email: creds.studentEmail, password: creds.studentPassword },
    { name: 'mentor' as const, email: creds.mentorEmail, password: creds.mentorPassword },
    { name: 'admin' as const, email: creds.adminEmail, password: creds.adminPassword },
  ];

  for (const role of roles) {
    try {
      const session = await loginViaApi(role.email, role.password);
      saveStorageStateFromSession(session, E2E_AUTH_FILES[role.name]);
    } catch (error) {
      throw new Error(
        `Falha ao salvar sessao ${role.name} (${role.email}): ${error instanceof Error ? error.message : error}`
      );
    }
  }
});
