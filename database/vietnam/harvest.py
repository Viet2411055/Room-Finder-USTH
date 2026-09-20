"""Harvest Airbnb listings for one city through jev-orca, one JSON list per city.

Every page is read with one in-page JS extraction — no model calls, no guessing. Records follow
the shape the project already uses (id, listing_url, name, room_type, city, district, address,
latitude, longitude, price_per_night, rating, specs, amenities, images), with the raw price label
and the collection timestamp kept as extras.
"""

import argparse
import json
import os
import pathlib
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request


def fold(text):
    """Airbnb writes 'Ha Noi' beside 'Hà Nội': compare without diacritics."""
    stripped = unicodedata.normalize("NFD", (text or "").lower())
    return "".join(ch for ch in stripped if unicodedata.category(ch) != "Mn")

S = pathlib.Path(os.environ.get("COMMANDCODE_SCRATCHPAD", "/tmp"))
PORT = int(os.environ.get("ROOMFINDER_PORT", "8785"))
STATE = S / "roomfinder-state.json"
BASE = f"http://127.0.0.1:{PORT}"
OUT = pathlib.Path(os.environ.get("ROOMFINDER_OUT", str(S / "roomfinder-data")))
SEARCH_JS = (S / "rf_search.js").read_text()

# A listing's page is server-rendered, so one in-page fetch answers with everything the render
# would have shown — five times faster, and it keeps the session on one page.
DETAIL_FETCH = """(listingId => fetch('/rooms/' + listingId, {credentials: 'include'})
  .then(response => response.text())
  .then(html => {
    const meta = name => {
      const match = html.match(new RegExp('<meta (?:property|name)="' + name + '"[^>]*content="([^"]*)"'));
      return match ? match[1] : '';
    };
    const titleMatch = html.match(/<title>([^<]*)<\\/title>/);
    const payloadMatch = html.match(/<script id="data-deferred-state-0"[^>]*>([\\s\\S]*?)<\\/script>/);
    const out = {
      ok: !!payloadMatch, pageTitle: titleMatch ? titleMatch[1] : '', ogTitle: meta('og:title'),
      description: meta('description').slice(0, 300), heading: '', summary: '', images: [], amenities: [],
      latitude: null, longitude: null, personCapacity: null, reviewCount: null, satisfaction: null,
      isSuperhost: null, propertyType: '', roomType: '',
    };
    if (!payloadMatch) return JSON.stringify(out);
    const data = JSON.parse(payloadMatch[1]);
    const root = data.niobeClientData[0][1];
    const sections = root?.data?.presentation?.stayProductDetailPage?.sections;
    const pdp = root?.data?.node?.pdpPresentation;
    const sharing = sections?.metadata?.sharingConfig || {};
    const logging = sections?.metadata?.loggingContext?.eventDataLogging || {};
    const all = [];
    const push = item => {
      const url = item && (item.baseUrl || item.uri || item.moderatedUri || item.picture);
      if (typeof url === 'string' && url.includes('muscache.com/im/pictures/')) all.push(url.replace(/\\?.*$/, ''));
    };
    for (const section of sections?.sections || []) {
      for (const item of section?.section?.mediaItems || []) push(item);
      for (const edge of section?.section?.mediaItems?.edges || []) push(edge?.node);
    }
    for (const edge of pdp?.heroMedia?.edges || []) push(edge?.node?.image);
    push(pdp?.heroMedia?.image);
    const own = all.filter(url => url.includes('Hosting-' + listingId));
    const unique = list => {
      const seen = new Set(), out = [];
      for (const url of list) {
        const key = (url.match(/([0-9a-f-]{20,})\\.(?:jpe?g|png|webp)/i) || [])[1] || url;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(url);
      }
      return out;
    };
    const groups = (pdp?.amenities?.previewAmenitiesGroups || [])
      .concat(pdp?.amenities?.seeAllAmenitiesGroups || []);
    const embedName = (sections?.sections || [])
      .map(section => section?.section?.shareSave?.embedData?.name).find(Boolean) || '';
    out.heading = embedName;
    out.summary = String((pdp?.overviewItems || []).map(item => item.title).filter(Boolean).join(' · ')).slice(0, 200);
    out.images = unique(own.length ? own : all);
    out.amenities = [...new Set(groups.flatMap(group =>
      (group?.amenities || []).map(item => item.title || item.localizedTitle || item.name)).filter(Boolean))];
    out.latitude = pdp?.location?.latitude ?? null;
    out.longitude = pdp?.location?.longitude ?? null;
    out.personCapacity = sharing.personCapacity ?? null;
    out.reviewCount = sharing.reviewCount ?? null;
    out.satisfaction = logging.guestSatisfactionOverall ?? null;
    out.isSuperhost = logging.isSuperhost ?? null;
    out.propertyType = sharing.propertyType || '';
    out.roomType = logging.roomType || '';
    return JSON.stringify(out);
  })
  .catch(error => JSON.stringify({ok: false, error: String(error).slice(0, 120)})))"""

CHECK_IN, CHECK_OUT, NIGHTS = "2026-11-01", "2026-11-06", 5

CITIES = {
    "hanoi": {
        "label": "Hà Nội",
        "districts": ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Đống Đa", "Quận Hai Bà Trưng",
                      "Quận Tây Hồ", "Quận Cầu Giấy", "Quận Thanh Xuân"],
    },
    "danang": {
        "label": "Đà Nẵng",
        "districts": ["Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn",
                      "Quận Liên Chiểu"],
    },
    "hcmc": {
        "label": "Hồ Chí Minh",
        "districts": ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 10", "Quận Bình Thạnh",
                      "Quận Phú Nhuận", "Quận Tân Bình", "Quận 7"],
    },
}


def orca(method, path, body=None, timeout=240):
    token = json.loads(STATE.read_text())["token"]
    request = urllib.request.Request(
        BASE + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"X-Orca-Token": token, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        return {"error": error.read().decode()[:200], "status": error.code}


def evaluate(session, expression, timeout=180):
    result = orca("POST", "/eval", {"session_id": session, "expression": expression}, timeout=timeout)
    value = result.get("result")
    return value if isinstance(value, str) else json.dumps(value)


def wait_ready(session, seconds=30):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if evaluate(session, "document.readyState") == "complete":
            return True
        time.sleep(0.5)
    return False


def search_url(query, band=(None, None), window=None, guests=1):
    """One query, sliced so each call returns a different set of listings.

    Airbnb renders at most ~24 cards per query with no usable next link, but another date window,
    another guest count or another price band returns a largely disjoint set — that is how a
    district is enumerated past its first page.
    """
    check_in, check_out = window or (CHECK_IN, CHECK_OUT)
    params = {
        "query": query,
        "check_in": check_in,
        "check_out": check_out,
        "adults": str(guests),
        "refinement_paths[]": "/homes",
    }
    low, high = band
    if low is not None or high is not None:
        params.update({"price_filter_input_type": "2", "price_filter_num_nights": str(NIGHTS)})
        if low is not None:
            params["price_min"] = str(low)
        if high is not None:
            params["price_max"] = str(high)
    return "https://www.airbnb.com.vn/s/homes?" + urllib.parse.urlencode(params)


BANDS = [(None, None), (0, 700_000), (700_000, 1_200_000), (1_200_000, 2_000_000),
         (2_000_000, 3_500_000), (3_500_000, None), (700_000, 1_000_000), (1_000_000, 1_500_000),
         (1_500_000, 2_500_000), (2_500_000, 5_000_000)]
WINDOWS = [(CHECK_IN, CHECK_OUT), ("2026-11-15", "2026-11-20"), ("2026-12-01", "2026-12-06"),
           ("2026-11-08", "2026-11-13"), ("2026-12-15", "2026-12-20")]
GUESTS = (1, 4, 2, 6)


def district_in(text, districts):
    lowered = fold(text)
    for name in districts:
        if fold(name) in lowered:
            return name
    return ""


def place_of(detail, districts, city):
    """The listing page's own claim: ogTitle carries district, type, rating and specs."""
    blob = f"{detail.get('pageTitle', '')} | {detail.get('ogTitle', '')} | {detail.get('description', '')}"
    return district_in(blob, districts), fold(city["label"]) in fold(blob)


def title_of(detail):
    """'Hilma Nouveau * 10 phút đến Hồ Hoàn Kiếm – Căn hộ cho thuê tại Quận Hai Bà Trưng, Ha Noi'."""
    if detail.get("heading"):
        return detail["heading"].strip()
    for value in (detail.get("pageTitle", ""), detail.get("ogTitle", "")):
        if " tại " in value:
            head = value.split(" tại ")[0]
            head = re.sub(r"\s+[–-]\s+(?:Căn hộ|Nhà|Phòng|Studio|Biệt thự|Loại hình)[^–-]*$", "", head)
            return head.strip(" ,–-")
    return ""


def specs_from_og(og_title, summary):
    """'Căn hộ cho thuê · Quận Hoàn Kiếm · ★5,0 · 1 phòng ngủ\\xa0 · 1 giường · 1 phòng tắm riêng'."""
    specs = {"guests": None, "bedrooms": None, "beds": None, "baths": None}
    parts = [part.strip() for part in (og_title or "").replace("\xa0", " ").split("·")]
    for part in parts:
        for label, key in (("phòng ngủ", "bedrooms"), ("giường", "beds"), ("phòng tắm", "baths")):
            if label in part:
                digits = "".join(ch for ch in part if ch.isdigit())
                if digits:
                    specs[key] = int(digits)
    if not any(specs[key] for key in ("bedrooms", "beds", "baths")):
        specs.update({key: value for key, value in parse_summary(summary).items() if value})
    return specs


def rating_of(detail, card_rating):
    """Prefer the page's own '★5,0', then the satisfaction score, then the card label."""
    og = detail.get("ogTitle", "").replace("\xa0", " ")
    match = re.search(r"★\s*([0-9][.,][0-9])", og)
    if match:
        return float(match.group(1).replace(",", "."))
    if detail.get("satisfaction"):
        return float(detail["satisfaction"])
    rating, _reviews = parse_rating(card_rating)
    return rating


def room_kind(detail):
    og = detail.get("ogTitle", "")
    kind = og.split("·")[0].strip() if "·" in og else ""
    if kind.endswith("cho thuê"):
        kind = kind[: -len("cho thuê")].strip()
    return kind or detail.get("propertyType", "")


def dotted_of(value):
    return f"{value:,}".replace(",", ".") if value else ""


def parse_summary(summary):
    specs = {"guests": None, "bedrooms": None, "beds": None, "baths": None}
    labels = {"khách": "guests", "phòng ngủ": "bedrooms", "giường": "beds", "phòng tắm": "baths"}
    for part in summary.replace("·", ",").split(","):
        for label, key in labels.items():
            if label in part:
                digits = "".join(ch for ch in part if ch.isdigit())
                if digits:
                    specs[key] = int(digits)
    return specs


def parse_rating(card_rating):
    """"5,0 (8)" -> (5.0, 8)."""
    if not card_rating:
        return None, None
    number = card_rating.split("(")[0].strip().replace(",", ".")
    try:
        rating = float(number)
    except ValueError:
        rating = None
    reviews = None
    if "(" in card_rating:
        digits = "".join(ch for ch in card_rating.split("(")[1] if ch.isdigit())
        reviews = int(digits) if digits else None
    return rating, reviews


def parse_price(card_text):
    """'4.025.000 ₫ Hiển thị chi tiết giá cho 5 đêm 4.025.000 ₫ cho 5 đêm …' -> (total, nights, per_night).

    The card is the only place the price lives: the listing page shows one only with dates.
    """
    text = card_text.replace(",", "")
    monthly = re.search(r"([\d.]+)\s*₫\s*(?:/|mỗi|cho)?\s*tháng", text)
    if monthly:
        total = int(monthly.group(1).replace(".", ""))
        return total, 30, round(total / 30)
    nightly = re.search(r"([\d.]+)\s*₫\s*(?:/|mỗi)\s*đêm", text)
    if nightly:
        per_night = int(nightly.group(1).replace(".", ""))
        return per_night * NIGHTS, NIGHTS, per_night
    total_match = re.search(r"([\d.]+)\s*₫", text)
    if not total_match:
        return None, None, None
    total = int(total_match.group(1).replace(".", ""))
    nights_match = re.search(r"cho\s*(\d+)\s*đêm", text)
    nights = int(nights_match.group(1)) if nights_match else NIGHTS
    if not 1 <= nights <= 60:
        nights = NIGHTS
    return total, nights, round(total / nights)


def record_for(card, detail, city, district):
    window = card.get("window") or (CHECK_IN, CHECK_OUT, 1)
    total, nights, per_night = parse_price(card["cardText"])
    _rating, reviews = parse_rating(card.get("rating", ""))
    specs = specs_from_og(detail.get("ogTitle", ""), detail.get("summary", ""))
    if specs["guests"] is None and detail.get("personCapacity"):
        specs["guests"] = detail["personCapacity"]
    text = f"{card['cardText']} {detail.get('ogTitle', '')}"
    images = detail.get("images", [])
    price_label = ""
    if per_night:
        price_label = f"{dotted_of(total)} ₫ cho {nights} đêm" if nights else f"{dotted_of(per_night)} ₫ / đêm"
    return {
        "id": card["id"],
        "listing_url": f"https://www.airbnb.com.vn/rooms/{card['id']}",
        "name": title_of(detail),
        "room_type": f"{room_kind(detail) or 'Chỗ ở'} tại {district}".strip(),
        "city": city["label"],
        "district": district,
        "neighborhood": district,
        "address": f"{district}, {city['label']}, Việt Nam",
        "latitude": detail.get("latitude"),
        "longitude": detail.get("longitude"),
        "price_per_night": per_night,
        "price_formatted": f"{dotted_of(per_night)} ₫ / đêm" if per_night else "",
        "price_total": total,
        "price_nights": nights,
        "price_label": price_label,
        "rating": rating_of(detail, card.get("rating", "")),
        "review_count": reviews if reviews is not None else detail.get("reviewCount"),
        "is_superhost": bool(detail.get("isSuperhost")),
        "is_guest_favorite": bool(card.get("guestFavorite")),
        "specs": specs,
        "amenities": detail.get("amenities", []),
        "images": images,
        "image_count": len(images),
        "cover_image": images[0] if images else "",
        "photo_count_on_card": card.get("photoCount"),
        "check_in": window[0],
        "check_out": window[1],
        "price_guests": window[2],
        "collected_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }


def cards_for_query(session, query, districts, wanted, known):
    """Enumerate one district through date windows, guest counts and price bands."""
    cards = []
    for window in WINDOWS:
        for guests in GUESTS:
            for band in BANDS:
                if len(cards) >= wanted:
                    return cards
                orca("POST", "/goto", {"session_id": session, "url": search_url(query, band, window, guests)})
                wait_ready(session)
                time.sleep(1.2)
                evaluate(session, "window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(0.8)
                try:
                    data = json.loads(evaluate(session, SEARCH_JS))
                except ValueError:
                    print(f"   unreadable slice {window} guests={guests} band={band}", flush=True)
                    continue
                kept, fresh = 0, 0
                for card in data["cards"]:
                    if not card["id"] or card["id"] in known:
                        continue
                    fresh += 1
                    district = district_in(card["cardText"], districts)
                    if district:
                        card["district"] = district
                        card["window"] = (window[0], window[1], guests)
                        cards.append(card)
                        known.add(card["id"])
                        kept += 1
                if kept:
                    print(f"   {window[0]} guests={guests} band {band[0] or 0}-{band[1] or '∞'}: "
                          f"+{kept} of {fresh} (queue {len(cards)})", flush=True)
                time.sleep(0.3)
    return cards


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("city", choices=sorted(CITIES))
    parser.add_argument("--limit", type=int, default=200)
    parser.add_argument("--pages", type=int, default=10)
    parser.add_argument("--districts", type=int, default=len(CITIES["hanoi"]["districts"]))
    args = parser.parse_args()
    city = CITIES[args.city]
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f"{args.city}.json"
    existing = json.loads(target.read_text()) if target.exists() else []
    keep = {record["id"]: record for record in existing}
    known = set(keep)
    print(f"{city['label']}: {len(keep)} records already on disk")

    session = orca("POST", "/sessions", {"url": search_url(f"{city['districts'][0]}, {city['label']}")})["session_id"]
    print("session:", session)
    try:
        wait_ready(session)
        queue = []
        for district in city["districts"][: args.districts]:
            if len(keep) + len(queue) >= args.limit:
                break
            query = f"{district}, {city['label']}"
            print(f" searching {query}", flush=True)
            wanted = args.limit - len(keep) - len(queue)
            queue.extend(cards_for_query(session, query, city["districts"], wanted, known))
        if len(keep) + len(queue) < args.limit:
            print(" topping up from the whole city", flush=True)
            wanted = args.limit - len(keep) - len(queue)
            queue.extend(cards_for_query(session, city["label"], city["districts"], wanted, known))
        print(f" fetching {len(queue)} listing pages")
        for index, card in enumerate(queue, 1):
            detail = {}
            for attempt in (1, 2):
                try:
                    answer = json.loads(evaluate(session, f"({DETAIL_FETCH})({json.dumps(card['id'])})", timeout=120))
                except ValueError:
                    answer = None
                if isinstance(answer, dict) and answer.get("ok"):
                    detail = answer
                    break
                if attempt == 1:
                    time.sleep(1.5)
                    evaluate(session, "1")  # a no-op read keeps the page context fresh between tries
            if not detail or not detail.get("images"):
                print(f"  {index}/{len(queue)} {card['id']}: skipped", flush=True)
                continue
            district, in_city = place_of(detail, city["districts"], city)
            if not district or not in_city:
                print(f"  {index}/{len(queue)} {card['id']}: outside {city['label']} central districts "
                      f"({detail.get('pageTitle', '')[:60]})")
                continue
            record = record_for(card, detail, city, district)
            keep[record["id"]] = record
            if index % 25 == 0 or index == len(queue):
                target.write_text(json.dumps(list(keep.values()), ensure_ascii=False, indent=1))
                print(f"  {index}/{len(queue)} saved {len(keep)} "
                      f"(last: {record['district']}, {record['image_count']} images)", flush=True)
            time.sleep(0.2)
    finally:
        target.write_text(json.dumps(list(keep.values()), ensure_ascii=False, indent=1))
        print(f"wrote {target} ({len(keep)} records)")
        orca("DELETE", f"/sessions/{session}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
