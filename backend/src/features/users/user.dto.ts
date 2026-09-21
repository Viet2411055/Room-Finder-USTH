import { z } from 'zod';
export const profileDto = z.object({ name: z.string().min(2).max(150).optional(), phone: z.string().max(50).nullable().optional(), avatarUrl: z.string().url().nullable().optional(), bio: z.string().max(5000).nullable().optional() });
