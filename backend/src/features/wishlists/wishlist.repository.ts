import { prisma } from '../../shared/database/prisma.js';
export const wishlistRepository = {
  list: (userId: string) => prisma.wishlist.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { listing: { include: { images: { orderBy: { displayOrder: 'asc' }, take: 5 } } } } }),
  count: (userId: string, listingId: string) => prisma.wishlist.count({ where: { userId, listingId } }),
  add: (userId: string, listingId: string) => prisma.wishlist.upsert({ where: { userId_listingId: { userId, listingId } }, create: { userId, listingId }, update: {} }),
  remove: (userId: string, listingId: string) => prisma.wishlist.deleteMany({ where: { userId, listingId } }),
};
