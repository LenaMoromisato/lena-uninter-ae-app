import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  isOnline: z.boolean().optional(),
  relevanceScore: z.number().int().optional(),
  capacity: z.number().int().positive().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
