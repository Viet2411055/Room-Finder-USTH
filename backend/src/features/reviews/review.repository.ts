import { prisma } from '../../shared/database/prisma.js';
export const reviewRepository = {
  completedBooking: (userId: string, id: string) => prisma.booking.findFirst({ where: { id, userId, status: 'COMPLETED' }, include: { user: true } }),
  create: (booking: any, input: { rating: number; comment: string }) => prisma.$transaction(async tx => {
    if (await tx.review.findUnique({ where: { bookingId: booking.id } })) return null;
    const created = await tx.review.create({ data: { listingId: booking.listingId, bookingId: booking.id, userId: booking.userId, reviewerName: booking.user.name, reviewerAvatar: booking.user.avatarUrl, rating: input.rating, comment: input.comment, reviewDate: new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date()) } });
    const stats = await tx.review.aggregate({ where: { listingId: booking.listingId }, _avg: { rating: true }, _count: true });
    await tx.listing.update({ where: { id: booking.listingId }, data: { rating: stats._avg.rating ?? 0, reviewCount: stats._count } });
    return created;
  }),
  mine: (userId: string) => prisma.review.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { listing: { select: { id: true, name: true, coverImage: true } } } }),
  host: (userId: string) => prisma.host.findUnique({ where: { userId } }),
  hostReviews: async (hostId: string, page: number, limit: number) => { const where = { listing: { hostId } }; const [total, rows] = await prisma.$transaction([prisma.review.count({ where }), prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { listing: { select: { id: true, name: true } } } })]); return { total, rows }; },
  byIdWithOwner: (id: string) => prisma.review.findUnique({ where: { id }, include: { listing: { select: { host: { select: { userId: true } } } } } }),
  reply: (id: string, reply: string) => prisma.review.update({ where: { id }, data: { hostReply: reply, hostReplyDate: new Date() } }),
};
