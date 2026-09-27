import { Router } from 'express';
import { authorize, requireAuth } from '../auth/auth.middleware.js';
import * as controller from './review.controller.js';
export const reviewRouter = Router();
reviewRouter.get('/me/reviews', requireAuth, controller.mine);
reviewRouter.post('/bookings/:bookingId/review', requireAuth, controller.create);
reviewRouter.get('/host/reviews', requireAuth, authorize('HOST'), controller.listForHost);
reviewRouter.put('/host/reviews/:reviewId/reply', requireAuth, authorize('HOST'), controller.reply);
