import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Share2,
  Heart,
  Award,
  MapPin,
  CheckCircle,
  Wifi,
  Tv,
  Wind,
  CookingPot,
  Car,
  Key,
  Calendar as CalendarIcon,
  ShieldCheck,
  ChevronRight,
  Flame,
  Shirt,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import type { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { BentoGallery } from '../components/room/BentoGallery';
import { BookingWidget } from '../components/room/BookingWidget';
import { HostCard } from '../components/room/HostCard';
import { ReviewsSection } from '../components/room/ReviewsSection';
import { GoogleMapEmbed } from '../components/map/GoogleMapEmbed';
import { RoomCard } from '../components/room/RoomCard';

export const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isSaved, toggle } = useWishlist();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    setLoading(true);
    api.room(roomId).then(async room => {
      if (!active) return;
      setListing(room);
      const related = await api.rooms({ destination: room.city, limit: 5, sort: 'rating_desc' });
      if (active) setSimilarListings(related.data.filter(item => item.id !== room.id).slice(0, 4));
    }).catch(() => { if (active) setListing(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [roomId]);

  if (loading) return <div className="py-24 text-center text-sm text-content-secondary">Đang tải thông tin phòng…</div>;

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-content-primary mb-2">Không tìm thấy phòng</h2>
        <p className="text-sm text-content-secondary mb-6">Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link
          to="/rooms"
          className="px-6 py-2.5 bg-content-primary text-white rounded-full text-xs font-bold hover:bg-black transition"
        >
          Khám phá các phòng khác
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleWishlistToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try { await toggle(listing.id); } catch { /* The shared context restores the previous state. */ }
  };

  const isLiked = isSaved(listing.id);

  const amenityIcons: Record<string, any> = {
    'Wi-fi': Wifi,
    'TV': Tv,
    'Điều hòa nhiệt độ': Wind,
    'Nhà bếp': CookingPot,
    'Chỗ đỗ xe miễn phí trong khuôn viên': Car,
    'Tự nhận phòng': Key,
    'Máy giặt': Shirt,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-content-primary tracking-tight">
            {listing.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-content-primary mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-amber-500" />
              <span>{listing.rating.toFixed(2)}</span>
              <span className="text-content-secondary font-normal underline">
                ({listing.review_count} đánh giá)
              </span>
            </div>
            <span>·</span>
            {listing.is_superhost && (
              <>
                <span className="flex items-center gap-1 text-rausch">
                  <Award className="w-3.5 h-3.5" />
                  Chủ nhà siêu cấp
                </span>
                <span>·</span>
              </>
            )}
            <span className="underline text-content-secondary font-normal flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {listing.address || `${listing.district}, ${listing.city}`}
            </span>
          </div>
        </div>

        {/* Share & Save Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-subtle text-xs font-semibold text-content-primary transition border border-border"
          >
            <Share2 className="w-4 h-4" />
            <span>{isCopied ? 'Đã sao chép link!' : 'Chia sẻ'}</span>
          </button>

          <button
            onClick={handleWishlistToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-border t-like-button ${
              isLiked ? 'bg-red-50 text-rausch border-red-200 liked' : 'hover:bg-surface-subtle text-content-primary'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rausch text-rausch' : ''}`} />
            <span>{isLiked ? 'Đã lưu' : 'Lưu'}</span>
          </button>
        </div>
      </div>

      {/* 2. BentoGrid Photo Gallery (Horizontal Scroll layout matching concept) */}
      <div className="mb-10">
        <BentoGallery images={listing.images} roomName={listing.name} />
      </div>

      {/* 3. Main Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Specs, Description, Amenities, Host, Reviews, Map */}
        <div className="lg:col-span-8 space-y-10">
          {/* Room Specs & Host Avatar Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border-hairline">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-content-primary">
                {listing.room_type} · Chủ nhà {listing.host.name}
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary mt-1">
                {listing.specs.guests} khách lưu trú · {listing.specs.bedrooms} phòng ngủ · {listing.specs.beds} giường · {listing.specs.baths} phòng tắm
              </p>
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden border border-border shadow-sm shrink-0">
              {listing.host.avatar_url ? <img src={listing.host.avatar_url} alt={listing.host.name} className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center bg-rausch/10 text-rausch font-bold">{listing.host.name.slice(0, 1)}</span>}
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4 pb-6 border-b border-border-hairline">
            {listing.is_superhost && (
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-rausch shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-content-primary">Chủ nhà siêu cấp</h4>
                  <p className="text-xs text-content-secondary mt-0.5">
                    {listing.host.name} là chủ nhà có kinh nghiệm, nhận được điểm đánh giá cao và cam kết mang lại kỳ nghỉ tuyệt vời cho khách.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <Key className="w-6 h-6 text-content-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-content-primary">Trải nghiệm nhận phòng thuận tiện</h4>
                <p className="text-xs text-content-secondary mt-0.5">
                  100% khách gần đây đã đánh giá 5 sao cho quy trình tự nhận phòng bằng mã khóa thông minh.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-content-primary">Không gian sạch sẽ & thoáng đãng</h4>
                <p className="text-xs text-content-secondary mt-0.5">
                  Phòng được dọn dẹp kỹ lưỡng theo quy trình vệ sinh tiêu chuẩn cao cấp trước mỗi lượt đón khách.
                </p>
              </div>
            </div>
          </div>

          {/* Long Description */}
          <div className="pb-6 border-b border-border-hairline space-y-4">
            <h3 className="text-lg font-bold text-content-primary">Giới thiệu về chỗ ở này</h3>
            <div className="text-sm text-content-secondary leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="pb-6 border-b border-border-hairline space-y-4">
            <h3 className="text-lg font-bold text-content-primary">Nơi này có những gì cho bạn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listing.amenities.map((amenity, idx) => {
                const Icon = amenityIcons[amenity] || CheckCircle;
                return (
                  <div key={idx} className="flex items-center gap-3 text-sm text-content-primary">
                    <Icon className="w-5 h-5 text-content-secondary shrink-0" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* House Rules & Policies */}
          <div className="pb-6 border-b border-border-hairline space-y-3">
            <h3 className="text-lg font-bold text-content-primary">Quy định và Chính sách</h3>
            <div className="bg-surface-subtle p-4 rounded-xl space-y-2 text-xs text-content-secondary">
              <div className="font-bold text-content-primary text-sm mb-1">
                {listing.cancellation_policy.title}
              </div>
              <p>{listing.cancellation_policy.description}</p>
              <div className="pt-2 border-t border-border-hairline mt-2 space-y-1">
                <span className="font-semibold text-content-primary block">Nội quy nhà:</span>
                {listing.house_rules.map((rule, idx) => (
                  <li key={idx} className="list-disc ml-4">{rule}</li>
                ))}
              </div>
            </div>
          </div>

          {/* Host Profile Card */}
          <HostCard host={listing.host} />

          {/* Reviews Section */}
          <ReviewsSection
            reviews={listing.reviews}
            rating={listing.rating}
            reviewCount={listing.review_count}
          />

          {/* Location & Embedded Map */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-content-primary">Vị trí nơi lưu trú</h3>
            <p className="text-xs text-content-secondary">
              {listing.address || `${listing.district}, ${listing.city}, Việt Nam`}
            </p>
            <div className="h-80 w-full rounded-2xl overflow-hidden border border-border">
              <GoogleMapEmbed singleListing={listing} />
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Reservation Box */}
        <div className="lg:col-span-4">
          <BookingWidget listing={listing} />
        </div>
      </div>

      {/* 4. Similar listings section */}
      {similarListings.length > 0 && (
        <section className="mt-20 pt-10 border-t border-border-hairline">
          <h2 className="text-xl sm:text-2xl font-extrabold text-content-primary mb-6">
            Nơi lưu trú tương tự tại {listing.city}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarListings.map((sim) => (
              <RoomCard key={sim.id} listing={sim} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
