import type { OtpPurpose, Role } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

export const authRepository = {
  findDuplicate: (username: string, email: string) => prisma.user.findFirst({ where: { OR: [{ username }, { email }] } }),
  createUser: (data: { username: string; name: string; email: string; passwordHash: string; phone?: string }) => prisma.user.create({ data: { ...data, role: 'TRAVELER', status: 'PENDING' } }),
  findUserByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findUserForLogin: (identity: string) => prisma.user.findFirst({ where: { OR: [{ username: identity }, { email: identity.toLowerCase() }], status: 'ACTIVE' }, include: { hostProfile: true } }),
  findUserWithHost: (id: string) => prisma.user.findUniqueOrThrow({ where: { id }, include: { hostProfile: true } }),
  findRecentOtp: (userId: string, purpose: OtpPurpose) => prisma.otpToken.findFirst({ where: { userId, purpose, createdAt: { gt: new Date(Date.now() - 60_000) } } }),
  replaceOtp: (userId: string, purpose: OtpPurpose, codeHash: string, expiresAt: Date) => prisma.$transaction([
    prisma.otpToken.updateMany({ where: { userId, purpose, consumedAt: null }, data: { consumedAt: new Date() } }),
    prisma.otpToken.create({ data: { userId, purpose, codeHash, expiresAt } }),
  ]),
  findActiveOtp: (userId: string, purpose: OtpPurpose) => prisma.otpToken.findFirst({ where: { userId, purpose, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } }, orderBy: { createdAt: 'desc' } }),
  incrementOtpAttempts: (id: string) => prisma.otpToken.update({ where: { id }, data: { attempts: { increment: 1 } } }),
  consumeOtp: (id: string) => prisma.otpToken.update({ where: { id }, data: { consumedAt: new Date() } }),
  activateUser: (id: string) => prisma.user.update({ where: { id }, data: { status: 'ACTIVE', emailVerifiedAt: new Date() }, include: { hostProfile: true } }),
  updatePasswordAndRevokeSessions: (id: string, passwordHash: string) => prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash } }),
    prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]),
  createSession: (userId: string, expiresAt: Date) => prisma.session.create({ data: { userId, tokenHash: `pending-${crypto.randomUUID()}`, expiresAt } }),
  setSessionToken: (id: string, tokenHash: string) => prisma.session.update({ where: { id }, data: { tokenHash } }),
  findSession: (id: string) => prisma.session.findUnique({ where: { id }, include: { user: true } }),
  revokeSession: (id: string) => prisma.session.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } }),
  roleOf: (_role: Role) => _role,
};
