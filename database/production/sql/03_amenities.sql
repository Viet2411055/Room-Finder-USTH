-- ==============================================================================
-- 03_amenities.sql: Seed Amenity Categories and Amenities
-- ==============================================================================

INSERT INTO amenity_categories (id, name, icon, display_order) VALUES
('cat-essentials', 'Tiện nghi cơ bản', 'Wifi', 1),
('cat-bathroom', 'Phòng tắm & Giặt là', 'Bath', 2),
('cat-kitchen', 'Bếp & Ăn uống', 'Utensils', 3),
('cat-facilities', 'Tiện ích & Giải trí', 'Tv', 4),
('cat-safety', 'An toàn & An ninh', 'ShieldCheck', 5),
('cat-services', 'Dịch vụ & Tự nhận phòng', 'Key', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO amenities (id, category_id, name, code, icon) VALUES
('amenity-wifi', 'cat-essentials', 'Wi-fi', 'wifi', 'Wifi'),
('amenity-ac', 'cat-essentials', 'Điều hòa nhiệt độ', 'air_conditioning', 'Wind'),
('amenity-workspace', 'cat-essentials', 'Không gian riêng để làm việc', 'workspace', 'Laptop'),
('amenity-tv', 'cat-essentials', 'TV', 'tv', 'Tv'),
('amenity-linens', 'cat-essentials', 'Khăn tắm, ga trải giường', 'linens', 'Bed'),
('amenity-iron', 'cat-essentials', 'Bàn là', 'iron', 'Zap'),
('amenity-hairdryer', 'cat-bathroom', 'Máy sấy tóc', 'hair_dryer', 'Wind'),
('amenity-washer', 'cat-bathroom', 'Máy giặt', 'washer', 'Shirt'),
('amenity-dryer', 'cat-bathroom', 'Máy sấy quần áo', 'dryer', 'Sun'),
('amenity-hotwater', 'cat-bathroom', 'Nước nóng', 'hot_water', 'Flame'),
('amenity-shampoo', 'cat-bathroom', 'Dầu gội và sữa tắm', 'shampoo', 'Droplet'),
('amenity-bathtub', 'cat-bathroom', 'Bồn tắm ngâm', 'bathtub', 'Bath'),
('amenity-kitchen', 'cat-kitchen', 'Nhà bếp', 'kitchen', 'Utensils'),
('amenity-fridge', 'cat-kitchen', 'Tủ lạnh', 'refrigerator', 'Archive'),
('amenity-microwave', 'cat-kitchen', 'Lò vi sóng', 'microwave', 'Box'),
('amenity-cookware', 'cat-kitchen', 'Nồi, chảo, gia vị cơ bản', 'cookware', 'Coffee'),
('amenity-kettle', 'cat-kitchen', 'Ấm đun nước siêu tốc', 'kettle', 'Coffee'),
('amenity-pool', 'cat-facilities', 'Bể bơi', 'pool', 'Waves'),
('amenity-parking', 'cat-facilities', 'Chỗ đỗ xe miễn phí trong khuôn viên', 'free_parking', 'Car'),
('amenity-elevator', 'cat-facilities', 'Thang máy', 'elevator', 'ArrowUpCircle'),
('amenity-gym', 'cat-facilities', 'Phòng tập thể dục (Gym)', 'gym', 'Dumbbell'),
('amenity-balcony', 'cat-facilities', 'Ban công riêng thoáng mát', 'balcony', 'Sun'),
('amenity-smoke', 'cat-safety', 'Máy báo khói', 'smoke_alarm', 'AlertTriangle'),
('amenity-firstaid', 'cat-safety', 'Hộp sơ cứu', 'first_aid', 'PlusSquare'),
('amenity-extinguisher', 'cat-safety', 'Bình chữa cháy', 'fire_extinguisher', 'Shield'),
('amenity-selfcheckin', 'cat-services', 'Tự nhận phòng với khóa thông minh', 'self_checkin', 'Key'),
('amenity-luggage', 'cat-services', 'Cho phép gửi hành lý trước giờ', 'luggage_dropoff', 'Package')
ON CONFLICT (id) DO NOTHING;
