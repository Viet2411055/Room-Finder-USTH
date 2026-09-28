# RoomFinder

RoomFinder là nền tảng tìm kiếm và đặt nơi lưu trú tại Việt Nam, gồm trải nghiệm Guest/Traveler và cổng quản trị Host. Hệ thống sử dụng React SPA, Express REST API versioned, JWT trong HttpOnly cookies, RBAC, Prisma và MySQL.

- Production: [https://room-finder-usth.vercel.app](https://room-finder-usth.vercel.app)
- API health: [https://backend-production-2b99.up.railway.app/api/v1/health](https://backend-production-2b99.up.railway.app/api/v1/health)
- API prefix: `/api/v1`

## Stack


| Layer         | Công nghệ                                                                     |
| ------------- | ----------------------------------------------------------------------------- |
| Frontend      | React 18, TypeScript, Vite, Tailwind CSS, React Router, MapTiler SDK          |
| Backend       | Node.js, Express 5, TypeScript, Zod, feature-based MVC                        |
| Auth          | JWT access/refresh, HttpOnly cookies, DB-backed refresh sessions, bcrypt, OTP |
| Database      | MySQL 8.4, Prisma 6.19                                                        |
| Email         | Gmail API OAuth2, transactional templates, booking outbox worker              |
| Local runtime | Docker Compose, Nginx reverse proxy                                           |
| Deployment    | Vercel frontend, Railway backend/MySQL                                        |


## Tài liệu

- [Kiến trúc hệ thống](./docs/01-architecture.md)
- [Database schema và dữ liệu](./docs/02-database-schema-and-data.md)
- [REST API v1](./docs/03-api-reference.md)
- [Frontend routes và components](./docs/04-frontend-components.md)
- [Auth, JWT, cookies và RBAC](./docs/05-auth-rbac-security.md)
- [Gmail API, MapTiler và CDN ảnh](./docs/06-third-party-services.md)
- [Prisma ORM](./docs/07-prisma-orm.md)
- [Docker, vận hành và deploy](./docs/08-operations-deployment.md)

> Runtime database dùng MySQL và `backend/prisma/schema.prisma`. Schema/SQL PostgreSQL trong `database/production/` là tài liệu thiết kế legacy, không được Docker/backend hiện tại dùng để generate Prisma Client.

## Chạy nhanh bằng Docker

Yêu cầu Docker Desktop/Engine với Compose v2.

```bash
cp .env.example .env
openssl rand -hex 32 # điền JWT_ACCESS_SECRET
openssl rand -hex 32 # điền JWT_REFRESH_SECRET bằng giá trị khác
docker compose up -d --build
```

- Web: [http://localhost:8088](http://localhost:8088)
- Healthcheck: [http://localhost:8088/api/v1/health](http://localhost:8088/api/v1/health)
- Đổi cổng: `ROOMFINDER_PORT=8090 docker compose up -d --build`

Gmail OTP cần điền `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_SENDER`. Xem [hướng dẫn Gmail API](./docs/06-third-party-services.md#1-gmail-api).

## Cấu trúc chính

```text
backend/src/features/       Feature-based routes/controller/DTO/service/repository
backend/prisma/             MySQL schema và runtime seed
frontend/src/pages/         Route-level React pages
frontend/src/components/    Shared layout/search/room/map components
frontend/src/context/       Auth, search và wishlist state
frontend/src/services/      REST client và API-to-UI adapters
database/production/json/   Dataset bootstrap production
docs/                       Tài liệu bàn giao
```

## Scripts phát triển

Backend:

```bash
cd backend
npm ci
npm run prisma:generate
npm run dev
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
npm test
npm run build
```

## Auth và role

- Guest: chưa đăng nhập; xem/search phòng và public reviews.
- `TRAVELER`: booking, trips, wishlist, profile và review.
- `HOST`: toàn bộ quyền Traveler cộng Host portal, listings, reservations, calendar và review replies.
- Không có Admin role trong runtime hiện tại.
- Access cookie `rf_access`: 15 phút.
- Refresh cookie `rf_refresh`: 7 ngày, rotate và lưu hash trong DB.

## API chính

- Auth: `/auth/*`
- Discovery: `/rooms/*`
- Traveler: `/bookings`, `/trips`, `/wishlists`, `/me/reviews`
- Host: `/hosts/*`, `/host/*`

`GET /rooms` hỗ trợ pagination, destination, date availability, guests, price, room types, amenities, rating, superhost, bedrooms/beds và sorting. Chi tiết request/response nằm trong [API reference](./docs/03-api-reference.md).

## Dữ liệu

Seed JSON hiện gồm 473 listing: 199 Hà Nội, 167 Đà Nẵng và 107 Hồ Chí Minh; ngoài ra có 18 Host, 26 User, 15 Booking, 1.899 Review và 8 Wishlist. Dữ liệu runtime có thể nhiều hơn seed khi Host tạo listing mới.

## Deploy

```bash
# Backend từ repository root
railway up --service backend

# Frontend
cd frontend
npx vercel --prod --yes
```

Vercel rewrite `/api/*` sang Railway để browser dùng same-origin cookies. Biến môi trường và release checklist nằm tại [tài liệu vận hành](./docs/08-operations-deployment.md).

