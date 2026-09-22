import { Router } from 'express';
import * as controller from './room.controller.js';
export const roomRouter = Router();
roomRouter.get('/', controller.list);
roomRouter.get('/:roomId/availability', controller.availability);
roomRouter.get('/:roomId/reviews', controller.reviews);
roomRouter.get('/:roomId', controller.get);
