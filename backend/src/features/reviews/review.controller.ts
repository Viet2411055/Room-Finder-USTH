import type { Request, Response } from 'express';
import { replyDto, reviewDto } from './review.dto.js';
import * as reviews from './review.service.js';
export async function create(req: Request, res: Response) { res.status(201).json({ data: await reviews.createReview(req.auth!.userId, String(req.params.bookingId), reviewDto.parse(req.body)) }); }
export async function mine(req: Request, res: Response) { res.json({ data: await reviews.myReviews(req.auth!.userId) }); }
export async function listForHost(req: Request, res: Response) { const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100); res.json(await reviews.hostReviews(req.auth!.userId, page, limit)); }
export async function reply(req: Request, res: Response) { res.json({ data: await reviews.replyToReview(req.auth!.userId, String(req.params.reviewId), replyDto.parse(req.body).reply) }); }
