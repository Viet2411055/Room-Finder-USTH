import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import * as controller from './booking.controller.js';
export const bookingRouter = Router();
bookingRouter.post('/bookings/quote', requireAuth, controller.quote);
bookingRouter.post('/bookings', requireAuth, controller.create);
bookingRouter.get('/trips', requireAuth, controller.listTrips);
bookingRouter.get('/trips/:bookingId', requireAuth, controller.getTrip);
bookingRouter.post('/trips/:bookingId/cancel', requireAuth, controller.cancel);
