import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Prisma, PrismaClient } from '../../src/core/lib/prisma/client.js';
import { getE2eCredentials } from './seed-data.js';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required for E2E seed`);
  }
  return value;
}

function createPrisma() {
  const adapter = new PrismaPg({
    connectionString: getRequiredEnv('DATABASE_URL'),
  });
  return new PrismaClient({ adapter });
}

function createAdminSupabaseClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required for E2E seed');
  }
  return createClient(url, getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function findSupabaseUserByEmail(adminClient: SupabaseClient, email: string) {
  let page = 1;
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(`Failed to list Supabase users: ${error.message}`);
    }
    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase()
    );
    if (user) return user;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

type SeedUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleCode: 'STUDENT' | 'MENTOR' | 'SUPER_ADMIN';
  profile?: {
    workArea?: string;
    programmingLanguages?: string[];
    experienceYears?: number;
  };
};

async function ensureAuthUser(
  adminClient: SupabaseClient,
  input: Pick<SeedUserInput, 'email' | 'password' | 'firstName' | 'lastName' | 'roleCode'>
) {
  const existing = await findSupabaseUserByEmail(adminClient, input.email);
  if (existing) {
    const { data, error } = await adminClient.auth.admin.updateUserById(existing.id, {
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        firstName: input.firstName,
        lastName: input.lastName,
        roleCode: input.roleCode,
        seeded: true,
        e2e: true,
      },
    });
    if (error || !data.user) {
      throw new Error(`Failed to update E2E user ${input.email}: ${error?.message}`);
    }
    return data.user;
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      firstName: input.firstName,
      lastName: input.lastName,
      roleCode: input.roleCode,
      seeded: true,
      e2e: true,
    },
  });
  if (error || !data.user) {
    throw new Error(`Failed to create E2E user ${input.email}: ${error?.message}`);
  }
  return data.user;
}

async function ensurePrismaUser(prisma: PrismaClient, input: SeedUserInput, supabaseAuthUserId: string) {
  const role = await prisma.role.findUniqueOrThrow({ where: { code: input.roleCode } });
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      supabaseAuthUserId,
      firstName: input.firstName,
      lastName: input.lastName,
      primaryRoleId: role.id,
      meta: { seeded: true, e2e: true },
      profile: {
        upsert: {
          create: {
            workArea: input.profile?.workArea ?? 'Tecnologia',
            programmingLanguages: input.profile?.programmingLanguages ?? ['TypeScript'],
            experienceYears: input.profile?.experienceYears ?? 3,
          },
          update: {
            workArea: input.profile?.workArea ?? 'Tecnologia',
            programmingLanguages: input.profile?.programmingLanguages ?? ['TypeScript'],
            experienceYears: input.profile?.experienceYears ?? 3,
          },
        },
      },
    },
    create: {
      supabaseAuthUserId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      primaryRoleId: role.id,
      meta: { seeded: true, e2e: true },
      profile: {
        create: {
          workArea: input.profile?.workArea ?? 'Tecnologia',
          programmingLanguages: input.profile?.programmingLanguages ?? ['TypeScript'],
          experienceYears: input.profile?.experienceYears ?? 3,
        },
      },
    },
  });
}

export async function seedE2eUsers() {
  const prisma = createPrisma();
  const adminClient = createAdminSupabaseClient();
  const creds = getE2eCredentials();

  const roleCount = await prisma.role.count();
  if (roleCount === 0) {
    throw new Error('RBAC not seeded. Run `pnpm db:seed` before `pnpm e2e:seed`.');
  }

  const users = [
    {
      email: creds.studentEmail,
      password: creds.studentPassword,
      firstName: 'E2E',
      lastName: 'Student',
      roleCode: 'STUDENT' as const,
      profile: {
        workArea: 'Frontend',
        programmingLanguages: ['TypeScript', 'React'],
        experienceYears: 1,
      },
    },
    {
      email: creds.mentorEmail,
      password: creds.mentorPassword,
      firstName: 'E2E',
      lastName: 'Mentor',
      roleCode: 'MENTOR' as const,
      profile: {
        workArea: 'Engenharia de Software',
        programmingLanguages: ['TypeScript', 'Node.js'],
        experienceYears: 8,
      },
    },
    {
      email: creds.adminEmail,
      password: creds.adminPassword,
      firstName: 'E2E',
      lastName: 'Admin',
      roleCode: 'SUPER_ADMIN' as const,
      profile: {
        workArea: 'Plataforma',
        programmingLanguages: ['TypeScript', 'SQL'],
        experienceYears: 10,
      },
    },
  ];

  const result: Record<'student' | 'mentor' | 'admin', { id: string }> = {
    student: { id: '' },
    mentor: { id: '' },
    admin: { id: '' },
  };

  try {
    for (const spec of users) {
      const authUser = await ensureAuthUser(adminClient, spec);
      const dbUser = await ensurePrismaUser(prisma, spec, authUser.id);
      if (spec.roleCode === 'STUDENT') result.student.id = dbUser.id;
      if (spec.roleCode === 'MENTOR') result.mentor.id = dbUser.id;
      if (spec.roleCode === 'SUPER_ADMIN') result.admin.id = dbUser.id;
    }
    return result;
  } finally {
    await prisma.$disconnect();
  }
}
