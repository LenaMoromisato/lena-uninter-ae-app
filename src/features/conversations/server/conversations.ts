import { forbidden, notFound } from '@core/api/api-error';
import { buildPaginationMeta, parsePagination } from '@core/api/pagination';
import { asJsonValue } from '@core/utils/as-json-value';
import { toIsoString } from '@core/utils/to-iso-string';
import { db } from '@core/lib/db';
import type { CreateMessageInput } from '@features/conversations/dto/conversation.dto';
import { mapUserResponse } from '@features/users/utils/map-user';

async function assertParticipant(conversationId: string, userId: string) {
  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant) {
    throw forbidden('Voce nao participa desta conversa.');
  }
}

function mapConversation(conversation: Awaited<ReturnType<typeof getConversationRecord>>) {
  return {
    id: conversation.id,
    mentorshipRequestId: conversation.mentorshipRequestId,
    participants: conversation.participants.map((participant) => ({
      id: participant.id,
      user: mapUserResponse(participant.user as never),
      joinedAt: toIsoString(participant.createdAt),
    })),
    createdAt: toIsoString(conversation.createdAt),
    updatedAt: toIsoString(conversation.updatedAt),
  };
}

async function getConversationRecord(conversationId: string) {
  return db.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            include: {
              primaryRole: {
                include: { rolePermissions: { include: { permission: true } } },
              },
              profile: true,
            },
          },
        },
      },
    },
  });
}

export async function listConversations(userId: string) {
  const conversations = await db.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: {
          user: {
            include: {
              primaryRole: {
                include: { rolePermissions: { include: { permission: true } } },
              },
              profile: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map(mapConversation);
}

export async function getConversation(conversationId: string, userId: string) {
  await assertParticipant(conversationId, userId);
  const conversation = await getConversationRecord(conversationId);
  return mapConversation(conversation);
}

const messageInclude = {
  sender: {
    include: {
      primaryRole: {
        include: { rolePermissions: { include: { permission: true } } },
      },
      profile: true,
    },
  },
} as const;

type MessageWithSender = Awaited<
  ReturnType<
    typeof db.message.findFirstOrThrow<{
      include: typeof messageInclude;
    }>
  >
>;

function mapMessage(message: MessageWithSender) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    body: message.body,
    parentMessageId: message.parentMessageId,
    meta: message.meta,
    sender: mapUserResponse(message.sender),
    createdAt: toIsoString(message.createdAt),
    updatedAt: toIsoString(message.updatedAt),
  };
}

export async function listMessages(
  conversationId: string,
  userId: string,
  searchParams: URLSearchParams
) {
  await assertParticipant(conversationId, userId);
  const pagination = parsePagination(searchParams);

  const where = { conversationId };
  const [total, messages] = await Promise.all([
    db.message.count({ where }),
    db.message.findMany({
      where,
      include: messageInclude,
      orderBy: { createdAt: 'asc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
  ]);

  return {
    items: messages.map(mapMessage),
    meta: buildPaginationMeta(total, pagination),
  };
}

export async function sendMessage(
  conversationId: string,
  userId: string,
  input: CreateMessageInput
) {
  await assertParticipant(conversationId, userId);

  const message = await db.message.create({
    data: {
      conversationId,
      senderId: userId,
      body: input.body,
      parentMessageId: input.parentMessageId,
      meta: asJsonValue(input.meta),
    },
    include: messageInclude,
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const otherParticipants = await db.conversationParticipant.findMany({
    where: {
      conversationId,
      userId: { not: userId },
    },
  });

  await db.notification.createMany({
    data: otherParticipants.map((participant) => ({
      userId: participant.userId,
      type: 'NEW_MESSAGE' as const,
      title: 'Nova mensagem',
      body: 'Voce recebeu uma nova mensagem.',
      data: { conversationId, messageId: message.id },
    })),
  });

  return mapMessage(message);
}
