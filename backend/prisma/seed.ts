import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
// Resolve from the backend working directory in both local runs and Docker.
// Override SEED_DATA_DIR when deploying with a different filesystem layout.
const root = process.env.SEED_DATA_DIR
  ? path.resolve(process.env.SEED_DATA_DIR)
  : path.resolve(process.cwd(), '../database/production/json');
const load = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const users: any[] = load('users.json');
const hosts: any[] = load('hosts.json');
const cities: any[] = load('cities.json');
const listings: any[] = load('listings.json');
const bookings: any[] = load('bookings.json');
const reviews: any[] = load('reviews.json');
const wishlists: any[] = load('wishlists.json');
const d = (value: string) => new Date(value);

async function main() {
  if (await prisma.user.count()) {
    const hashes = new Map<string, string>();
    for (const user of users) {
      if (!user.password) continue;
      if (!hashes.has(user.password)) hashes.set(user.password, await bcrypt.hash(user.password, 12));
      await prisma.user.updateMany({ where: { id: user.id, passwordHash: user.password_hash }, data: { passwordHash: hashes.get(user.password)! } });
    }
    console.info('Database already has data; repaired seed credentials and skipped data import');
    return;
  }
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0');
  for (const table of ['sessions','otp_tokens','wishlists','reviews','listing_calendar','bookings','listing_amenities','listing_images','listings','districts','cities','hosts','users']) await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\``);
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1');
  const hashes = new Map<string, string>();
  for (const u of users) {
    const password = u.password ?? 'password123';
    if (!hashes.has(password)) hashes.set(password, await bcrypt.hash(password, 12));
    await prisma.user.create({ data: { id: u.id, username: u.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'), email: u.email, passwordHash: hashes.get(password)!, name: u.name, phone: u.phone, avatarUrl: u.avatar_url, bio: u.bio, role: u.role === 'host' ? 'HOST' : 'TRAVELER', status: 'ACTIVE', emailVerifiedAt: new Date() } });
  }
  for (const h of hosts) await prisma.host.create({ data: { id: h.id, userId: h.user_id, name: h.name, email: h.email, phone: h.phone, avatarUrl: h.avatar_url, about: h.about, isSuperhost: h.is_superhost, responseRate: h.response_rate, responseTime: h.response_time, joinedDate: h.joined_date, identityVerified: h.identity_verified, listingsCount: h.listings_count, rating: h.rating, reviewCount: h.review_count } });
  for (const c of cities) {
    await prisma.city.create({ data: { id: c.id, name: c.name, slug: c.slug, country: c.country, latitude: c.latitude, longitude: c.longitude, imageUrl: c.image_url } });
    for (const district of c.districts) await prisma.district.create({ data: { id: district.id, cityId: c.id, name: district.name, slug: district.slug, latitude: district.latitude, longitude: district.longitude } });
  }
  for (const l of listings) await prisma.listing.create({ data: { id: String(l.id), hostId: l.host_id, cityId: l.city_id, districtId: l.district_id, listingUrl: l.listing_url, name: l.name, roomType: l.room_type, city: l.city, district: l.district, neighborhood: l.neighborhood, address: l.address, latitude: l.latitude, longitude: l.longitude, pricePerNight: l.price_per_night, priceFormatted: l.price_formatted, cleaningFee: l.cleaning_fee, serviceFeeRate: l.service_fee_rate, guestsMax: l.specs.guests, bedrooms: l.specs.bedrooms, beds: l.specs.beds, baths: l.specs.baths, description: l.description, rating: l.rating, reviewCount: l.review_count, isSuperhost: l.is_superhost, isGuestFavorite: l.is_guest_favorite, coverImage: l.cover_image, imageCount: l.image_count, houseRules: l.house_rules, cancellationPolicyTitle: l.cancellation_policy.title, cancellationPolicyDescription: l.cancellation_policy.description, status: l.status, images: { create: l.images.map((imageUrl: string, displayOrder: number) => ({ imageUrl, displayOrder, isCover: imageUrl === l.cover_image })) }, amenities: { create: l.amenities.map((amenityName: string) => ({ amenityName })) }, calendar: { create: (l.booked_dates || []).map((x: any) => ({ checkIn: d(x.check_in), checkOut: d(x.check_out), isBlocked: true })) } } });
  for (const b of bookings) {
    const booking = await prisma.booking.create({ data: { id: b.id, bookingCode: b.booking_code, userId: b.user_id, listingId: String(b.listing_id), hostId: b.host_id, guestName: b.guest_name, guestEmail: b.guest_email, guestPhone: b.guest_phone, listingName: b.listing_name, city: b.city, district: b.district, coverImage: b.cover_image, hostName: b.host_name, checkIn: d(b.check_in), checkOut: d(b.check_out), nights: b.nights, guests: b.guests, pricePerNight: b.price_per_night, cleaningFee: b.cleaning_fee, serviceFee: b.service_fee, totalPrice: b.total_price, status: b.status, paymentMethod: b.payment_method, paymentStatus: b.payment_status, specialRequests: b.special_requests } });
    if (b.status === 'UPCOMING') await prisma.listingCalendar.create({ data: { listingId: booking.listingId, bookingId: booking.id, checkIn: booking.checkIn, checkOut: booking.checkOut, isBlocked: true, note: 'Imported booking' } });
  }
  for (const r of reviews) await prisma.review.create({ data: { id: r.id, listingId: String(r.listing_id), reviewerName: r.reviewer_name, reviewerAvatar: r.reviewer_avatar, rating: r.rating, comment: r.comment, hostReply: r.host_reply, reviewDate: r.date } });
  for (const w of wishlists) await prisma.wishlist.create({ data: { id: w.id, userId: w.user_id, listingId: String(w.listing_id), createdAt: d(w.created_at) } });
}
main().then(() => console.info('Production data seeded')).finally(() => prisma.$disconnect());
