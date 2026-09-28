import crypto from 'node:crypto';
import type { BookingStatus, Prisma } from '@prisma/client';
import { AppError, notFound } from '../../shared/errors/app-error.js';
import type { BookingInput, BookingQuoteInput } from './booking.dto.js';
import { presentBooking } from './booking.presenter.js';
import { bookingRepository as repo } from './booking.repository.js';

const money = (input: { pricePerNight: number; cleaningFee: number; serviceFeeRate: unknown }, nights: number) => { const basePrice = input.pricePerNight * nights; const serviceFee = Math.round(basePrice * Number(input.serviceFeeRate)); return { nights, basePrice, cleaningFee: input.cleaningFee, serviceFee, totalPrice: basePrice + input.cleaningFee + serviceFee }; };
const dateOnly = (value: Date) => value.toISOString().slice(0, 10);

export async function quote(input: BookingQuoteInput) {
  const listing = await repo.findActiveListingDirect(input.listingId);
  if (!listing) throw notFound('Không tìm thấy phòng đang hoạt động');
  if (input.guests > listing.guestsMax) throw new AppError(422, 'CAPACITY_EXCEEDED', 'Số khách vượt quá sức chứa');
  const checkIn = new Date(input.checkIn), checkOut = new Date(input.checkOut);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000);
  if (nights < 1) throw new AppError(422, 'INVALID_DATES', 'Ngày trả phòng phải sau ngày nhận phòng');
  if (await repo.findConflictDirect(listing.id, checkIn, checkOut)) throw new AppError(409, 'DATES_UNAVAILABLE', 'Khoảng thời gian này không còn trống');
  return { listingId: listing.id, checkIn: input.checkIn, checkOut: input.checkOut, guests: input.guests, ...money(listing, nights) };
}

export async function createBooking(userId: string, input: BookingInput, idempotencyKey?: string) {
  if (idempotencyKey) {
    const previous = await repo.findByIdempotencyKey(idempotencyKey);
    if (previous && previous.userId === userId) return presentBooking(previous);
    if (previous) throw new AppError(409, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency-Key đã được sử dụng');
  }
  return repo.transaction(async tx => {
    const listing = await repo.findActiveListing(tx, input.listingId);
    if (!listing) throw notFound('Không tìm thấy phòng đang hoạt động');
    if (input.guests > listing.guestsMax) throw new AppError(422, 'CAPACITY_EXCEEDED', 'Số khách vượt quá sức chứa');
    const checkIn = new Date(input.checkIn), checkOut = new Date(input.checkOut);
    if (await repo.findConflict(tx, listing.id, checkIn, checkOut)) throw new AppError(409, 'DATES_UNAVAILABLE', 'Khoảng thời gian này không còn trống');
    await repo.findUser(tx, userId);
    const prices = money(listing, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
    const booking = await repo.createBooking(tx, { bookingCode: `RF-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`, idempotencyKey, userId, listingId: listing.id, hostId: listing.hostId, guestName: input.guestName, guestEmail: input.guestEmail, guestPhone: input.guestPhone, listingName: listing.name, city: listing.city, district: listing.district, coverImage: listing.coverImage, hostName: listing.host.name, checkIn, checkOut, guests: input.guests, pricePerNight: listing.pricePerNight, cleaningFee: prices.cleaningFee, serviceFee: prices.serviceFee, totalPrice: prices.totalPrice, nights: prices.nights, paymentMethod: input.paymentMethod, specialRequests: input.specialRequests });
    await repo.createCalendarBlock(tx, { listingId: listing.id, bookingId: booking.id, checkIn, checkOut, isBlocked: true, note: 'Booking RoomFinder' });
    const payload = { type: 'BOOKING_CONFIRMATION' as const, bookingCode: booking.bookingCode, listingName: booking.listingName, city: booking.city, district: booking.district, checkIn: dateOnly(checkIn), checkOut: dateOnly(checkOut), guests: booking.guests, totalPrice: booking.totalPrice };
    await repo.enqueueEmail(tx, { type: 'BOOKING_CONFIRMATION', recipient: booking.guestEmail, payload: payload as Prisma.InputJsonValue, dedupeKey: `booking-confirmation:${booking.id}` });
    return presentBooking(booking);
  });
}
export async function trips(userId: string, status?: string) { return (await repo.trips(userId, status as BookingStatus | undefined)).map(presentBooking); }
export async function trip(userId: string, id: string) { const booking = await repo.trip(userId, id); if (!booking) throw notFound('Không tìm thấy chuyến đi'); return presentBooking(booking); }
export async function cancelTrip(userId: string, id: string) { const booking = await repo.bookingForCancel(userId, id); if (!booking) throw notFound('Không tìm thấy chuyến đi'); if (booking.status !== 'UPCOMING' || booking.checkIn <= new Date()) throw new AppError(409, 'CANNOT_CANCEL', 'Booking này không thể hủy'); return presentBooking(await repo.cancel(booking.id)); }
