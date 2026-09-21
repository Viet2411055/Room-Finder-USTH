import bcrypt from 'bcryptjs';
import { OtpPurpose, type Role } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { sendTransactionalEmail } from '../../shared/mail/mail.service.js';
import type { RegisterInput } from './auth.dto.js';
import { authRepository as repo } from './auth.repository.js';
import { createOtp, hashToken, signAccess, signRefresh, verifyRefresh } from './auth.tokens.js';

const otpExpiry = () => new Date(Date.now() + 10 * 60_000);

async function issueOtp(userId: string, email: string, purpose: OtpPurpose) {
  if (await repo.findRecentOtp(userId, purpose)) throw new AppError(429, 'OTP_RATE_LIMITED', 'Vui lòng chờ 60 giây trước khi yêu cầu mã OTP mới');
  const otp = createOtp();
  await repo.replaceOtp(userId, purpose, await bcrypt.hash(otp, 10), otpExpiry());
  await sendTransactionalEmail(email, { type: purpose, otp });
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();
  if (await repo.findDuplicate(input.username, email)) throw new AppError(409, 'ACCOUNT_EXISTS', 'Username hoặc email đã được sử dụng');
  const { password, ...profile } = input;
  const user = await repo.createUser({ ...profile, email, passwordHash: await bcrypt.hash(password, 12) });
  await issueOtp(user.id, user.email, OtpPurpose.EMAIL_VERIFICATION);
  return user;
}

async function consumeOtp(email: string, otp: string, purpose: OtpPurpose) {
  const user = await repo.findUserByEmail(email.toLowerCase());
  if (!user) throw new AppError(400, 'INVALID_OTP', 'OTP không hợp lệ');
  const token = await repo.findActiveOtp(user.id, purpose);
  if (!token || !(await bcrypt.compare(otp, token.codeHash))) {
    if (token) await repo.incrementOtpAttempts(token.id);
    throw new AppError(400, 'INVALID_OTP', 'OTP không hợp lệ hoặc đã hết hạn');
  }
  await repo.consumeOtp(token.id);
  return user;
}

export async function verifyEmail(email: string, otp: string) {
  const user = await consumeOtp(email, otp, OtpPurpose.EMAIL_VERIFICATION);
  return repo.activateUser(user.id);
}
export async function resendVerification(email: string) {
  const user = await repo.findUserByEmail(email.toLowerCase());
  if (!user || user.emailVerifiedAt) return;
  await issueOtp(user.id, user.email, OtpPurpose.EMAIL_VERIFICATION);
}
export async function beginPasswordReset(email: string) {
  const user = await repo.findUserByEmail(email.toLowerCase());
  if (!user) return;
  try { await issueOtp(user.id, user.email, OtpPurpose.PASSWORD_RESET); }
  catch (error) {
    if (error instanceof AppError && error.code === 'OTP_RATE_LIMITED') return;
    console.error('[mail] Password reset delivery failed');
  }
}
export async function resetPassword(email: string, otp: string, password: string) {
  const user = await consumeOtp(email, otp, OtpPurpose.PASSWORD_RESET);
  await repo.updatePasswordAndRevokeSessions(user.id, await bcrypt.hash(password, 12));
}
export async function login(identity: string, password: string) {
  const user = await repo.findUserForLogin(identity);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Username/email hoặc mật khẩu không đúng');
  return createSession(user.id, user.role);
}
export async function createSession(userId: string, role: Role) {
  const session = await repo.createSession(userId, new Date(Date.now() + 7 * 86400_000));
  const refresh = signRefresh({ sub: userId, role, sid: session.id });
  await repo.setSessionToken(session.id, hashToken(refresh));
  return { access: signAccess({ sub: userId, role, sid: session.id }), refresh };
}
export async function refreshSession(token: string) {
  const claims = verifyRefresh(token);
  if (!claims.sid) throw new AppError(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không hợp lệ');
  const session = await repo.findSession(claims.sid);
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.tokenHash !== hashToken(token)) throw new AppError(401, 'UNAUTHENTICATED', 'Phiên đăng nhập không hợp lệ');
  await repo.revokeSession(session.id);
  return createSession(session.userId, session.user.role);
}
export async function logout(sessionId?: string) { if (sessionId) await repo.revokeSession(sessionId); }
export const currentUser = (id: string) => repo.findUserWithHost(id);
