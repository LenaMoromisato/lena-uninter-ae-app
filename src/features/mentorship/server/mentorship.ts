import { conflict, forbidden, notFound } from '@core/api/api-error';
import { toIsoString } from '@core/utils/to-iso-string';
import { db } from '@core/lib/db';
import type {
  CreateMentorshipRequestInput,
  RespondMentorshipRequestInput,
} from '@features/mentorship/dto/mentorship.dto';
import { mapUserResponse } from '@features/users/utils/map-user';

const includeRelations = {
  student: {
    include: {
      primaryRole: { include: { rolePermissions: { include: { permission: true } } } },
      profile: true,
    },
  },
  mentor: {
    include: {
      primaryRole: { include: { rolePermissions: { include: { permission: true } } } },
      profile: true,
    },
  },
  conversation: true,
} as const;

type MentorshipWithRelations = Awaited<
  ReturnType<
    typeof db.mentorshipRequest.findFirstOrThrow<{
      include: typeof includeRelations;
    }>
  >
>;

function mapMentorshipRequest(request: MentorshipWithRelations) {
  return {
    id: request.id,
    message: request.message,
    status: request.status,
    responseMessage: request.responseMessage,
    requestedAt: toIsoString(request.requestedAt),
    respondedAt: toIsoString(request.respondedAt),
    student: mapUserResponse(request.student),
    mentor: mapUserResponse(request.mentor),
    conversationId: request.conversation?.id ?? null,
    createdAt: toIsoString(request.createdAt),
    updatedAt: toIsoString(request.updatedAt),
  };
}

export async function listMentorshipRequests(userId: string) {
  const requests = await db.mentorshipRequest.findMany({
    where: {
      OR: [{ studentId: userId }, { mentorId: userId }],
    },
    include: includeRelations,
    orderBy: { createdAt: 'desc' },
  });

  return requests.map(mapMentorshipRequest);
}

export async function createMentorshipRequest(
  studentId: string,
  input: CreateMentorshipRequestInput
) {
  if (studentId === input.mentorId) {
    throw conflict('Nao e possivel solicitar mentoria para si mesma.');
  }

  const mentor = await db.user.findUnique({
    where: { id: input.mentorId },
    include: { primaryRole: true },
  });

  if (!mentor) {
    throw notFound('Mentora nao encontrada.');
  }

  if (mentor.primaryRole.code !== 'MENTOR') {
    throw forbidden('Usuario alvo nao e mentora.');
  }

  const pending = await db.mentorshipRequest.findFirst({
    where: {
      studentId,
      mentorId: input.mentorId,
      status: 'PENDING',
    },
  });

  if (pending) {
    throw conflict('Ja existe solicitacao pendente para esta mentora.');
  }

  const request = await db.mentorshipRequest.create({
    data: {
      studentId,
      mentorId: input.mentorId,
      message: input.message,
    },
    include: includeRelations,
  });

  await db.notification.create({
    data: {
      userId: input.mentorId,
      type: 'MENTORSHIP_REQUEST',
      title: 'Nova solicitacao de mentoria',
      body: 'Voce recebeu uma nova solicitacao de mentoria.',
      data: { mentorshipRequestId: request.id },
    },
  });

  return mapMentorshipRequest(request);
}

async function respondToRequest(
  requestId: string,
  mentorId: string,
  status: 'ACCEPTED' | 'REJECTED',
  input: RespondMentorshipRequestInput
) {
  const request = await db.mentorshipRequest.findUnique({
    where: { id: requestId },
    include: includeRelations,
  });

  if (!request) {
    throw notFound('Solicitacao nao encontrada.');
  }

  if (request.mentorId !== mentorId) {
    throw forbidden('Apenas a mentora enderecada pode responder.');
  }

  if (request.status !== 'PENDING') {
    throw conflict('Solicitacao ja foi respondida.');
  }

  if (status === 'ACCEPTED') {
    const updated = await db.$transaction(async (tx) => {
      await tx.mentorshipRequest.update({
        where: { id: requestId },
        data: {
          status: 'ACCEPTED',
          responseMessage: input.responseMessage,
          respondedAt: new Date(),
        },
      });

      const conversation = await tx.conversation.create({
        data: {
          mentorshipRequestId: requestId,
          participants: {
            create: [
              { userId: request.studentId },
              { userId: request.mentorId },
            ],
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: request.studentId,
          type: 'MENTORSHIP_ACCEPTED',
          title: 'Mentoria aceita',
          body: 'Sua solicitacao de mentoria foi aceita.',
          data: { mentorshipRequestId: requestId, conversationId: conversation.id },
        },
      });

      return tx.mentorshipRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: includeRelations,
      });
    });

    return mapMentorshipRequest(updated);
  }

  const updated = await db.mentorshipRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      responseMessage: input.responseMessage,
      respondedAt: new Date(),
    },
    include: includeRelations,
  });

  await db.notification.create({
    data: {
      userId: request.studentId,
      type: 'MENTORSHIP_REJECTED',
      title: 'Mentoria recusada',
      body: 'Sua solicitacao de mentoria foi recusada.',
      data: { mentorshipRequestId: requestId },
    },
  });

  return mapMentorshipRequest(updated);
}

export async function acceptMentorshipRequest(
  requestId: string,
  mentorId: string,
  input: RespondMentorshipRequestInput
) {
  return respondToRequest(requestId, mentorId, 'ACCEPTED', input);
}

export async function rejectMentorshipRequest(
  requestId: string,
  mentorId: string,
  input: RespondMentorshipRequestInput
) {
  return respondToRequest(requestId, mentorId, 'REJECTED', input);
}
