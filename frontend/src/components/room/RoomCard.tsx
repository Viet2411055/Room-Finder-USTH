import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Listing } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { optimizeImageUrl } from '../../utils/image';

interface RoomCardProps {
  listing: Listing;
  onHover?: (listingId: string | null) => void;
  isHovered?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ listing, onHover, isHovered }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isSaved, toggle } = useWishlist();

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const isLiked = isSaved(listing.id);

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [listing.cover_image];

  useEffect(() => { setCurrentImgIndex(0); }, [listing.id]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 35) {
      setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    } else if (diff < -35) {
      setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try { await toggle(listing.id); } catch { /* The shared context restores the previous state. */ }
  };

  return (
    <div
      onClick={() => navigate(`/rooms/${listing.id}`)}
      onMouseEnter={() => onHover && onHover(listing.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group cursor-pointer flex flex-col t-card-hover rounded-card transition-all duration-200 ${
        isHovered ? 'ring-2 ring-content-primary ring-offset-2 scale-[1.01]' : ''
      }`}
    >
      {/* 1. Image Slider Container */}
      <div 
        className="relative aspect-[20/19] w-full rounded-2xl overflow-hidden bg-surface-subtle"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        <img
          src={optimizeImageUrl(images[currentImgIndex] ?? listing.cover_image, 720)}
          alt={`${listing.name} ảnh ${currentImgIndex + 1}`}
          className="h-full w-full object-cover select-none"
          loading="lazy"
          decoding="async"
        />

        {/* Guest favorite / Superhost Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {listing.is_guest_favorite && (
            <span className="px-2.5 py-1 rounded-full bg-white/95 text-content-primary text-[11px] font-bold shadow-sm backdrop-blur-sm">
              Được khách yêu thích
            </span>
          )}
          {listing.is_superhost && !listing.is_guest_favorite && (
            <span className="px-2.5 py-1 rounded-full bg-white/95 text-content-primary text-[11px] font-bold shadow-sm backdrop-blur-sm flex items-center gap-1">
              <Award className="w-3 h-3 text-rausch" />
              Chủ nhà siêu cấp
            </span>
          )}
        </div>

        {/* Wishlist Button (transitions.dev like pop) */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isLiked ? 'Bỏ lưu vào danh sách yêu thích' : 'Lưu vào danh sách yêu thích'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-transform z-10 t-like-button ${
            isLiked ? 'liked' : 'hover:scale-110 active:scale-90'
          }`}
        >
          <Heart
            className={`w-6 h-6 transition-colors drop-shadow-md ${
              isLiked ? 'fill-rausch text-rausch' : 'text-white fill-black/30 hover:fill-black/40'
            }`}
          />
        </button>

        {/* Slider Controls (prev / next buttons shown on hover) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ảnh trước"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-content-primary flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md hover:scale-105 active:scale-95 z-10"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ảnh tiếp theo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-content-primary flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md hover:scale-105 active:scale-95 z-10"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Dot Pagination */}
            <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
              {images.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === currentImgIndex
                      ? 'w-4 bg-white shadow-sm'
                      : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Room Information */}
      <div className="pt-3 pb-1 flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-content-primary line-clamp-1 leading-tight group-hover:text-rausch transition-colors">
            {listing.district || listing.city}, Việt Nam
          </h3>
          <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-content-primary">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>{listing.rating.toFixed(2)}</span>
            <span className="text-content-secondary font-normal">({listing.review_count})</span>
          </div>
        </div>

        <p className="text-xs text-content-secondary line-clamp-1">
          {listing.name}
        </p>

        <p className="text-xs text-content-secondary">
          {listing.specs?.beds || 1} giường · {listing.specs?.guests || 2} khách
        </p>

        {/* Pricing */}
        <div className="mt-1.5 text-sm">
          <span className="font-extrabold text-content-primary">
            {listing.price_per_night.toLocaleString('vi-VN')} ₫
          </span>
          <span className="text-xs text-content-secondary font-normal"> / đêm</span>
        </div>
      </div>
    </div>
  );
};
