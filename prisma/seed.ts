import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Prisma, PrismaClient } from '../src/core/lib/prisma/client.js';

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Environment variable ${name} is required for the seed flow`
    );
  }

  return value;
}

const adapter = new PrismaPg({
  connectionString: getRequiredEnv('DATABASE_URL'),
});

const prisma = new PrismaClient({ adapter });

const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR',
  STUDENT: 'STUDENT',
};

const PERMISSIONS = [
  ['users.read', 'users', 'read', 'Ler usuarias'],
  ['users.write', 'users', 'write', 'Criar usuarias'],
  ['users.update', 'users', 'update', 'Atualizar usuarias'],
  ['users.manage', 'users', 'manage', 'Gerenciar usuarias'],
  ['roles.read', 'roles', 'read', 'Ler roles'],
  ['roles.write', 'roles', 'write', 'Criar roles'],
  ['roles.update', 'roles', 'update', 'Atualizar roles'],
  ['roles.manage', 'roles', 'manage', 'Gerenciar roles'],
  ['permissions.read', 'permissions', 'read', 'Ler permissoes'],
  ['profiles.read', 'profiles', 'read', 'Ler perfis'],
  ['profiles.update', 'profiles', 'update', 'Atualizar perfis'],
  [
    'mentorship_requests.read',
    'mentorship_requests',
    'read',
    'Ler solicitacoes de mentoria',
  ],
  [
    'mentorship_requests.write',
    'mentorship_requests',
    'write',
    'Criar solicitacoes de mentoria',
  ],
  [
    'mentorship_requests.manage',
    'mentorship_requests',
    'manage',
    'Responder solicitacoes de mentoria',
  ],
  ['conversations.read', 'conversations', 'read', 'Ler conversas'],
  ['messages.read', 'messages', 'read', 'Ler mensagens'],
  ['messages.write', 'messages', 'write', 'Enviar mensagens'],
  ['notifications.read', 'notifications', 'read', 'Ler notificacoes'],
  ['notifications.update', 'notifications', 'update', 'Atualizar notificacoes'],
  ['events.read', 'events', 'read', 'Ler eventos'],
  ['events.write', 'events', 'write', 'Criar eventos'],
  ['events.update', 'events', 'update', 'Atualizar eventos'],
  ['events.manage', 'events', 'manage', 'Gerenciar eventos'],
  [
    'event_registrations.write',
    'event_registrations',
    'write',
    'Inscrever-se em eventos',
  ],
] as const;

const ROLE_PERMISSION_CODES = {
  SUPER_ADMIN: PERMISSIONS.map(([code]) => code),
  ADMIN: [
    'users.read',
    'users.write',
    'users.update',
    'roles.read',
    'roles.write',
    'roles.update',
    'roles.manage',
    'permissions.read',
    'profiles.read',
    'profiles.update',
    'mentorship_requests.read',
    'mentorship_requests.manage',
    'conversations.read',
    'messages.read',
    'notifications.read',
    'notifications.update',
    'events.read',
    'events.write',
    'events.update',
    'events.manage',
  ],
  MENTOR: [
    'profiles.read',
    'profiles.update',
    'mentorship_requests.read',
    'mentorship_requests.manage',
    'conversations.read',
    'messages.read',
    'messages.write',
    'notifications.read',
    'notifications.update',
    'events.read',
    'events.write',
    'events.update',
    'event_registrations.write',
  ],
  STUDENT: [
    'profiles.read',
    'profiles.update',
    'mentorship_requests.read',
    'mentorship_requests.write',
    'conversations.read',
    'messages.read',
    'messages.write',
    'notifications.read',
    'notifications.update',
    'events.read',
    'event_registrations.write',
  ],
};

function createAdminSupabaseClient() {
  return createClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

async function findSupabaseUserByEmail(
  adminClient: SupabaseClient,
  email: string
) {
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(`Failed to list Supabase Auth users: ${error.message}`);
    }

    const user = data.users.find(
      (candidate: { email?: string | null }) =>
        candidate.email?.toLowerCase() === email.toLowerCase()
    );
    if (user) {
      return user;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureSeededSuperAdminAuthUser(email: string) {
  const password = getRequiredEnv('SEED_SUPER_ADMIN_PASSWORD');
  const adminClient = createAdminSupabaseClient();
  const existingUser = await findSupabaseUserByEmail(adminClient, email);

  if (existingUser) {
    const { data, error } = await adminClient.auth.admin.updateUserById(
      existingUser.id,
      {
        email,
        password,
        email_confirm: true,
        user_metadata: {
          firstName: 'Super',
          lastName: 'Admin',
          roleCode: ROLE_CODES.SUPER_ADMIN,
          seeded: true,
        },
      }
    );

    if (error || !data.user) {
      throw new Error(
        `Failed to update seeded super admin in Supabase Auth: ${error?.message ?? 'unknown error'}`
      );
    }

    return data.user;
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: 'Super',
      lastName: 'Admin',
      roleCode: ROLE_CODES.SUPER_ADMIN,
      seeded: true,
    },
  });

  if (error || !data.user) {
    throw new Error(
      `Failed to create seeded super admin in Supabase Auth: ${error?.message ?? 'unknown error'}`
    );
  }

  return data.user;
}

/**
 * Seeds roles, permissions, default associations, and sample data.
 */
async function main() {
  for (const [code, resource, action, label] of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: { resource, action, label, isSystem: true },
      create: { code, resource, action, label, isSystem: true },
    });
  }

  const roles = [
    ['SUPER_ADMIN', 'Super administradora'],
    ['ADMIN', 'Administradora'],
    ['MENTOR', 'Mentora'],
    ['STUDENT', 'Aluna'],
  ] as const;

  for (const [code, label] of roles) {
    await prisma.role.upsert({
      where: { code },
      update: { label, isSystem: true },
      create: {
        code,
        label,
        isSystem: true,
      },
    });
  }

  for (const [roleCode, permissionCodes] of Object.entries(
    ROLE_PERMISSION_CODES
  )) {
    const role = await prisma.role.findUniqueOrThrow({
      where: { code: roleCode },
    });
    for (const permissionCode of permissionCodes) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { code: permissionCode },
      });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL;
  if (superAdminEmail) {
    const seededAuthUser =
      await ensureSeededSuperAdminAuthUser(superAdminEmail);
    const role = await prisma.role.findUniqueOrThrow({
      where: { code: ROLE_CODES.SUPER_ADMIN },
    });
    await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {
        supabaseAuthUserId: seededAuthUser.id,
        firstName: 'Super',
        lastName: 'Admin',
        primaryRoleId: role.id,
        meta: {
          seeded: true,
          authProvisioned: true,
        },
      },
      create: {
        supabaseAuthUserId: seededAuthUser.id,
        email: superAdminEmail,
        firstName: 'Super',
        lastName: 'Admin',
        primaryRoleId: role.id,
        meta: {
          seeded: true,
          authProvisioned: true,
        },
        profile: {
          create: {
            programmingLanguages: ['TypeScript', 'SQL'],
            workArea: 'Plataforma',
            experienceYears: 10,
            education: {
              degree: 'Computer Science',
            },
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    ) {
      console.error(
        'Seed aborted because the application tables do not exist yet. Run `npm run db:push` or `npm run db:migrate` before `npm run db:seed`.'
      );
    } else {
      console.error(error);
    }
    await prisma.$disconnect();
    process.exit(1);
  });
