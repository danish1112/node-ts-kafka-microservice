import { z } from 'zod';

export const CreateNotificationDto = z.object({
  userId: z.string().uuid(),
  message: z.string().min(1).max(500),
  type: z.enum(['email', 'in-app'])
});

export type CreateNotificationDtoType = z.infer<typeof CreateNotificationDto>;