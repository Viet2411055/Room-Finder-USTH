import type { Booking, Host, Listing, Review, User } from '../types';

const API_ROOT = '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  });
  if (response.status === 401 && retry && path !== '/auth/refresh') {
    refreshPromise ??= fetch(`${API_ROOT}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(value => value.ok)
      .finally(() => { refreshPromise = null; });
    if (await refreshPromise) return request<T>(path, init, false);
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(response.status, payload?.error?.code ?? 'REQUEST_FAILED', payload?.error?.message ?? 'Không thể kết nối đến máy chủ');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const hostFromApi = (value: any): Host => ({
  id: value.id,
  name: value.name,
  avatar_url: value.avatarUrl ?? '',
  about: value.about ?? '',
  is_superhost: Boolean(value.isSuperhost),
  response_rate: value.responseRate ?? '',
  response_time: value.responseTime ?? '',
  joined_date: value.joinedDate ?? '',
  phone: value.phone ?? undefined,
  email: value.email ?? undefined,
  listings_count: value.listingsCount ?? undefined,
});

const reviewFromApi = (value: any): Review => ({
  id: value.id,
  listing_id: value.listingId,
  reviewer_name: value.reviewerName,
  reviewer_avatar: value.reviewerAvatar ?? '',
  date: value.date,
  rating: Number(value.rating),
  comment: value.comment,
  host_reply: value.hostReply ?? null,
});

export const listingFromApi = (value: any): Listing => ({
  id: value.id,
  listing_url: value.listingUrl ?? undefined,
  name: value.name,
  room_type: value.roomType,
  city: value.city,
  district: value.district,
  neighborhood: value.neighborhood ?? '',
  address: value.address,
  latitude: Number(value.latitude),
  longitude: Number(value.longitude),
  price_per_night: value.pricePerNight,
  price_formatted: value.priceFormatted,
  rating: Number(value.rating),
  review_count: value.reviewCount,
  is_superhost: Boolean(value.isSuperhost),
  is_guest_favorite: Boolean(value.isGuestFavorite),
  specs: value.specs,
  amenities: value.amenities ?? [],
  images: value.images?.length ? value.images : [value.coverImage],
  image_count: value.imageCount,
  cover_image: value.coverImage,
  host_id: value.hostId,
  host: value.host ? hostFromApi(value.host) : (undefined as unknown as Host),
  description: value.description ?? '',
  reviews: (value.reviews ?? []).map(reviewFromApi),
  booked_dates: (value.bookedDates ?? []).map((date: any) => ({ check_in: date.checkIn, check_out: date.checkOut })),
  cleaning_fee: value.cleaningFee,
  service_fee_rate: Number(value.serviceFeeRate),
  house_rules: value.houseRules ?? [],
  cancellation_policy: value.cancellationPolicy ?? { title: '', description: '' },
  status: value.status,
});

const userFromApi = (value: any): User => ({
  id: value.id,
  username: value.username,
  name: value.name,
  email: value.email,
  phone: value.phone ?? '',
  avatar_url: value.avatarUrl ?? '',
  role: value.role === 'HOST' ? 'host' : 'traveler',
  host_id: value.hostId,
  created_at: value.createdAt,
  email_verified_at: value.emailVerifiedAt ?? null,
});

export const bookingFromApi = (value: any): Booking => ({
  id: value.id,
  booking_code: value.bookingCode,
  user_id: value.userId ?? '',
  guest_name: value.guestName,
  guest_email: value.guestEmail,
  guest_phone: value.guestPhone,
  listing_id: value.listingId,
  listing_name: value.listingName,
  city: value.city,
  district: value.district,
  cover_image: value.coverImage,
  host_id: value.hostId,
  host_name: value.hostName,
  check_in: String(value.checkIn).slice(0, 10),
  check_out: String(value.checkOut).slice(0, 10),
  nights: value.nights,
  guests: value.guests,
  price_per_night: value.pricePerNight,
  cleaning_fee: value.cleaningFee,
  service_fee: value.serviceFee,
  total_price: value.totalPrice,
  status: value.status,
  payment_method: value.paymentMethod,
  created_at: value.createdAt,
});

export type RoomQuery = Record<string, string | number | boolean | undefined>;
export type PageMeta = { page: number; limit: number; total: number; totalPages: number };

const queryString = (input: RoomQuery) => {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== false) params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const api = {
  async rooms(query: RoomQuery = {}, signal?: AbortSignal) {
    const result = await request<{ data: any[]; meta: PageMeta }>(`/rooms${queryString(query)}`, { signal });
    return { data: result.data.map(listingFromApi), meta: result.meta };
  },
  async room(id: string) {
    const result = await request<{ data: any }>(`/rooms/${encodeURIComponent(id)}`);
    return listingFromApi(result.data);
  },
  async me() {
    const result = await request<{ data: any }>('/auth/me');
    return userFromApi(result.data);
  },
  async login(identity: string, password: string) {
    await request<void>('/auth/login', { method: 'POST', body: JSON.stringify({ identity, password }) }, false);
    return this.me();
  },
  async register(input: { username: string; name: string; email: string; password: string; phone?: string }) {
    return request<{ data: { id: string; email: string }; message: string }>('/auth/register', { method: 'POST', body: JSON.stringify(input) }, false);
  },
  async verifyEmail(email: string, otp: string) {
    const result = await request<{ data: any }>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) }, false);
    return userFromApi(result.data);
  },
  resendVerification(email: string) {
    return request<void>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }, false);
  },
  forgotPassword(email: string) {
    return request<void>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }, false);
  },
  resetPassword(email: string, otp: string, password: string) {
    return request<void>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, password }) }, false);
  },
  logout: () => request<void>('/auth/logout', { method: 'POST' }, false),
  async updateProfile(input: Partial<{ name: string; phone: string | null; avatarUrl: string | null; bio: string | null }>) {
    const result = await request<{ data: any }>('/users/me', { method: 'PATCH', body: JSON.stringify(input) });
    return userFromApi(result.data);
  },
  async onboardHost() {
    await request('/hosts/onboarding', { method: 'POST' });
    return this.me();
  },
  async hostProfile() { return hostFromApi((await request<{ data: any }>('/hosts/me')).data); },
  async updateHost(input: Partial<{ name: string; phone: string; avatarUrl: string; about: string; responseTime: string }>) {
    return hostFromApi((await request<{ data: any }>('/hosts/me', { method: 'PATCH', body: JSON.stringify(input) })).data);
  },
  async wishlist() {
    const result = await request<{ data: any[] }>('/wishlists');
    return result.data.map(listingFromApi);
  },
  async wishlistStatus(listingId: string) {
    return (await request<{ data: { saved: boolean } }>(`/wishlists/${encodeURIComponent(listingId)}`)).data.saved;
  },
  addWishlist: (listingId: string) => request<void>(`/wishlists/${encodeURIComponent(listingId)}`, { method: 'PUT' }),
  removeWishlist: (listingId: string) => request<void>(`/wishlists/${encodeURIComponent(listingId)}`, { method: 'DELETE' }),
  async trips(status?: Booking['status']) {
    const result = await request<{ data: any[] }>(`/trips${status ? `?status=${status}` : ''}`);
    return result.data.map(bookingFromApi);
  },
  async trip(id: string) {
    const result = await request<{ data: any }>(`/trips/${encodeURIComponent(id)}`);
    return bookingFromApi(result.data);
  },
  async createBooking(input: any) {
    const result = await request<{ data: any }>('/bookings', { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify(input) });
    return bookingFromApi(result.data);
  },
  async cancelTrip(id: string) {
    const result = await request<{ data: any }>(`/trips/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
    return bookingFromApi(result.data);
  },
  async createReview(bookingId: string, rating: number, comment: string) {
    const result = await request<{ data: any }>(`/bookings/${encodeURIComponent(bookingId)}/review`, { method: 'POST', body: JSON.stringify({ rating, comment }) });
    return reviewFromApi(result.data);
  },
  async hostDashboard() { return (await request<{ data: any }>('/host/dashboard')).data; },
  async hostListings() { return (await request<{ data: any[] }>('/host/listings')).data.map(listingFromApi); },
  async hostListing(id: string) { return listingFromApi((await request<{ data: any }>(`/host/listings/${encodeURIComponent(id)}`)).data); },
  async createListing(input: any) { return listingFromApi((await request<{ data: any }>('/host/listings', { method: 'POST', body: JSON.stringify(input) })).data); },
  async updateListing(id: string, input: any) { return listingFromApi((await request<{ data: any }>(`/host/listings/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) })).data); },
  updateListingStatus: (id: string, status: Listing['status']) => request(`/host/listings/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  archiveListing: (id: string) => request<void>(`/host/listings/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  async hostReservations() { return (await request<{ data: any[] }>('/host/reservations')).data.map(bookingFromApi); },
  async hostReservation(id: string) { return bookingFromApi((await request<{ data: any }>(`/host/reservations/${encodeURIComponent(id)}`)).data); },
  async hostReviews() {
    const result = await request<{ data: any[]; meta: PageMeta }>('/host/reviews?limit=100');
    return result.data.map(value => ({ ...reviewFromApi(value), listing: value.listing }));
  },
  replyReview: (id: string, reply: string) => request(`/host/reviews/${encodeURIComponent(id)}/reply`, { method: 'PUT', body: JSON.stringify({ reply }) }),
  async calendar(listingId: string) { return (await request<{ data: any[] }>(`/host/listings/${encodeURIComponent(listingId)}/calendar`)).data; },
  createCalendar: (listingId: string, input: any) => request(`/host/listings/${encodeURIComponent(listingId)}/calendar`, { method: 'POST', body: JSON.stringify(input) }),
  deleteCalendar: (listingId: string, calendarId: string) => request<void>(`/host/listings/${encodeURIComponent(listingId)}/calendar/${encodeURIComponent(calendarId)}`, { method: 'DELETE' }),
};
