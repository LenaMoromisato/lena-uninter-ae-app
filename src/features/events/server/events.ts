import { conflict, forbidden, notFound } from '@core/api/api-error';
import { buildPaginationMeta, parsePagination } from '@core/api/pagination';
import { asJsonValue } from '@core/utils/as-json-value';
import { toIsoString } from '@core/utils/to-iso-string';
import { db } from '@core/lib/db';
import type { CreateEventInput } from '@features/events/dto/event.dto';
import { mapUserResponse } from '@features/users/utils/map-user';

const eventInclude = {
  createdBy: {
    include: {
      primaryRole: { include: { rolePermissions: { include: { permission: true } } } },
      profile: true,
    },
  },
  _count: { select: { registrations: true } },
} as const;

type EventWithRelations = Awaited<
  ReturnType<
    typeof db.event.findFirstOrThrow<{
      include: typeof eventInclude;
    }>
  >
>;

function mapEvent(event: EventWithRelations) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    isOnline: event.isOnline,
    relevanceScore: event.relevanceScore,
    capacity: event.capacity,
    startsAt: toIsoString(event.startsAt),
    endsAt: toIsoString(event.endsAt),
    status: event.status,
    meta: event.meta,
    createdBy: mapUserResponse(event.createdBy),
    registrationsCount: event._count.registrations,
    createdAt: toIsoString(event.createdAt),
    updatedAt: toIsoString(event.updatedAt),
  };
}

export async function listEvents(searchParams: URLSearchParams) {
  const pagination = parsePagination(searchParams);
  const [total, events] = await Promise.all([
    db.event.count(),
    db.event.findMany({
      include: eventInclude,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [{ relevanceScore: 'desc' }, { startsAt: 'asc' }],
    }),
  ]);

  return {
    items: events.map(mapEvent),
    meta: buildPaginationMeta(total, pagination),
  };
}

export async function getEvent(eventId: string) {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: eventInclude,
  });

  if (!event) {
    throw notFound('Evento nao encontrado.');
  }

  return mapEvent(event);
}

export async function createEvent(userId: string, input: CreateEventInput) {
  const event = await db.event.create({
    data: {
      createdById: userId,
      title: input.title,
      description: input.description,
      location: input.location,
      isOnline: input.isOnline ?? false,
      relevanceScore: input.relevanceScore ?? 0,
      capacity: input.capacity,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      status: input.status ?? 'DRAFT',
      meta: asJsonValue(input.meta),
    },
    include: eventInclude,
  });

  return mapEvent(event);
}

export async function updateEvent(
  eventId: string,
  userId: string,
  canManage: boolean,
  input: CreateEventInput
) {
  const event = await db.event.findUnique({ where: { id: eventId } });

  if (!event) {
    throw notFound('Evento nao encontrado.');
  }

  if (!canManage && event.createdById !== userId) {
    throw forbidden('Sem permissao para atualizar este evento.');
  }

  const updated = await db.event.update({
    where: { id: eventId },
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      isOnline: input.isOnline,
      relevanceScore: input.relevanceScore,
      capacity: input.capacity,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      status: input.status,
      meta: asJsonValue(input.meta),
    },
    include: eventInclude,
  });

  return mapEvent(updated);
}

export async function registerForEvent(eventId: string, userId: string) {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) {
    throw notFound('Evento nao encontrado.');
  }

  if (event.status === 'CANCELLED') {
    throw conflict('Evento cancelado.');
  }

  if (event.capacity && event._count.registrations >= event.capacity) {
    throw conflict('Evento lotado.');
  }

  const existing = await db.eventRegistration.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (existing?.status === 'REGISTERED') {
    throw conflict('Inscricao ja registrada.');
  }

  const registration = await db.eventRegistration.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: { status: 'REGISTERED' },
    create: { eventId, userId },
  });

  await db.notification.create({
    data: {
      userId,
      type: 'EVENT_REGISTRATION',
      title: 'Inscricao confirmada',
      body: `Inscricao no evento "${event.title}" registrada.`,
      data: { eventId, registrationId: registration.id },
    },
  });

  return {
    id: registration.id,
    eventId: registration.eventId,
    userId: registration.userId,
    status: registration.status,
    createdAt: toIsoString(registration.createdAt),
  };
}
