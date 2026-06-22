import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedE2eDomain } from './seed-domain.js';
import { SEED_STATE_PATH } from './seed-data.js';
import { seedE2eUsers } from './seed-users.js';
import type { SeedState } from './types.js';

const e2eDir = path.dirname(fileURLToPath(new URL('../', import.meta.url)));
const rootDir = path.resolve(e2eDir, '..');

loadEnv({ path: path.join(rootDir, '.env') });
loadEnv({ path: path.join(e2eDir, '.env'), override: true });

async function main() {
  console.log('Seeding E2E users...');
  const users = await seedE2eUsers();

  console.log('Seeding E2E domain data...');
  const state: SeedState = await seedE2eDomain({
    studentUserId: users.student.id,
    mentorUserId: users.mentor.id,
    adminUserId: users.admin.id,
  });

  const statePath = fileURLToPath(SEED_STATE_PATH);
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  console.log('E2E seed complete:', statePath);
  console.log(JSON.stringify(state, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
