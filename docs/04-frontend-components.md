# Frontend routes và components

## 1. Công nghệ và conventions

- React 18 + TypeScript.
- Vite 5 build/dev server.
- React Router 6 cho SPA routes.
- Tailwind CSS cho design tokens và responsive UI.
- Lucide React cho icons.
- MapTiler SDK cho WebGL map.
- Route pages được lazy-load qua `React.lazy` và `Suspense`.

Các API object dùng camelCase; `services/api.ts` chuyển chúng sang UI interfaces dùng nhiều field snake_case. Khi thêm field mới cần cập nhật cả presenter backend, adapter API và `frontend/src/types/index.ts`.

## 2. Route tree

### Public/Traveler shell (`MainLayout`)

`MainLayout` gồm `Navbar`, `<Outlet>` và `Footer`.

| Route | Page | Chức năng |
| --- | --- | --- |
| `/` | `LandingPage` | Hero search, city sections, featured rooms, marketing content |
| `/rooms` | `RoomsPage` | Search/filter/sort/pagination, cards và map |
| `/rooms/:roomId` | `RoomDetailPage` | Gallery, host, amenities, reviews, map, booking widget |
| `/booking/:roomId` | `BookingCheckoutPage` | Booking form và server quote/create |
| `/booking/success/:bookingId` | `BookingSuccessPage` | Xác nhận booking |
| `/wishlist` | `WishlistPage` | Saved listings của user |
| `/trips` | `TripsPage` | Upcoming/completed/cancelled trips |
| `/trips/:bookingId` | `TripDetailPage` | Trip detail và cancel action |
| `/trips/:bookingId/review` | `WriteReviewPage` | Viết review sau completed trip |
| `/profile` | `ProfilePage` | Profile hiện tại |
| `/profile/edit` | `EditProfilePage` | Sửa profile |
| `/login` | `AuthPages` | Login |
| `/register` | `AuthPages` | Register |
| `/verify-email` | `AuthPages` | OTP verify |
| `/forgot-password` | `AuthPages` | Yêu cầu OTP reset |
| `/reset-password` | `AuthPages` | OTP + password mới |

### Host shell (`HostLayout`)

`HostLayout` kiểm tra auth, redirect Guest sang login và hiển thị onboarding cho Traveler. Backend vẫn là nơi enforce role thật.

| Route | Page | Chức năng |
| --- | --- | --- |
| `/host` | `HostDashboardPage` | Active listings, reservations, revenue |
| `/host/listings` | `HostListingsPage` | Danh sách, status và archive listing |
| `/host/listings/new` | `CreateListingPage` | Wizard 7 bước, loading overlay, double-submit guard |
| `/host/listings/:listingId/edit` | `EditListingPage` | Sửa listing |
| `/host/reservations` | `HostReservationsPage` | Danh sách reservation |
| `/host/reservations/:bookingId` | `HostReservationDetailPage` | Reservation detail |
| `/host/calendar` | `HostCalendarPage` | Listing calendar và manual block |
| `/host/reviews` | `HostReviewsPage` | Review và Host reply |
| `/host/settings` | `HostSettingsPage` | Host profile settings |

## 3. Shared layout components

### `Navbar`

- Logo và route về Landing.
- Compact search pill mở `SearchModal`.
- Account menu thay đổi theo auth state.
- Links tới wishlist, trips, profile và Host portal.
- Search modal được mount toàn cục cạnh header để vẫn dùng được khi header mobile của `/rooms` bị ẩn.

### `Footer`

- Nội dung marketing/static links.
- Không phụ thuộc API; hình ảnh và slogan marketing tĩnh được giữ nguyên.

### `HostLayout`

- Auth loading screen.
- Redirect chưa login.
- Onboarding CTA cho Traveler.
- Responsive sidebar và Host navigation.
- Switch về traveler experience.

## 4. Search components

| Component | Trách nhiệm |
| --- | --- |
| `HeroSearchBar` | Search CTA trên Landing; cập nhật context và điều hướng URL `/rooms?dest=...` |
| `CompactSearchPill` | Tóm tắt destination/date/guests trên Navbar |
| `SearchModal` | Chọn thành phố, date và guest; commit context rồi navigate |

`RoomsPage` coi URL `dest` là source of truth cho destination. Khi gọi backend, field này được đổi thành query `destination`. Request có `AbortController` để hủy fetch cũ khi filter thay đổi.

## 5. Room components

### `RoomCard`

- Hiển thị một ảnh active tại một thời điểm, tránh render toàn gallery.
- Lazy/async image decode và URL optimization.
- Điều hướng detail, gallery arrows và wishlist optimistic toggle.

### `BentoGallery` và `RoomGalleryModal`

- Bento preview trên detail/listing feature.
- Modal gallery đầy đủ; ảnh hero/thumbnail dùng kích thước tối ưu khác nhau.

### `BookingWidget`

- Chọn check-in/check-out và số khách tối đa theo listing.
- Guest dropdown không bị container clip; đóng bằng outside click/Escape.
- Tính preview giá ở client để UX nhanh, nhưng checkout/booking vẫn dùng giá server.

### `HostCard`

- Host profile, response metrics và superhost state của listing.

### `ReviewsSection`

- Render public reviews và Host reply trong room detail.

## 6. Map component

`GoogleMapEmbed` nhận một trong hai mode:

- `listings`: map nhiều marker trên search page.
- `singleListing`: map một marker tại detail page.

Hành vi:

- Chọn initial center theo Hà Nội/Đà Nẵng/Hồ Chí Minh.
- `fitBounds` theo tọa độ listing hợp lệ.
- Marker giá đổi thành dot khi zoom dưới 11.5.
- Hover card/list marker liên kết qua `hoveredListingId`.
- Click marker điều hướng `/rooms/:id`.
- Marker root phải giữ `position:absolute` để MapLibre transform tọa độ chính xác.

## 7. Context/state ownership

### `AuthContext`

State: `currentUser`, `isLoading`; derived: `isGuest`, `isHost`.

Actions: `login`, `logout`, `refreshUser`, `updateProfile`, `becomeHost`. Provider gọi `/auth/me` khi mount. Token không nằm trong React state hay localStorage.

### `SearchContext`

State:

- destination/checkIn/checkOut/guests;
- room filters;
- global SearchModal visibility;
- active city tab.

Setter được memoize để không gây effect/request loop. `RoomsPage` đồng bộ URL → context và reset page khi search criteria đổi.

### `WishlistContext`

- Tải wishlist một lần sau login.
- Lưu ID bằng `Set<string>`.
- Toggle optimistic và rollback nếu API lỗi.
- Tránh mỗi `RoomCard` tự gọi status endpoint riêng.

## 8. API client

`request()` trong `services/api.ts`:

1. Prefix `/api/v1`.
2. Luôn `credentials: include`.
3. Thêm JSON content type khi có body.
4. Khi gặp 401, dùng singleton `refreshPromise` để tránh nhiều refresh đồng thời.
5. Retry original request đúng một lần nếu refresh thành công.
6. Chuyển error envelope thành `ApiError(status, code, message)`.

Booking client tự tạo `Idempotency-Key` bằng `crypto.randomUUID()`.

## 9. Loading và error states

- App-level lazy route: `Suspense` hiển thị “Đang tải…”.
- Auth/Host guard: màn hình kiểm tra phiên đăng nhập.
- Rooms: `isLoading`, empty result và error fallback.
- Create listing: `isPublishing`, disabled button, synchronous in-flight ref và blocking overlay.
- Các page còn lại quản lý loading/error cục bộ; khi phát triển thêm nên chuẩn hóa thành shared async-state components.

## 10. Image và performance

`utils/image.ts` tối ưu URL theo CDN:

- Airbnb/muscache: thêm width parameter.
- Unsplash: thêm crop/fit/width.
- Các nguồn khác giữ nguyên.

List API chỉ trả 5 ảnh; `RoomCard` chỉ render ảnh active. Route splitting giữ MapTiler khỏi initial Landing bundle.

## 11. Thêm page/component mới

1. Tạo page trong `pages/` hoặc `pages/host/`.
2. Thêm lazy import và route trong `App.tsx`.
3. Thêm method typed vào `services/api.ts` nếu cần API.
4. Dùng context hiện có nếu state thực sự global; không đưa local form state vào context.
5. Thêm loading, empty, error và disabled submit states.
6. Kiểm tra mobile/desktop và chạy `npm test && npm run build`.

