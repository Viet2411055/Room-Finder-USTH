import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { verifyAccess } from './auth.tokens.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies.rf_access;
    if (!token) throw new Error('Missing access token');
    const claims = verifyAccess(token);
    req.auth = { userId: claims.sub, role: claims.role, sessionId: claims.sid };
    next();
  } catch {
    next(new AppError(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) return next(new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này'));
    next();
  };
}
