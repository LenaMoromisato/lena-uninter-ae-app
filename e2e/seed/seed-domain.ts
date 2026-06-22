import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/core/lib/prisma/client.js';
import type { SeedState } from './types.js';

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

export async function seedE2eDomain(input: {
  studentUserId: string;
  mentorUserId: string;
  adminUserId: string;
}): Promise<Omit<SeedState, never>> {
  const prisma = createPrisma();

  try {
    const mentorRole = await prisma.role.findUniqueOrThrow({ where: { code: 'MENTOR' } });

    const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);

    const existingEvent = await prisma.event.findFirst({
      where: { title: 'Workshop E2E — Carreira em Tech' },
    });

    const event = existingEvent
      ? await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            description: 'Evento de demonstracao para testes E2E da plataforma TechSisters.',
            status: 'PUBLISHED',
            isOnline: true,
            location: 'Sao Paulo/SP (online)',
            startsAt,
            endsAt,
            createdById: input.mentorUserId,
          },
        })
      : await prisma.event.create({
          data: {
            title: 'Workshop E2E — Carreira em Tech',
            description: 'Evento de demonstracao para testes E2E da plataforma TechSisters.',
            status: 'PUBLISHED',
            isOnline: true,
            location: 'Sao Paulo/SP (online)',
            startsAt,
            endsAt,
            createdById: input.mentorUserId,
          },
        });

    let mentorship = await prisma.mentorshipRequest.findFirst({
      where: {
        studentId: input.studentUserId,
        mentorId: input.mentorUserId,
        status: 'ACCEPTED',
      },
    });

    if (!mentorship) {
      mentorship = await prisma.mentorshipRequest.create({
        data: {
          studentId: input.studentUserId,
          mentorId: input.mentorUserId,
          message: 'Gostaria de orientacao sobre transicao de carreira para desenvolvimento web.',
          status: 'ACCEPTED',
          responseMessage: 'Feliz em ajudar!',
          respondedAt: new Date(),
        },
      });
    } else {
      mentorship = await prisma.mentorshipRequest.update({
        where: { id: mentorship.id },
        data: {
          status: 'ACCEPTED',
          responseMessage: 'Feliz em ajudar!',
          respondedAt: new Date(),
        },
      });
    }

    let conversation = await prisma.conversation.findFirst({
      where: { mentorshipRequestId: mentorship.id },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          mentorshipRequestId: mentorship.id,
          participants: {
            create: [
              { userId: input.studentUserId },
              { userId: input.mentorUserId },
            ],
          },
        },
      });
    }

    const existingMessage = await prisma.message.findFirst({
      where: { conversationId: conversation.id },
    });

    if (!existingMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: input.mentorUserId,
          body: 'Ola! Seja bem-vinda a mentoria E2E.',
        },
      });
    }

    await prisma.notification.deleteMany({
      where: {
        userId: input.studentUserId,
        title: 'Notificacao E2E de teste',
      },
    });

    await prisma.notification.create({
      data: {
        userId: input.studentUserId,
        type: 'NEW_MESSAGE',
        title: 'Notificacao E2E de teste',
        body: 'Voce tem uma nova mensagem na mentoria E2E.',
        data: { conversationId: conversation.id },
      },
    });

    return {
      studentUserId: input.studentUserId,
      mentorUserId: input.mentorUserId,
      adminUserId: input.adminUserId,
      conversationId: conversation.id,
      eventId: event.id,
      roleId: mentorRole.id,
      mentorshipRequestId: mentorship.id,
    };
  } finally {
    await prisma.$disconnect();
  }
}
