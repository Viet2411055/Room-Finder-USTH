import type { Prisma } from '@prisma/client';
import { notFound } from '../../shared/errors/app-error.js';
import type { RoomQuery } from './room.dto.js';
import { presentListing, presentPublicReview } from './room.presenter.js';
import { roomRepository as repo } from './room.repository.js';

export async function listRooms(input: RoomQuery) {
  const and: Prisma.ListingWhereInput[] = [{ status: 'ACTIVE' }];
  if (input.destination) and.push({ OR: ['city', 'district', 'neighborhood', 'address'].map(field => ({ [field]: { contains: input.destination } })) as Prisma.ListingWhereInput[] });
  if (input.minPrice !== undefined) and.push({ pricePerNight: { gte: input.minPrice } });
  if (input.maxPrice !== undefined) and.push({ pricePerNight: { lte: input.maxPrice } });
  if (input.minRating !== undefined) and.push({ rating: { gte: input.minRating } });
  if (input.superhostOnly) and.push({ isSuperhost: true });
  if (input.bedrooms !== undefined) and.push({ bedrooms: { gte: input.bedrooms } });
  if (input.beds !== undefined) and.push({ beds: { gte: input.beds } });
  if (input.roomTypes) and.push({ roomType: { in: input.roomTypes.split(',').map(value => value.trim()).filter(Boolean) } });
  if (input.amenities) for (const name of input.amenities.split(',').map(value => value.trim()).filter(Boolean)) and.push({ amenities: { some: { amenityName: { equals: name } } } });
  const guests = input.adults + input.children;
  if (guests) and.push({ guestsMax: { gte: guests } });
  if (input.checkIn && input.checkOut) and.push({ NOT: { calendar: { some: { isBlocked: true, checkIn: { lt: new Date(input.checkOut) }, checkOut: { gt: new Date(input.checkIn) } } } } });
  const orderBy: Prisma.ListingOrderByWithRelationInput = input.sort === 'price_asc' ? { pricePerNight: 'asc' } : input.sort === 'price_desc' ? { pricePerNight: 'desc' } : input.sort === 'rating_desc' ? { rating: 'desc' } : { createdAt: 'desc' };
  const { total, rows } = await repo.list({ AND: and }, orderBy, input.page, input.limit);
  return { data: rows.map(row => presentListing(row)), meta: { page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit) } };
}
export async function getRoom(id: string) { const listing = await repo.findActiveById(id); if (!listing) throw notFound('Không tìm thấy phòng'); return presentListing(listing, true); }
export async function availability(id: string) { const listing = await repo.availability(id); if (!listing) throw notFound('Không tìm thấy phòng'); return listing.calendar.map(item => ({ id: item.id, checkIn: item.checkIn, checkOut: item.checkOut, priceOverride: item.priceOverride })); }
export async function publicReviews(id: string, page: number, limit: number) { const { total, rows } = await repo.reviews(id, page, limit); return { data: rows.map(presentPublicReview), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }; }
