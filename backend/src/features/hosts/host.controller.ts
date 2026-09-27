import type { Request, Response } from 'express';
import { setAuthCookies } from '../auth/auth.tokens.js';
import { calendarDto, hostProfileDto, listingDto, listingStatusDto, listingUpdateDto } from './host.dto.js';
import * as hosts from './host.service.js';
export async function onboard(req: Request, res: Response) { const result = await hosts.onboard(req.auth!.userId, req.auth!.sessionId); setAuthCookies(res, result.tokens.access, result.tokens.refresh); res.status(201).json({ data: result.host }); }
export async function getProfile(req: Request, res: Response) { res.json({ data: await hosts.getProfile(req.auth!.userId) }); }
export async function updateProfile(req: Request, res: Response) { res.json({ data: await hosts.updateProfile(req.auth!.userId, hostProfileDto.parse(req.body)) }); }
export async function dashboard(req: Request, res: Response) { res.json({ data: await hosts.dashboard(req.auth!.userId) }); }
export async function listings(req: Request, res: Response) { res.json({ data: await hosts.listings(req.auth!.userId) }); }
export async function listing(req: Request, res: Response) { res.json({ data: await hosts.listing(req.auth!.userId, String(req.params.listingId)) }); }
export async function createListing(req: Request, res: Response) { res.status(201).json({ data: await hosts.createListing(req.auth!.userId, listingDto.parse(req.body)) }); }
export async function updateListing(req: Request, res: Response) { res.json({ data: await hosts.updateListing(req.auth!.userId, String(req.params.listingId), listingUpdateDto.parse(req.body)) }); }
export async function setStatus(req: Request, res: Response) { res.json({ data: await hosts.setListingStatus(req.auth!.userId, String(req.params.listingId), listingStatusDto.parse(req.body).status) }); }
export async function removeListing(req: Request, res: Response) { await hosts.removeListing(req.auth!.userId, String(req.params.listingId)); res.status(204).end(); }
export async function reservations(req: Request, res: Response) { res.json({ data: await hosts.reservations(req.auth!.userId) }); }
export async function reservation(req: Request, res: Response) { res.json({ data: await hosts.reservation(req.auth!.userId, String(req.params.bookingId)) }); }
export async function calendar(req: Request, res: Response) { res.json({ data: await hosts.calendar(req.auth!.userId, String(req.params.listingId)) }); }
export async function createCalendar(req: Request, res: Response) { res.status(201).json({ data: await hosts.createCalendar(req.auth!.userId, String(req.params.listingId), calendarDto.parse(req.body)) }); }
export async function updateCalendar(req: Request, res: Response) { res.json({ data: await hosts.updateCalendar(req.auth!.userId, String(req.params.listingId), String(req.params.calendarId), calendarDto.parse(req.body)) }); }
export async function removeCalendar(req: Request, res: Response) { await hosts.removeCalendar(req.auth!.userId, String(req.params.listingId), String(req.params.calendarId)); res.status(204).end(); }
