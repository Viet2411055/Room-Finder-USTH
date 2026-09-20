export interface Host {
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

export interface Review {
  id: string;
  listing_id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  date: string;
  rating: number;
  comment: string;
  host_reply?: string | null;
}

export interface BookedDate {
  check_in: string;
  check_out: string;
}

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

export interface Listing {
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
  host: Host;
  description: string;
  reviews: Review[];
  booked_dates: BookedDate[];
  cleaning_fee: number;
  service_fee_rate: number;
  house_rules: string[];
  cancellation_policy: CancellationPolicy;
  status?: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
}

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: 'traveler' | 'host';
  host_id?: string | null;
  created_at: string;
  email_verified_at?: string | null;
}

export interface Booking {
  id: string;
  booking_code: string;
  user_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  listing_id: string;
  listing_name: string;
  city: string;
  district: string;
  cover_image: string;
  host_id: string;
  host_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  payment_method: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface SearchState {
  destination: string; // e.g. "Tất cả", "Hà Nội", "Đà Nẵng", "Hồ Chí Minh"
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
}

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  roomTypes: string[];
  amenities: string[];
  minRating?: number;
  superhostOnly?: boolean;
  bedrooms?: number;
}
