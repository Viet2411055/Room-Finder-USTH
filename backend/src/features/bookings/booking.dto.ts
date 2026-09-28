import { z } from 'zod';
const date = z.string().date();
export const bookingDto = z.object({
  listingId: z.string().min(1), checkIn: date, checkOut: date, guests: z.number().int().min(1),
  guestName: z.string().min(2).max(150), guestEmail: z.string().email(), guestPhone: z.string().min(8).max(50),
  paymentMethod: z.string().min(2).max(100), specialRequests: z.string().max(3000).optional(),
}).refine(value => value.checkIn < value.checkOut, { message: 'checkOut phải sau checkIn', path: ['checkOut'] });
export const bookingQuoteDto = z.object({ listingId: z.string().min(1), checkIn: date, checkOut: date, guests: z.number().int().min(1) }).refine(value => value.checkIn < value.checkOut, { message: 'checkOut phải sau checkIn', path: ['checkOut'] });
export const bookingEmailPayloadDto = z.object({
  type: z.literal('BOOKING_CONFIRMATION'), bookingCode: z.string(), listingName: z.string(), city: z.string(), district: z.string(),
  checkIn: date, checkOut: date, guests: z.number().int().positive(), totalPrice: z.number().int().nonnegative(),
});
export type BookingInput = z.infer<typeof bookingDto>;
export type BookingQuoteInput = z.infer<typeof bookingQuoteDto>;
