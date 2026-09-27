import type { Request, Response } from 'express';
import * as wishlists from './wishlist.service.js';
export async function list(req: Request, res: Response) { res.json({ data: await wishlists.list(req.auth!.userId) }); }
export async function status(req: Request, res: Response) { res.json({ data: await wishlists.status(req.auth!.userId, String(req.params.listingId)) }); }
export async function add(req: Request, res: Response) { await wishlists.add(req.auth!.userId, String(req.params.listingId)); res.status(204).end(); }
export async function remove(req: Request, res: Response) { await wishlists.remove(req.auth!.userId, String(req.params.listingId)); res.status(204).end(); }
