import type { Request, Response } from 'express';
import { bookingDto, bookingQuoteDto } from './booking.dto.js';
import * as bookings from './booking.service.js';
export async function quote(req: Request, res: Response) { res.json({ data: await bookings.quote(bookingQuoteDto.parse(req.body)) }); }
export async function create(req: Request, res: Response) { res.status(201).json({ data: await bookings.createBooking(req.auth!.userId, bookingDto.parse(req.body), req.header('Idempotency-Key') ?? undefined) }); }
export async function listTrips(req: Request, res: Response) { res.json({ data: await bookings.trips(req.auth!.userId, req.query.status as string | undefined) }); }
export async function getTrip(req: Request, res: Response) { res.json({ data: await bookings.trip(req.auth!.userId, String(req.params.bookingId)) }); }
export async function cancel(req: Request, res: Response) { res.json({ data: await bookings.cancelTrip(req.auth!.userId, String(req.params.bookingId)) }); }
