import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import * as controller from './wishlist.controller.js';
export const wishlistRouter = Router();
wishlistRouter.get('/wishlists', requireAuth, controller.list);
wishlistRouter.get('/wishlists/:listingId', requireAuth, controller.status);
wishlistRouter.put('/wishlists/:listingId', requireAuth, controller.add);
wishlistRouter.delete('/wishlists/:listingId', requireAuth, controller.remove);
