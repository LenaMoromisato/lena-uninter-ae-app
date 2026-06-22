import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.string().min(1),
  parentMessageId: z.string().uuid().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
