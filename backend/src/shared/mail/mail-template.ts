export type OtpEmailInput = {
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  otp: string;
};

export type BookingEmailInput = {
  type: 'BOOKING_CONFIRMATION';
  bookingCode: string;
  listingName: string;
  city: string;
  district: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
};

export type TransactionalEmailInput = OtpEmailInput | BookingEmailInput;
export type RenderedEmail = { subject: string; text: string; html: string };

const escapeHtml = (value: unknown) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f7f7f7;font-family:Arial,sans-serif;color:#222222">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f7;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #ebebeb;border-radius:16px;overflow:hidden">
        <tr><td style="background:#ff385c;padding:22px 28px;color:#ffffff;font-size:22px;font-weight:700">RoomFinder</td></tr>
        <tr><td style="padding:32px 28px"><h1 style="font-size:24px;line-height:32px;margin:0 0 16px">${escapeHtml(title)}</h1>${body}</td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #ebebeb;color:#717171;font-size:12px;line-height:18px">Email tự động từ RoomFinder. Vui lòng không trả lời email này.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function otpEmail(input: OtpEmailInput): RenderedEmail {
  const verification = input.type === 'EMAIL_VERIFICATION';
  const subject = verification ? 'Xác thực tài khoản RoomFinder' : 'Đặt lại mật khẩu RoomFinder';
  const action = verification ? 'xác thực tài khoản' : 'đặt lại mật khẩu';
  const text = `Mã OTP để ${action} là ${input.otp}. Mã hết hạn sau 10 phút. Không chia sẻ mã này với bất kỳ ai.`;
  const html = shell(subject, `
    <p style="font-size:15px;line-height:24px;margin:0 0 18px">Sử dụng mã dưới đây để ${action}:</p>
    <div style="background:#fff1f3;border:1px solid #ffd0d8;border-radius:12px;padding:20px;text-align:center;font-size:30px;font-weight:700;letter-spacing:8px;color:#ba0036">${escapeHtml(input.otp)}</div>
    <p style="font-size:14px;line-height:22px;margin:18px 0 0;color:#717171">Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai. Nếu bạn không thực hiện yêu cầu, hãy bỏ qua email.</p>`);
  return { subject, text, html };
}

function bookingEmail(input: BookingEmailInput): RenderedEmail {
  const subject = `Xác nhận đặt phòng ${input.bookingCode} — RoomFinder`;
  const location = `${input.district}, ${input.city}`;
  const total = input.totalPrice.toLocaleString('vi-VN');
  const text = `Đặt phòng ${input.bookingCode} đã được xác nhận. ${input.listingName}, ${location}. Nhận phòng ${input.checkIn}, trả phòng ${input.checkOut}, ${input.guests} khách. Tổng tiền ${total} ₫.`;
  const row = (label: string, value: string) => `<tr><td style="padding:9px 0;color:#717171;font-size:14px">${escapeHtml(label)}</td><td align="right" style="padding:9px 0;font-size:14px;font-weight:700">${escapeHtml(value)}</td></tr>`;
  const html = shell('Đặt phòng thành công!', `
    <p style="font-size:15px;line-height:24px;margin:0 0 18px">Booking của bạn đã được xác nhận. Hãy lưu mã đặt phòng để tiện tra cứu.</p>
    <div style="background:#f7f7f7;border-radius:12px;padding:18px;margin-bottom:18px">
      <div style="font-size:12px;color:#717171;text-transform:uppercase;letter-spacing:1px">Mã đặt phòng</div>
      <div style="font-size:22px;font-weight:700;color:#ff385c;margin-top:4px">${escapeHtml(input.bookingCode)}</div>
    </div>
    <h2 style="font-size:18px;margin:0 0 4px">${escapeHtml(input.listingName)}</h2>
    <p style="font-size:14px;color:#717171;margin:0 0 14px">${escapeHtml(location)}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #ebebeb">
      ${row('Nhận phòng', input.checkIn)}
      ${row('Trả phòng', input.checkOut)}
      ${row('Số khách', `${input.guests} khách`)}
      ${row('Tổng tiền', `${total} ₫`)}
    </table>`);
  return { subject, text, html };
}

export function renderTransactionalEmail(input: TransactionalEmailInput): RenderedEmail {
  return input.type === 'BOOKING_CONFIRMATION' ? bookingEmail(input) : otpEmail(input);
}
