# RoomFinder

RoomFinder gồm React frontend, Express REST API (`/api/v1`), Prisma và MySQL. Toàn bộ stack chạy bằng một file `docker-compose.yml`.

## Chạy dự án

```bash
docker compose up --build -d
```

- Web: `http://localhost:8088`
- Healthcheck: `http://localhost:8088/api/v1/health`
- Đổi cổng web: `ROOMFINDER_PORT=8090 docker compose up --build -d`

Frontend gọi API cùng origin qua reverse proxy Nginx. MySQL và backend không publish cổng ra host.

## Xác thực và phân quyền

- Guest là người chưa đăng nhập.
- `TRAVELER` có thể đặt phòng, quản lý trips/wishlist và viết review cho booking đã hoàn thành.
- `HOST` có toàn bộ quyền Traveler và được quản lý listing, reservation, calendar, review/reply.
- Access JWT sống 15 phút trong cookie `rf_access`.
- Refresh JWT sống 7 ngày trong cookie `rf_refresh`; token được rotate khi refresh và DB chỉ lưu SHA-256 hash.
- Cookie dùng `HttpOnly`, `SameSite=Lax`; đặt `COOKIE_SECURE=true` khi deploy HTTPS.

## Gmail API cho OTP

Tạo file `.env` ở thư mục gốc hoặc export các biến sau trước khi chạy Compose:

```dotenv
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_SENDER=
```

OTP xác thực email và OTP đặt lại mật khẩu hết hạn sau 10 phút, tối đa 5 lần thử và giới hạn gửi lại một lần mỗi 60 giây. Backend không giả lập gửi mail khi chạy production; cần cấu hình Gmail OAuth2 để đăng ký tài khoản mới.

## REST API chính

- Auth: `/auth/register`, `/auth/verify-email`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/me`
- Discovery: `/rooms`, `/rooms/:id`, `/rooms/:id/availability`, `/rooms/:id/reviews`
- Traveler: `/bookings`, `/bookings/quote`, `/trips`, `/wishlists`, `/me/reviews`, `/bookings/:id/review`
- Host: `/host/dashboard`, `/host/listings`, `/host/reservations`, `/host/listings/:id/calendar`, `/host/reviews`, `/host/reviews/:id/reply`

`GET /rooms` hỗ trợ phân trang và filter qua `page`, `limit`, `destination`, `checkIn`, `checkOut`, `adults`, `children`, `minPrice`, `maxPrice`, `roomTypes`, `amenities`, `minRating`, `superhostOnly`, `bedrooms`, `beds`, `sort`.

## Deploy

- Frontend: Vercel, project `frontend`, production `https://room-finder-usth.vercel.app` — `cd frontend && npx vercel deploy --prod`.
- Backend + MySQL: Railway, project `room-finder-usth` — `railway up --service backend` từ thư mục gốc.
- `frontend/vercel.json` rewrite `/api/*` sang domain Railway, nên trình duyệt luôn gọi same-origin và cookie `HttpOnly` hoạt động bình thường (Vercel đóng vai trò reverse proxy).

Biến môi trường của service `backend` trên Railway: `DATABASE_URL=${{MySQL.MYSQL_URL}}`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_ORIGIN=https://room-finder-usth.vercel.app`, `COOKIE_SECURE=true`, `SEED_DATA_DIR=/app/database/production/json`, `RAILWAY_DOCKERFILE_PATH=backend/Dockerfile` và `GMAIL_*`.

Container backend khi khởi động chạy `prisma db push` → seed dữ liệu production → start server; các lần deploy sau tự bỏ qua bước seed vì DB đã có dữ liệu.
