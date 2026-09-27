import { Router } from 'express';
import * as controller from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

export const authRouter = Router();
authRouter.post('/register', controller.register);
authRouter.post('/verify-email', controller.verifyEmail);
authRouter.post('/resend-verification', controller.resend);
authRouter.post('/login', controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/forgot-password', controller.forgot);
authRouter.post('/reset-password', controller.reset);
authRouter.get('/me', requireAuth, controller.me);
authRouter.post('/logout', controller.logout);
