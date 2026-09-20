-- ==============================================================================
-- ROOMFINDER PRODUCTION DATABASE INITIALIZATION
-- File: 00_init.sql
-- Description: PostgreSQL extensions, custom ENUM types, and core configuration
-- ==============================================================================

-- Enable UUID and cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('traveler', 'host', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. User Account Status
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Listing Status
DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('ACTIVE', 'DRAFT', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Booking Status
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Payment Status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
