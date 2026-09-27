import type { Request, Response } from 'express';
import { profileDto } from './user.dto.js';
import * as users from './user.service.js';
export async function updateMe(req: Request, res: Response) { res.json({ data: await users.updateMe(req.auth!.userId, profileDto.parse(req.body)) }); }
