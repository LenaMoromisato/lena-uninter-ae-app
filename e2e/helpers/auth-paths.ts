import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const E2E_AUTH_DIR = path.join(e2eDir, '.auth');

export const E2E_AUTH_FILES = {
  student: path.join(E2E_AUTH_DIR, 'student.json'),
  mentor: path.join(E2E_AUTH_DIR, 'mentor.json'),
  admin: path.join(E2E_AUTH_DIR, 'admin.json'),
} as const;
