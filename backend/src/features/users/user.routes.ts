import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import * as controller from './user.controller.js';
export const userRouter = Router();
userRouter.patch('/users/me', requireAuth, controller.updateMe);
