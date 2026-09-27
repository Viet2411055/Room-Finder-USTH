const n = (value: unknown) => Number(value);
export function presentPublicReview(review: any) {
  return { id: review.id, listingId: review.listingId, bookingId: review.bookingId, reviewerName: review.reviewerName, reviewerAvatar: review.reviewerAvatar, rating: n(review.rating), comment: review.comment, hostReply: review.hostReply, date: review.reviewDate, createdAt: review.createdAt };
}
export function presentListing(listing: any, detail = false) {
  const images = listing.images?.length
    ? listing.images.map((item: any) => item.imageUrl)
    : [listing.coverImage];
  const base = {
    id: listing.id, listingUrl: listing.listingUrl, name: listing.name, roomType: listing.roomType, city: listing.city, district: listing.district, neighborhood: listing.neighborhood, address: listing.address,
    latitude: n(listing.latitude), longitude: n(listing.longitude), pricePerNight: listing.pricePerNight, priceFormatted: listing.priceFormatted, rating: n(listing.rating), reviewCount: listing.reviewCount,
    isSuperhost: listing.isSuperhost, isGuestFavorite: listing.isGuestFavorite, specs: { guests: listing.guestsMax, bedrooms: listing.bedrooms, beds: listing.beds, baths: n(listing.baths) },
    imageCount: listing.imageCount, coverImage: listing.coverImage, images: detail ? images : images.slice(0, 5), hostId: listing.hostId, cleaningFee: listing.cleaningFee, serviceFeeRate: n(listing.serviceFeeRate), status: listing.status,
  };
  if (!detail) return base;
  return { ...base, description: listing.description, amenities: listing.amenities?.map((item: any) => item.amenityName) ?? [], houseRules: listing.houseRules, cancellationPolicy: { title: listing.cancellationPolicyTitle, description: listing.cancellationPolicyDescription }, host: listing.host && { id: listing.host.id, name: listing.host.name, avatarUrl: listing.host.avatarUrl, about: listing.host.about, isSuperhost: listing.host.isSuperhost, responseRate: listing.host.responseRate, responseTime: listing.host.responseTime, joinedDate: listing.host.joinedDate, phone: listing.host.phone, email: listing.host.email }, reviews: listing.reviews?.map(presentPublicReview) ?? [], bookedDates: listing.calendar?.filter((item: any) => item.isBlocked).map((item: any) => ({ checkIn: item.checkIn, checkOut: item.checkOut })) ?? [] };
}
