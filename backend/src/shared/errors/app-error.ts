import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export const notFound = (message = 'Không tìm thấy tài nguyên') => new AppError(404, 'NOT_FOUND', message);
export const forbidden = (message = 'Bạn không có quyền thực hiện thao tác này') => new AppError(403, 'FORBIDDEN', message);

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ', details: error.flatten() } });
  }
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
  }
  console.error(error);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi máy chủ' } });
}
