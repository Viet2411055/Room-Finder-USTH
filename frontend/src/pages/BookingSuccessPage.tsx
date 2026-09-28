import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Calendar, MapPin, Compass, Home } from 'lucide-react';
import { api } from '../services/api';
import type { Booking } from '../types';

export const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  useEffect(() => {
    if (bookingId) api.trip(bookingId).then(setBooking).catch(() => setBooking(null));
  }, [bookingId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* 1. Celebration Icon with transitions.dev stroke check */}
      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 t-success-check shadow-lg">
        <svg className="w-10 h-10 stroke-current fill-none stroke-[3]" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-3">
        Thanh toán & Xác nhận thành công
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight mb-3">
        Chúc mừng bạn đã đặt phòng thành công!
      </h1>

      <p className="text-sm text-content-secondary max-w-md mx-auto mb-8">
        Chuyến đi của bạn đã được ghi nhận vào hệ thống. Chủ nhà sẽ sớm chuẩn bị không gian chu đáo để đón tiếp bạn.
      </p>

      <div className="max-w-md mx-auto mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
        Email xác nhận đang được gửi đến địa chỉ bạn đã cung cấp khi đặt phòng.
      </div>

      {/* Booking Summary Card */}
      {booking && (
        <div className="bg-white border border-border rounded-2xl p-6 text-left shadow-airbnb-card mb-8">
          <div className="flex gap-4 pb-4 border-b border-border-hairline">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-subtle shrink-0">
              <img
                src={booking.cover_image}
                alt={booking.listing_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-rausch uppercase tracking-wider">
                Mã đặt phòng: {booking.booking_code}
              </span>
              <h3 className="font-bold text-base text-content-primary line-clamp-1 mt-0.5">
                {booking.listing_name}
              </h3>
              <p className="text-xs text-content-secondary flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-rausch" />
                {booking.district}, {booking.city}
              </p>
            </div>
          </div>

          <div className="py-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-content-secondary block mb-0.5">Nhận phòng</span>
              <span className="font-bold text-content-primary text-sm">{booking.check_in} (Từ 14:00)</span>
            </div>
            <div>
              <span className="text-content-secondary block mb-0.5">Trả phòng</span>
              <span className="font-bold text-content-primary text-sm">{booking.check_out} (Trước 12:00)</span>
            </div>
            <div>
              <span className="text-content-secondary block mb-0.5">Số khách</span>
              <span className="font-bold text-content-primary text-sm">{booking.guests} khách</span>
            </div>
            <div>
              <span className="text-content-secondary block mb-0.5">Tổng tiền đã thanh toán</span>
              <span className="font-bold text-rausch text-sm">{booking.total_price.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {booking && (
          <Link
            to={`/trips/${booking.id}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-rausch hover:bg-rausch-hover text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-md"
          >
            <Compass className="w-4 h-4" />
            <span>Xem chi tiết chuyến đi</span>
          </Link>
        )}
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-border bg-white hover:bg-surface-subtle text-content-primary text-sm font-bold flex items-center justify-center gap-2 transition"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
};
