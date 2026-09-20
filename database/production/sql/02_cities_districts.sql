-- ==============================================================================
-- 02_cities_districts.sql: Seed Cities and Districts
-- ==============================================================================

INSERT INTO cities (id, name, slug, country, latitude, longitude, image_url) VALUES
('city-hanoi', 'Hà Nội', 'ha-noi', 'Việt Nam', 21.028511, 105.854167, 'https://images.unsplash.com/photo-1509030450996-9321c8b939f6?auto=format&fit=crop&w=800&q=80'),
('city-danang', 'Đà Nẵng', 'da-nang', 'Việt Nam', 16.054407, 108.202167, 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'),
('city-hcmc', 'Hồ Chí Minh', 'ho-chi-minh', 'Việt Nam', 10.776889, 106.700806, 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

INSERT INTO districts (id, city_id, name, slug, latitude, longitude) VALUES
('dist-hn-01', 'city-hanoi', 'Quận Ba Đình', 'quan-ba-dinh', 21.0341, 105.8239),
('dist-hn-02', 'city-hanoi', 'Quận Hoàn Kiếm', 'quan-hoan-kiem', 21.0292, 105.8524),
('dist-hn-03', 'city-hanoi', 'Quận Tây Hồ', 'quan-tay-ho', 21.0717, 105.8228),
('dist-hn-04', 'city-hanoi', 'Quận Đống Đa', 'quan-dong-da', 21.0181, 105.8299),
('dist-hn-05', 'city-hanoi', 'Quận Hai Bà Trưng', 'quan-hai-ba-trung', 21.0084, 105.8569),
('dist-hn-06', 'city-hanoi', 'Quận Cầu Giấy', 'quan-cau-giay', 21.0313, 105.7938),
('dist-hn-07', 'city-hanoi', 'Quận Thanh Xuân', 'quan-thanh-xuan', 20.9937, 105.8115),
('dist-dn-01', 'city-danang', 'Quận Hải Châu', 'quan-hai-chau', 16.0538, 108.2208),
('dist-dn-02', 'city-danang', 'Quận Sơn Trà', 'quan-son-tra', 16.0825, 108.2435),
('dist-dn-03', 'city-danang', 'Quận Thanh Khê', 'quan-thanh-khe', 16.0601, 108.1884),
('dist-dn-04', 'city-danang', 'Quận Ngũ Hành Sơn', 'quan-ngu-hanh-son', 16.0025, 108.2562),
('dist-dn-05', 'city-danang', 'Quận Liên Chiểu', 'quan-lien-chieu', 16.0831, 108.1481),
('dist-hcm-01', 'city-hcmc', 'Quận 1', 'quan-1', 10.7756, 106.7004),
('dist-hcm-02', 'city-hcmc', 'Quận 3', 'quan-3', 10.7844, 106.6844),
('dist-hcm-03', 'city-hcmc', 'Quận 4', 'quan-4', 10.7644, 106.7042),
('dist-hcm-04', 'city-hcmc', 'Quận 5', 'quan-5', 10.7554, 106.6669),
('dist-hcm-05', 'city-hcmc', 'Quận 7', 'quan-7', 10.734, 106.7218),
('dist-hcm-06', 'city-hcmc', 'Quận 10', 'quan-10', 10.7716, 106.6672),
('dist-hcm-07', 'city-hcmc', 'Quận Tân Bình', 'quan-tan-binh', 10.7992, 106.6541),
('dist-hcm-08', 'city-hcmc', 'Quận Bình Thạnh', 'quan-binh-thanh', 10.803, 106.7099),
('dist-hcm-09', 'city-hcmc', 'Quận Phú Nhuận', 'quan-phu-nhuan', 10.7997, 106.6803)
ON CONFLICT (city_id, name) DO NOTHING;
