# Prisma ORM

## 1. Vai trò trong hệ thống

Prisma là lớp truy cập MySQL duy nhất của backend:

- schema và relations;
- generated TypeScript client;
- CRUD/filter/include/order/pagination;
- nested writes;
- transaction cho booking/auth operations;
- seed dataset.

Runtime singleton nằm tại `backend/src/shared/database/prisma.ts`:

```ts
export const prisma = new PrismaClient();
```

Repositories import singleton này; service không query DB trực tiếp ngoại trừ background worker chuyên biệt.

## 2. Schema mapping

Prisma model/field dùng PascalCase/camelCase, MySQL table/column dùng snake_case:

```prisma
model ListingImage {
  listingId String @map("listing_id")
  @@map("listing_images")
}
```

Điều này giữ TypeScript idiomatic trong khi DB vẫn theo SQL naming convention. `Decimal` từ Prisma phải được presenter chuyển thành `Number` trước khi trả frontend ở các field như rating, baths và service fee rate.

## 3. Repository boundary

Mỗi feature có repository riêng:

- `auth.repository`: User, OTP, Session.
- `room.repository`: public listing/review queries.
- `host.repository`: Host ownership, listing/calendar/reservation writes.
- `booking.repository`: quote, transaction, booking/calendar/outbox.
- `review.repository`: eligibility, create, host listing/reply.
- `user.repository`: profile update.
- `wishlist.repository`: upsert/delete/list.

Controller không import Prisma. Service nhận DTO typed, enforce business rule rồi gọi repository. Presenter tách REST contract khỏi Prisma record shape.

## 4. Query patterns

### Search specification

`room.service.ts` xây `Prisma.ListingWhereInput[]` động:

- luôn `status = ACTIVE`;
- destination OR trên city/district/neighborhood/address;
- range price/rating/capacity;
- room type IN;
- một `amenities.some` condition cho mỗi amenity cần có;
- `NOT calendar.some(overlap)` khi truyền date range.

Repository chạy count và findMany trong `$transaction` để meta và page cùng snapshot hợp lý:

```text
skip = (page - 1) × limit
take = limit
```

### Include list và detail

List query chỉ include tối đa 5 `ListingImage` theo display order để kiểm soát payload. Detail include gallery, host, amenities, reviews và calendar đầy đủ.

### Ownership queries

Host resource luôn filter cả `hostId` và resource ID. Không dựa vào ID do client gửi rồi update trực tiếp.

## 5. Transactions

### Booking transaction

`createBooking` dùng interactive transaction:

1. tải active listing;
2. kiểm tra capacity và calendar conflict;
3. tính giá server-side;
4. tạo Booking;
5. tạo ListingCalendar block;
6. enqueue EmailOutbox.

Nếu bất kỳ bước nào lỗi, toàn bộ rollback. Email thật được gửi sau transaction bởi worker.

### Auth transactions

- Replace OTP: consume token cũ + tạo token mới.
- Reset password: update password + revoke sessions.
- Refresh rotation: session cũ revoke trước khi tạo session mới.

### Nested writes

Create listing nested-create `images` và `amenities`. Update listing thay gallery/amenities bằng `deleteMany` + `create` khi các arrays được truyền.

## 6. Idempotency và unique constraints

Prisma/DB constraints là lớp cuối chống duplicate:

- User username/email unique.
- Booking idempotency key unique.
- Review booking ID unique.
- Wishlist `(userId,listingId)` unique.
- Listing amenity `(listingId,amenityName)` composite PK.
- Email outbox dedupe key unique.

Service vẫn cần chuyển constraint/business conflict thành error code có ý nghĩa; không nên đưa raw Prisma error ra client.

## 7. Commands thường dùng

```bash
cd backend

# Kiểm tra schema
npx prisma validate

# Sinh client sau khi schema thay đổi
npm run prisma:generate

# Đồng bộ schema nhanh cho local hiện tại
npm run db:push

# Import seed JSON
npm run db:seed

# DB browser cho development
npx prisma studio
```

Build Docker đã chạy `prisma generate`; container startup chạy `prisma db push --skip-generate` trước seed và server.

## 8. Quy trình đổi schema đề xuất

Hiện repository chưa có `prisma/migrations`. Khi dự án chuyển sang quy trình production chặt chẽ:

1. Không chỉnh DB trực tiếp bằng GUI.
2. Sửa `backend/prisma/schema.prisma`.
3. Tạo migration local:

   ```bash
   npx prisma migrate dev --name add_example_field
   ```

4. Review SQL trong `prisma/migrations`.
5. Test seed và toàn bộ backend suite.
6. Production dùng:

   ```bash
   npx prisma migrate deploy
   ```

7. Bỏ `prisma db push` khỏi container startup sau khi migration pipeline ổn định.

`db push` tiện cho prototype nhưng không cung cấp migration history/rollback audit và có thể yêu cầu destructive reset khi thay đổi không tương thích.

## 9. Seed behavior

`backend/prisma/seed.ts` đọc `SEED_DATA_DIR` hoặc fallback `../database/production/json`.

- DB rỗng: import toàn bộ dataset theo thứ tự FK.
- DB đã có user: không import lại; chỉ repair seed password hash khi source có password tương ứng.
- Không dùng seed để update dữ liệu nghiệp vụ đang chạy.

Trước khi re-seed một DB quan trọng, phải backup. Seed path rỗng có đoạn xóa bảng và tắt foreign key checks trong flow bootstrap.

## 10. Performance checklist

- Dùng `select/include` tối thiểu cho list endpoints.
- Luôn `take` giới hạn; public room max 100/request.
- Dựa vào indexes `(city,status,pricePerNight)`, `(listingId,checkIn,checkOut)`, user/host status.
- Tránh N+1 bằng relation include hoặc batch query.
- Không serialize raw Decimal/BigInt trực tiếp.
- Dùng transaction cho state phải thay đổi atomically.
- Khi dataset lớn hơn, xem xét full-text/geospatial index cho destination và coordinates.

