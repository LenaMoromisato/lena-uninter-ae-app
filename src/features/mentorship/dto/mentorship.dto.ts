import { z } from 'zod';

export const createMentorshipRequestSchema = z.object({
  mentorId: z.string().uuid(),
  message: z.string().min(1),
});

export const respondMentorshipRequestSchema = z.object({
  responseMessage: z.string().optional(),
});

export type CreateMentorshipRequestInput = z.infer<typeof createMentorshipRequestSchema>;
export type RespondMentorshipRequestInput = z.infer<typeof respondMentorshipRequestSchema>;
