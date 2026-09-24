import type { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

type Db = Prisma.TransactionClient;
export const bookingRepository = {
  transaction: <T>(work: (tx: Db) => Promise<T>) => prisma.$transaction(work, { isolationLevel: 'Serializable' }),
  findByIdempotencyKey: (key: string) => prisma.booking.findUnique({ where: { idempotencyKey: key } }),
  findActiveListingDirect: (id: string) => prisma.listing.findFirst({ where: { id, status: 'ACTIVE' }, include: { host: true } }),
  findActiveListing: (db: Db | typeof prisma, id: string) => db.listing.findFirst({ where: { id, status: 'ACTIVE' }, include: { host: true } }),
  findConflictDirect: (listingId: string, checkIn: Date, checkOut: Date) => prisma.listingCalendar.findFirst({ where: { listingId, isBlocked: true, checkIn: { lt: checkOut }, checkOut: { gt: checkIn } } }),
  findConflict: (db: Db | typeof prisma, listingId: string, checkIn: Date, checkOut: Date) => db.listingCalendar.findFirst({ where: { listingId, isBlocked: true, checkIn: { lt: checkOut }, checkOut: { gt: checkIn } } }),
  findUser: (db: Db, id: string) => db.user.findUniqueOrThrow({ where: { id } }),
  createBooking: (db: Db, data: Prisma.BookingUncheckedCreateInput) => db.booking.create({ data }),
  createCalendarBlock: (db: Db, data: Prisma.ListingCalendarUncheckedCreateInput) => db.listingCalendar.create({ data }),
  enqueueEmail: (db: Db, data: Prisma.EmailOutboxCreateInput) => db.emailOutbox.create({ data }),
  trips: (userId: string, status?: BookingStatus) => prisma.booking.findMany({ where: { userId, ...(status ? { status } : {}) }, orderBy: { createdAt: 'desc' } }),
  trip: (userId: string, id: string) => prisma.booking.findFirst({ where: { id, userId } }),
  bookingForCancel: (userId: string, id: string) => prisma.booking.findFirst({ where: { id, userId } }),
  cancel: (bookingId: string) => prisma.$transaction(async tx => { await tx.listingCalendar.deleteMany({ where: { bookingId } }); return tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' } }); }),
};
