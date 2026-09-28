# Xác thực, JWT, cookie và RBAC

## 1. Ba nhóm người dùng ở mức sản phẩm

| Nhóm | Representation | Mô tả |
| --- | --- | --- |
| Guest | Không có User/session | Xem Landing, search, room detail, availability và reviews |
| Du khách | DB role `TRAVELER` | Guest capabilities + profile, booking, trip, wishlist, review; có thể onboard Host |
| Host | DB role `HOST` | Toàn bộ quyền Du khách + Host portal và quản lý tài nguyên mình sở hữu |

Guest không phải enum trong database. Runtime chỉ có đúng hai role persisted: `TRAVELER` và `HOST`. Không có Admin role hoặc Admin API.

## 2. Permission matrix

| Capability | Guest | TRAVELER | HOST |
| --- | :---: | :---: | :---: |
| Xem/search phòng, map, availability, public review | ✓ | ✓ | ✓ |
| Register/login/reset password | ✓ | ✓ | ✓ |
| Sửa user profile | — | ✓ | ✓ |
| Wishlist | — | ✓ | ✓ |
| Quote/tạo booking, xem/hủy trip | — | ✓ | ✓ |
| Review completed booking | — | ✓ | ✓ |
| Onboard thành Host | — | ✓ | idempotent/reuse profile |
| Host dashboard/settings | — | — | ✓ |
| Listing CRUD/status | — | — | ✓, chỉ listing của mình |
| Reservations/calendar | — | — | ✓, chỉ listing của mình |
| Xem/reply Host reviews | — | — | ✓, chỉ review thuộc listing của mình |

## 3. JWT và session model

### Access token

- Secret: `JWT_ACCESS_SECRET`, tối thiểu 32 ký tự.
- TTL: 15 phút.
- Claims: `sub` user ID, `role`, `sid` session ID.
- Cookie: `rf_access`.
- Cookie path: `/`.

### Refresh token

- Secret độc lập: `JWT_REFRESH_SECRET`, tối thiểu 32 ký tự.
- TTL: 7 ngày.
- Cùng claims với access token.
- Cookie: `rf_refresh`.
- Cookie path: `/api/v1/auth`, nên browser chỉ gửi tới auth endpoints.

Cả hai cookie đều:

- `HttpOnly`: JavaScript frontend không đọc được token.
- `SameSite=Lax`.
- `Secure` theo `COOKIE_SECURE`; bắt buộc `true` trên HTTPS production.

Sinh secret:

```bash
openssl rand -hex 32
```

Dùng hai kết quả khác nhau cho access và refresh.

## 4. Refresh rotation

DB không lưu refresh token thô. Khi tạo session:

1. Tạo `Session` với expiry 7 ngày.
2. Sign refresh JWT có `sid`.
3. SHA-256 refresh token và lưu vào `Session.tokenHash`.
4. Sign access JWT cùng session ID.

Khi refresh:

1. Verify signature/expiry của refresh cookie.
2. Tải session theo `sid`.
3. Kiểm tra chưa revoke, chưa hết hạn và hash khớp.
4. Revoke session cũ.
5. Tạo session mới và set cặp cookies mới.

Do đó refresh token cũ không dùng lại được sau rotation. Frontend gộp các request refresh đồng thời bằng một `refreshPromise`.

## 5. Middleware authorization

`requireAuth`:

- đọc `rf_access` từ cookie;
- verify JWT;
- gắn `{userId, role, sessionId}` vào `req.auth`;
- trả `401 UNAUTHENTICATED` nếu thiếu/hỏng/hết hạn.

`authorize('HOST')`:

- chạy sau `requireAuth`;
- so role trong claims;
- trả `403 FORBIDDEN` nếu sai role.

Authorization theo ownership nằm trong service/repository, không chỉ dựa trên role. Ví dụ Host không thể sửa listing/reply review của Host khác.

## 6. Password và account lifecycle

- Register tạo role `TRAVELER`, status `PENDING`.
- Password được bcrypt hash cost 12.
- Chỉ account `ACTIVE` được login.
- Verify email đổi status thành `ACTIVE` và set `emailVerifiedAt`.
- Reset password cập nhật hash và revoke mọi session còn sống.
- Onboard Host tạo/reuse Host profile, đổi role thành `HOST`, revoke session hiện tại và phát JWT mới chứa role mới.

## 7. OTP security

- OTP gồm 6 chữ số sinh bởi `crypto.randomInt`.
- Chỉ bcrypt hash được lưu, không lưu mã thô.
- TTL 10 phút.
- Tối đa 5 lần nhập sai (`attempts < 5`).
- Mỗi user/purpose chỉ yêu cầu OTP mới sau 60 giây.
- Khi phát OTP mới, token cùng purpose chưa dùng bị đánh dấu consumed.
- Purpose tách riêng email verification và password reset.
- Forgot-password luôn trả 202 kể cả email không tồn tại để chống account enumeration.

OTP register/verify yêu cầu Gmail gửi thành công; nếu provider lỗi API trả `503 EMAIL_DELIVERY_FAILED`. Forgot-password cố tình không tiết lộ delivery/account state.

## 8. Chống duplicate và abuse

- Booking: `Idempotency-Key` unique ở DB và transaction calendar/outbox.
- Wishlist: unique `(userId,listingId)` và Prisma upsert.
- Review: unique `bookingId`.
- Create listing: frontend in-flight ref + disabled/loading; backend giới hạn một create thành công mỗi 10 giây/Host.
- Create-listing limiter đang dùng memory store, cần Redis nếu chạy nhiều replicas.

## 9. CORS, proxy và CSRF considerations

Backend CORS chỉ cho `FRONTEND_ORIGIN` và bật credentials. Production browser gọi same-origin `/api` qua Vercel rewrite; local browser gọi Nginx reverse proxy.

`SameSite=Lax` giảm phần lớn cross-site form submission, nhưng hệ thống chưa có CSRF token riêng. Nếu sau này cho phép cross-site embedding, đổi `SameSite=None`, hoặc mở nhiều frontend origins thì phải bổ sung CSRF defense trước.

## 10. Secret handling

Không commit các giá trị thật của:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

Nếu secret từng xuất hiện trong chat, log hoặc Git history, phải rotate tại provider; xóa file hiện tại không làm secret biến mất khỏi history.

