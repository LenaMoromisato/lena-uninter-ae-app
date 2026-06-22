import type { E2eCredentials } from './types.js';

export const DEFAULT_E2E_CREDENTIALS: E2eCredentials = {
  studentEmail: 'e2e-student@test.local',
  studentPassword: 'E2eStudent123!',
  mentorEmail: 'e2e-mentor@test.local',
  mentorPassword: 'E2eMentor123!',
  adminEmail: 'e2e-admin@test.local',
  adminPassword: 'E2eAdmin123!',
};

export function getE2eCredentials(): E2eCredentials {
  return {
    studentEmail: process.env.E2E_STUDENT_EMAIL ?? DEFAULT_E2E_CREDENTIALS.studentEmail,
    studentPassword: process.env.E2E_STUDENT_PASSWORD ?? DEFAULT_E2E_CREDENTIALS.studentPassword,
    mentorEmail: process.env.E2E_MENTOR_EMAIL ?? DEFAULT_E2E_CREDENTIALS.mentorEmail,
    mentorPassword: process.env.E2E_MENTOR_PASSWORD ?? DEFAULT_E2E_CREDENTIALS.mentorPassword,
    adminEmail: process.env.E2E_ADMIN_EMAIL ?? DEFAULT_E2E_CREDENTIALS.adminEmail,
    adminPassword: process.env.E2E_ADMIN_PASSWORD ?? DEFAULT_E2E_CREDENTIALS.adminPassword,
  };
}

export const SEED_STATE_PATH = new URL('../.seed-state.json', import.meta.url);
