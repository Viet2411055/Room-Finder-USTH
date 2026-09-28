# REST API v1

## 1. Quy ước chung

- Base URL local qua Docker: `http://localhost:8088/api/v1`.
- Base URL production qua Vercel: `https://room-finder-usth.vercel.app/api/v1`.
- JSON request dùng `Content-Type: application/json`.
- Auth gửi tự động bằng cookie `rf_access` và `rf_refresh`; không dùng Bearer token trong frontend hiện tại.
- Date-only dùng định dạng `YYYY-MM-DD`.

Success envelope:

```json
{ "data": {} }
```

Paginated envelope:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": []
  }
}
```

## 2. Health

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/health` | Public | `{data:{status:"ok"}}` cho healthcheck |

## 3. Auth

| Method | Path | Auth | Status | Input / kết quả |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Public | 201 | Tạo account PENDING và gửi OTP |
| POST | `/auth/verify-email` | Public | 200 | Xác nhận OTP, activate account, set cookies |
| POST | `/auth/resend-verification` | Public | 202 | Gửi lại OTP nếu account chưa verify |
| POST | `/auth/login` | Public | 204 | Login bằng username hoặc email; set cookies |
| POST | `/auth/refresh` | Refresh cookie | 204 | Rotate session và cả hai JWT cookies |
| POST | `/auth/forgot-password` | Public | 202 | Gửi OTP reset; không tiết lộ email tồn tại hay không |
| POST | `/auth/reset-password` | Public | 204 | Đổi password và revoke toàn bộ session |
| GET | `/auth/me` | User | 200 | User hiện tại và Host linkage |
| POST | `/auth/logout` | Cookie nếu có | 204 | Revoke session và clear cookies |

Register:

```json
{
  "username": "ducnguyen",
  "name": "Nguyễn Văn Đức",
  "email": "user@example.com",
  "password": "minimum8chars",
  "phone": "0912345678"
}
```

Ràng buộc: username 3–50 ký tự `[a-zA-Z0-9_]`; password 8–72; name 2–150. OTP luôn là 6 chữ số.

Login:

```json
{ "identity": "ducnguyen", "password": "minimum8chars" }
```

Verify/reset:

```json
{ "email": "user@example.com", "otp": "123456" }
```

Reset password thêm field `password` mới.

## 4. Public rooms

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/rooms` | Public | Search/filter/sort/pagination; tối đa 5 ảnh/listing |
| GET | `/rooms/:roomId` | Public | Detail listing và gallery đầy đủ |
| GET | `/rooms/:roomId/availability` | Public | Các khoảng ngày bị block |
| GET | `/rooms/:roomId/reviews` | Public | Review phân trang |

`GET /rooms` query:

| Query | Kiểu/default | Ý nghĩa |
| --- | --- | --- |
| `page` | integer, `1` | Trang hiện tại |
| `limit` | 1–100, `20` | Số kết quả/trang |
| `destination` | string | Match contains trên city/district/neighborhood/address |
| `checkIn`, `checkOut` | date | Loại listing có calendar overlap; phải truyền cùng nhau |
| `adults`, `children` | integer, `0` | Tổng được so với `guestsMax` |
| `minPrice`, `maxPrice` | integer | Khoảng giá mỗi đêm |
| `roomTypes` | CSV string | Match exact một trong các room type |
| `amenities` | CSV string | Listing phải có mọi amenity đã truyền |
| `minRating` | 0–5 | Rating tối thiểu |
| `superhostOnly` | boolean | Chỉ superhost |
| `bedrooms`, `beds` | integer | Số lượng tối thiểu |
| `sort` | enum | `newest`, `price_asc`, `price_desc`, `rating_desc` |

Ví dụ:

```http
GET /api/v1/rooms?destination=Đà%20Nẵng&page=1&limit=12&adults=2&amenities=Wi-fi,TV&sort=rating_desc
```

List/detail public đặt CDN cache header: `s-maxage=30, stale-while-revalidate=60`.

## 5. User profile và wishlist

| Method | Path | Auth | Input / kết quả |
| --- | --- | --- | --- |
| PATCH | `/users/me` | User | Partial `name`, `phone`, `avatarUrl`, `bio` |
| GET | `/wishlists` | User | Các listing đã lưu |
| GET | `/wishlists/:listingId` | User | `{data:{saved:boolean}}` |
| PUT | `/wishlists/:listingId` | User | Upsert; 204 |
| DELETE | `/wishlists/:listingId` | User | Bỏ lưu; 204 |

`phone`, `avatarUrl`, `bio` có thể gửi `null` để xóa. Wishlist có unique key `(userId,listingId)`, nên PUT lặp không tạo duplicate.

## 6. Booking và trips

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/bookings/quote` | User | Kiểm tra capacity/calendar và tính giá |
| POST | `/bookings` | User | Tạo booking transactionally |
| GET | `/trips?status=...` | User | Danh sách trip của chính user |
| GET | `/trips/:bookingId` | Owner | Chi tiết trip |
| POST | `/trips/:bookingId/cancel` | Owner | Hủy booking UPCOMING trước check-in |

Quote:

```json
{
  "listingId": "listing-id",
  "checkIn": "2026-10-10",
  "checkOut": "2026-10-13",
  "guests": 2
}
```

Create booking dùng cùng bốn field và thêm:

```json
{
  "guestName": "Nguyễn Văn Đức",
  "guestEmail": "user@example.com",
  "guestPhone": "0912345678",
  "paymentMethod": "CARD",
  "specialRequests": "Nhận phòng muộn"
}
```

Client nên gửi header:

```http
Idempotency-Key: <UUID duy nhất cho lần checkout>
```

Nếu cùng user retry cùng key, API trả booking trước đó. Nếu key đã thuộc user khác, API trả `409 IDEMPOTENCY_KEY_REUSED`.

Giá được tính server-side:

```text
basePrice = pricePerNight × nights
serviceFee = round(basePrice × serviceFeeRate)
totalPrice = basePrice + cleaningFee + serviceFee
```

Create booking đồng thời tạo calendar block và email outbox trong cùng DB transaction.

## 7. Reviews

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/me/reviews` | User | Review của user hiện tại |
| POST | `/bookings/:bookingId/review` | Booking owner | Tạo một review cho booking COMPLETED |
| GET | `/host/reviews?page=&limit=` | HOST | Review trên listing của Host |
| PUT | `/host/reviews/:reviewId/reply` | Listing owner HOST | Tạo/cập nhật reply |

Create review:

```json
{ "rating": 5, "comment": "Không gian sạch sẽ và chủ nhà hỗ trợ rất nhanh." }
```

Rating là integer 1–5; comment 5–3000 ký tự. `bookingId` unique ở DB ngăn review lần hai.

Reply:

```json
{ "reply": "Cảm ơn bạn đã lựa chọn RoomFinder!" }
```

## 8. Host onboarding và profile

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/hosts/onboarding` | User | Tạo/reuse Host profile, nâng role và rotate cookies |
| GET | `/hosts/me` | HOST | Host profile |
| PATCH | `/hosts/me` | HOST | Partial profile update |

Host update nhận `name`, `phone`, `avatarUrl`, `about`, `responseTime`.

## 9. Host dashboard, listings và reservations

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/host/dashboard` | HOST | active listings, upcoming reservations, revenue |
| GET | `/host/listings` | HOST | Listing thuộc Host |
| GET | `/host/listings/:listingId` | Owner HOST | Listing detail |
| POST | `/host/listings` | HOST | Tạo listing; rate limit 1 success/10 giây/Host |
| PATCH | `/host/listings/:listingId` | Owner HOST | Partial update |
| PATCH | `/host/listings/:listingId/status` | Owner HOST | Đổi status |
| DELETE | `/host/listings/:listingId` | Owner HOST | Soft archive thành INACTIVE |
| GET | `/host/reservations` | HOST | Booking trên listing của Host |
| GET | `/host/reservations/:bookingId` | Owner HOST | Booking detail |

Create listing body:

```json
{
  "name": "Căn hộ view biển",
  "roomType": "Toàn bộ căn hộ",
  "city": "Đà Nẵng",
  "district": "Quận Sơn Trà",
  "neighborhood": "Phước Mỹ",
  "address": "88 Võ Nguyên Giáp",
  "latitude": 16.0544,
  "longitude": 108.2022,
  "pricePerNight": 850000,
  "cleaningFee": 120000,
  "serviceFeeRate": 0.08,
  "guestsMax": 4,
  "bedrooms": 2,
  "beds": 2,
  "baths": 1,
  "description": "Mô tả tối thiểu hai mươi ký tự.",
  "amenities": ["Wi-fi", "TV"],
  "images": ["https://example.com/cover.jpg"],
  "houseRules": ["Không hút thuốc"],
  "cancellationPolicyTitle": "Linh hoạt",
  "cancellationPolicyDescription": "Hoàn tiền theo thời điểm hủy.",
  "status": "ACTIVE"
}
```

Status endpoint nhận `{ "status": "DRAFT|ACTIVE|INACTIVE" }`.

## 10. Host calendar

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/host/listings/:listingId/calendar` | Owner HOST | Calendar entries |
| POST | `/host/listings/:listingId/calendar` | Owner HOST | Tạo manual block |
| PATCH | `/host/listings/:listingId/calendar/:calendarId` | Owner HOST | Sửa manual block |
| DELETE | `/host/listings/:listingId/calendar/:calendarId` | Owner HOST | Xóa manual block |

Input:

```json
{
  "checkIn": "2026-11-01",
  "checkOut": "2026-11-05",
  "isBlocked": true,
  "priceOverride": 1200000,
  "note": "Bảo trì"
}
```

Không thể tạo range overlap. Update/delete chỉ áp dụng entry Host có thể sửa; calendar gắn booking được bảo vệ khỏi việc Host xóa tùy ý.

## 11. Status/error code đáng chú ý

| HTTP | Code | Khi nào |
| ---: | --- | --- |
| 400 | `INVALID_OTP` | OTP sai hoặc hết hạn |
| 401 | `UNAUTHENTICATED`, `INVALID_CREDENTIALS` | Thiếu/hỏng token hoặc login sai |
| 403 | `FORBIDDEN` | Role hoặc ownership không hợp lệ |
| 404 | `NOT_FOUND` | Resource không tồn tại/không thuộc owner |
| 409 | `ACCOUNT_EXISTS`, `DATES_UNAVAILABLE`, `REVIEW_EXISTS`, `CANNOT_CANCEL` | Xung đột nghiệp vụ |
| 422 | `VALIDATION_ERROR`, `CAPACITY_EXCEEDED`, `INVALID_DATES` | DTO hoặc điều kiện booking không hợp lệ |
| 429 | `OTP_RATE_LIMITED`, `RATE_LIMITED` | Gửi OTP/tạo listing quá nhanh |
| 503 | `EMAIL_DELIVERY_FAILED` | Gmail gửi transactional OTP thất bại |
