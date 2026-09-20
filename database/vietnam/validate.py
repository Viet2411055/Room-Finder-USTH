"""Check the harvested city files against what the project needs."""

import json
import os
import pathlib
import statistics
import sys

DATA = pathlib.Path(os.environ.get("ROOMFINDER_DATA", os.environ["COMMANDCODE_SCRATCHPAD"] + "/roomfinder-data"))
EXPECTED = {"hanoi": "Hà Nội", "danang": "Đà Nẵng", "hcmc": "Hồ Chí Minh"}
REQUIRED = ("id", "listing_url", "name", "city", "district", "price_per_night", "specs", "amenities", "images")

ok = True
for name, city in EXPECTED.items():
    path = DATA / f"{name}.json"
    if not path.exists():
        print(f"{name}: MISSING")
        ok = False
        continue
    records = json.loads(path.read_text())
    ids = [record["id"] for record in records]
    unique = len(set(ids))
    images = [len(record["images"]) for record in records]
    hosts = {record["images"][0].split("/")[2] for record in records if record["images"]}
    prices = [record["price_per_night"] for record in records if record["price_per_night"]]
    districts = {}
    for record in records:
        districts[record["district"]] = districts.get(record["district"], 0) + 1
    missing = {field: sum(1 for record in records if not record.get(field)) for field in REQUIRED}
    cities = {record["city"] for record in records}
    print(f"--- {name} ({city}) ---")
    print(f"  records {len(records)} | unique ids {unique} | cities in file {sorted(cities)}")
    print(f"  images: min {min(images) if images else 0} median {int(statistics.median(images)) if images else 0} "
          f"max {max(images) if images else 0} | hosts {sorted(hosts)}")
    print(f"  image urls >=5 for {sum(1 for n in images if n >= 5)}/{len(records)} listings")
    print(f"  price/night: min {min(prices) if prices else 0:,} median {int(statistics.median(prices)) if prices else 0:,} "
          f"max {max(prices) if prices else 0:,}")
    print(f"  districts: {dict(sorted(districts.items(), key=lambda item: -item[1]))}")
    print(f"  missing fields: {missing}")
    if len(records) < 200 or unique != len(records) or any(n < 5 for n in images) or any(missing.values()):
        ok = False
print("RESULT:", "all city files meet the brief" if ok else "some checks failed")
sys.exit(0 if ok else 1)
