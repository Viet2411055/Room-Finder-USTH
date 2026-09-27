import { z } from 'zod';
const date = z.string().date();
export const hostProfileDto = z.object({ name: z.string().min(2).max(150).optional(), phone: z.string().max(50).nullable().optional(), avatarUrl: z.string().url().nullable().optional(), about: z.string().max(5000).nullable().optional(), responseTime: z.string().max(50).optional() });
export const listingDto = z.object({
  name: z.string().min(3).max(255), roomType: z.string().min(2).max(100), city: z.string().min(2).max(100), district: z.string().min(2).max(100), neighborhood: z.string().max(100).optional(), address: z.string().min(3).max(500), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
  pricePerNight: z.number().int().positive(), cleaningFee: z.number().int().min(0).default(120000), serviceFeeRate: z.number().min(0).max(1).default(0.08), guestsMax: z.number().int().min(1).max(100), bedrooms: z.number().int().min(0), beds: z.number().int().min(0), baths: z.number().min(0),
  description: z.string().min(20), amenities: z.array(z.string().min(1)).default([]), images: z.array(z.string().url()).min(1), houseRules: z.array(z.string().min(1)).default([]), cancellationPolicyTitle: z.string().min(3).max(150), cancellationPolicyDescription: z.string().min(3), status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).default('DRAFT'),
});
export const listingUpdateDto = listingDto.partial().refine(value => Object.keys(value).length > 0, { message: 'Cần ít nhất một trường để cập nhật' });
export const listingStatusDto = z.object({ status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']) });
export const calendarDto = z.object({ checkIn: date, checkOut: date, isBlocked: z.boolean().default(true), priceOverride: z.number().int().positive().optional(), note: z.string().max(255).optional() }).refine(value => value.checkIn < value.checkOut, { message: 'checkOut phải sau checkIn' });
export type ListingInput = z.infer<typeof listingDto>;
export type ListingUpdateInput = z.infer<typeof listingUpdateDto>;
export type CalendarInput = z.infer<typeof calendarDto>;
