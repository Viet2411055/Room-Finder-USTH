import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Phone, Mail, User, Calendar, MapPin, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import type { Booking } from '../../types';

export const HostReservationDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  useEffect(() => { if (bookingId) api.hostReservation(bookingId).then(setBooking).catch(() => setBooking(null)); }, [bookingId]);

  if (!booking) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold mb-4">Không tìm thấy lượt đặt phòng</h2>
        <Link to="/host/reservations" className="text-sm font-semibold text-rausch underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/host/reservations')}
          className="flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-content-primary"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách đặt phòng</span>
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
          {booking.status === 'UPCOMING' ? 'Lượt đặt sắp tới' : booking.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
        </span>
      </div>

      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-airbnb-card space-y-6">
        {/* Header */}
        <div className="flex gap-4 pb-6 border-b border-border-hairline">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-subtle shrink-0 border border-border">
            <img src={booking.cover_image} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-rausch uppercase tracking-wider">
              Mã: {booking.booking_code}
            </span>
            <h1 className="text-lg font-bold text-content-primary line-clamp-1 mt-0.5">
              {booking.listing_name}
            </h1>
            <p className="text-xs text-content-secondary mt-0.5">
              {booking.district}, {booking.city}
            </p>
          </div>
        </div>

        {/* Guest Information */}
        <div className="pb-6 border-b border-border-hairline space-y-3">
          <h3 className="font-bold text-sm text-content-primary">Thông tin khách lưu trú</h3>
          <div className="bg-surface-subtle p-4 rounded-xl space-y-2 text-xs text-content-secondary">
            <div className="flex items-center gap-2 text-sm font-bold text-content-primary">
              <User className="w-4 h-4 text-rausch" />
              <span>{booking.guest_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-content-secondary" />
              <span>{booking.guest_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-content-secondary" />
              <span>{booking.guest_email}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border-hairline text-xs">
          <div>
            <span className="text-content-secondary block mb-1 font-semibold">Nhận phòng</span>
            <span className="text-sm font-bold text-content-primary">{booking.check_in} (Sau 14:00)</span>
          </div>
          <div>
            <span className="text-content-secondary block mb-1 font-semibold">Trả phòng</span>
            <span className="text-sm font-bold text-content-primary">{booking.check_out} (Trước 12:00)</span>
          </div>
        </div>

        {/* Payout Details */}
        <div className="space-y-2 text-xs text-content-secondary">
          <h3 className="font-bold text-sm text-content-primary mb-2">Thanh toán</h3>
          <div className="flex justify-between">
            <span>Tiền phòng ({booking.nights} đêm)</span>
            <span>{(booking.price_per_night * booking.nights).toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between">
            <span>Phí dọn dẹp</span>
            <span>{booking.cleaning_fee.toLocaleString('vi-VN')} ₫</span>
          </div>
          <div className="flex justify-between font-bold text-content-primary text-sm pt-2 border-t border-border-hairline">
            <span>Tổng thu từ đơn đặt này</span>
            <span className="text-rausch">{booking.total_price.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
};
