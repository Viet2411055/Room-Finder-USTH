import { rateLimit } from 'express-rate-limit';

export const createListingRateLimiter = rateLimit({
  windowMs: 10_000,
  limit: 1,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: request => request.auth!.userId,
  validate: { keyGeneratorIpFallback: false },
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Bạn vừa tạo một phòng. Vui lòng đợi vài giây trước khi tạo phòng tiếp theo.',
    },
  },
});
