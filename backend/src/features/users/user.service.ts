import { presentUser } from '../auth/auth.presenter.js';
import type { z } from 'zod';
import type { profileDto } from './user.dto.js';
import { userRepository as repo } from './user.repository.js';
export async function updateMe(id: string, input: z.infer<typeof profileDto>) { return presentUser(await repo.updateMe(id, input)); }
