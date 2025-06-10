import { z } from 'zod';

export const RegisterUserDto = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8)
});

export const LoginUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type RegisterUserDtoType = z.infer<typeof RegisterUserDto>;
export type LoginUserDtoType = z.infer<typeof LoginUserDto>;