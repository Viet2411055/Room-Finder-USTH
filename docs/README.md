# Tài liệu bàn giao RoomFinder

Tài liệu trong thư mục này mô tả **trạng thái runtime hiện tại của codebase**. Khi tài liệu cũ trong `database/production/` khác với nội dung ở đây, ưu tiên code runtime và `backend/prisma/schema.prisma`.

## Mục lục

1. [Kiến trúc hệ thống](./01-architecture.md)
2. [Database schema và dữ liệu](./02-database-schema-and-data.md)
3. [REST API v1](./03-api-reference.md)
4. [Frontend routes và components](./04-frontend-components.md)
5. [Xác thực, JWT, cookie và RBAC](./05-auth-rbac-security.md)
6. [Dịch vụ bên thứ ba: Gmail API và MapTiler](./06-third-party-services.md)
7. [Prisma ORM](./07-prisma-orm.md)
8. [Vận hành, Docker và deploy](./08-operations-deployment.md)

## Nguồn sự thật

| Nội dung | File/thư mục chuẩn |
| --- | --- |
| Schema runtime | `backend/prisma/schema.prisma` |
| REST routes | `backend/src/features/*/*.routes.ts` |
| Validation request | `backend/src/features/*/*.dto.ts` |
| Business rules | `backend/src/features/*/*.service.ts` |
| Truy vấn DB | `backend/src/features/*/*.repository.ts` |
| Frontend routes | `frontend/src/App.tsx` |
| API client frontend | `frontend/src/services/api.ts` |
| Dữ liệu seed | `database/production/json/` |
| Seed runtime | `backend/prisma/seed.ts` |
| Local stack | `docker-compose.yml` |

## Cảnh báo về tài liệu legacy

`database/production/prisma/schema.prisma` và các file `database/production/sql/*.sql` là thiết kế PostgreSQL ban đầu, không được backend/Docker hiện tại sử dụng. Runtime hiện dùng MySQL 8.4 và schema Prisma tại `backend/prisma/schema.prisma`. Thiết kế legacy có role `admin`; runtime **không có role Admin**.

