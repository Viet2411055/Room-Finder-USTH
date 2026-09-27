import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Eye } from 'lucide-react';
import { api } from '../../services/api';
import type { Listing } from '../../types';

export const EditListingPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [name, setName] = useState('');
  const [pricePerNight, setPricePerNight] = useState(0);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [description, setDescription] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    if (!listingId) return;
    api.hostListing(listingId).then(value => { setListing(value); setName(value.name); setPricePerNight(value.price_per_night); setCleaningFee(value.cleaning_fee); setDescription(value.description); }).catch(() => setListing(null));
  }, [listingId]);

  if (!listing) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold mb-4">Không tìm thấy phòng để chỉnh sửa</h2>
        <Link to="/host/listings" className="text-sm font-semibold text-rausch underline">
          Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateListing(listing.id, {
      name,
      pricePerNight,
      cleaningFee,
      description,
    });
    setIsSaved(true);
    setTimeout(() => {
      navigate('/host/listings');
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/host/listings')}
          className="flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-content-primary"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách phòng</span>
        </button>

        <Link
          to={`/rooms/${listing.id}`}
          className="flex items-center gap-1.5 text-xs font-bold text-content-primary hover:text-rausch transition"
        >
          <Eye className="w-4 h-4" />
          <span>Xem trang công khai</span>
        </Link>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-airbnb-card">
        <h1 className="text-2xl font-black text-content-primary mb-1">Chỉnh sửa thông tin phòng</h1>
        <p className="text-xs text-content-secondary mb-6">
          Mã phòng: <span className="font-mono font-bold text-content-primary">{listing.id}</span>
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-content-primary mb-1">Tên phòng lưu trú</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1">Giá mỗi đêm (VND)</label>
              <input
                type="number"
                step={50000}
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full border border-border rounded-xl p-3 text-sm font-bold text-content-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1">Phí vệ sinh (VND)</label>
              <input
                type="number"
                step={20000}
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Number(e.target.value))}
                className="w-full border border-border rounded-xl p-3 text-sm font-bold text-content-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary mb-1">Mô tả chi tiết</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-border rounded-xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary leading-relaxed"
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-rausch hover:bg-rausch-hover text-white text-xs font-bold flex items-center gap-2 transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Đã lưu thành công!' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
