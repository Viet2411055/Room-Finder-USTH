import type { EmailOutboxStatus, EmailOutboxType } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { gmailMailProvider, type MailProvider } from '../../shared/mail/mail-provider.js';
import { renderTransactionalEmail } from '../../shared/mail/mail-template.js';
import { bookingEmailPayloadDto } from './booking.dto.js';

const delays = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000];
export type OutboxJob = { id: string; type: EmailOutboxType; recipient: string; payload: unknown; status: EmailOutboxStatus; attempts: number; availableAt: Date };
export interface OutboxStore {
  recoverStale(before: Date): Promise<void>;
  pending(now: Date, limit: number): Promise<OutboxJob[]>;
  claim(id: string): Promise<boolean>;
  sent(id: string): Promise<void>;
  failed(id: string, state: { attempts: number; terminal: boolean; availableAt: Date; error: string }): Promise<void>;
}

export const prismaOutboxStore: OutboxStore = {
  async recoverStale(before) { await prisma.emailOutbox.updateMany({ where: { status: 'PROCESSING', lockedAt: { lt: before } }, data: { status: 'PENDING', lockedAt: null } }); },
  pending: (now, limit) => prisma.emailOutbox.findMany({ where: { status: 'PENDING', availableAt: { lte: now } }, orderBy: { createdAt: 'asc' }, take: limit }),
  async claim(id) { return (await prisma.emailOutbox.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'PROCESSING', lockedAt: new Date() } })).count > 0; },
  async sent(id) { await prisma.emailOutbox.update({ where: { id }, data: { status: 'SENT', sentAt: new Date(), lockedAt: null, lastError: null } }); },
  async failed(id, state) { await prisma.emailOutbox.update({ where: { id }, data: { attempts: state.attempts, status: state.terminal ? 'FAILED' : 'PENDING', availableAt: state.availableAt, lockedAt: null, lastError: state.error } }); },
};

export async function processEmailOutbox(provider: MailProvider = gmailMailProvider, store: OutboxStore = prismaOutboxStore) {
  const now = new Date();
  await store.recoverStale(new Date(now.getTime() - 10 * 60_000));
  const jobs = await store.pending(now, 10);
  for (const job of jobs) {
    if (!(await store.claim(job.id))) continue;
    try {
      const payload = bookingEmailPayloadDto.parse(job.payload);
      await provider.send(job.recipient, renderTransactionalEmail(payload));
      await store.sent(job.id);
    } catch (error) {
      const attempts = job.attempts + 1;
      const terminal = attempts >= 5;
      await store.failed(job.id, { attempts, terminal, availableAt: terminal ? job.availableAt : new Date(Date.now() + delays[Math.min(attempts - 1, delays.length - 1)]), error: (error instanceof Error ? error.message : 'Unknown email error').slice(0, 2000) });
    }
  }
  return jobs.length;
}

export function startEmailOutboxWorker(provider: MailProvider = gmailMailProvider) {
  void processEmailOutbox(provider).catch(error => console.error('[email-worker]', error));
  const timer = setInterval(() => void processEmailOutbox(provider).catch(error => console.error('[email-worker]', error)), 2_000);
  timer.unref();
  return () => clearInterval(timer);
}
