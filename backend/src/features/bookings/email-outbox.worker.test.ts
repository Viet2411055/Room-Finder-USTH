import { describe, expect, it } from 'vitest';
import type { MailProvider } from '../../shared/mail/mail-provider.js';
import { processEmailOutbox, type OutboxJob, type OutboxStore } from './email-outbox.worker.js';

const payload = { type: 'BOOKING_CONFIRMATION' as const, bookingCode: 'RF-2026-123456', listingName: 'Căn hộ Hồ Tây', city: 'Hà Nội', district: 'Tây Hồ', checkIn: '2026-10-01', checkOut: '2026-10-04', guests: 2, totalPrice: 3450000 };
function memoryStore(job: OutboxJob) {
  const state = { job, outcome: '' };
  const store: OutboxStore = {
    async recoverStale() {}, async pending() { return [state.job]; }, async claim() { return true; },
    async sent() { state.outcome = 'SENT'; },
    async failed(_id, failure) { state.outcome = failure.terminal ? 'FAILED' : 'PENDING'; state.job.attempts = failure.attempts; },
  };
  return { state, store };
}

describe('booking email outbox contract', () => {
  it('marks a valid booking email as sent', async () => {
    const { state, store } = memoryStore({ id: 'job-1', type: 'BOOKING_CONFIRMATION', recipient: 'guest@example.com', payload, status: 'PENDING', attempts: 0, availableAt: new Date(0) });
    const provider: MailProvider = { async send() {} };
    await processEmailOutbox(provider, store);
    expect(state.outcome).toBe('SENT');
  });
  it('moves a fifth failed attempt to the terminal state', async () => {
    const { state, store } = memoryStore({ id: 'job-2', type: 'BOOKING_CONFIRMATION', recipient: 'guest@example.com', payload, status: 'PENDING', attempts: 4, availableAt: new Date(0) });
    const provider: MailProvider = { async send() { throw new Error('Gmail unavailable'); } };
    await processEmailOutbox(provider, store);
    expect(state.outcome).toBe('FAILED'); expect(state.job.attempts).toBe(5);
  });
});
