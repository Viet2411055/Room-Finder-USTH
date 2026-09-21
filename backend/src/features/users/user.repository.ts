import { prisma } from '../../shared/database/prisma.js';
import type { z } from 'zod';
import type { profileDto } from './user.dto.js';
export const userRepository = { updateMe: (id: string, data: z.infer<typeof profileDto>) => prisma.user.update({ where: { id }, data, include: { hostProfile: true } }) };
