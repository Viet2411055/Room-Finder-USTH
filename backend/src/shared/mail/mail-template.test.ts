import { describe, expect, it } from 'vitest';
import { renderTransactionalEmail } from './mail-template.js';

describe('transactional email contract', () => {
  it('renders a verification OTP with the code and expiry', () => {
    const message = renderTransactionalEmail({
      type: 'EMAIL_VERIFICATION',
      otp: '482193',
    });

    expect(message.subject).toBe('Xác thực tài khoản RoomFinder');
    expect(message.text).toContain('482193');
    expect(message.html).toContain('482193');
    expect(message.html).toContain('10 phút');
  });

  it('renders a booking confirmation from persisted booking facts', () => {
    const message = renderTransactionalEmail({
      type: 'BOOKING_CONFIRMATION',
      bookingCode: 'RF-2026-123456',
      listingName: 'Căn hộ Hồ Tây',
      city: 'Hà Nội',
      district: 'Tây Hồ',
      checkIn: '2026-10-01',
      checkOut: '2026-10-04',
      guests: 2,
      totalPrice: 3450000,
    });

    expect(message.subject).toContain('RF-2026-123456');
    expect(message.html).toContain('Căn hộ Hồ Tây');
    expect(message.html).toContain('3.450.000');
  });
});
