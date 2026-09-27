import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

export const hostListingInclude = { host: true, images: { orderBy: { displayOrder: 'asc' as const } }, amenities: true, reviews: { orderBy: { createdAt: 'desc' as const }, take: 20 }, calendar: { orderBy: { checkIn: 'asc' as const } } };
export const hostRepository = {
  findByUserId: (userId: string) => prisma.host.findUnique({ where: { userId } }),
  findUserWithHost: (userId: string) => prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { hostProfile: true } }),
  createHost: (data: Prisma.HostUncheckedCreateInput) => prisma.host.create({ data }),
  updateUserRole: (userId: string) => prisma.user.update({ where: { id: userId }, data: { role: 'HOST' } }),
  updateHost: (id: string, data: Prisma.HostUpdateInput) => prisma.host.update({ where: { id }, data }),
  dashboardBookings: (hostId: string) => prisma.booking.findMany({ where: { hostId } }),
  activeListingCount: (hostId: string) => prisma.listing.count({ where: { hostId, status: 'ACTIVE' } }),
  listings: (hostId: string) => prisma.listing.findMany({ where: { hostId }, include: { images: { orderBy: { displayOrder: 'asc' } } } }),
  listing: (hostId: string, listingId: string) => prisma.listing.findFirst({ where: { id: listingId, hostId }, include: hostListingInclude }),
  createListing: (data: Prisma.ListingUncheckedCreateInput) => prisma.listing.create({ data, include: hostListingInclude }),
  updateListing: (id: string, data: Prisma.ListingUpdateInput) => prisma.listing.update({ where: { id }, data, include: hostListingInclude }),
  updateListingStatus: (id: string, status: 'DRAFT' | 'ACTIVE' | 'INACTIVE') => prisma.listing.update({ where: { id }, data: { status }, include: { images: { orderBy: { displayOrder: 'asc' } } } }),
  reservations: (hostId: string) => prisma.booking.findMany({ where: { hostId }, orderBy: { checkIn: 'asc' } }),
  reservation: (hostId: string, id: string) => prisma.booking.findFirst({ where: { id, hostId } }),
  listingCalendar: (hostId: string, listingId: string) => prisma.listing.findFirst({ where: { id: listingId, hostId }, include: { calendar: { orderBy: { checkIn: 'asc' } } } }),
  calendarConflict: (listingId: string, checkIn: Date, checkOut: Date, excludeId?: string) => prisma.listingCalendar.findFirst({ where: { listingId, isBlocked: true, checkIn: { lt: checkOut }, checkOut: { gt: checkIn }, ...(excludeId ? { id: { not: excludeId } } : {}) } }),
  createCalendar: (data: Prisma.ListingCalendarUncheckedCreateInput) => prisma.listingCalendar.create({ data }),
  editableCalendar: (listingId: string, id: string) => prisma.listingCalendar.findFirst({ where: { id, listingId, bookingId: null } }),
  updateCalendar: (id: string, data: Prisma.ListingCalendarUpdateInput) => prisma.listingCalendar.update({ where: { id }, data }),
  deleteCalendar: (listingId: string, id: string) => prisma.listingCalendar.deleteMany({ where: { id, listingId, bookingId: null } }),
};
