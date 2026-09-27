import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, Mail, AlertTriangle } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Booking, Listing } from '../types';

export const TripDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState('');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    api.trip(bookingId).then(async value => {
      setBooking(value);
      setListing(await api.room(value.listing_id));
    }).catch(value => setError(value instanceof ApiError ? value.message : 'Không thể tải chuyến đi'));
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold mb-4">Không tìm thấy thông tin chuyến đi</h2>
        <Link to="/trips" className="text-sm font-semibold text-rausch underline">
          Quay lại danh sách chuyến đi
        </Link>
      </div>
    );
  }

  const handleCancel = async () => {
    try { setBooking(await api.cancelTrip(booking.id)); setIsCancelModalOpen(false); }
    catch (value) { setError(value instanceof ApiError ? value.message : 'Không thể hủy booking'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-xs font-bold text-content-primary hover:text-rausch transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại tất cả chuyến đi</span>
        </button>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            booking.status === 'UPCOMING'
              ? 'bg-sky-50 text-sky-700'
              : booking.status === 'COMPLETED'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {booking.status === 'UPCOMING'
            ? 'Chuyến đi sắp tới'
            : booking.status === 'COMPLETED'
            ? 'Đã hoàn thành'
            : 'Đã hủy'}
        </span>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Cover Hero */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-surface-subtle">
          <img
            src={booking.cover_image}
            alt={booking.listing_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-rausch bg-white/95 px-2.5 py-0.5 rounded-full inline-block mb-2">
              Mã: {booking.booking_code}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold line-clamp-2 leading-tight">{booking.listing_name}</h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-rausch" />
              {booking.district}, {booking.city}
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Reservation times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-border-hairline">
            <div>
              <span className="text-xs text-content-secondary uppercase font-bold tracking-wider block mb-1">
                Nhận phòng
              </span>
              <div className="font-extrabold text-content-primary text-base">{booking.check_in}</div>
              <div className="text-xs text-content-secondary">Sau 14:00</div>
            </div>

            <div>
              <span className="text-xs text-content-secondary uppercase font-bold tracking-wider block mb-1">
                Trả phòng
              </span>
              <div className="font-extrabold text-content-primary text-base">{booking.check_out}</div>
              <div className="text-xs text-content-secondary">Trước 12:00</div>
            </div>

            <div>
              <span className="text-xs text-content-secondary uppercase font-bold tracking-wider block mb-1">
                Số lượng khách
              </span>
              <div className="font-extrabold text-content-primary text-base">{booking.guests} khách</div>
              <div className="text-xs text-content-secondary">Thời lượng: {booking.nights} đêm</div>
            </div>
          </div>

          {/* Host Info */}
          <div className="pb-6 border-b border-border-hairline space-y-4">
            <h3 className="font-bold text-base text-content-primary">Thông tin chủ nhà</h3>
            <div className="flex items-center justify-between p-4 bg-surface-subtle rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                  <img
                    src={listing?.host?.avatar_url}
                    alt={booking.host_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm text-content-primary">{booking.host_name}</div>
                  <div className="text-xs text-content-secondary">Chủ nhà RoomFinder</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${listing?.host?.phone ?? ''}`}
                  className="p-2.5 rounded-full bg-white border border-border text-content-primary hover:bg-border transition"
                  title="Gọi điện"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${listing?.host?.email ?? ''}`}
                  className="p-2.5 rounded-full bg-white border border-border text-content-primary hover:bg-border transition"
                  title="Gửi email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="pb-6 border-b border-border-hairline space-y-3">
            <h3 className="font-bold text-base text-content-primary">Chi tiết thanh toán</h3>
            <div className="space-y-2 text-xs sm:text-sm text-content-secondary">
              <div className="flex justify-between">
                <span>Giá phòng ({booking.nights} đêm)</span>
                <span>{(booking.price_per_night * booking.nights).toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vệ sinh</span>
                <span>{booking.cleaning_fee.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span>Phí dịch vụ</span>
                <span>{booking.service_fee.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="pt-2 border-t border-border-hairline flex justify-between font-bold text-content-primary text-base">
                <span>Tổng số tiền đã thanh toán</span>
                <span className="text-rausch">{booking.total_price.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="text-[11px] text-content-tertiary">
                Phương thức: {booking.payment_method}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to={`/rooms/${booking.listing_id}`}
              className="px-5 py-2.5 rounded-xl border border-border bg-white text-content-primary font-bold text-xs hover:border-content-primary transition"
            >
              Xem trang phòng lưu trú
            </Link>

            <div className="flex items-center gap-3">
              {booking.status === 'UPCOMING' && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-xs transition"
                >
                  Hủy đặt phòng
                </button>
              )}

              {booking.status === 'COMPLETED' && (
                <Link
                  to={`/trips/${booking.id}/review`}
                  className="px-6 py-2.5 rounded-xl bg-rausch hover:bg-rausch-hover text-white font-bold text-xs transition shadow-md"
                >
                  Viết đánh giá chuyến đi
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm t-modal-backdrop">
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-airbnb-modal border border-border p-6 pb-8 sm:pb-6 t-modal-content max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
            <div className="w-12 h-1 bg-border rounded-full mx-auto -mt-2 mb-4 sm:hidden" />
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-content-primary text-center mb-2">
              Xác nhận hủy đặt phòng?
            </h3>
            <p className="text-xs text-content-secondary text-center mb-6 leading-relaxed">
              Theo chính sách hủy phòng, số tiền đã thanh toán ({booking.total_price.toLocaleString('vi-VN')} ₫) sẽ được hoàn trả theo phương thức thanh toán ban đầu của bạn.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 border border-border rounded-xl text-xs font-bold text-content-primary hover:bg-surface-subtle"
              >
                Giữ lại phòng
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
