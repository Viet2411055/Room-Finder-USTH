# RoomFinder Production Database & Data Architecture

Tài liệu thiết kế kiến trúc cơ sở dữ liệu và bộ dữ liệu sản xuất (Production Schema & Seed Dataset) cho nền tảng **RoomFinder**.

> **Nguồn schema runtime:** backend MySQL sử dụng duy nhất `backend/prisma/schema.prisma`.
> File Prisma trong thư mục tài liệu này chỉ là bản thiết kế dữ liệu ban đầu và không được Docker hoặc backend dùng để generate client.

---

## 1. Tổng quan Kiến trúc (Architecture Overview)

Kiến trúc dữ liệu tại thư mục `database/production/` được xây dựng theo mô hình **Dual Format**:
- **Lớp Quan hệ Chuẩn hóa 3NF (Relational SQL & Prisma):** Thiết kế cho hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ (PostgreSQL 14+, tương thích Supabase, Neon, AWS RDS, Docker) với đầy đủ ràng buộc toàn vẹn khóa ngoại, composite indexes tối ưu cho truy vấn tìm kiếm lọc theo giá/địa điểm, và triggers tự động tính toán thống kê.
- **Lớp Tài liệu (Document JSON):** Bộ dữ liệu JSON tương thích 100% với hợp đồng dữ liệu của Frontend [frontend/src/types/index.ts](file:///Users/ducnv/Workspace/room-finder/frontend/src/types/index.ts) và [mockStore.ts](file:///Users/ducnv/Workspace/room-finder/frontend/src/services/mockStore.ts), đồng thời sẵn sàng import vào MongoDB, CouchDB hoặc phục vụ trực tiếp qua REST/GraphQL APIs.

### Thống kê Dữ liệu Sản xuất (Production Data Metrics)

| Thực thể (Entity) | Số lượng bản ghi | Nguồn dữ liệu & Mô tả |
| :--- | :--- | :--- |
| **Phòng & Căn hộ (`listings`)** | **473** | 199 tại Hà Nội, 167 tại Đà Nẵng, 107 tại TP. Hồ Chí Minh |
| **Thư viện ảnh (`listing_images`)** | **10.067** | Thư viện ảnh thực tế chất lượng cao từ CDN (tối thiểu 5 ảnh/phòng) |
| **Chủ nhà (`hosts`)** | **18** | Host thực tế người Việt, đầy đủ tiểu sử, avatar, superhost badge |
| **Người dùng (`users`)** | **26** | Gồm Traveler demo, Host demo, Admin demo và các tài khoản khách |
| **Đơn đặt phòng (`bookings`)** | **15** | Đầy đủ các trạng thái `UPCOMING`, `COMPLETED`, `CANCELLED` |
| **Đánh giá (`reviews`)** | **1.899** | Đánh giá tiếng Việt thực tế (4-5 sao) kèm phản hồi của Host |
| **Tiện nghi phòng (`listing_amenities`)** | **17.080** | Quan hệ liên kết tiện nghi chuẩn hóa theo phòng |
| **Lịch khóa phòng (`listing_calendar`)** | **1.285** | Khoảng ngày đã đặt phòng đồng bộ trên lịch năm 2026 |
| **Phòng yêu thích (`wishlists`)** | **8** | Danh sách yêu thích của người dùng demo |
| **Thành phố & Quận (`cities`, `districts`)** | **3 TP / 21 Quận** | Tọa độ GPS chính xác tại các quận trung tâm |

---

## 2. Sơ đồ Thực thể Quan hệ (ERD - Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o| HOSTS : "user_id"
    USERS ||--o{ BOOKINGS : "user_id"
    USERS ||--o{ REVIEWS : "user_id"
    USERS ||--o{ WISHLISTS : "user_id"
    HOSTS ||--o{ LISTINGS : "host_id"
    HOSTS ||--o{ BOOKINGS : "host_id"
    CITIES ||--o{ DISTRICTS : "city_id"
    CITIES ||--o{ LISTINGS : "city_id"
    DISTRICTS ||--o{ LISTINGS : "district_id"
    LISTINGS ||--o{ LISTING_IMAGES : "listing_id"
    LISTINGS ||--o{ LISTING_AMENITIES : "listing_id"
    AMENITIES ||--o{ LISTING_AMENITIES : "amenity_id"
    AMENITY_CATEGORIES ||--o{ AMENITIES : "category_id"
    LISTINGS ||--o{ LISTING_CALENDAR : "listing_id"
    LISTINGS ||--o{ BOOKINGS : "listing_id"
    LISTINGS ||--o{ REVIEWS : "listing_id"
    LISTINGS ||--o{ WISHLISTS : "listing_id"
    BOOKINGS ||--o| REVIEWS : "booking_id"

    USERS {
        varchar id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar phone
        text avatar_url
        varchar role
        varchar status
        varchar host_id FK
        text bio
        timestamptz created_at
        timestamptz updated_at
    }

    HOSTS {
        varchar id PK
        varchar user_id FK
        varchar name
        varchar email
        varchar phone
        text avatar_url
        text about
        boolean is_superhost
        varchar response_rate
        varchar response_time
        varchar joined_date
        boolean identity_verified
        int listings_count
        numeric rating
        int review_count
        timestamptz created_at
        timestamptz updated_at
    }

    CITIES {
        varchar id PK
        varchar name
        varchar slug UK
        varchar country
        numeric latitude
        numeric longitude
        text image_url
        timestamptz created_at
    }

    DISTRICTS {
        varchar id PK
        varchar city_id FK
        varchar name
        varchar slug
        numeric latitude
        numeric longitude
        timestamptz created_at
    }

    AMENITY_CATEGORIES {
        varchar id PK
        varchar name
        varchar icon
        int display_order
    }

    AMENITIES {
        varchar id PK
        varchar category_id FK
        varchar name
        varchar code UK
        varchar icon
    }

    LISTINGS {
        varchar id PK
        varchar host_id FK
        varchar city_id FK
        varchar district_id FK
        text listing_url
        varchar name
        varchar room_type
        varchar city
        varchar district
        varchar neighborhood
        text address
        numeric latitude
        numeric longitude
        int price_per_night
        varchar price_formatted
        int price_total
        int price_nights
        varchar price_label
        int cleaning_fee
        numeric service_fee_rate
        int guests_max
        int bedrooms
        int beds
        numeric baths
        text description
        numeric rating
        int review_count
        boolean is_superhost
        boolean is_guest_favorite
        text cover_image
        int image_count
        jsonb house_rules
        varchar cancellation_policy_title
        text cancellation_policy_description
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    LISTING_IMAGES {
        varchar id PK
        varchar listing_id FK
        text image_url
        int display_order
        boolean is_cover
        varchar caption
        timestamptz created_at
    }

    LISTING_AMENITIES {
        varchar listing_id PK,FK
        varchar amenity_name PK
        varchar amenity_id FK
        timestamptz created_at
    }

    LISTING_CALENDAR {
        varchar id PK
        varchar listing_id FK
        varchar booking_id FK
        date check_in
        date check_out
        boolean is_blocked
        int price_override
        varchar note
        timestamptz created_at
    }

    BOOKINGS {
        varchar id PK
        varchar booking_code UK
        varchar user_id FK
        varchar listing_id FK
        varchar host_id FK
        varchar guest_name
        varchar guest_email
        varchar guest_phone
        varchar listing_name
        varchar city
        varchar district
        text cover_image
        varchar host_name
        date check_in
        date check_out
        int nights
        int guests
        int price_per_night
        int cleaning_fee
        int service_fee
        int total_price
        varchar status
        varchar payment_method
        varchar payment_status
        text special_requests
        timestamptz created_at
        timestamptz updated_at
    }

    REVIEWS {
        varchar id PK
        varchar listing_id FK
        varchar booking_id FK
        varchar user_id FK
        varchar reviewer_name
        text reviewer_avatar
        numeric rating
        text comment
        text host_reply
        timestamptz host_reply_date
        varchar review_date
        timestamptz created_at
        timestamptz updated_at
    }

    WISHLISTS {
        varchar id PK
        varchar user_id FK
        varchar listing_id FK
        timestamptz created_at
    }
```

---

## 3. Cấu trúc Thư mục `database/production/`

```
database/production/
├── README.md                      # Tài liệu này
├── types.ts                       # TypeScript Data Types (cho cả backend và frontend)
├── prisma/
│   └── schema.prisma              # Prisma ORM Schema hoàn chỉnh
├── sql/
│   ├── 00_init.sql                # Khởi tạo database, extensions, enum types
│   ├── 01_schema.sql              # DDL Schema, constraints, triggers, indexes
│   ├── 02_cities_districts.sql    # Dữ liệu 3 thành phố & các quận trung tâm
│   ├── 03_amenities.sql           # Danh mục nhóm tiện nghi & tiện nghi chi tiết
│   ├── 04_users_hosts.sql         # Tài khoản 26 người dùng & 18 chủ nhà
│   ├── 05_listings.sql            # Dữ liệu 473 căn hộ thực tế
│   ├── 06_listing_images.sql      # Quan hệ 10.067 hình ảnh phòng từ CDN
│   ├── 07_listing_amenities.sql   # 17.080 liên kết tiện nghi phòng
│   ├── 08_bookings_calendar.sql   # 15 đơn booking mẫu & 1.285 lịch đặt phòng
│   ├── 09_reviews.sql             # 1.899 đánh giá chân thực kèm phản hồi của Host
│   ├── 10_wishlists.sql           # Danh sách phòng yêu thích
│   └── seed_all.sql               # File SQL tổng hợp duy nhất để chạy toàn bộ (5.88 MB)
├── json/
│   ├── listings.json              # Toàn bộ 473 listings kèm thông tin Host & Reviews nhúng
│   ├── hanoi.json                 # 199 listings Hà Nội
│   ├── danang.json                # 167 listings Đà Nẵng
│   ├── hcmc.json                  # 107 listings TP. Hồ Chí Minh
│   ├── hosts.json                 # 18 Hosts với thống kê chi tiết
│   ├── users.json                 # 26 Users với mật khẩu demo chuẩn
│   ├── bookings.json              # 15 Bookings mẫu
│   ├── reviews.json               # 1.899 Reviews dạng bảng quan hệ
│   ├── wishlists.json             # 8 Wishlists
│   ├── cities.json                # Metadata 3 thành phố và các quận
│   ├── amenities.json             # Danh mục tiện nghi phân loại
│   └── production_bundle.json     # Gói dữ liệu tổng hợp (single-file export)
└── scripts/
    ├── generate_production.py     # Script Python sinh dữ liệu tự động
    └── validate_production.py     # Bộ kiểm thử tự động toàn vẹn dữ liệu
```

---

## 4. Tài khoản Đăng nhập Demo (Demo Credentials)

Tất cả các tài khoản demo đều dùng chung mật khẩu: `password123`

| Vai trò (Role) | Email | Mật khẩu | Tên người dùng | Quyền hạn & Chức năng |
| :--- | :--- | :--- | :--- | :--- |
| **Traveler** | `traveler@roomfinder.vn` | `password123` | Nguyễn Văn Đức | Đặt phòng, quản lý chuyến đi (Trips), viết review, wishlist |
| **Host** | `host@roomfinder.vn` | `password123` | Trần Minh Quân | Quản lý 40 phòng, xem lịch, quản lý đơn đặt phòng, trả lời review |
| **Admin** | `admin@roomfinder.vn` | `password123` | Quản Trị Viên RoomFinder | Quản trị toàn bộ hệ thống |
| **Host khác** | `thuha.nguyen@roomfinder.vn` | `password123` | Nguyễn Thu Hà | Host 40 phòng phong cách Bắc Âu tại Đà Nẵng / Hà Nội |
| **Host khác** | `baongoc.le@roomfinder.vn` | `password123` | Lê Bảo Ngọc | Host chuyên homestay ven biển |

---

## 5. Hướng dẫn Triển khai & Nạp Dữ liệu (Deployment & Seeding Guide)

### Cách 1: Nạp trực tiếp vào PostgreSQL / Supabase / Neon / Docker

Chỉ cần thực thi file duy nhất `seed_all.sql`:

```bash
# Đối với PostgreSQL local hoặc Docker:
psql -h localhost -U postgres -d roomfinder -f database/production/sql/seed_all.sql

# Hoặc đối với Supabase / Neon CLI:
psql "postgres://[user]:[password]@[host]:5432/[database]" -f database/production/sql/seed_all.sql
```

Script này tự động:
1. Kích hoạt extensions `uuid-ossp`, `pgcrypto`, `citext`.
2. Khởi tạo tất cả ENUM types.
3. Tạo 13 bảng với đầy đủ khóa ngoại, ràng buộc CHECK và composite indexes.
4. Thiết lập Triggers tự động cập nhật thống kê (`rating`, `review_count`, `listings_count`).
5. Nạp toàn bộ dữ liệu mẫu chuẩn hóa 100%.

### Cách 2: Triển khai thông qua Prisma ORM

```bash
cd database/production/
# Cấu hình biến môi trường DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/roomfinder?schema=public"

# Tạo migration và đẩy schema lên database:
npx prisma db push --schema=prisma/schema.prisma

# Sinh Prisma Client:
npx prisma generate --schema=prisma/schema.prisma
```

### Cách 3: Sử dụng trực tiếp dữ liệu JSON cho Frontend hoặc NoSQL

Thư mục `database/production/json/` chứa sẵn các file JSON độc lập:
- Giao diện Frontend có thể đọc trực tiếp [listings.json](file:///Users/ducnv/Workspace/room-finder/database/production/json/listings.json), [hosts.json](file:///Users/ducnv/Workspace/room-finder/database/production/json/hosts.json), [bookings.json](file:///Users/ducnv/Workspace/room-finder/database/production/json/bookings.json).
- Có thể import nhanh vào MongoDB với lệnh:
  ```bash
  mongoimport --db roomfinder --collection listings --file database/production/json/listings.json --jsonArray
  ```

---

## 6. Kiểm thử Toàn vẹn Dữ liệu (Validation Suite)

Để kiểm tra tính toàn vẹn của dữ liệu bất kỳ lúc nào:

```bash
python3 database/production/scripts/validate_production.py
```

Bộ kiểm tra tự động xác nhận:
1. Đầy đủ các file JSON và SQL, không bị rỗng.
2. Kiểm tra chính xác số lượng 473 phòng (199 Hà Nội, 167 Đà Nẵng, 107 Hồ Chí Minh).
3. Đảm bảo mọi căn phòng đều có tối thiểu 5 ảnh CDN, giá > 0, tọa độ GPS hợp lệ tại Việt Nam.
4. Kiểm tra tính toàn vẹn tham chiếu (Referential Integrity): Không có ID mồ côi (100% `host_id`, `user_id`, `listing_id` đều khớp).
5. Kiểm tra công thức tài chính: `total_price = (price_per_night * nights) + cleaning_fee + service_fee`.
6. Kiểm tra ràng buộc thời gian: `check_out > check_in`.
7. Kiểm tra cú pháp SQL và ký tự thoát chuỗi an toàn.
