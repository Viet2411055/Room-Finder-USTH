import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Calendar, MapPin, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';

export const TripsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  useEffect(() => {
    if (currentUser) api.trips().then(setAllBookings).catch(() => setAllBookings([]));
    else setAllBookings([]);
  }, [currentUser]);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => b.status === activeTab);
  }, [allBookings, activeTab]);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Compass className="w-16 h-16 text-rausch mx-auto mb-4 stroke-1" />
        <h1 className="text-2xl font-black text-content-primary mb-2">Chưa đăng nhập</h1>
        <p className="text-sm text-content-secondary mb-6">
          Vui lòng đăng nhập để xem thông tin các chuyến đi và phòng bạn đã đặt.
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Chuyến đi của bạn
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary mt-1">
          Theo dõi trạng thái đặt phòng, hướng dẫn nhận phòng và lịch sử kỳ nghỉ
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-hairline mb-8 overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === 'UPCOMING'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Sắp tới ({allBookings.filter((b) => b.status === 'UPCOMING').length})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === 'COMPLETED'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Đã hoàn thành ({allBookings.filter((b) => b.status === 'COMPLETED').length})
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === 'CANCELLED'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Đã hủy ({allBookings.filter((b) => b.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Trips list */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-surface-subtle rounded-2xl border border-border p-8">
          <Calendar className="w-12 h-12 text-content-secondary mx-auto mb-3 stroke-1" />
          <h3 className="text-lg font-bold text-content-primary mb-1">
            Không có chuyến đi nào trong mục này
          </h3>
          <p className="text-xs text-content-secondary mb-6">
            Đã đến lúc phủi bụi hành lý và bắt đầu lên kế hoạch cho kỳ nghỉ tiếp theo của bạn rồi!
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rausch text-white text-xs font-bold shadow-md hover:bg-rausch-hover transition"
          >
            <span>Bắt đầu tìm phòng</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-airbnb-card transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-subtle shrink-0">
                  <img
                    src={b.cover_image}
                    alt={b.listing_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-rausch uppercase tracking-wider">
                      {b.booking_code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'UPCOMING'
                          ? 'bg-sky-50 text-sky-700'
                          : b.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {b.status === 'UPCOMING' ? 'Sắp diễn ra' : b.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-content-primary line-clamp-1">
                    {b.listing_name}
                  </h3>

                  <p className="text-xs text-content-secondary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rausch" />
                    {b.district}, {b.city}
                  </p>

                  <div className="text-xs font-semibold text-content-primary pt-1">
                    {b.check_in} — {b.check_out} ({b.nights} đêm) · {b.total_price.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border-hairline">
                <Link
                  to={`/trips/${b.id}`}
                  className="px-5 py-2.5 rounded-xl bg-surface-subtle hover:bg-surface-container text-content-primary font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {b.status === 'COMPLETED' && (
                  <Link
                    to={`/trips/${b.id}/review`}
                    className="text-xs font-bold text-rausch hover:underline"
                  >
                    Viết đánh giá ★
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
