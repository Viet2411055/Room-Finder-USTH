# Vietnam rental listings (Airbnb)

Three JSON arrays, one per city, collected with [jev-orca](https://github.com/browser-use/jev-ultrafast)
driving the browser inside the Orca app (a real, logged-in browser profile — no headless scrape).

| File | City | Listings |
| --- | --- | --- |
| `hanoi.json` | Hà Nội | 199 |
| `danang.json` | Đà Nẵng | 167 |
| `hcmc.json` | Hồ Chí Minh | 107 |

Hà Nội is at the 200 target; Đà Nẵng and Hồ Chí Minh are short of it — the collection stopped on
request, mid-run. `harvest.py` is resumable: run it again for a city and it keeps every record it
already has and appends new ones until the limit is reached.

```bash
COMMANDCODE_SCRATCHPAD=<scratch> ROOMFINDER_OUT=<this folder> uv run python harvest.py danang --limit 200
uv run python validate.py       # counts, unique ids, image counts, districts, missing fields
```

Only **central districts** are included, and every record carries the **full image gallery** of
the listing (the URLs the detail page itself uses), which is what the bento grid needs.

Central districts per city:

- **Hà Nội** — Hoàn Kiếm, Ba Đình, Đống Đa, Hai Bà Trưng, Tây Hồ, Cầu Giấy, Thanh Xuân
- **Đà Nẵng** — Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Liên Chiểu
- **Hồ Chí Minh** — Quận 1, 3, 4, 5, 10, Bình Thạnh, Phú Nhuận, Tân Bình, Quận 7

## Record shape

```json
{
  "id": "1691037109183389304",
  "listing_url": "https://www.airbnb.com.vn/rooms/1691037109183389304",
  "name": "Studio ấm cúng ở Tokyo | Khu phố cổ | Ban công yên tĩnh",
  "room_type": "Căn hộ tại Quận Hoàn Kiếm",
  "city": "Hà Nội",
  "district": "Quận Hoàn Kiếm",
  "neighborhood": "Quận Hoàn Kiếm",
  "address": "Quận Hoàn Kiếm, Hà Nội, Việt Nam",
  "latitude": 21.0385,
  "longitude": 105.8452,
  "price_per_night": 684000,
  "price_formatted": "684.000 ₫ / đêm",
  "price_total": 3420000,
  "price_nights": 5,
  "price_label": "3.420.000 ₫ cho 5 đêm",
  "rating": 5.0,
  "review_count": 2,
  "is_superhost": false,
  "is_guest_favorite": false,
  "specs": { "guests": 2, "bedrooms": 1, "beds": 1, "baths": 1 },
  "amenities": ["Wi-fi", "Không gian riêng để làm việc", "..."],
  "images": ["https://a0.muscache.com/im/pictures/hosting/Hosting-1691037109183389304/original/...jpeg", "..."],
  "image_count": 20,
  "cover_image": "https://a0.muscache.com/im/pictures/hosting/Hosting-.../original/...jpeg",
  "photo_count_on_card": 6,
  "check_in": "2026-11-01",
  "check_out": "2026-11-06",
  "collected_at": "2026-09-26T22:41:12"
}
```

Field notes:

- `price_per_night` / `price_total` come from the search card, for the stay in
  `check_in` / `check_out` with `price_guests` guests (a 5-night window; most records use
  `2026-11-01` → `2026-11-06`, 1 guest — the windows are how different result pages were
  enumerated). Airbnb's displayed price includes its fees, so read it as "as displayed for that
  window", not as a bare nightly rate.
- `images` are the listing's own gallery, in the order Airbnb serves them, without query
  parameters. They are public, unsigned CDN URLs with no expiry token, so they can be stored and
  rendered later; append `?im_w=720` (or `?im_w=1200`) to pick a size, or use the bare URL for
  the original.
- `specs` comes from the page's own summary; `guests` falls back to the listing capacity, so a
  `null` bedroom/bed/bath means Airbnb did not state it, not zero.
- `rating` is `null` when the listing has no reviews yet.
- `amenities` is the preview list Airbnb shows on the page (usually 9–40 items).

## How it was collected

`jev-orca` opened each city's search by district, sliced by nightly price bands (Airbnb renders
at most ~24 cards per query and two bands return disjoint sets), then fetched each listing page
inside the browser and parsed the server-rendered payload — no model calls, ~600 pages in about
half an hour. Districts come from the listing page itself ("… cho thuê tại Quận Hoàn Kiếm, Ha Noi"),
so a record can never carry a district the listing does not claim.

Re-run or extend it with `harvest.py` (resumable: it keeps existing records and appends new ones).

## Legal note

Airbnb's terms do not allow automated collection; this data was gathered for a university
project. Do not republish the photos or resell the data — link to the listings instead.
