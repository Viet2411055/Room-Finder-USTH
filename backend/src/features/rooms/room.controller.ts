import type { Request, Response } from 'express';
import { roomQueryDto } from './room.dto.js';
import * as rooms from './room.service.js';
const cachePublicRooms = (res: Response) => res.set('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=60');
export async function list(req: Request, res: Response) { cachePublicRooms(res).json(await rooms.listRooms(roomQueryDto.parse(req.query))); }
export async function get(req: Request, res: Response) { cachePublicRooms(res).json({ data: await rooms.getRoom(String(req.params.roomId)) }); }
export async function availability(req: Request, res: Response) { res.json({ data: await rooms.availability(String(req.params.roomId)) }); }
export async function reviews(req: Request, res: Response) { const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100); res.json(await rooms.publicReviews(String(req.params.roomId), page, limit)); }
