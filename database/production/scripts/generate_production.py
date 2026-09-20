#!/usr/bin/env python3
"""
generate_production.py
Generates the complete production schema seed SQL files and JSON data for RoomFinder.
Reads from database/vietnam/*.json and creates normalized, verified production assets in:
- database/production/json/
- database/production/sql/
"""

import json
import os
import re
import random
from datetime import datetime, timedelta

ROOT_DIR = "/Users/ducnv/Workspace/room-finder"
INPUT_DIR = os.path.join(ROOT_DIR, "database", "vietnam")
PROD_DIR = os.path.join(ROOT_DIR, "database", "production")
JSON_DIR = os.path.join(PROD_DIR, "json")
SQL_DIR = os.path.join(PROD_DIR, "sql")

os.makedirs(JSON_DIR, exist_ok=True)
os.makedirs(SQL_DIR, exist_ok=True)

# Fixed seed for deterministic generation
random.seed(42)

# ==============================================================================
# 1. CITIES & DISTRICTS METADATA
# ==============================================================================
CITIES = [
    {
        "id": "city-hanoi",
        "name": "Hà Nội",
        "slug": "ha-noi",
        "country": "Việt Nam",
        "latitude": 21.028511,
        "longitude": 105.854167,
        "image_url": "https://images.unsplash.com/photo-1509030450996-9321c8b939f6?auto=format&fit=crop&w=800&q=80",
        "districts": [
            {"id": "dist-hn-01", "name": "Quận Ba Đình", "slug": "quan-ba-dinh", "lat": 21.0341, "lon": 105.8239},
            {"id": "dist-hn-02", "name": "Quận Hoàn Kiếm", "slug": "quan-hoan-kiem", "lat": 21.0292, "lon": 105.8524},
            {"id": "dist-hn-03", "name": "Quận Tây Hồ", "slug": "quan-tay-ho", "lat": 21.0717, "lon": 105.8228},
            {"id": "dist-hn-04", "name": "Quận Đống Đa", "slug": "quan-dong-da", "lat": 21.0181, "lon": 105.8299},
            {"id": "dist-hn-05", "name": "Quận Hai Bà Trưng", "slug": "quan-hai-ba-trung", "lat": 21.0084, "lon": 105.8569},
            {"id": "dist-hn-06", "name": "Quận Cầu Giấy", "slug": "quan-cau-giay", "lat": 21.0313, "lon": 105.7938},
            {"id": "dist-hn-07", "name": "Quận Thanh Xuân", "slug": "quan-thanh-xuan", "lat": 20.9937, "lon": 105.8115},
        ]
    },
    {
        "id": "city-danang",
        "name": "Đà Nẵng",
        "slug": "da-nang",
        "country": "Việt Nam",
        "latitude": 16.054407,
        "longitude": 108.202167,
        "image_url": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
        "districts": [
            {"id": "dist-dn-01", "name": "Quận Hải Châu", "slug": "quan-hai-chau", "lat": 16.0538, "lon": 108.2208},
            {"id": "dist-dn-02", "name": "Quận Sơn Trà", "slug": "quan-son-tra", "lat": 16.0825, "lon": 108.2435},
            {"id": "dist-dn-03", "name": "Quận Thanh Khê", "slug": "quan-thanh-khe", "lat": 16.0601, "lon": 108.1884},
            {"id": "dist-dn-04", "name": "Quận Ngũ Hành Sơn", "slug": "quan-ngu-hanh-son", "lat": 16.0025, "lon": 108.2562},
            {"id": "dist-dn-05", "name": "Quận Liên Chiểu", "slug": "quan-lien-chieu", "lat": 16.0831, "lon": 108.1481},
        ]
    },
    {
        "id": "city-hcmc",
        "name": "Hồ Chí Minh",
        "slug": "ho-chi-minh",
        "country": "Việt Nam",
        "latitude": 10.776889,
        "longitude": 106.700806,
        "image_url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
        "districts": [
            {"id": "dist-hcm-01", "name": "Quận 1", "slug": "quan-1", "lat": 10.7756, "lon": 106.7004},
            {"id": "dist-hcm-02", "name": "Quận 3", "slug": "quan-3", "lat": 10.7844, "lon": 106.6844},
            {"id": "dist-hcm-03", "name": "Quận 4", "slug": "quan-4", "lat": 10.7644, "lon": 106.7042},
            {"id": "dist-hcm-04", "name": "Quận 5", "slug": "quan-5", "lat": 10.7554, "lon": 106.6669},
            {"id": "dist-hcm-05", "name": "Quận 7", "slug": "quan-7", "lat": 10.7340, "lon": 106.7218},
            {"id": "dist-hcm-06", "name": "Quận 10", "slug": "quan-10", "lat": 10.7716, "lon": 106.6672},
            {"id": "dist-hcm-07", "name": "Quận Tân Bình", "slug": "quan-tan-binh", "lat": 10.7992, "lon": 106.6541},
            {"id": "dist-hcm-08", "name": "Quận Bình Thạnh", "slug": "quan-binh-thanh", "lat": 10.8030, "lon": 106.7099},
            {"id": "dist-hcm-09", "name": "Quận Phú Nhuận", "slug": "quan-phu-nhuan", "lat": 10.7997, "lon": 106.6803},
        ]
    }
]

# Quick lookup dicts
DISTRICT_LOOKUP = {}
CITY_NAME_TO_ID = {}
for c in CITIES:
    CITY_NAME_TO_ID[c["name"]] = c["id"]
    for d in c["districts"]:
        DISTRICT_LOOKUP[(c["name"], d["name"])] = d

# ==============================================================================
# 2. AMENITY CATALOG
# ==============================================================================
AMENITY_CATEGORIES = [
    {"id": "cat-essentials", "name": "Tiện nghi cơ bản", "icon": "Wifi", "display_order": 1},
    {"id": "cat-bathroom", "name": "Phòng tắm & Giặt là", "icon": "Bath", "display_order": 2},
    {"id": "cat-kitchen", "name": "Bếp & Ăn uống", "icon": "Utensils", "display_order": 3},
    {"id": "cat-facilities", "name": "Tiện ích & Giải trí", "icon": "Tv", "display_order": 4},
    {"id": "cat-safety", "name": "An toàn & An ninh", "icon": "ShieldCheck", "display_order": 5},
    {"id": "cat-services", "name": "Dịch vụ & Tự nhận phòng", "icon": "Key", "display_order": 6}
]

AMENITIES_CATALOG = [
    # Essentials
    {"id": "amenity-wifi", "category_id": "cat-essentials", "name": "Wi-fi", "code": "wifi", "icon": "Wifi"},
    {"id": "amenity-ac", "category_id": "cat-essentials", "name": "Điều hòa nhiệt độ", "code": "air_conditioning", "icon": "Wind"},
    {"id": "amenity-workspace", "category_id": "cat-essentials", "name": "Không gian riêng để làm việc", "code": "workspace", "icon": "Laptop"},
    {"id": "amenity-tv", "category_id": "cat-essentials", "name": "TV", "code": "tv", "icon": "Tv"},
    {"id": "amenity-linens", "category_id": "cat-essentials", "name": "Khăn tắm, ga trải giường", "code": "linens", "icon": "Bed"},
    {"id": "amenity-iron", "category_id": "cat-essentials", "name": "Bàn là", "code": "iron", "icon": "Zap"},
    
    # Bathroom & Laundry
    {"id": "amenity-hairdryer", "category_id": "cat-bathroom", "name": "Máy sấy tóc", "code": "hair_dryer", "icon": "Wind"},
    {"id": "amenity-washer", "category_id": "cat-bathroom", "name": "Máy giặt", "code": "washer", "icon": "Shirt"},
    {"id": "amenity-dryer", "category_id": "cat-bathroom", "name": "Máy sấy quần áo", "code": "dryer", "icon": "Sun"},
    {"id": "amenity-hotwater", "category_id": "cat-bathroom", "name": "Nước nóng", "code": "hot_water", "icon": "Flame"},
    {"id": "amenity-shampoo", "category_id": "cat-bathroom", "name": "Dầu gội và sữa tắm", "code": "shampoo", "icon": "Droplet"},
    {"id": "amenity-bathtub", "category_id": "cat-bathroom", "name": "Bồn tắm ngâm", "code": "bathtub", "icon": "Bath"},

    # Kitchen
    {"id": "amenity-kitchen", "category_id": "cat-kitchen", "name": "Nhà bếp", "code": "kitchen", "icon": "Utensils"},
    {"id": "amenity-fridge", "category_id": "cat-kitchen", "name": "Tủ lạnh", "code": "refrigerator", "icon": "Archive"},
    {"id": "amenity-microwave", "category_id": "cat-kitchen", "name": "Lò vi sóng", "code": "microwave", "icon": "Box"},
    {"id": "amenity-cookware", "category_id": "cat-kitchen", "name": "Nồi, chảo, gia vị cơ bản", "code": "cookware", "icon": "Coffee"},
    {"id": "amenity-kettle", "category_id": "cat-kitchen", "name": "Ấm đun nước siêu tốc", "code": "kettle", "icon": "Coffee"},

    # Facilities
    {"id": "amenity-pool", "category_id": "cat-facilities", "name": "Bể bơi", "code": "pool", "icon": "Waves"},
    {"id": "amenity-parking", "category_id": "cat-facilities", "name": "Chỗ đỗ xe miễn phí trong khuôn viên", "code": "free_parking", "icon": "Car"},
    {"id": "amenity-elevator", "category_id": "cat-facilities", "name": "Thang máy", "code": "elevator", "icon": "ArrowUpCircle"},
    {"id": "amenity-gym", "category_id": "cat-facilities", "name": "Phòng tập thể dục (Gym)", "code": "gym", "icon": "Dumbbell"},
    {"id": "amenity-balcony", "category_id": "cat-facilities", "name": "Ban công riêng thoáng mát", "code": "balcony", "icon": "Sun"},

    # Safety
    {"id": "amenity-smoke", "category_id": "cat-safety", "name": "Máy báo khói", "code": "smoke_alarm", "icon": "AlertTriangle"},
    {"id": "amenity-firstaid", "category_id": "cat-safety", "name": "Hộp sơ cứu", "code": "first_aid", "icon": "PlusSquare"},
    {"id": "amenity-extinguisher", "category_id": "cat-safety", "name": "Bình chữa cháy", "code": "fire_extinguisher", "icon": "Shield"},

    # Services
    {"id": "amenity-selfcheckin", "category_id": "cat-services", "name": "Tự nhận phòng với khóa thông minh", "code": "self_checkin", "icon": "Key"},
    {"id": "amenity-luggage", "category_id": "cat-services", "name": "Cho phép gửi hành lý trước giờ", "code": "luggage_dropoff", "icon": "Package"}
]

# ==============================================================================
# 3. 18 REAL VIETNAMESE HOSTS
# ==============================================================================
HOSTS_DATA = [
    {
        "id": "host-01",
        "name": "Trần Minh Quân",
        "email": "host@roomfinder.vn",
        "phone": "0988 123 456",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "about": "Xin chào! Mình là Quân, kiến trúc sư và người đam mê văn hóa bản địa. Mình luôn tâm huyết mang đến không gian nghỉ dưỡng ấm cúng, tinh tế và trọn vẹn nhất cho bạn.",
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
        "about": "Chào mừng bạn đến với căn hộ phong cách Scandinavian kết hợp Á Đông của mình. Yêu thích ẩm thực và luôn sẵn sàng hướng dẫn địa điểm ăn uống ngon.",
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
        "about": "Host tận tâm tại Đà Nẵng và Hội An. Sẵn sàng đồng hành giúp bạn có kỳ nghỉ biển tuyệt vời và thư giãn nhất.",
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
        "about": "Kiến trúc sư trẻ yêu thích việc biến những không gian nhỏ thành nơi lưu trú tràn ngập ánh sáng tự nhiên và cây xanh.",
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
        "about": "Quản lý chuỗi căn hộ boutique tại trung tâm Quận 1 và Hoàn Kiếm. Tiêu chí hàng đầu là sự sạch sẽ, an toàn và dịch vụ chuyên nghiệp.",
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
        "about": "Người Sài Gòn chính gốc, rất vui được đón tiếp du khách bốn phương trải nghiệm sự sôi động và lòng hiếu khách của thành phố.",
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
        "about": "Đam mê nhiếp ảnh và du lịch bụi. Mỗi căn phòng đều được chăm chút cẩn thận từng chi tiết trang trí để bạn có những góc ảnh đẹp nhất.",
        "is_superhost": False,
        "response_rate": "96%",
        "response_time": "trong vòng 2 giờ",
        "joined_date": "tháng 8 năm 2023",
        "identity_verified": True
    },
    {
        "id": "host-08",
        "name": "Phạm Hoàng Long",
        "email": "hoanglong.pham@roomfinder.vn",
        "phone": "0989 012 345",
        "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
        "about": "Chủ sở hữu các căn hộ condotel cao cấp ven biển Sơn Trà và trung tâm Tây Hồ. Hệ thống tự nhận phòng thông minh 24/7.",
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
        "about": "Yêu thiên nhiên và không gian sống xanh. Căn hộ có ban công nhiều hoa lá và góc ngắm hoàng hôn cực chill.",
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
        "about": "Kinh doanh homestay với phương châm mang lại sự thoải mái tối đa với mức chi phí hợp lý nhất cho mọi chuyến đi.",
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
        "about": "Không gian sống hiện đại, bếp đầy đủ dụng cụ và wifi tốc độ cao cực kỳ thích hợp cho các bạn làm việc từ xa.",
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
    },
    {
        "id": "host-13",
        "name": "Trịnh Diệu Linh",
        "email": "dieulinh.trinh@roomfinder.vn",
        "phone": "0968 556 677",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "about": "Thiết kế nội thất vintage kết hợp hiện đại. Mỗi góc nhỏ đều mang lại cảm giác bình yên sau một ngày dài khám phá.",
        "is_superhost": True,
        "response_rate": "99%",
        "response_time": "trong vòng 20 phút",
        "joined_date": "tháng 5 năm 2021",
        "identity_verified": True
    },
    {
        "id": "host-14",
        "name": "Nguyễn Trọng Hiếu",
        "email": "tronghieu.nguyen@roomfinder.vn",
        "phone": "0919 667 788",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
        "about": "Host tại các khu đô thị hiện đại Vinhomes Smart City và Vinhomes Central Park. Tiện ích hồ bơi, công viên đỉnh cao.",
        "is_superhost": True,
        "response_rate": "100%",
        "response_time": "trong vòng 15 phút",
        "joined_date": "tháng 8 năm 2020",
        "identity_verified": True
    },
    {
        "id": "host-15",
        "name": "Chu Quỳnh Anh",
        "email": "quynhanh.chu@roomfinder.vn",
        "phone": "0938 778 899",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        "about": "Căn hộ ngắm trọn hoàng hôn Hồ Tây thơ mộng, không gian tĩnh lặng thích hợp cho kỳ nghỉ tái tạo năng lượng.",
        "is_superhost": False,
        "response_rate": "94%",
        "response_time": "trong vòng 1 giờ",
        "joined_date": "tháng 11 năm 2022",
        "identity_verified": True
    },
    {
        "id": "host-16",
        "name": "Lý Gia Hưng",
        "email": "giahung.ly@roomfinder.vn",
        "phone": "0949 889 900",
        "avatar_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
        "about": "Tâm huyết với từng trải nghiệm của khách. Đảm bảo phòng ốc thơm tho, sạch sẽ chuẩn khách sạn 4 sao.",
        "is_superhost": True,
        "response_rate": "100%",
        "response_time": "trong vòng 5 phút",
        "joined_date": "tháng 2 năm 2021",
        "identity_verified": True
    },
    {
        "id": "host-17",
        "name": "Võ Cẩm Tú",
        "email": "camtu.vo@roomfinder.vn",
        "phone": "0978 990 011",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        "about": "Yêu nghệ thuật gốm và tranh ảnh. Không gian căn hộ ấm cúng, thư thái với trà ngon bản địa miễn phí chào mừng.",
        "is_superhost": True,
        "response_rate": "99%",
        "response_time": "trong vòng 30 phút",
        "joined_date": "tháng 9 năm 2021",
        "identity_verified": True
    },
    {
        "id": "host-18",
        "name": "Tạ Minh Nhật",
        "email": "minhnhat.ta@roomfinder.vn",
        "phone": "0908 001 122",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        "about": "Host thân thiện tại trung tâm Đà Nẵng, cách cầu Rồng chỉ vài phút đi bộ. Sẵn sàng hỗ trợ thuê xe máy và tour tham quan giá tốt.",
        "is_superhost": False,
        "response_rate": "96%",
        "response_time": "trong vòng 1 giờ",
        "joined_date": "tháng 4 năm 2023",
        "identity_verified": True
    }
]

# ==============================================================================
# 4. REVIEWERS & AUTHENTIC COMMENTS POOL
# ==============================================================================
REVIEWERS = [
    ("Nguyễn Hoàng Nam", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"),
    ("Trần Thị Bích", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"),
    ("Lê Minh Trí", "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80"),
    ("Phạm Thu Thảo", "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80"),
    ("Hoàng Kim Ngân", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"),
    ("Vũ Thành Đạt", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"),
    ("Đinh Ngọc Mai", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"),
    ("Đặng Thế Bảo", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"),
    ("Bùi Phương Linh", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"),
    ("Trịnh Quang Huy", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"),
    ("Cao Thùy Trang", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80"),
    ("Lương Tuấn Anh", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80")
]

POSITIVE_COMMENTS = [
    "Căn phòng tuyệt vời vượt xa mong đợi của mình! Rất sạch sẽ, thơm tho và đầy đủ tiện nghi từ máy sấy, bàn là đến bếp nấu. Vị trí ngay trung tâm rất thuận tiện đi lại.",
    "Chủ nhà vô cùng nhiệt tình và chu đáo, hướng dẫn check-in chi tiết và phản hồi rất nhanh. Không gian yên tĩnh, giường êm giúp mình có giấc ngủ ngon sau ngày dài dạo chơi.",
    "Góc ban công ngắm cảnh rất chill, ánh sáng tự nhiên ngập tràn phòng. Đồ dùng trong phòng đều mới và cao cấp. Chắc chắn sẽ quay lại khi có dịp!",
    "Vị trí đắc địa, xung quanh có rất nhiều quán cà phê đẹp và quán ăn ngon bản địa. Khóa thông minh tự nhận phòng cực kỳ tiện lợi và an toàn.",
    "Phòng ốc y hệt như hình ảnh đăng tải. Thiết kế tinh tế, không gian thoáng đãng. Rất phù hợp cho cặp đôi hoặc người đi công tác cần không gian làm việc riêng.",
    "Trải nghiệm nghỉ dưỡng tuyệt vời! Nhà tắm sạch bóng, nước nóng mạnh, máy lạnh mát rượi. Đánh giá 5 sao cho chất lượng dịch vụ của chủ nhà.",
    "Căn hộ đẹp lung linh, sống ảo góc nào cũng xinh. Đồ đạc được sắp xếp gọn gàng, ngăn nắp. Rất thích sự hiếu khách và hỗ trợ tận tình của bạn host."
]

NEUTRAL_COMMENTS = [
    "Phòng sạch sẽ và tiện nghi ổn, vị trí thuận lợi. Điểm trừ nhỏ là giờ cao điểm đường hơi đông một chút, nhưng nhìn chung kỳ nghỉ rất thoải mái.",
    "Không gian đẹp, chủ nhà nhiệt tình. Căn phòng hơi cách âm chưa hoàn hảo nếu có xe cộ qua lại, bù lại view và tiện nghi rất xứng đáng với giá tiền."
]

HOST_REPLIES = [
    "Cảm ơn bạn rất nhiều vì đã lựa chọn nghỉ ngơi tại căn hộ của mình! Rất vui vì bạn đã có trải nghiệm đáng nhớ và hy vọng sớm được đón tiếp bạn lần tới nhé!",
    "Cảm ơn những lời nhận xét chân thành của bạn. Sự hài lòng của quý khách là động lực lớn nhất của chúng mình. Chúc bạn luôn có những chuyến đi thật vui vẻ!",
    "Rất cảm ơn bạn đã góp ý quý báu. Chúc bạn nhiều sức khỏe và hy vọng lại được gặp bạn trong chuyến du lịch tiếp theo!"
]

def generate_description(item):
    name = item.get("name", "Căn hộ tiện nghi")
    city = item.get("city", "Việt Nam")
    district = item.get("district", "trung tâm")
    specs = item.get("specs", {})
    guests = specs.get("guests", 2)
    bedrooms = specs.get("bedrooms", 1) or 1
    beds = specs.get("beds", 1) or 1
    baths = specs.get("baths", 1) or 1
    amenities = item.get("amenities", [])
    sample_amenities = ", ".join(amenities[:4]) if amenities else "Wifi tốc độ cao, điều hòa nhiệt độ, nước nóng"

    p1 = (
        f"Chào mừng bạn đến với không gian lưu trú lý tưởng tại {district}, {city}. "
        f"Căn hộ sở hữu phong cách thiết kế hiện đại, ngập tràn ánh sáng tự nhiên với diện tích bài trí thông minh, "
        f"bao gồm {bedrooms} phòng ngủ ấm cúng, {beds} giường êm ái cùng {baths} phòng tắm tiện nghi, "
        f"được trang bị hoàn hảo để phục vụ tối đa {guests} khách lưu trú thoải mái nhất."
    )
    p2 = (
        f"Được chăm chút tỉ mỉ với đầy đủ tiện ích sinh hoạt thiết yếu như {sample_amenities} và khu vực bếp tiện lợi. "
        f"Từ đây, bạn có thể dễ dàng tiếp cận các điểm tham quan nổi tiếng, nhà hàng ẩm thực bản địa phong phú và quán cà phê đặc sắc của {city}. "
        f"Hệ thống khóa thông minh tự nhận phòng 24/7 mang đến sự riêng tư, linh hoạt và thuận tiện tối đa cho kỳ nghỉ của bạn."
    )
    return f"{p1}\n\n{p2}"

def escape_sql(text):
    if text is None:
        return "NULL"
    if isinstance(text, (int, float)):
        return str(text)
    if isinstance(text, bool):
        return "TRUE" if text else "FALSE"
    # String escaping for PostgreSQL
    s = str(text).replace("'", "''")
    return f"'{s}'"

def main():
    print("=" * 70)
    print("RoomFinder Production Data & Schema Generator")
    print("=" * 70)

    # --------------------------------------------------------------------------
    # Step 1: Load harvested listings from database/vietnam/
    # --------------------------------------------------------------------------
    city_files = [
        ("hanoi.json", "Hà Nội", "city-hanoi"),
        ("danang.json", "Đà Nẵng", "city-danang"),
        ("hcmc.json", "Hồ Chí Minh", "city-hcmc")
    ]
    raw_listings = []
    for fn, cname, cid in city_files:
        fpath = os.path.join(INPUT_DIR, fn)
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
            for it in data:
                it["_city_name"] = cname
                it["_city_id"] = cid
                raw_listings.append(it)
        print(f"Loaded {len(data)} listings from {fn}")

    print(f"Total raw listings: {len(raw_listings)}")

    # --------------------------------------------------------------------------
    # Step 2: Prepare Users & Hosts
    # --------------------------------------------------------------------------
    # Demo Users
    users = [
        {
            "id": "user-traveler-01",
            "email": "traveler@roomfinder.vn",
            "password_hash": "$2a$10$wT8KkC8lQG9WzQhE4JmVOu5H0m1E8H1z3q1vO5n8G1k3q1vO5n8G1", # password123
            "password": "password123",
            "name": "Nguyễn Văn Đức",
            "phone": "0912 345 678",
            "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
            "role": "traveler",
            "status": "ACTIVE",
            "host_id": None,
            "bio": "Người yêu thích khám phá vẻ đẹp ẩm thực và kiến trúc các thành phố Việt Nam.",
            "created_at": "2024-01-15T08:00:00Z"
        },
        {
            "id": "user-host-01",
            "email": "host@roomfinder.vn",
            "password_hash": "$2a$10$wT8KkC8lQG9WzQhE4JmVOu5H0m1E8H1z3q1vO5n8G1k3q1vO5n8G1",
            "password": "password123",
            "name": "Trần Minh Quân",
            "phone": "0988 123 456",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            "role": "host",
            "status": "ACTIVE",
            "host_id": "host-01",
            "bio": "Chủ nhà tận tâm tại RoomFinder. Đam mê văn hóa bản địa và kiến trúc tối giản.",
            "created_at": "2021-03-10T10:00:00Z"
        },
        {
            "id": "user-admin-01",
            "email": "admin@roomfinder.vn",
            "password_hash": "$2a$10$wT8KkC8lQG9WzQhE4JmVOu5H0m1E8H1z3q1vO5n8G1k3q1vO5n8G1",
            "password": "password123",
            "name": "Quản Trị Viên RoomFinder",
            "phone": "0900 000 000",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
            "role": "admin",
            "status": "ACTIVE",
            "host_id": None,
            "bio": "Tài khoản quản trị hệ thống RoomFinder toàn quốc.",
            "created_at": "2020-01-01T00:00:00Z"
        }
    ]

    # Additional Host users (for hosts 2 to 18)
    hosts = []
    for h in HOSTS_DATA:
        h_copy = dict(h)
        user_id = f"user-{h['id']}"
        h_copy["user_id"] = user_id
        hosts.append(h_copy)
        
        if h["id"] != "host-01":
            users.append({
                "id": user_id,
                "email": h["email"],
                "password_hash": "$2a$10$wT8KkC8lQG9WzQhE4JmVOu5H0m1E8H1z3q1vO5n8G1k3q1vO5n8G1",
                "password": "password123",
                "name": h["name"],
                "phone": h["phone"],
                "avatar_url": h["avatar_url"],
                "role": "host",
                "status": "ACTIVE",
                "host_id": h["id"],
                "bio": h["about"],
                "created_at": "2021-06-01T08:00:00Z"
            })

    # Additional Travelers (for bookings & reviews)
    traveler_pool = [
        ("user-guest-01", "Lê Phương Linh", "phuonglinh.le@gmail.com", "0901 234 567", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80"),
        ("user-guest-02", "Đỗ Hoàng Quân", "hoangquan.do@gmail.com", "0932 456 789", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"),
        ("user-guest-03", "Phạm Bích Ngọc", "bichngoc.pham@gmail.com", "0918 765 432", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80"),
        ("user-guest-04", "Hoàng Minh Thắng", "minhthang.hoang@gmail.com", "0944 332 211", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80"),
        ("user-guest-05", "Nguyễn Thảo My", "thaomy.nguyen@gmail.com", "0966 554 433", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"),
        ("user-guest-06", "Trần Đình Trọng", "dinhtrong.tran@gmail.com", "0988 776 655", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80")
    ]
    for uid, uname, uemail, uphone, uavatar in traveler_pool:
        users.append({
            "id": uid,
            "email": uemail,
            "password_hash": "$2a$10$wT8KkC8lQG9WzQhE4JmVOu5H0m1E8H1z3q1vO5n8G1k3q1vO5n8G1",
            "password": "password123",
            "name": uname,
            "phone": uphone,
            "avatar_url": uavatar,
            "role": "traveler",
            "status": "ACTIVE",
            "host_id": None,
            "bio": f"Khách du lịch trải nghiệm từ {uname}.",
            "created_at": "2024-02-01T09:00:00Z"
        })

    print(f"Total Users prepared: {len(users)}")
    print(f"Total Hosts prepared: {len(hosts)}")

    # --------------------------------------------------------------------------
    # Step 3: Enrich Listings & Generate Relational Entities
    # --------------------------------------------------------------------------
    enriched_listings = []
    all_listing_images = []
    all_listing_amenities = []
    all_reviews = []
    all_calendar_dates = []

    # Map each listing to a host
    # Give host-01 a strong batch of 35-40 listings across cities
    host_listing_counts = {h["id"]: 0 for h in hosts}

    base_review_date = datetime(2026, 9, 20)

    for idx, raw in enumerate(raw_listings):
        lid = str(raw["id"])
        cname = raw["_city_name"]
        cid = raw["_city_id"]
        dname = raw.get("district", "Quận trung tâm")

        # Resolve district ID
        dist_record = DISTRICT_LOOKUP.get((cname, dname))
        did = dist_record["id"] if dist_record else None

        # Assign host
        # host-01 gets every 12th listing (~40 listings)
        if idx % 12 == 0:
            assigned_host = hosts[0]
        else:
            assigned_host = hosts[(idx % (len(hosts) - 1)) + 1]

        host_listing_counts[assigned_host["id"]] += 1

        # Images: ensure >= 5 images
        raw_images = raw.get("images", [])
        if not raw_images:
            raw_images = [raw.get("cover_image", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80")]
        
        # Clean query strings if any, ensure quality
        cleaned_images = []
        for img in raw_images:
            if img:
                cleaned_images.append(img.split("?")[0])
        
        while len(cleaned_images) < 5:
            cleaned_images.append(cleaned_images[0])

        cover_img = cleaned_images[0]

        # Relational listing_images
        for img_order, img_url in enumerate(cleaned_images):
            all_listing_images.append({
                "id": f"img-{lid}-{img_order+1}",
                "listing_id": lid,
                "image_url": img_url,
                "display_order": img_order,
                "is_cover": img_order == 0,
                "caption": f"Hình ảnh {img_order+1} của {raw.get('name', 'phòng')[:40]}"
            })

        # Specs
        specs = raw.get("specs", {}) or {}
        guests = specs.get("guests", 2) or 2
        bedrooms = specs.get("bedrooms", 1) or 1
        beds = specs.get("beds", 1) or 1
        baths = specs.get("baths", 1.0) or 1.0

        # Pricing
        p_night = raw.get("price_per_night", 650000) or 650000
        p_formatted = f"{p_night:,.0f} ₫ / đêm".replace(",", ".")
        
        cleaning_fee = round((p_night * 0.15) / 10000) * 10000
        if cleaning_fee < 100000: cleaning_fee = 100000
        if cleaning_fee > 350000: cleaning_fee = 350000
        service_fee_rate = 0.08

        # Amenities
        raw_amenities = raw.get("amenities", [])
        if not raw_amenities:
            raw_amenities = ["Wi-fi", "Điều hòa nhiệt độ", "Nhà bếp", "Tự nhận phòng với khóa thông minh"]

        for a_name in set(raw_amenities):
            # Try to match with catalog
            cat_match = next((a for a in AMENITIES_CATALOG if a["name"].lower() in a_name.lower() or a_name.lower() in a["name"].lower()), None)
            all_listing_amenities.append({
                "listing_id": lid,
                "amenity_id": cat_match["id"] if cat_match else None,
                "amenity_name": a_name[:150]
            })

        # Reviews (3 - 5 reviews per listing)
        num_reviews = random.randint(3, 5)
        selected_revs = random.sample(REVIEWERS, min(num_reviews, len(REVIEWERS)))
        listing_reviews = []
        for r_idx, (r_name, r_avatar) in enumerate(selected_revs):
            rev_id = f"rev-{lid}-{r_idx+1}"
            days_ago = random.randint(3 + r_idx * 15, 20 + r_idx * 25)
            r_date = (base_review_date - timedelta(days=days_ago)).strftime("%d/%m/%Y")
            is_5_star = random.random() < 0.85
            rating_val = 5 if is_5_star else 4
            comment_text = random.choice(POSITIVE_COMMENTS) if is_5_star else random.choice(NEUTRAL_COMMENTS)
            host_reply_text = random.choice(HOST_REPLIES) if random.random() < 0.6 else None

            rev_dict = {
                "id": rev_id,
                "listing_id": lid,
                "booking_id": None,
                "user_id": None,
                "reviewer_name": r_name,
                "reviewer_avatar": r_avatar,
                "date": r_date,
                "rating": rating_val,
                "comment": comment_text,
                "host_reply": host_reply_text
            }
            listing_reviews.append(rev_dict)
            all_reviews.append(rev_dict)

        avg_rating = round(sum(r["rating"] for r in listing_reviews) / len(listing_reviews), 2)

        # Calendar booked dates (for mockStore & calendar table)
        booked_ranges = []
        # October range
        d1 = random.randint(4, 10)
        booked_ranges.append({"check_in": f"2026-10-{d1:02d}", "check_out": f"2026-10-{d1+random.randint(2, 4):02d}"})
        # November range
        d2 = random.randint(12, 18)
        booked_ranges.append({"check_in": f"2026-11-{d2:02d}", "check_out": f"2026-11-{d2+random.randint(2, 4):02d}"})
        # December range
        if random.random() < 0.7:
            d3 = random.randint(20, 24)
            booked_ranges.append({"check_in": f"2026-12-{d3:02d}", "check_out": f"2026-12-{d3+random.randint(2, 4):02d}"})

        for c_idx, br in enumerate(booked_ranges):
            all_calendar_dates.append({
                "id": f"cal-{lid}-{c_idx+1}",
                "listing_id": lid,
                "booking_id": None,
                "check_in": br["check_in"],
                "check_out": br["check_out"],
                "is_blocked": True,
                "note": "Khách đặt qua hệ thống"
            })

        house_rules = [
            "Nhận phòng sau 14:00 và trả phòng trước 12:00",
            "Không hút thuốc trong phòng và ban công kín",
            "Không tổ chức tiệc tùng hoặc gây ồn ào sau 22:00",
            "Vui lòng tắt các thiết bị điện khi ra khỏi phòng",
            "Không mang thú cưng (trừ khi có sự đồng ý trước của chủ nhà)"
        ]

        cancellation_policy = {
            "title": "Hủy miễn phí trong vòng 48 giờ",
            "description": "Được hoàn tiền 100% nếu bạn hủy trước ngày nhận phòng ít nhất 48 giờ. Hủy sau thời gian này sẽ áp dụng hoàn 50% tiền phòng."
        }

        # Build Enriched Listing Object (Matching Frontend Listing interface exactly)
        listing_obj = {
            "id": lid,
            "listing_url": raw.get("listing_url", f"https://www.airbnb.com.vn/rooms/{lid}"),
            "name": raw.get("name", "Căn hộ sang trọng tại RoomFinder"),
            "room_type": raw.get("room_type", "Toàn bộ căn hộ"),
            "city": cname,
            "district": dname,
            "neighborhood": raw.get("neighborhood", dname),
            "address": raw.get("address", f"{dname}, {cname}, Việt Nam"),
            "latitude": float(raw.get("latitude", 21.0285)),
            "longitude": float(raw.get("longitude", 105.8542)),
            "price_per_night": int(p_night),
            "price_formatted": p_formatted,
            "price_total": raw.get("price_total", int(p_night * 5)),
            "price_nights": raw.get("price_nights", 5),
            "price_label": raw.get("price_label", f"{int(p_night * 5):,.0f} ₫ cho 5 đêm".replace(",", ".")),
            "rating": avg_rating,
            "review_count": len(listing_reviews),
            "is_superhost": assigned_host["is_superhost"],
            "is_guest_favorite": raw.get("is_guest_favorite", False),
            "specs": {
                "guests": int(guests),
                "bedrooms": int(bedrooms),
                "beds": int(beds),
                "baths": float(baths)
            },
            "amenities": raw_amenities,
            "images": cleaned_images,
            "image_count": len(cleaned_images),
            "cover_image": cover_img,
            "host_id": assigned_host["id"],
            "host": {
                "id": assigned_host["id"],
                "name": assigned_host["name"],
                "avatar_url": assigned_host["avatar_url"],
                "about": assigned_host["about"],
                "is_superhost": assigned_host["is_superhost"],
                "response_rate": assigned_host["response_rate"],
                "response_time": assigned_host["response_time"],
                "joined_date": assigned_host["joined_date"],
                "phone": assigned_host["phone"],
                "email": assigned_host["email"]
            },
            "description": generate_description(raw),
            "reviews": listing_reviews,
            "booked_dates": booked_ranges,
            "cleaning_fee": int(cleaning_fee),
            "service_fee_rate": service_fee_rate,
            "house_rules": house_rules,
            "cancellation_policy": cancellation_policy,
            "status": "ACTIVE",
            # Additional normalized relational keys
            "city_id": cid,
            "district_id": did
        }
        enriched_listings.append(listing_obj)

    # Update hosts listings_count
    for h in hosts:
        h["listings_count"] = host_listing_counts[h["id"]]

    print(f"Total Enriched Listings: {len(enriched_listings)}")
    print(f"Total Listing Images: {len(all_listing_images)}")
    print(f"Total Listing Amenities relations: {len(all_listing_amenities)}")
    print(f"Total Reviews: {len(all_reviews)}")

    # --------------------------------------------------------------------------
    # Step 4: Generate Bookings
    # --------------------------------------------------------------------------
    bookings = []
    traveler_id = "user-traveler-01"
    host_01_id = "host-01"
    host_01_listings = [l for l in enriched_listings if l["host_id"] == host_01_id]
    other_listings = [l for l in enriched_listings if l["host_id"] != host_01_id]

    # 1. Traveler Bookings (covering UPCOMING, COMPLETED, CANCELLED)
    traveler_rooms = [host_01_listings[0]] + random.sample(other_listings, 5)

    # Booking 1: UPCOMING (October 2026) - on host-01's room!
    r0 = traveler_rooms[0]
    pn0 = r0["price_per_night"]
    cf0 = r0["cleaning_fee"]
    sf0 = int(pn0 * 3 * 0.08)
    tot0 = pn0 * 3 + cf0 + sf0
    bookings.append({
        "id": "bk-1001",
        "booking_code": "RF-2026-8819",
        "user_id": traveler_id,
        "guest_name": "Nguyễn Văn Đức",
        "guest_email": "traveler@roomfinder.vn",
        "guest_phone": "0912 345 678",
        "listing_id": r0["id"],
        "listing_name": r0["name"],
        "city": r0["city"],
        "district": r0["district"],
        "cover_image": r0["cover_image"],
        "host_id": r0["host_id"],
        "host_name": r0["host"]["name"],
        "check_in": "2026-10-15",
        "check_out": "2026-10-18",
        "nights": 3,
        "guests": 2,
        "price_per_night": pn0,
        "cleaning_fee": cf0,
        "service_fee": sf0,
        "total_price": tot0,
        "status": "UPCOMING",
        "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
        "payment_status": "PAID",
        "special_requests": "Phòng tầng cao và check-in sau 18:00.",
        "created_at": "2026-09-22T14:30:00Z"
    })

    # Booking 2: UPCOMING (November 2026)
    r1 = traveler_rooms[1]
    pn1 = r1["price_per_night"]
    cf1 = r1["cleaning_fee"]
    sf1 = int(pn1 * 3 * 0.08)
    tot1 = pn1 * 3 + cf1 + sf1
    bookings.append({
        "id": "bk-1002",
        "booking_code": "RF-2026-9042",
        "user_id": traveler_id,
        "guest_name": "Nguyễn Văn Đức",
        "guest_email": "traveler@roomfinder.vn",
        "guest_phone": "0912 345 678",
        "listing_id": r1["id"],
        "listing_name": r1["name"],
        "city": r1["city"],
        "district": r1["district"],
        "cover_image": r1["cover_image"],
        "host_id": r1["host_id"],
        "host_name": r1["host"]["name"],
        "check_in": "2026-11-05",
        "check_out": "2026-11-08",
        "nights": 3,
        "guests": 2,
        "price_per_night": pn1,
        "cleaning_fee": cf1,
        "service_fee": sf1,
        "total_price": tot1,
        "status": "UPCOMING",
        "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
        "payment_status": "PAID",
        "special_requests": "Yêu cầu giường đôi lớn.",
        "created_at": "2026-09-24T09:15:00Z"
    })

    # Booking 3: COMPLETED (August 2026 - ready for WriteReview)
    r2 = traveler_rooms[2]
    pn2 = r2["price_per_night"]
    cf2 = r2["cleaning_fee"]
    sf2 = int(pn2 * 3 * 0.08)
    tot2 = pn2 * 3 + cf2 + sf2
    bookings.append({
        "id": "bk-1003",
        "booking_code": "RF-2026-7215",
        "user_id": traveler_id,
        "guest_name": "Nguyễn Văn Đức",
        "guest_email": "traveler@roomfinder.vn",
        "guest_phone": "0912 345 678",
        "listing_id": r2["id"],
        "listing_name": r2["name"],
        "city": r2["city"],
        "district": r2["district"],
        "cover_image": r2["cover_image"],
        "host_id": r2["host_id"],
        "host_name": r2["host"]["name"],
        "check_in": "2026-08-10",
        "check_out": "2026-08-13",
        "nights": 3,
        "guests": 2,
        "price_per_night": pn2,
        "cleaning_fee": cf2,
        "service_fee": sf2,
        "total_price": tot2,
        "status": "COMPLETED",
        "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
        "payment_status": "PAID",
        "special_requests": None,
        "created_at": "2026-08-01T11:00:00Z"
    })

    # Booking 4: COMPLETED (July 2026)
    r3 = traveler_rooms[3]
    pn3 = r3["price_per_night"]
    cf3 = r3["cleaning_fee"]
    sf3 = int(pn3 * 3 * 0.08)
    tot3 = pn3 * 3 + cf3 + sf3
    bookings.append({
        "id": "bk-1004",
        "booking_code": "RF-2026-6140",
        "user_id": traveler_id,
        "guest_name": "Nguyễn Văn Đức",
        "guest_email": "traveler@roomfinder.vn",
        "guest_phone": "0912 345 678",
        "listing_id": r3["id"],
        "listing_name": r3["name"],
        "city": r3["city"],
        "district": r3["district"],
        "cover_image": r3["cover_image"],
        "host_id": r3["host_id"],
        "host_name": r3["host"]["name"],
        "check_in": "2026-07-20",
        "check_out": "2026-07-23",
        "nights": 3,
        "guests": 3,
        "price_per_night": pn3,
        "cleaning_fee": cf3,
        "service_fee": sf3,
        "total_price": tot3,
        "status": "COMPLETED",
        "payment_method": "Chuyển khoản QR ngân hàng",
        "payment_status": "PAID",
        "special_requests": "Cần hóa đơn VAT công ty.",
        "created_at": "2026-07-10T16:20:00Z"
    })

    # Booking 5: CANCELLED (June 2026)
    r4 = traveler_rooms[4]
    pn4 = r4["price_per_night"]
    cf4 = r4["cleaning_fee"]
    sf4 = int(pn4 * 3 * 0.08)
    tot4 = pn4 * 3 + cf4 + sf4
    bookings.append({
        "id": "bk-1005",
        "booking_code": "RF-2026-5311",
        "user_id": traveler_id,
        "guest_name": "Nguyễn Văn Đức",
        "guest_email": "traveler@roomfinder.vn",
        "guest_phone": "0912 345 678",
        "listing_id": r4["id"],
        "listing_name": r4["name"],
        "city": r4["city"],
        "district": r4["district"],
        "cover_image": r4["cover_image"],
        "host_id": r4["host_id"],
        "host_name": r4["host"]["name"],
        "check_in": "2026-06-15",
        "check_out": "2026-06-18",
        "nights": 3,
        "guests": 2,
        "price_per_night": pn4,
        "cleaning_fee": cf4,
        "service_fee": sf4,
        "total_price": tot4,
        "status": "CANCELLED",
        "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa *8899)",
        "payment_status": "REFUNDED",
        "special_requests": "Bận việc đột xuất xin hủy theo chính sách hoàn 100%.",
        "created_at": "2026-06-05T08:30:00Z"
    })

    # 2. Additional Bookings targeting host-01 from other guests (for Host Dashboard & Reservations)
    host_guest_bookings = [
        ("user-guest-01", "Lê Phương Linh", "phuonglinh.le@gmail.com", "0901 234 567", 1, "2026-10-20", "2026-10-22", "UPCOMING"),
        ("user-guest-02", "Đỗ Hoàng Quân", "hoangquan.do@gmail.com", "0932 456 789", 2, "2026-10-24", "2026-10-27", "UPCOMING"),
        ("user-guest-03", "Phạm Bích Ngọc", "bichngoc.pham@gmail.com", "0918 765 432", 3, "2026-09-10", "2026-09-13", "COMPLETED"),
        ("user-guest-04", "Hoàng Minh Thắng", "minhthang.hoang@gmail.com", "0944 332 211", 4, "2026-09-01", "2026-09-04", "COMPLETED"),
        ("user-guest-05", "Nguyễn Thảo My", "thaomy.nguyen@gmail.com", "0966 554 433", 5, "2026-08-15", "2026-08-18", "COMPLETED"),
        ("user-guest-06", "Trần Đình Trọng", "dinhtrong.tran@gmail.com", "0988 776 655", 6, "2026-08-05", "2026-08-07", "CANCELLED"),
    ]

    for g_idx, (guid, gname, gemail, gphone, room_idx, cin, cout, bstatus) in enumerate(host_guest_bookings):
        target_r = host_01_listings[room_idx % len(host_01_listings)]
        pn = target_r["price_per_night"]
        cf = target_r["cleaning_fee"]
        d_in = datetime.strptime(cin, "%Y-%m-%d")
        d_out = datetime.strptime(cout, "%Y-%m-%d")
        nights = (d_out - d_in).days
        sf = int(pn * nights * 0.08)
        tot = pn * nights + cf + sf

        bookings.append({
            "id": f"bk-host01-{g_idx+1}",
            "booking_code": f"RF-2026-HOST-{g_idx+101}",
            "user_id": guid,
            "guest_name": gname,
            "guest_email": gemail,
            "guest_phone": gphone,
            "listing_id": target_r["id"],
            "listing_name": target_r["name"],
            "city": target_r["city"],
            "district": target_r["district"],
            "cover_image": target_r["cover_image"],
            "host_id": host_01_id,
            "host_name": "Trần Minh Quân",
            "check_in": cin,
            "check_out": cout,
            "nights": nights,
            "guests": 2,
            "price_per_night": pn,
            "cleaning_fee": cf,
            "service_fee": sf,
            "total_price": tot,
            "status": bstatus,
            "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa)",
            "payment_status": "REFUNDED" if bstatus == "CANCELLED" else "PAID",
            "special_requests": "Vui lòng giữ chỗ đậu xe nếu còn trống.",
            "created_at": "2026-08-20T10:00:00Z"
        })

    # 3. Add a few bookings for other hosts (so switching to another host in demo still shows bookings!)
    for h_demo in hosts[1:5]:
        h_rooms = [l for l in enriched_listings if l["host_id"] == h_demo["id"]]
        if h_rooms:
            hr = h_rooms[0]
            pn = hr["price_per_night"]
            cf = hr["cleaning_fee"]
            nights = 2
            sf = int(pn * nights * 0.08)
            tot = pn * nights + cf + sf
            bookings.append({
                "id": f"bk-{h_demo['id']}-01",
                "booking_code": f"RF-2026-{h_demo['id'].upper()}-01",
                "user_id": "user-guest-01",
                "guest_name": "Lê Phương Linh",
                "guest_email": "phuonglinh.le@gmail.com",
                "guest_phone": "0901 234 567",
                "listing_id": hr["id"],
                "listing_name": hr["name"],
                "city": hr["city"],
                "district": hr["district"],
                "cover_image": hr["cover_image"],
                "host_id": h_demo["id"],
                "host_name": h_demo["name"],
                "check_in": "2026-10-25",
                "check_out": "2026-10-27",
                "nights": nights,
                "guests": 2,
                "price_per_night": pn,
                "cleaning_fee": cf,
                "service_fee": sf,
                "total_price": tot,
                "status": "UPCOMING",
                "payment_method": "Thẻ tín dụng / Ghi nợ (Mock Visa)",
                "payment_status": "PAID",
                "special_requests": "Nhận phòng muộn 20h.",
                "created_at": "2026-09-20T15:00:00Z"
            })

    print(f"Total Bookings prepared: {len(bookings)}")

    # --------------------------------------------------------------------------
    # Step 5: Wishlists
    # --------------------------------------------------------------------------
    wishlist_listings = sample_rooms = enriched_listings[:8]
    wishlists = [
        {
            "id": f"wl-{i+1}",
            "user_id": traveler_id,
            "listing_id": l["id"],
            "created_at": "2026-09-20T12:00:00Z"
        }
        for i, l in enumerate(wishlist_listings)
    ]
    print(f"Total Wishlists prepared: {len(wishlists)}")

    # --------------------------------------------------------------------------
    # Step 6: Export JSON Files to database/production/json/
    # --------------------------------------------------------------------------
    print("\nWriting JSON files to database/production/json/...")
    
    # 1. listings.json
    with open(os.path.join(JSON_DIR, "listings.json"), "w", encoding="utf-8") as f:
        json.dump(enriched_listings, f, ensure_ascii=False, indent=2)
    print(" -> listings.json saved")

    # 2. City listings (hanoi.json, danang.json, hcmc.json)
    for fn, cname, cid in city_files:
        c_items = [l for l in enriched_listings if l["city"] == cname]
        with open(os.path.join(JSON_DIR, fn), "w", encoding="utf-8") as f:
            json.dump(c_items, f, ensure_ascii=False, indent=2)
        print(f" -> {fn} saved ({len(c_items)} listings)")

    # 3. hosts.json
    with open(os.path.join(JSON_DIR, "hosts.json"), "w", encoding="utf-8") as f:
        json.dump(hosts, f, ensure_ascii=False, indent=2)
    print(" -> hosts.json saved")

    # 4. users.json
    with open(os.path.join(JSON_DIR, "users.json"), "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    print(" -> users.json saved")

    # 5. bookings.json
    with open(os.path.join(JSON_DIR, "bookings.json"), "w", encoding="utf-8") as f:
        json.dump(bookings, f, ensure_ascii=False, indent=2)
    print(" -> bookings.json saved")

    # 6. wishlists.json
    with open(os.path.join(JSON_DIR, "wishlists.json"), "w", encoding="utf-8") as f:
        json.dump(wishlists, f, ensure_ascii=False, indent=2)
    print(" -> wishlists.json saved")

    # 7. reviews.json (normalized standalone)
    with open(os.path.join(JSON_DIR, "reviews.json"), "w", encoding="utf-8") as f:
        json.dump(all_reviews, f, ensure_ascii=False, indent=2)
    print(" -> reviews.json saved")

    # 8. cities.json
    with open(os.path.join(JSON_DIR, "cities.json"), "w", encoding="utf-8") as f:
        json.dump(CITIES, f, ensure_ascii=False, indent=2)
    print(" -> cities.json saved")

    # 9. amenities.json
    amenities_export = {
        "categories": AMENITY_CATEGORIES,
        "items": AMENITIES_CATALOG
    }
    with open(os.path.join(JSON_DIR, "amenities.json"), "w", encoding="utf-8") as f:
        json.dump(amenities_export, f, ensure_ascii=False, indent=2)
    print(" -> amenities.json saved")

    # 10. Complete Production Bundle
    bundle = {
        "version": "1.0.0",
        "generated_at": datetime.now().isoformat(),
        "cities": CITIES,
        "amenity_categories": AMENITY_CATEGORIES,
        "amenities": AMENITIES_CATALOG,
        "hosts": hosts,
        "users": users,
        "listings_count": len(enriched_listings),
        "listings": enriched_listings,
        "bookings": bookings,
        "wishlists": wishlists
    }
    with open(os.path.join(JSON_DIR, "production_bundle.json"), "w", encoding="utf-8") as f:
        json.dump(bundle, f, ensure_ascii=False, indent=2)
    print(" -> production_bundle.json saved")

    # --------------------------------------------------------------------------
    # Step 7: Export SQL Files to database/production/sql/
    # --------------------------------------------------------------------------
    print("\nWriting SQL seed files to database/production/sql/...")

    # 02_cities_districts.sql
    with open(os.path.join(SQL_DIR, "02_cities_districts.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 02_cities_districts.sql: Seed Cities and Districts\n")
        f.write("-- ==============================================================================\n\n")
        f.write("INSERT INTO cities (id, name, slug, country, latitude, longitude, image_url) VALUES\n")
        city_lines = []
        for c in CITIES:
            city_lines.append(f"({escape_sql(c['id'])}, {escape_sql(c['name'])}, {escape_sql(c['slug'])}, {escape_sql(c['country'])}, {c['latitude']}, {c['longitude']}, {escape_sql(c['image_url'])})")
        f.write(",\n".join(city_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")

        f.write("INSERT INTO districts (id, city_id, name, slug, latitude, longitude) VALUES\n")
        dist_lines = []
        for c in CITIES:
            for d in c["districts"]:
                dist_lines.append(f"({escape_sql(d['id'])}, {escape_sql(c['id'])}, {escape_sql(d['name'])}, {escape_sql(d['slug'])}, {d['lat']}, {d['lon']})")
        f.write(",\n".join(dist_lines) + "\nON CONFLICT (city_id, name) DO NOTHING;\n")
    print(" -> 02_cities_districts.sql saved")

    # 03_amenities.sql
    with open(os.path.join(SQL_DIR, "03_amenities.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 03_amenities.sql: Seed Amenity Categories and Amenities\n")
        f.write("-- ==============================================================================\n\n")
        f.write("INSERT INTO amenity_categories (id, name, icon, display_order) VALUES\n")
        cat_lines = []
        for ac in AMENITY_CATEGORIES:
            cat_lines.append(f"({escape_sql(ac['id'])}, {escape_sql(ac['name'])}, {escape_sql(ac['icon'])}, {ac['display_order']})")
        f.write(",\n".join(cat_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")

        f.write("INSERT INTO amenities (id, category_id, name, code, icon) VALUES\n")
        am_lines = []
        for am in AMENITIES_CATALOG:
            am_lines.append(f"({escape_sql(am['id'])}, {escape_sql(am['category_id'])}, {escape_sql(am['name'])}, {escape_sql(am['code'])}, {escape_sql(am['icon'])})")
        f.write(",\n".join(am_lines) + "\nON CONFLICT (id) DO NOTHING;\n")
    print(" -> 03_amenities.sql saved")

    # 04_users_hosts.sql
    with open(os.path.join(SQL_DIR, "04_users_hosts.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 04_users_hosts.sql: Seed Users and Hosts\n")
        f.write("-- ==============================================================================\n\n")
        
        # Insert Hosts first (without user_id foreign key constraint initially, or insert users first then update)
        # In our schema: hosts.user_id references users.id, and users.host_id references hosts.id
        # To avoid circular FK issue during insert, we insert users without host_id first, then insert hosts, then update users.host_id.
        f.write("INSERT INTO users (id, email, password_hash, name, phone, avatar_url, role, status, bio, created_at) VALUES\n")
        user_lines = []
        for u in users:
            user_lines.append(
                f"({escape_sql(u['id'])}, {escape_sql(u['email'])}, {escape_sql(u['password_hash'])}, "
                f"{escape_sql(u['name'])}, {escape_sql(u['phone'])}, {escape_sql(u['avatar_url'])}, "
                f"{escape_sql(u['role'])}, {escape_sql(u['status'])}, {escape_sql(u['bio'])}, {escape_sql(u['created_at'])})"
            )
        f.write(",\n".join(user_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")

        f.write("INSERT INTO hosts (id, user_id, name, email, phone, avatar_url, about, is_superhost, response_rate, response_time, joined_date, identity_verified, listings_count, rating, review_count) VALUES\n")
        host_lines = []
        for h in hosts:
            host_lines.append(
                f"({escape_sql(h['id'])}, {escape_sql(h['user_id'])}, {escape_sql(h['name'])}, {escape_sql(h['email'])}, "
                f"{escape_sql(h['phone'])}, {escape_sql(h['avatar_url'])}, {escape_sql(h['about'])}, {h['is_superhost']}, "
                f"{escape_sql(h['response_rate'])}, {escape_sql(h['response_time'])}, {escape_sql(h['joined_date'])}, "
                f"{h['identity_verified']}, {h['listings_count']}, 5.0, 0)"
            )
        f.write(",\n".join(host_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")

        # Now link users.host_id
        f.write("-- Link user.host_id references\n")
        for u in users:
            if u["host_id"]:
                f.write(f"UPDATE users SET host_id = {escape_sql(u['host_id'])} WHERE id = {escape_sql(u['id'])};\n")
    print(" -> 04_users_hosts.sql saved")

    # 05_listings.sql
    with open(os.path.join(SQL_DIR, "05_listings.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 05_listings.sql: Seed 473 Enriched Listings\n")
        f.write("-- ==============================================================================\n\n")
        
        # Batch insert by 50 listings per statement for optimal execution
        batch_size = 50
        for i in range(0, len(enriched_listings), batch_size):
            batch = enriched_listings[i:i+batch_size]
            f.write("INSERT INTO listings (\n")
            f.write("    id, host_id, city_id, district_id, listing_url, name, room_type, city, district, neighborhood,\n")
            f.write("    address, latitude, longitude, price_per_night, price_formatted, price_total, price_nights, price_label,\n")
            f.write("    cleaning_fee, service_fee_rate, guests_max, bedrooms, beds, baths, description, rating, review_count,\n")
            f.write("    is_superhost, is_guest_favorite, cover_image, image_count, house_rules, cancellation_policy_title, cancellation_policy_description, status\n")
            f.write(") VALUES\n")
            batch_lines = []
            for l in batch:
                rules_json = escape_sql(json.dumps(l["house_rules"], ensure_ascii=False))
                batch_lines.append(
                    f"({escape_sql(l['id'])}, {escape_sql(l['host_id'])}, {escape_sql(l['city_id'])}, {escape_sql(l['district_id'])}, "
                    f"{escape_sql(l['listing_url'])}, {escape_sql(l['name'])}, {escape_sql(l['room_type'])}, {escape_sql(l['city'])}, "
                    f"{escape_sql(l['district'])}, {escape_sql(l['neighborhood'])}, {escape_sql(l['address'])}, {l['latitude']}, {l['longitude']}, "
                    f"{l['price_per_night']}, {escape_sql(l['price_formatted'])}, {l['price_total']}, {l['price_nights']}, {escape_sql(l['price_label'])}, "
                    f"{l['cleaning_fee']}, {l['service_fee_rate']}, {l['specs']['guests']}, {l['specs']['bedrooms']}, {l['specs']['beds']}, {l['specs']['baths']}, "
                    f"{escape_sql(l['description'])}, {l['rating']}, {l['review_count']}, {l['is_superhost']}, {l['is_guest_favorite']}, "
                    f"{escape_sql(l['cover_image'])}, {l['image_count']}, {rules_json}::jsonb, {escape_sql(l['cancellation_policy']['title'])}, "
                    f"{escape_sql(l['cancellation_policy']['description'])}, {escape_sql(l['status'])})"
                )
            f.write(",\n".join(batch_lines) + "\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n\n")
    print(f" -> 05_listings.sql saved ({len(enriched_listings)} listings)")

    # 06_listing_images.sql
    with open(os.path.join(SQL_DIR, "06_listing_images.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 06_listing_images.sql: Seed Listing Images Gallery\n")
        f.write("-- ==============================================================================\n\n")
        batch_size = 200
        for i in range(0, len(all_listing_images), batch_size):
            batch = all_listing_images[i:i+batch_size]
            f.write("INSERT INTO listing_images (id, listing_id, image_url, display_order, is_cover, caption) VALUES\n")
            img_lines = []
            for img in batch:
                img_lines.append(f"({escape_sql(img['id'])}, {escape_sql(img['listing_id'])}, {escape_sql(img['image_url'])}, {img['display_order']}, {img['is_cover']}, {escape_sql(img['caption'])})")
            f.write(",\n".join(img_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")
    print(f" -> 06_listing_images.sql saved ({len(all_listing_images)} images)")

    # 07_listing_amenities.sql
    with open(os.path.join(SQL_DIR, "07_listing_amenities.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 07_listing_amenities.sql: Seed Listing Amenities Relations\n")
        f.write("-- ==============================================================================\n\n")
        batch_size = 200
        for i in range(0, len(all_listing_amenities), batch_size):
            batch = all_listing_amenities[i:i+batch_size]
            f.write("INSERT INTO listing_amenities (listing_id, amenity_id, amenity_name) VALUES\n")
            am_lines = []
            for la in batch:
                am_lines.append(f"({escape_sql(la['listing_id'])}, {escape_sql(la['amenity_id'])}, {escape_sql(la['amenity_name'])})")
            f.write(",\n".join(am_lines) + "\nON CONFLICT (listing_id, amenity_name) DO NOTHING;\n\n")
    print(f" -> 07_listing_amenities.sql saved ({len(all_listing_amenities)} relations)")

    # 08_bookings_calendar.sql
    with open(os.path.join(SQL_DIR, "08_bookings_calendar.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 08_bookings_calendar.sql: Seed Bookings and Calendar Availability\n")
        f.write("-- ==============================================================================\n\n")
        f.write("INSERT INTO bookings (\n")
        f.write("    id, booking_code, user_id, listing_id, host_id, guest_name, guest_email, guest_phone,\n")
        f.write("    listing_name, city, district, cover_image, host_name, check_in, check_out, nights, guests,\n")
        f.write("    price_per_night, cleaning_fee, service_fee, total_price, status, payment_method, payment_status, special_requests, created_at\n")
        f.write(") VALUES\n")
        b_lines = []
        for b in bookings:
            b_lines.append(
                f"({escape_sql(b['id'])}, {escape_sql(b['booking_code'])}, {escape_sql(b['user_id'])}, {escape_sql(b['listing_id'])}, "
                f"{escape_sql(b['host_id'])}, {escape_sql(b['guest_name'])}, {escape_sql(b['guest_email'])}, {escape_sql(b['guest_phone'])}, "
                f"{escape_sql(b['listing_name'])}, {escape_sql(b['city'])}, {escape_sql(b['district'])}, {escape_sql(b['cover_image'])}, "
                f"{escape_sql(b['host_name'])}, {escape_sql(b['check_in'])}, {escape_sql(b['check_out'])}, {b['nights']}, {b['guests']}, "
                f"{b['price_per_night']}, {b['cleaning_fee']}, {b['service_fee']}, {b['total_price']}, {escape_sql(b['status'])}, "
                f"{escape_sql(b['payment_method'])}, {escape_sql(b['payment_status'])}, {escape_sql(b['special_requests'])}, {escape_sql(b['created_at'])})"
            )
        f.write(",\n".join(b_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")

        # Calendar blocked dates
        batch_size = 200
        for i in range(0, len(all_calendar_dates), batch_size):
            batch = all_calendar_dates[i:i+batch_size]
            f.write("INSERT INTO listing_calendar (id, listing_id, booking_id, check_in, check_out, is_blocked, note) VALUES\n")
            cal_lines = []
            for c in batch:
                cal_lines.append(f"({escape_sql(c['id'])}, {escape_sql(c['listing_id'])}, {escape_sql(c['booking_id'])}, {escape_sql(c['check_in'])}, {escape_sql(c['check_out'])}, {c['is_blocked']}, {escape_sql(c['note'])})")
            f.write(",\n".join(cal_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")
    print(f" -> 08_bookings_calendar.sql saved ({len(bookings)} bookings, {len(all_calendar_dates)} calendar ranges)")

    # 09_reviews.sql
    with open(os.path.join(SQL_DIR, "09_reviews.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 09_reviews.sql: Seed Listing Reviews and Host Replies\n")
        f.write("-- ==============================================================================\n\n")
        batch_size = 100
        for i in range(0, len(all_reviews), batch_size):
            batch = all_reviews[i:i+batch_size]
            f.write("INSERT INTO reviews (id, listing_id, reviewer_name, reviewer_avatar, rating, comment, host_reply, review_date) VALUES\n")
            rev_lines = []
            for r in batch:
                rev_lines.append(
                    f"({escape_sql(r['id'])}, {escape_sql(r['listing_id'])}, {escape_sql(r['reviewer_name'])}, "
                    f"{escape_sql(r['reviewer_avatar'])}, {r['rating']}, {escape_sql(r['comment'])}, "
                    f"{escape_sql(r['host_reply'])}, {escape_sql(r['date'])})"
                )
            f.write(",\n".join(rev_lines) + "\nON CONFLICT (id) DO NOTHING;\n\n")
    print(f" -> 09_reviews.sql saved ({len(all_reviews)} reviews)")

    # 10_wishlists.sql
    with open(os.path.join(SQL_DIR, "10_wishlists.sql"), "w", encoding="utf-8") as f:
        f.write("-- ==============================================================================\n")
        f.write("-- 10_wishlists.sql: Seed User Wishlists\n")
        f.write("-- ==============================================================================\n\n")
        f.write("INSERT INTO wishlists (id, user_id, listing_id, created_at) VALUES\n")
        w_lines = []
        for w in wishlists:
            w_lines.append(f"({escape_sql(w['id'])}, {escape_sql(w['user_id'])}, {escape_sql(w['listing_id'])}, {escape_sql(w['created_at'])})")
        f.write(",\n".join(w_lines) + "\nON CONFLICT (user_id, listing_id) DO NOTHING;\n")
    print(" -> 10_wishlists.sql saved")

    # Combine all into seed_all.sql
    seed_all_path = os.path.join(SQL_DIR, "seed_all.sql")
    sql_files_order = [
        "00_init.sql",
        "01_schema.sql",
        "02_cities_districts.sql",
        "03_amenities.sql",
        "04_users_hosts.sql",
        "05_listings.sql",
        "06_listing_images.sql",
        "07_listing_amenities.sql",
        "08_bookings_calendar.sql",
        "09_reviews.sql",
        "10_wishlists.sql"
    ]
    with open(seed_all_path, "w", encoding="utf-8") as out_f:
        out_f.write("-- ==============================================================================\n")
        out_f.write("-- ROOMFINDER COMPLETE PRODUCTION MASTER SEED SCRIPT\n")
        out_f.write(f"-- Generated At: {datetime.now().isoformat()}\n")
        out_f.write("-- Executes schema creation and all data seeders in strict order\n")
        out_f.write("-- ==============================================================================\n\n")
        for sf in sql_files_order:
            sf_full = os.path.join(SQL_DIR, sf)
            if os.path.exists(sf_full):
                out_f.write(f"\n-- >>> START OF {sf} <<<\n")
                with open(sf_full, "r", encoding="utf-8") as inf:
                    out_f.write(inf.read())
                out_f.write(f"\n-- >>> END OF {sf} <<<\n\n")
    print(f" -> seed_all.sql saved ({os.path.getsize(seed_all_path):,} bytes)")

    print("\nProduction generation finished successfully!")

if __name__ == "__main__":
    main()
