import { z } from 'zod';

const date = z.string().date();
export const roomQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
  destination: z.string().trim().max(100).optional(), checkIn: date.optional(), checkOut: date.optional(),
  adults: z.coerce.number().int().min(0).default(0), children: z.coerce.number().int().min(0).default(0),
  minPrice: z.coerce.number().int().min(0).optional(), maxPrice: z.coerce.number().int().min(0).optional(),
  roomTypes: z.string().optional(), amenities: z.string().optional(), minRating: z.coerce.number().min(0).max(5).optional(),
  superhostOnly: z.coerce.boolean().optional(), bedrooms: z.coerce.number().int().min(0).optional(), beds: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest']).default('newest'),
}).superRefine((value, ctx) => {
  if ((value.checkIn && !value.checkOut) || (!value.checkIn && value.checkOut) || (value.checkIn && value.checkOut && value.checkIn >= value.checkOut)) ctx.addIssue({ code: 'custom', message: 'checkOut phải sau checkIn' });
});
export type RoomQuery = z.infer<typeof roomQueryDto>;
