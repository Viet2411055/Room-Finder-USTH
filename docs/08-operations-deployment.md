# Vận hành, Docker và deploy

## 1. Yêu cầu

- Docker Desktop/Engine có Compose v2, hoặc:
- Node.js tương thích package lock (Docker dùng Node 24), npm và MySQL 8.x.
- Gmail OAuth credentials nếu cần register/reset/booking email.
- MapTiler browser API key cho map (hiện key nằm trong code; xem tài liệu third-party).

## 2. Environment variables

| Variable | Bắt buộc | Mô tả |
| --- | :---: | --- |
| `DATABASE_URL` | ✓ backend | MySQL connection URL |
| `JWT_ACCESS_SECRET` | ✓ | Secret ≥32 ký tự, riêng cho access |
| `JWT_REFRESH_SECRET` | ✓ | Secret ≥32 ký tự, riêng cho refresh |
| `FRONTEND_ORIGIN` | ✓ production | CORS origin duy nhất |
| `COOKIE_SECURE` | ✓ production | `true` trên HTTPS |
| `PORT` | — | Backend port, mặc định 3001 |
| `NODE_ENV` | — | development/test/production |
| `GMAIL_CLIENT_ID` | Email | OAuth client ID |
| `GMAIL_CLIENT_SECRET` | Email | OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Email | Offline token của sender |
| `GMAIL_SENDER` | Email | Gmail mailbox đã authorize |
| `EMAIL_WORKER_ENABLED` | — | Bật worker booking email, mặc định true |
| `SEED_DATA_DIR` | — | Override đường dẫn JSON seed |
| `ROOMFINDER_PORT` | — Compose | Host port của Nginx, mặc định 8088 |

Tạo JWT secrets:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Không dùng cùng một giá trị cho hai secret.

## 3. Chạy toàn stack bằng Docker

Tạo `.env` ở root từ `.env.example`, sau đó:

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:8088/api/v1/health
```

Services:

| Service | Image/build | Exposure |
| --- | --- | --- |
| `mysql` | `mysql:8.4` | Chỉ Docker network, persistent volume `mysql_data` |
| `backend` | `backend/Dockerfile` | Chỉ Docker network port 3001 |
| `frontend` | Vite build + Nginx | Host `${ROOMFINDER_PORT:-8088}` |

Nginx phục vụ SPA và proxy `/api/` tới backend. MySQL/backend không publish trực tiếp ra host.

Lệnh vận hành:

```bash
# Logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# Rebuild riêng backend
docker compose up -d --build --force-recreate backend

# Dừng nhưng giữ DB volume
docker compose down

# Xóa cả DB volume — destructive
docker compose down -v
```

## 4. Chạy development không qua full Compose

Backend cần MySQL và `backend/.env`:

```bash
cd backend
npm ci
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

Vite development cần proxy/API setup phù hợp nếu frontend và backend khác origin. Flow chính thức dễ tái hiện nhất vẫn là Docker same-origin.

## 5. Tests và build gate

```bash
cd backend
npm test
npm run build
npx prisma validate

cd ../frontend
npm test
npm run build
```

Backend dùng Vitest + Supertest; frontend dùng Vitest + Testing Library/jsdom. Chạy cả test và build trước deploy vì TypeScript build bắt được lỗi ngoài phạm vi test.

## 6. Production deployment

### Backend + MySQL trên Railway

Project hiện tại: `room-finder-usth`; service backend public:

```text
https://backend-production-2b99.up.railway.app
```

Variables tối thiểu:

```dotenv
DATABASE_URL=${{MySQL.MYSQL_URL}}
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<different-secret>
FRONTEND_ORIGIN=https://room-finder-usth.vercel.app
COOKIE_SECURE=true
SEED_DATA_DIR=/app/database/production/json
RAILWAY_DOCKERFILE_PATH=backend/Dockerfile
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_SENDER=...
EMAIL_WORKER_ENABLED=true
```

Deploy từ root:

```bash
railway up --service backend
```

Kiểm tra:

```bash
curl https://backend-production-2b99.up.railway.app/api/v1/health
railway deployment list --service backend
```

Container startup hiện chạy schema push → seed bootstrap/repair → server.

### Frontend trên Vercel

Project frontend có alias:

```text
https://room-finder-usth.vercel.app
```

`frontend/vercel.json` build `dist`, rewrite `/api/:path*` tới Railway và fallback các routes về `index.html`.

```bash
cd frontend
npx vercel --prod --yes
```

Sau deploy, test ít nhất Landing, city search, room detail/map, login, booking và Host create listing.

## 7. Health, jobs và logs

- Liveness: `GET /api/v1/health`.
- Docker backend/frontend có healthcheck.
- Email outbox poll mỗi 2 giây.
- Booking completion job chạy startup và mỗi giờ, đổi UPCOMING có `checkOut <= now` thành COMPLETED.
- Backend dùng console logs; Railway logs là nguồn kiểm tra lỗi runtime hiện tại.

Chưa có structured logging, tracing, metrics hoặc error monitoring. Khi production mở rộng nên thêm request ID, JSON logs, Sentry/OpenTelemetry và alert cho outbox FAILED.

## 8. Backup và restore

Trước schema change/re-seed:

```bash
mysqldump --single-transaction --routines --triggers \
  -h <host> -u <user> -p roomfinder > roomfinder-backup.sql
```

Restore vào DB trống/test trước khi restore production:

```bash
mysql -h <host> -u <user> -p roomfinder < roomfinder-backup.sql
```

Railway MySQL credential lấy từ service variables; không paste credential vào tài liệu hoặc command history dùng chung.

## 9. Release checklist

1. Review diff, đặc biệt schema/env/routes.
2. Backend tests/build/Prisma validate xanh.
3. Frontend tests/build xanh.
4. Backup nếu có data/schema change.
5. Deploy Railway và chờ status SUCCESS.
6. Healthcheck Railway.
7. Deploy Vercel và xác nhận alias production.
8. Smoke test auth cookie, search, booking email/outbox, Host listing và map.
9. Kiểm tra logs không có secret, Prisma error hoặc mail retry bất thường.

## 10. Known operational risks

- `prisma db push` thay vì versioned migrations.
- Seed chạy ở mọi container startup nhưng chỉ import đầy đủ khi DB rỗng.
- MapTiler key hard-code và cần origin restriction/env migration.
- Create-listing rate limiter dùng memory store, không distributed.
- Email outbox worker chạy cùng API process; nhiều replicas cần bảo đảm claim semantics và quan sát throughput.
- Không có automated CI/CD config trong repository; deploy hiện qua CLI/project integrations.

