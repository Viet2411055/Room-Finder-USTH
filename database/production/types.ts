// ==============================================================================
// RoomFinder Production TypeScript Type Definitions
// File: database/production/types.ts
// Description: Unified database entities and API data transfer objects
// ==============================================================================

export type UserRole = 'traveler' | 'host' | 'admin';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type ListingStatus = 'ACTIVE' | 'DRAFT' | 'INACTIVE';
export type BookingStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

// ------------------------------------------------------------------------------
// Core Database Entities (Normalized Relational 3NF)
// ------------------------------------------------------------------------------

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  status: UserStatus;
  host_id?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostEntity {
  id: string;
  user_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url: string;
  about?: string | null;
  is_superhost: boolean;
  response_rate: string;
  response_time: string;
  joined_date: string;
  identity_verified: boolean;
  listings_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface CityEntity {
  id: string;
  name: string;
  slug: string;
  country: string;
  latitude: number;
  longitude: number;
  image_url?: string | null;
  created_at: string;
}

export interface DistrictEntity {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface AmenityCategoryEntity {
  id: string;
  name: string;
  icon?: string | null;
  display_order: number;
}

export interface AmenityEntity {
  id: string;
  category_id?: string | null;
  name: string;
  code: string;
  icon?: string | null;
}

export interface ListingEntity {
  id: string;
  host_id: string;
  city_id?: string | null;
  district_id?: string | null;
  listing_url?: string | null;
  name: string;
  room_type: string;
  city: string;
  district: string;
  neighborhood?: string | null;
  address: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  price_formatted: string;
  price_total?: number | null;
  price_nights?: number | null;
  price_label?: string | null;
  cleaning_fee: number;
  service_fee_rate: number;
  guests_max: number;
  bedrooms: number;
  beds: number;
  baths: number;
  description: string;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  is_guest_favorite: boolean;
  cover_image: string;
  image_count: number;
  house_rules: string[];
  cancellation_policy_title: string;
  cancellation_policy_description: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface ListingImageEntity {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  is_cover: boolean;
  caption?: string | null;
  created_at: string;
}

export interface ListingAmenityEntity {
  listing_id: string;
  amenity_id?: string | null;
  amenity_name: string;
  created_at: string;
}

export interface ListingCalendarEntity {
  id: string;
  listing_id: string;
  booking_id?: string | null;
  check_in: string;
  check_out: string;
  is_blocked: boolean;
  price_override?: number | null;
  note?: string | null;
  created_at: string;
}

export interface BookingEntity {
  id: string;
  booking_code: string;
  user_id: string;
  listing_id: string;
  host_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  listing_name: string;
  city: string;
  district: string;
  cover_image: string;
  host_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: BookingStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  special_requests?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewEntity {
  id: string;
  listing_id: string;
  booking_id?: string | null;
  user_id?: string | null;
  reviewer_name: string;
  reviewer_avatar?: string | null;
  rating: number;
  comment: string;
  host_reply?: string | null;
  host_reply_date?: string | null;
  review_date: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistEntity {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// Frontend Compatible Enriched Listing Interface
// ------------------------------------------------------------------------------

export interface Specs {
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
}

export interface CancellationPolicy {
  title: string;
  description: string;
}

export interface BookedDate {
  check_in: string;
  check_out: string;
}

export interface ReviewItem {
  id: string;
  listing_id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  date: string;
  rating: number;
  comment: string;
  host_reply?: string | null;
}

export interface HostProfile {
  id: string;
  name: string;
  avatar_url: string;
  about: string;
  is_superhost: boolean;
  response_rate: string;
  response_time: string;
  joined_date: string;
  phone?: string;
  email?: string;
  listings_count?: number;
}

export interface ProductionListing {
  id: string;
  listing_url?: string;
  name: string;
  room_type: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  price_formatted: string;
  price_total?: number;
  price_nights?: number;
  price_label?: string;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  is_guest_favorite?: boolean;
  specs: Specs;
  amenities: string[];
  images: string[];
  image_count: number;
  cover_image: string;
  host_id: string;
  host: HostProfile;
  description: string;
  reviews: ReviewItem[];
  booked_dates: BookedDate[];
  cleaning_fee: number;
  service_fee_rate: number;
  house_rules: string[];
  cancellation_policy: CancellationPolicy;
  status: ListingStatus;
  city_id?: string;
  district_id?: string;
}
