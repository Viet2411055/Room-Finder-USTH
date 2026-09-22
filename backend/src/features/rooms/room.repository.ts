import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';

const detailInclude = { host: true, images: { orderBy: { displayOrder: 'asc' as const } }, amenities: true, reviews: { orderBy: { createdAt: 'desc' as const }, take: 20 }, calendar: { where: { isBlocked: true }, orderBy: { checkIn: 'asc' as const } } };
export const roomRepository = {
  list: async (where: Prisma.ListingWhereInput, orderBy: Prisma.ListingOrderByWithRelationInput, page: number, limit: number) => {
    const [total, rows] = await prisma.$transaction([
      prisma.listing.count({ where }),
      prisma.listing.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { images: { orderBy: { displayOrder: 'asc' }, take: 5 } } }),
    ]);
    return { total, rows };
  },
  findActiveById: (id: string) => prisma.listing.findFirst({ where: { id, status: 'ACTIVE' }, include: detailInclude }),
  availability: (id: string) => prisma.listing.findUnique({ where: { id }, select: { id: true, calendar: { where: { isBlocked: true }, orderBy: { checkIn: 'asc' } } } }),
  reviews: async (id: string, page: number, limit: number) => {
    const where = { listingId: id };
    const [total, rows] = await prisma.$transaction([prisma.review.count({ where }), prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit })]);
    return { total, rows };
  },
};
