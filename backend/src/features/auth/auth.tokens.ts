import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../../shared/config/env.js';

export type Claims = { sub: string; role: 'TRAVELER' | 'HOST'; sid?: string };
const accessOptions = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax' as const, maxAge: 15 * 60 * 1000, path: '/' };
const refreshOptions = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax' as const, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/v1/auth' };

export const hashToken = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
export const createOtp = () => String(crypto.randomInt(100000, 1_000_000));
export const signAccess = (claims: Claims) => jwt.sign(claims, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
export const signRefresh = (claims: Claims) => jwt.sign(claims, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
export const verifyAccess = (token: string) => jwt.verify(token, env.JWT_ACCESS_SECRET) as Claims;
export const verifyRefresh = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET) as Claims;

export function setAuthCookies(res: Response, access: string, refresh: string) {
  res.cookie('rf_access', access, accessOptions);
  res.cookie('rf_refresh', refresh, refreshOptions);
}
export function clearAuthCookies(res: Response) {
  res.clearCookie('rf_access', { ...accessOptions, maxAge: undefined });
  res.clearCookie('rf_refresh', { ...refreshOptions, maxAge: undefined });
}
