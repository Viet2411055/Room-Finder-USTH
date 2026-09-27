import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { RoomCard } from '../components/room/RoomCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Listing } from '../types';

export const WishlistPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [wishlistListings, setWishlistListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (currentUser) {
      api.wishlist().then(setWishlistListings).catch(() => setWishlistListings([]));
    } else {
      setWishlistListings([]);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart className="w-16 h-16 text-rausch mx-auto mb-4 stroke-1" />
        <h1 className="text-2xl font-black text-content-primary mb-2">Đăng nhập để xem danh sách yêu thích</h1>
        <p className="text-sm text-content-secondary mb-6">
          Bạn có thể tạo, xem hoặc chỉnh sửa danh sách yêu thích sau khi đăng nhập.
        </p>
        <Link
          to="/login"
          className="px-6 py-3 bg-rausch hover:bg-rausch-hover text-white rounded-full text-sm font-bold shadow-md transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
            Danh sách yêu thích của bạn
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Đã lưu {wishlistListings.length} địa điểm lưu trú yêu thích
          </p>
        </div>
      </div>

      {wishlistListings.length === 0 ? (
        <div className="text-center py-24 bg-surface-subtle rounded-2xl border border-border p-8">
          <Heart className="w-12 h-12 text-content-secondary mx-auto mb-3 stroke-1" />
          <h3 className="text-lg font-bold text-content-primary mb-1">
            Chưa có căn phòng nào trong danh sách
          </h3>
          <p className="text-xs text-content-secondary mb-6">
            Khi duyệt phòng, hãy nhấn biểu tượng trái tim để lưu lại những nơi bạn yêu thích nhất.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rausch text-white text-xs font-bold shadow-md hover:bg-rausch-hover transition"
          >
            <Search className="w-4 h-4" />
            <span>Bắt đầu khám phá</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistListings.map((listing) => (
            <RoomCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};
