import { z } from 'zod';

export const registerDto = z.object({
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(8).max(50).optional(),
});
export const otpDto = z.object({ email: z.string().trim().email(), otp: z.string().regex(/^\d{6}$/) });
export const emailDto = otpDto.pick({ email: true });
export const loginDto = z.object({ identity: z.string().trim().min(3).max(255), password: z.string().min(8).max(72) });
export const resetDto = otpDto.extend({ password: z.string().min(8).max(72) });

export type RegisterInput = z.infer<typeof registerDto>;
