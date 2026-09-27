import { z } from 'zod';
export const reviewDto = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().min(5).max(3000) });
export const replyDto = z.object({ reply: z.string().trim().min(1).max(3000) });
