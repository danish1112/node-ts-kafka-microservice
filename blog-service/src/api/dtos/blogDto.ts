import { z } from 'zod';

export const CreateBlogDto = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  authorId: z.string().uuid()
});

export const UpdateBlogDto = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional()
});

export type CreateBlogDtoType = z.infer<typeof CreateBlogDto>;
export type UpdateBlogDtoType = z.infer<typeof UpdateBlogDto>;