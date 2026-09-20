#!/usr/bin/env python3
"""
Enrich and mock data for RoomFinder.
Reads from database/vietnam/*.json and writes enriched JSON files to database/development/json/.
"""

import json
import os
import random
from datetime import datetime, timedelta

ROOT_DIR = "/Users/ducnv/Workspace/room-finder"
INPUT_DIR = os.path.join(ROOT_DIR, "database", "vietnam")
OUTPUT_DIR = os.path.join(ROOT_DIR, "database", "development", "json")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. 18 Real Vietnamese Hosts
HOST_PROFILES = [
    {
        "id": "host-01",
        "name": "Trần Minh Quân",
        "email": "quan.tran@roomfinder.vn",
        "phone": "0988 123 456",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "about": "Xin chào! Mình là Quân, người đam mê du lịch và kiến trúc bản địa. Mình luôn mong muốn mang đến cho quý khách trải nghiệm ấm cúng, tiện nghi như chính ngôi nhà của bạn.",
        "is_superhost": True,
        "response_rate": "100%",
        "response_time": "trong vòng vài phút",
        "joined_date": "tháng 3 năm 2021",
        "identity_verified": True
    },
    {
        "id": "host-02",
        "name": "Nguyễn Thu Hà",
        "email": "thuha.nguyen@roomfinder.vn",
        "phone": "0977 234 567",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        "about": "Chào mừng bạn đến với căn hộ của mình. Mình yêu thích nấu ăn và thiết kế nội thất tối giản phong cách Bắc Âu kết hợp Á Đông.",
        "is_superhost": True,
        "response_rate": "99%",
        "response_time": "trong vòng 1 giờ",
        "joined_date": "tháng 6 năm 2020",
        "identity_verified": True
    },
    {
        "id": "host-03",
        "name": "Lê Bảo Ngọc",
        "email": "baongoc.le@roomfinder.vn",
        "phone": "0912 345 678",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        "about": "Host tận tâm tại Đà Nẵng và Hội An. Sẵn sàng hỗ trợ bạn gợi ý các quán ăn ngon bản địa và lịch trình khám phá trọn vẹn nhất.",
        "is_superhost": True,
        "response_rate": "100%",
        "response_time": "trong vòng 30 phút",
        "joined_date": "tháng 1 năm 2019",
        "identity_verified": True
    },
    {
        "id": "host-04",
        "name": "Hoàng Đức Anh",
        "email": "ducanh.hoang@roomfinder.vn",
        "phone": "0903 456 789",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        "about": "Kiến trúc sư trẻ yêu thích việc biến những không gian nhỏ thành nơi lưu trú đậm chất nghệ thuật và tràn ngập ánh sáng tự nhiên.",
        "is_superhost": False,
        "response_rate": "95%",
        "response_time": "trong vòng 2 giờ",
        "joined_date": "tháng 9 năm 2022",
        "identity_verified": True
    },
    {
        "id": "host-05",
        "name": "Vũ Mai Phương",
        "email": "maiphuong.vu@roomfinder.vn",
        "phone": "0934 567 890",
        "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
        "about": "Mình quản lý chuỗi homestay boutique tại trung tâm Quận 1 và Hoàn Kiếm. Tiêu chí hàng đầu là sự sạch sẽ, an toàn và tinh tế.",
        "is_superhost": True,
        "response_rate": "100%",
        "response_time": "trong vòng 1 giờ",
        "joined_date": "tháng 4 năm 2021",
        "identity_verified": True
    },
    {
        "id": "host-06",
        "name": "Đặng Tuấn Kiệt",
        "email": "tuankiet.dang@roomfinder.vn",
        "phone": "0945 678 901",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        "about": "Người Sài Gòn chính gốc, rất vui được đón tiếp du khách bốn phương trải nghiệm sự sôi động và lòng hiếu khách của miền Nam.",
        "is_superhost": True,
        "response_rate": "98%",
        "response_time": "trong vòng 1 giờ",
        "joined_date": "tháng 11 năm 2018",
        "identity_verified": True
    },
    {
        "id": "host-07",
        "name": "Bùi Khánh Linh",
        "email": "khanhlinh.bui@roomfinder.vn",
        "phone": "0967 890 123",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        "about": "Chào các bạn! Mình đam mê nhiếp ảnh và du lịch bụi. Mỗi góc nhỏ trong căn nhà đều được mình tự tay chăm chút và trang trí.",
        "is_superhost": False,
        "response_rate": "96%",
        "response_time": "trong vòng vài giờ",
        "joined_date": "tháng 8 năm 2023",
        "identity_verified": True
    },
    {
        "id": "host-08",
        "name": "Phạm Hoàng Long",
        "email": "hoanglong.pham@roomfinder.vn",
        "phone": "0989 012 345",
        "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
        "about": "Host tại các khu căn hộ cao cấp ven biển Sơn Trà và trung tâm Tây Hồ. Hỗ trợ check-in tự động 24/7 siêu tiện lợi.",
        "is_superhost": True,
        "response_rate": "100%",
        "response_time": "trong vòng 10 phút",
        "joined_date": "tháng 2 năm 2021",
        "identity_verified": True
    },
    {
        "id": "host-09",
        "name": "Dương Thùy Chi",
        "email": "thuychi.duong@roomfinder.vn",
        "phone": "0976 112 233",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "about": "Yêu thiên nhiên và không gian sống xanh. Căn hộ có ban công ngập tràn cây cảnh và view ngắm hoàng hôn tuyệt đẹp.",
        "is_superhost": True,
        "response_rate": "99%",
        "response_time": "trong vòng 30 phút",
        "joined_date": "tháng 5 năm 2019",
        "identity_verified": True
    },
    {
        "id": "host-10",
        "name": "Ngô Quốc Huy",
        "email": "quochuy.ngo@roomfinder.vn",
        "phone": "0913 223 344",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
        "about": "Kinh doanh homestay với phương châm mang lại sự thoải mái tối đa với mức chi phí hợp lý nhất cho mọi gia đình và nhóm bạn.",
        "is_superhost": False,
        "response_rate": "92%",
        "response_time": "trong vòng 2 giờ",
        "joined_date": "tháng 7 năm 2022",
        "identity_verified": True
    },
    {
        "id": "host-11",
        "name": "Phan Thanh Trúc",
        "email": "thanhtruc.phan@roomfinder.vn",
        "phone": "0935 334 455",
        "avatar_url": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
        "about": "Không gian sống hiện đại, đầy đủ tiện nghi giặt ủi, bếp nấu và wifi tốc độ cao cực kỳ thích hợp cho các bạn làm việc từ xa.",
        "is_superhost": True,
        "response_rate": "100%",
        "response_time": "trong vòng 15 phút",
        "joined_date": "tháng 12 năm 2020",
        "identity_verified": True
    },
    {
        "id": "host-12",
        "name": "Đỗ Minh Khang",
        "email": "minhkhang.do@roomfinder.vn",
        "phone": "0946 445 566",
        "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
        "about": "Nhiệt tình, chu đáo và luôn sẵn sàng hỗ trợ khách hàng bất kỳ lúc nào để chuyến đi của bạn thêm trọn vẹn và đáng nhớ.",
        "is_superhost": True,
        "response_rate": "98%",
        "response_time": "trong vòng 1 giờ",
        "joined_date": "tháng 3 năm 2022",
        "identity_verified": True
    }
]

# 2. Authentic Vietnamese Reviewers & Comments
REVIEWER_NAMES = [
    ("Nguyễn Hoàng Nam", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"),
    ("Trần Thị Bích", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"),
    ("Lê Minh Trí", "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80"),
    ("Phạm Thu Thảo", "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80"),
    ("Hoàng Kim Ngân", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"),
    ("Vũ Thành Đạt", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"),
    ("Đinh Ngọc Mai", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"),
    ("Đặng Thế Bảo", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"),
    ("Bùi Phương Linh", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"),
    ("Trịnh Quang Huy", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80")
]

POSITIVE_COMMENTS = [
    "Căn phòng tuyệt vời vượt xa mong đợi của mình! Rất sạch sẽ, thơm tho và đầy đủ tiện nghi từ máy sấy, bàn là đến bếp nấu. Vị trí ngay trung tâm rất thuận tiện đi lại.",
    "Chủ nhà vô cùng nhiệt tình và chu đáo, hướng dẫn check-in chi tiết và phản hồi rất nhanh. Không gian yên tĩnh, giường êm giúp mình có giấc ngủ ngon sau ngày dài dạo chơi.",
    "Góc ban công ngắm hoàng hôn rất chill, ánh sáng tự nhiên ngập tràn phòng. Đồ dùng trong phòng đều mới và cao cấp. Chắc chắn sẽ quay lại khi có dịp!",
    "Vị trí đắc địa, xung quanh có rất nhiều quán cà phê đẹp và quán ăn ngon bản địa. Khóa thông minh tiện lợi nên tự nhận phòng rất dễ dàng.",
    "Phòng ốc y hệt như hình ảnh đăng tải. Thiết kế tinh tế, không gian thoáng đãng. Rất phù hợp cho cặp đôi hoặc các bạn đi công tác cần không gian làm việc riêng.",
    "Trải nghiệm nghỉ dưỡng tuyệt vời! Nhà tắm sạch bóng, nước nóng mạnh, máy lạnh mát rượi. Đánh giá 5 sao cho chất lượng dịch vụ của chủ nhà.",
    "Căn hộ đẹp lung linh, sống ảo góc nào cũng xinh. Đồ đạc được sắp xếp gọn gàng, ngăn nắp. Rất thích sự hiếu khách và hỗ trợ tận tình của bạn host."
]

NEUTRAL_COMMENTS = [
    "Phòng sạch sẽ và tiện nghi ổn, vị trí thuận lợi. Điểm trừ nhỏ là giờ cao điểm đường hơi đông một chút, nhưng nhìn chung kỳ nghỉ rất thoải mái.",
    "Không gian đẹp, chủ nhà nhiệt tình. Căn phòng hơi cách âm chưa tốt lắm nếu có xe chạy qua, bù lại view và tiện nghi rất xứng đáng với giá tiền."
]

HOST_REPLIES = [
    "Cảm ơn bạn rất nhiều vì đã lựa chọn nghỉ ngơi tại căn hộ của mình! Rất vui vì bạn đã có trải nghiệm đáng nhớ và hy vọng sớm được đón tiếp bạn lần tới nhé!",
    "Cảm ơn những lời nhận xét chân thành của bạn. Sự hài lòng của quý khách là động lực lớn nhất của chúng mình. Chúc bạn luôn có những chuyến đi thật vui vẻ!",
    "Rất cảm ơn bạn đã góp ý quý báu. Chúc bạn nhiều sức khỏe và hy vọng lại được gặp bạn trong chuyến du lịch tiếp theo!"
]

def generate_description(item):
    name = item.get("name", "Căn hộ sang trọng")
    city = item.get("city", "Việt Nam")
    district = item.get("district", "trung tâm")
    specs = item.get("specs", {})
    guests = specs.get("guests", 2)
    bedrooms = specs.get("bedrooms", 1) or 1
    beds = specs.get("beds", 1) or 1
    baths = specs.get("baths", 1) or 1
    amenities = item.get("amenities", [])
    sample_amenities = ", ".join(amenities[:4]) if amenities else "Wifi tốc độ cao, điều hòa, nước nóng"
    
    para1 = (
        f"Chào mừng bạn đến với {name} tọa lạc tại vị trí đắc địa thuộc {district}, {city}. "
        f"Căn hộ sở hữu không gian mở thoáng đãng, ngập tràn ánh sáng tự nhiên với diện tích tối ưu, "
        f"bao gồm {bedrooms} phòng ngủ ấm cúng, {beds} giường êm ái và {baths} phòng tắm hiện đại, "
        f"được trang bị đầy đủ để phục vụ tối đa {guests} khách lưu trú thoải mái nhất."
    )
    para2 = (
        f"Không gian được chăm chút tỉ mỉ với đầy đủ tiện ích sinh hoạt tiện lợi như {sample_amenities} và khu vực bếp tiện nghi. "
        f"Từ đây, bạn có thể dễ dàng đi bộ hoặc bắt xe đến các điểm tham quan biểu tượng, nhà hàng ẩm thực phong phú và quán cà phê nổi tiếng của {city}. "
        f"Hệ thống khóa thông minh tự nhận phòng 24/7 mang đến sự riêng tư, linh hoạt và thuận tiện tuyệt đối cho kỳ nghỉ hoặc chuyến công tác của bạn."
    )
    return f"{para1}\n\n{para2}"

def generate_reviews(listing_id, count=3):
    reviews = []
    base_date = datetime(2026, 9, 20)
    selected_reviewers = random.sample(REVIEWER_NAMES, min(count, len(REVIEWER_NAMES)))
    
    for i, (rev_name, rev_avatar) in enumerate(selected_reviewers):
        days_ago = random.randint(3 + i * 15, 20 + i * 25)
        rev_date = (base_date - timedelta(days=days_ago)).strftime("%d/%m/%Y")
        
        is_five_star = random.random() < 0.85
        rating = 5 if is_five_star else 4
        comment = random.choice(POSITIVE_COMMENTS) if is_five_star else random.choice(NEUTRAL_COMMENTS)
        
        has_reply = random.random() < 0.6
        host_reply = random.choice(HOST_REPLIES) if has_reply else None
        
        reviews.append({
            "id": f"rev-{listing_id}-{i+1}",
            "listing_id": str(listing_id),
            "reviewer_name": rev_name,
            "reviewer_avatar": rev_avatar,
            "date": rev_date,
            "rating": rating,
            "comment": comment,
            "host_reply": host_reply
        })
    return reviews

def generate_booked_dates():
    # 2 to 3 booked ranges in Oct, Nov, Dec 2026
    ranges = []
    # Oct 2026
    d1 = random.randint(3, 10)
    ranges.append({
        "check_in": f"2026-10-{d1:02d}",
        "check_out": f"2026-10-{d1+random.randint(2, 4):02d}"
    })
    # Nov 2026
    d2 = random.randint(12, 18)
    ranges.append({
        "check_in": f"2026-11-{d2:02d}",
        "check_out": f"2026-11-{d2+random.randint(2, 4):02d}"
    })
    # Dec 2026 (optional)
    if random.random() < 0.7:
        d3 = random.randint(20, 25)
        ranges.append({
            "check_in": f"2026-12-{d3:02d}",
            "check_out": f"2026-12-{d3+random.randint(2, 5):02d}"
        })
    return ranges

def enrich_listing(item, index, total):
    # Assign Host
    host = HOST_PROFILES[index % len(HOST_PROFILES)]
    
    # Description
    description = generate_description(item)
    
    # Reviews
    rev_count = random.randint(3, 6)
    reviews = generate_reviews(item["id"], rev_count)
    avg_rating = round(sum(r["rating"] for r in reviews) / len(reviews), 2)
    
    # Booked dates
    booked_dates = generate_booked_dates()
    
    # Fees & Policies
    price_night = item.get("price_per_night", 500000)
    cleaning_fee = round((price_night * 0.15) / 10000) * 10000
    if cleaning_fee < 100000: cleaning_fee = 100000
    if cleaning_fee > 350000: cleaning_fee = 350000
    
    service_fee_rate = 0.08  # 8%
    
    # Rules
    house_rules = [
        "Nhận phòng sau 14:00 và trả phòng trước 12:00",
        "Không hút thuốc trong phòng và ban công kín",
        "Không tổ chức tiệc tùng hoặc gây ồn ào sau 22:00",
        "Vui lòng tắt các thiết bị điện khi ra khỏi phòng",
        "Không mang thú cưng (trừ khi có sự đồng ý trước của chủ nhà)"
    ]
    
    cancellation_policy = {
        "title": "Hủy miễn phí trong vòng 48 giờ",
        "description": "Được hoàn tiền 100% nếu bạn hủy trước ngày nhận phòng ít nhất 48 giờ. Hủy sau thời gian này sẽ áp dụng chính sách hoàn 50% tiền phòng."
    }
    
    # Ensure images have at least 5 images (if less, pad with the first image)
    images = item.get("images", [])
    if len(images) < 5 and images:
        while len(images) < 5:
            images.append(images[0])
    
    enriched = dict(item)
    enriched["host_id"] = host["id"]
    enriched["host"] = {
        "id": host["id"],
        "name": host["name"],
        "avatar_url": host["avatar_url"],
        "about": host["about"],
        "is_superhost": host["is_superhost"],
        "response_rate": host["response_rate"],
        "response_time": host["response_time"],
        "joined_date": host["joined_date"],
        "phone": host["phone"],
        "email": host["email"]
    }
    enriched["description"] = description
    enriched["reviews"] = reviews
    enriched["rating"] = avg_rating
    enriched["review_count"] = len(reviews)
    enriched["booked_dates"] = booked_dates
    enriched["cleaning_fee"] = cleaning_fee
    enriched["service_fee_rate"] = service_fee_rate
    enriched["house_rules"] = house_rules
    enriched["cancellation_policy"] = cancellation_policy
    enriched["images"] = images
    enriched["image_count"] = len(images)
    
    return enriched

def main():
    print("Starting data enrichment...")
    all_enriched_listings = []
    city_files = ["hanoi.json", "danang.json", "hcmc.json"]
    
    for filename in city_files:
        in_path = os.path.join(INPUT_DIR, filename)
        if not os.path.exists(in_path):
            print(f"File not found: {in_path}")
            continue
        with open(in_path, "r", encoding="utf-8") as f:
            items = json.load(f)
            
        print(f"Enriching {filename} ({len(items)} items)...")
        enriched_city_items = []
        for i, item in enumerate(items):
            enr = enrich_listing(item, len(all_enriched_listings), 500)
            enriched_city_items.append(enr)
            all_enriched_listings.append(enr)
            
        # Write enriched city file
        out_path = os.path.join(OUTPUT_DIR, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(enriched_city_items, f, ensure_ascii=False, indent=2)
        print(f"Saved {out_path}")

    # Write combined listings.json
    listings_path = os.path.join(OUTPUT_DIR, "listings.json")
    with open(listings_path, "w", encoding="utf-8") as f:
        json.dump(all_enriched_listings, f, ensure_ascii=False, indent=2)
    print(f"Saved all {len(all_enriched_listings)} listings to {listings_path}")

    # Write hosts.json
    # Update host listing counts
    host_counts = {}
    for l in all_enriched_listings:
        hid = l["host_id"]
        host_counts[hid] = host_counts.get(hid, 0) + 1
        
    enriched_hosts = []
    for h in HOST_PROFILES:
        h_copy = dict(h)
        h_copy["listings_count"] = host_counts.get(h["id"], 0)
        enriched_hosts.append(h_copy)
        
    hosts_path = os.path.join(OUTPUT_DIR, "hosts.json")
    with open(hosts_path, "w", encoding="utf-8") as f:
        json.dump(enriched_hosts, f, ensure_ascii=False, indent=2)
    print(f"Saved hosts.json ({len(enriched_hosts)} hosts)")

    # Write users.json
    users = [
        {
            "id": "user-traveler-01",
            "name": "Nguyễn Văn Đức",
            "email": "traveler@roomfinder.vn",
            "password": "password123",
            "phone": "0912 345 678",
            "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
            "role": "traveler",
            "host_id": None,
            "created_at": "2024-01-15T08:00:00Z"
        },
        {
            "id": "user-host-01",
            "name": "Trần Minh Quân",
            "email": "host@roomfinder.vn",
            "password": "password123",
            "phone": "0988 123 456",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            "role": "host",
            "host_id": "host-01",
            "created_at": "2021-03-10T10:00:00Z"
        },
        {
            "id": "user-admin-01",
            "name": "Quản Trị Viên RoomFinder",
            "email": "admin@roomfinder.vn",
            "password": "password123",
            "phone": "0900 000 000",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
            "role": "admin",
            "host_id": None,
            "created_at": "2020-01-01T00:00:00Z"
        }
    ]
    users_path = os.path.join(OUTPUT_DIR, "users.json")
    with open(users_path, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    print(f"Saved users.json ({len(users)} users)")

    # Write bookings.json (Traveler trips & Host reservations)
    traveler_id = "user-traveler-01"
    host_id = "host-01" # Trần Minh Quân
    
    # Find listings belonging to host-01 and other listings
    host_01_listings = [l for l in all_enriched_listings if l["host_id"] == host_id]
    other_listings = [l for l in all_enriched_listings if l["host_id"] != host_id]
    
    sample_rooms_for_traveler = random.sample(all_enriched_listings, min(6, len(all_enriched_listings)))
    
    bookings = [
        # Upcoming trip 1 for traveler (also on host-01's room!)
        {
            "id": "bk-1001",
            "booking_code": "RF-2026-8819",
            "user_id": traveler_id,
            "guest_name": "Nguyễn Văn Đức",
            "guest_email": "traveler@roomfinder.vn",
            "guest_phone": "0912 345 678",
            "listing_id": host_01_listings[0]["id"] if host_01_listings else sample_rooms_for_traveler[0]["id"],
            "listing_name": host_01_listings[0]["name"] if host_01_listings else sample_rooms_for_traveler[0]["name"],
            "city": host_01_listings[0]["city"] if host_01_listings else sample_rooms_for_traveler[0]["city"],
            "district": host_01_listings[0]["district"] if host_01_listings else sample_rooms_for_traveler[0]["district"],
            "cover_image": host_01_listings[0]["cover_image"] if host_01_listings else sample_rooms_for_traveler[0]["cover_image"],
            "host_id": host_id,
            "host_name": "Trần Minh Quân",
            "check_in": "2026-10-15",
            "check_out": "2026-10-18",
            "nights": 3,
            "guests": 2,
            "price_per_night": host_01_listings[0]["price_per_night"] if host_01_listings else 850000,
            "cleaning_fee": 150000,
            "service_fee": 204000,
            "total_price": (host_01_listings[0]["price_per_night"] * 3 + 150000 + 204000) if host_01_listings else 2904000,
            "status": "UPCOMING",
            "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
            "created_at": "2026-09-22T14:30:00Z"
        },
        # Upcoming trip 2 for traveler
        {
            "id": "bk-1002",
            "booking_code": "RF-2026-9042",
            "user_id": traveler_id,
            "guest_name": "Nguyễn Văn Đức",
            "guest_email": "traveler@roomfinder.vn",
            "guest_phone": "0912 345 678",
            "listing_id": sample_rooms_for_traveler[1]["id"],
            "listing_name": sample_rooms_for_traveler[1]["name"],
            "city": sample_rooms_for_traveler[1]["city"],
            "district": sample_rooms_for_traveler[1]["district"],
            "cover_image": sample_rooms_for_traveler[1]["cover_image"],
            "host_id": sample_rooms_for_traveler[1]["host_id"],
            "host_name": sample_rooms_for_traveler[1]["host"]["name"],
            "check_in": "2026-11-05",
            "check_out": "2026-11-08",
            "nights": 3,
            "guests": 2,
            "price_per_night": sample_rooms_for_traveler[1]["price_per_night"],
            "cleaning_fee": 200000,
            "service_fee": int(sample_rooms_for_traveler[1]["price_per_night"] * 3 * 0.08),
            "total_price": sample_rooms_for_traveler[1]["price_per_night"] * 3 + 200000 + int(sample_rooms_for_traveler[1]["price_per_night"] * 3 * 0.08),
            "status": "UPCOMING",
            "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
            "created_at": "2026-09-24T09:15:00Z"
        },
        # Completed trip 1 (ready for Write Review)
        {
            "id": "bk-1003",
            "booking_code": "RF-2026-7215",
            "user_id": traveler_id,
            "guest_name": "Nguyễn Văn Đức",
            "guest_email": "traveler@roomfinder.vn",
            "guest_phone": "0912 345 678",
            "listing_id": sample_rooms_for_traveler[2]["id"],
            "listing_name": sample_rooms_for_traveler[2]["name"],
            "city": sample_rooms_for_traveler[2]["city"],
            "district": sample_rooms_for_traveler[2]["district"],
            "cover_image": sample_rooms_for_traveler[2]["cover_image"],
            "host_id": sample_rooms_for_traveler[2]["host_id"],
            "host_name": sample_rooms_for_traveler[2]["host"]["name"],
            "check_in": "2026-08-10",
            "check_out": "2026-08-13",
            "nights": 3,
            "guests": 2,
            "price_per_night": sample_rooms_for_traveler[2]["price_per_night"],
            "cleaning_fee": 150000,
            "service_fee": int(sample_rooms_for_traveler[2]["price_per_night"] * 3 * 0.08),
            "total_price": sample_rooms_for_traveler[2]["price_per_night"] * 3 + 150000 + int(sample_rooms_for_traveler[2]["price_per_night"] * 3 * 0.08),
            "status": "COMPLETED",
            "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
            "created_at": "2026-08-01T11:00:00Z"
        },
        # Completed trip 2
        {
            "id": "bk-1004",
            "booking_code": "RF-2026-6140",
            "user_id": traveler_id,
            "guest_name": "Nguyễn Văn Đức",
            "guest_email": "traveler@roomfinder.vn",
            "guest_phone": "0912 345 678",
            "listing_id": sample_rooms_for_traveler[3]["id"],
            "listing_name": sample_rooms_for_traveler[3]["name"],
            "city": sample_rooms_for_traveler[3]["city"],
            "district": sample_rooms_for_traveler[3]["district"],
            "cover_image": sample_rooms_for_traveler[3]["cover_image"],
            "host_id": sample_rooms_for_traveler[3]["host_id"],
            "host_name": sample_rooms_for_traveler[3]["host"]["name"],
            "check_in": "2026-07-20",
            "check_out": "2026-07-23",
            "nights": 3,
            "guests": 3,
            "price_per_night": sample_rooms_for_traveler[3]["price_per_night"],
            "cleaning_fee": 200000,
            "service_fee": int(sample_rooms_for_traveler[3]["price_per_night"] * 3 * 0.08),
            "total_price": sample_rooms_for_traveler[3]["price_per_night"] * 3 + 200000 + int(sample_rooms_for_traveler[3]["price_per_night"] * 3 * 0.08),
            "status": "COMPLETED",
            "payment_method": "Chuyển khoản QR ngân hàng",
            "created_at": "2026-07-10T16:20:00Z"
        },
        # Cancelled trip
        {
            "id": "bk-1005",
            "booking_code": "RF-2026-5311",
            "user_id": traveler_id,
            "guest_name": "Nguyễn Văn Đức",
            "guest_email": "traveler@roomfinder.vn",
            "guest_phone": "0912 345 678",
            "listing_id": sample_rooms_for_traveler[4]["id"],
            "listing_name": sample_rooms_for_traveler[4]["name"],
            "city": sample_rooms_for_traveler[4]["city"],
            "district": sample_rooms_for_traveler[4]["district"],
            "cover_image": sample_rooms_for_traveler[4]["cover_image"],
            "host_id": sample_rooms_for_traveler[4]["host_id"],
            "host_name": sample_rooms_for_traveler[4]["host"]["name"],
            "check_in": "2026-06-15",
            "check_out": "2026-06-18",
            "nights": 3,
            "guests": 2,
            "price_per_night": sample_rooms_for_traveler[4]["price_per_night"],
            "cleaning_fee": 150000,
            "service_fee": int(sample_rooms_for_traveler[4]["price_per_night"] * 3 * 0.08),
            "total_price": sample_rooms_for_traveler[4]["price_per_night"] * 3 + 150000 + int(sample_rooms_for_traveler[4]["price_per_night"] * 3 * 0.08),
            "status": "CANCELLED",
            "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
            "created_at": "2026-06-05T08:30:00Z"
        }
    ]

    # Additional bookings specifically targeting host-01's listings from other guests
    guest_names = [("Lê Phương Linh", "0901 234 567"), ("Đỗ Hoàng Quân", "0932 456 789"), ("Phạm Bích Ngọc", "0918 765 432")]
    if len(host_01_listings) > 1:
        for idx, (g_name, g_phone) in enumerate(guest_names):
            target_room = host_01_listings[(idx + 1) % len(host_01_listings)]
            pn = target_room["price_per_night"]
            bookings.append({
                "id": f"bk-host01-{idx+1}",
                "booking_code": f"RF-2026-HOST-{idx+100}",
                "user_id": f"user-guest-{idx+1}",
                "guest_name": g_name,
                "guest_email": f"guest{idx+1}@gmail.com",
                "guest_phone": g_phone,
                "listing_id": target_room["id"],
                "listing_name": target_room["name"],
                "city": target_room["city"],
                "district": target_room["district"],
                "cover_image": target_room["cover_image"],
                "host_id": host_id,
                "host_name": "Trần Minh Quân",
                "check_in": f"2026-10-{20+idx*3}",
                "check_out": f"2026-10-{22+idx*3}",
                "nights": 2,
                "guests": 2,
                "price_per_night": pn,
                "cleaning_fee": 150000,
                "service_fee": int(pn * 2 * 0.08),
                "total_price": pn * 2 + 150000 + int(pn * 2 * 0.08),
                "status": "UPCOMING" if idx == 0 else "COMPLETED",
                "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa)",
                "created_at": "2026-09-18T10:00:00Z"
            })

    bookings_path = os.path.join(OUTPUT_DIR, "bookings.json")
    with open(bookings_path, "w", encoding="utf-8") as f:
        json.dump(bookings, f, ensure_ascii=False, indent=2)
    print(f"Saved bookings.json ({len(bookings)} bookings)")

    # Write wishlists.json
    wishlist_ids = [l["id"] for l in sample_rooms_for_traveler[:4]]
    wishlist_items = [
        {
            "id": f"wl-{i+1}",
            "user_id": traveler_id,
            "listing_id": lid,
            "created_at": "2026-09-20T12:00:00Z"
        }
        for i, lid in enumerate(wishlist_ids)
    ]
    wishlist_path = os.path.join(OUTPUT_DIR, "wishlists.json")
    with open(wishlist_path, "w", encoding="utf-8") as f:
        json.dump(wishlist_items, f, ensure_ascii=False, indent=2)
    print(f"Saved wishlists.json ({len(wishlist_items)} items)")

    print("\nData enrichment and mocking completed successfully!")

if __name__ == "__main__":
    main()
