import { describe, expect, it } from 'vitest';
import { presentListing } from './room.presenter.js';

const listing = {
  id: 'room-1',
  name: 'Room',
  roomType: 'Entire home',
  city: 'Đà Nẵng',
  district: 'Sơn Trà',
  address: 'Đà Nẵng',
  latitude: 16.05,
  longitude: 108.2,
  pricePerNight: 1_000_000,
  priceFormatted: '1.000.000 ₫',
  rating: 4.9,
  reviewCount: 10,
  guestsMax: 6,
  bedrooms: 2,
  beds: 2,
  baths: 2,
  isSuperhost: true,
  isGuestFavorite: true,
  imageCount: 8,
  coverImage: 'cover.jpg',
  images: Array.from({ length: 8 }, (_, index) => ({ imageUrl: `image-${index}.jpg` })),
  hostId: 'host-1',
  cleaningFee: 100_000,
  serviceFeeRate: 0.08,
  status: 'ACTIVE',
};

describe('presentListing', () => {
  it('caps list previews at five images but preserves a detail gallery', () => {
    expect(presentListing(listing).images).toHaveLength(5);
    expect(presentListing(listing, true).images).toHaveLength(8);
  });
});
