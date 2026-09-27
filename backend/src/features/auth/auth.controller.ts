import type { Request, Response } from 'express';
import { emailDto, loginDto, otpDto, registerDto, resetDto } from './auth.dto.js';
import * as auth from './auth.service.js';
import { clearAuthCookies, setAuthCookies, verifyRefresh } from './auth.tokens.js';
import { presentUser } from './auth.presenter.js';

export async function register(req: Request, res: Response) { const user = await auth.register(registerDto.parse(req.body)); res.status(201).json({ data: { id: user.id, email: user.email }, message: 'Đã gửi OTP xác thực email' }); }
export async function verifyEmail(req: Request, res: Response) { const { email, otp } = otpDto.parse(req.body); const user = await auth.verifyEmail(email, otp); const tokens = await auth.createSession(user.id, user.role); setAuthCookies(res, tokens.access, tokens.refresh); res.json({ data: presentUser(user) }); }
export async function resend(req: Request, res: Response) { await auth.resendVerification(emailDto.parse(req.body).email); res.status(202).json({ data: null }); }
export async function login(req: Request, res: Response) { const input = loginDto.parse(req.body); const tokens = await auth.login(input.identity, input.password); setAuthCookies(res, tokens.access, tokens.refresh); res.status(204).end(); }
export async function refresh(req: Request, res: Response) { const tokens = await auth.refreshSession(req.cookies.rf_refresh); setAuthCookies(res, tokens.access, tokens.refresh); res.status(204).end(); }
export async function logout(req: Request, res: Response) { let sessionId = req.auth?.sessionId; if (!sessionId && req.cookies.rf_refresh) { try { sessionId = verifyRefresh(req.cookies.rf_refresh).sid; } catch {} } await auth.logout(sessionId); clearAuthCookies(res); res.status(204).end(); }
export async function me(req: Request, res: Response) { res.json({ data: presentUser(await auth.currentUser(req.auth!.userId)) }); }
export async function forgot(req: Request, res: Response) { await auth.beginPasswordReset(emailDto.parse(req.body).email); res.status(202).json({ data: null }); }
export async function reset(req: Request, res: Response) { const input = resetDto.parse(req.body); await auth.resetPassword(input.email, input.otp, input.password); clearAuthCookies(res); res.status(204).end(); }
