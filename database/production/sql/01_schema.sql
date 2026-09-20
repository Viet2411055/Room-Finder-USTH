-- ==============================================================================
-- ROOMFINDER PRODUCTION DATABASE SCHEMA (DDL)
-- File: 01_schema.sql
-- Description: Core tables, foreign keys, triggers, and performance indexes
-- Target Engine: PostgreSQL 14+ (Compatible with Supabase, Neon, AWS RDS, Docker)
-- ==============================================================================

-- Drop existing tables if needed (in reverse dependency order)
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS listing_calendar CASCADE;
DROP TABLE IF EXISTS listing_amenities CASCADE;
DROP TABLE IF EXISTS listing_images CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS amenity_categories CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS hosts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'traveler' CHECK (role IN ('traveler', 'host', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    host_id VARCHAR(64),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_host_id ON users(host_id);

-- ------------------------------------------------------------------------------
-- 2. HOSTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE hosts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT NOT NULL,
    about TEXT,
    is_superhost BOOLEAN NOT NULL DEFAULT FALSE,
    response_rate VARCHAR(20) NOT NULL DEFAULT '100%',
    response_time VARCHAR(50) NOT NULL DEFAULT 'trong vòng 1 giờ',
    joined_date VARCHAR(50) NOT NULL,
    identity_verified BOOLEAN NOT NULL DEFAULT TRUE,
    listings_count INT NOT NULL DEFAULT 0 CHECK (listings_count >= 0),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hosts_user_id ON hosts(user_id);
CREATE INDEX idx_hosts_superhost ON hosts(is_superhost);

-- Add foreign key constraint back from users.host_id to hosts.id
ALTER TABLE users ADD CONSTRAINT fk_users_host FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 3. CITIES & DISTRICTS TABLES (Geo Lookup)
-- ------------------------------------------------------------------------------
CREATE TABLE cities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Việt Nam',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE districts (
    id VARCHAR(64) PRIMARY KEY,
    city_id VARCHAR(64) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_city_district UNIQUE (city_id, name)
);

CREATE INDEX idx_districts_city_id ON districts(city_id);

-- ------------------------------------------------------------------------------
-- 4. AMENITIES CATALOG TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE amenity_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE amenities (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) REFERENCES amenity_categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50)
);

CREATE INDEX idx_amenities_category_id ON amenities(category_id);

-- ------------------------------------------------------------------------------
-- 5. LISTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE listings (
    id VARCHAR(64) PRIMARY KEY,
    host_id VARCHAR(64) NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    city_id VARCHAR(64) REFERENCES cities(id) ON DELETE SET NULL,
    district_id VARCHAR(64) REFERENCES districts(id) ON DELETE SET NULL,
    listing_url TEXT,
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    price_per_night INT NOT NULL CHECK (price_per_night >= 0),
    price_formatted VARCHAR(100) NOT NULL,
    price_total INT,
    price_nights INT,
    price_label VARCHAR(100),
    cleaning_fee INT NOT NULL DEFAULT 120000 CHECK (cleaning_fee >= 0),
    service_fee_rate NUMERIC(4, 2) NOT NULL DEFAULT 0.08 CHECK (service_fee_rate >= 0),
    guests_max INT NOT NULL DEFAULT 2 CHECK (guests_max >= 1),
    bedrooms INT NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
    beds INT NOT NULL DEFAULT 1 CHECK (beds >= 0),
    baths NUMERIC(3, 1) NOT NULL DEFAULT 1 CHECK (baths >= 0),
    description TEXT NOT NULL,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    is_superhost BOOLEAN NOT NULL DEFAULT FALSE,
    is_guest_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    cover_image TEXT NOT NULL,
    image_count INT NOT NULL DEFAULT 0,
    house_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    cancellation_policy_title VARCHAR(150) NOT NULL DEFAULT 'Hủy miễn phí trong 48 giờ',
    cancellation_policy_description TEXT NOT NULL DEFAULT 'Hoàn tiền 100% nếu hủy trước ngày nhận phòng ít nhất 48 giờ.',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX idx_listings_host_id ON listings(host_id);
CREATE INDEX idx_listings_city_status_price ON listings(city, status, price_per_night);
CREATE INDEX idx_listings_district ON listings(district);
CREATE INDEX idx_listings_rating ON listings(rating DESC);
CREATE INDEX idx_listings_superhost ON listings(is_superhost);
CREATE INDEX idx_listings_coords ON listings(latitude, longitude);

-- ------------------------------------------------------------------------------
-- 6. LISTING IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE listing_images (
    id VARCHAR(64) PRIMARY KEY,
    listing_id VARCHAR(64) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    caption VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listing_images_listing_order ON listing_images(listing_id, display_order);

-- ------------------------------------------------------------------------------
-- 7. LISTING AMENITIES TABLE (Junction)
-- ------------------------------------------------------------------------------
CREATE TABLE listing_amenities (
    listing_id VARCHAR(64) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    amenity_id VARCHAR(64) REFERENCES amenities(id) ON DELETE CASCADE,
    amenity_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (listing_id, amenity_name)
);

CREATE INDEX idx_listing_amenities_name ON listing_amenities(amenity_name);

-- ------------------------------------------------------------------------------
-- 8. BOOKINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id VARCHAR(64) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    host_id VARCHAR(64) NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(50) NOT NULL,
    listing_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    cover_image TEXT NOT NULL,
    host_name VARCHAR(150) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL CHECK (nights >= 1),
    guests INT NOT NULL CHECK (guests >= 1),
    price_per_night INT NOT NULL CHECK (price_per_night >= 0),
    cleaning_fee INT NOT NULL DEFAULT 0 CHECK (cleaning_fee >= 0),
    service_fee INT NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
    total_price INT NOT NULL CHECK (total_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'COMPLETED', 'CANCELLED')),
    payment_method VARCHAR(100) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'FAILED')),
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_dates CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_host_status ON bookings(host_id, status);
CREATE INDEX idx_bookings_listing_dates ON bookings(listing_id, check_in, check_out);

-- ------------------------------------------------------------------------------
-- 9. LISTING CALENDAR TABLE (Blocked dates & reservations)
-- ------------------------------------------------------------------------------
CREATE TABLE listing_calendar (
    id VARCHAR(64) PRIMARY KEY,
    listing_id VARCHAR(64) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT TRUE,
    price_override INT,
    note VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_calendar_dates CHECK (check_out > check_in)
);

CREATE INDEX idx_calendar_listing_dates ON listing_calendar(listing_id, check_in, check_out);

-- ------------------------------------------------------------------------------
-- 10. REVIEWS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE reviews (
    id VARCHAR(64) PRIMARY KEY,
    listing_id VARCHAR(64) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(150) NOT NULL,
    reviewer_avatar TEXT,
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    host_reply TEXT,
    host_reply_date TIMESTAMPTZ,
    review_date VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);

-- ------------------------------------------------------------------------------
-- 11. WISHLISTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE wishlists (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id VARCHAR(64) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_listing_wishlist UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- ------------------------------------------------------------------------------
-- 12. TRIGGERS & STORED PROCEDURES
-- ------------------------------------------------------------------------------

-- Trigger 1: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_hosts_updated_at BEFORE UPDATE ON hosts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger 2: Recalculate listing rating & review count upon Review change
CREATE OR REPLACE FUNCTION sync_listing_review_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_listing_id VARCHAR(64);
BEGIN
    target_listing_id := COALESCE(NEW.listing_id, OLD.listing_id);
    UPDATE listings
    SET 
        rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE listing_id = target_listing_id), 0.0),
        review_count = (SELECT COUNT(*) FROM reviews WHERE listing_id = target_listing_id)
    WHERE id = target_listing_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_review_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION sync_listing_review_stats();

-- Trigger 3: Sync host listing count upon Listing change
CREATE OR REPLACE FUNCTION sync_host_listing_count()
RETURNS TRIGGER AS $$
DECLARE
    target_host_id VARCHAR(64);
BEGIN
    target_host_id := COALESCE(NEW.host_id, OLD.host_id);
    UPDATE hosts
    SET listings_count = (SELECT COUNT(*) FROM listings WHERE host_id = target_host_id AND status = 'ACTIVE')
    WHERE id = target_host_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_host_listings
AFTER INSERT OR UPDATE OR DELETE ON listings
FOR EACH ROW EXECUTE FUNCTION sync_host_listing_count();
