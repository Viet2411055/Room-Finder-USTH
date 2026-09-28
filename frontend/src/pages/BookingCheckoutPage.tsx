import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star, ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2 } from 'lucide-react';
import { api, ApiError } from '../services/api';
import type { Listing } from '../types';
import { useAuth } from '../context/AuthContext';

export const BookingCheckoutPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  useEffect(() => { if (roomId) api.room(roomId).then(setListing).catch(() => setListing(null)); }, [roomId]);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guestsCount = Number(searchParams.get('guests')) || 1;

  // Contact form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'momo' | 'vnpay' | 'bank'>('credit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (currentUser) { setGuestName(currentUser.name); setGuestEmail(currentUser.email); setGuestPhone(currentUser.phone); }
  }, [currentUser]);

  // Nights calculation
  const nights = useMemo(() => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = end - start;
    const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return d > 0 ? d : 0;
  }, [checkIn, checkOut]);

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold mb-4">Không tìm thấy thông tin phòng cần đặt</h2>
        <Link to="/rooms" className="text-sm font-semibold text-rausch underline">
          Quay lại danh sách phòng
        </Link>
      </div>
    );
  }

  const basePrice = listing.price_per_night * nights;
  const cleaningFee = listing.cleaning_fee || 120000;
  const serviceFee = Math.round(basePrice * (listing.service_fee_rate || 0.08));
  const totalPrice = basePrice + cleaningFee + serviceFee;

  const handleConfirmBooking = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (!checkIn || !checkOut || nights < 1) { setError('Vui lòng chọn ngày nhận và trả phòng hợp lệ.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const booking = await api.createBooking({
      listingId: listing.id,
      checkIn,
      checkOut,
      guests: guestsCount,
      guestName,
      guestEmail,
      guestPhone,
      paymentMethod:
        paymentMethod === 'credit'
          ? 'Thẻ tín dụng / Ghi nợ'
          : paymentMethod === 'momo'
          ? 'Ví điện tử MoMo'
          : paymentMethod === 'vnpay'
          ? 'Cổng VNPay-QR'
          : 'Chuyển khoản VietQR',
      });
      setIsSubmitting(false);
      navigate(`/booking/success/${booking.id}`);
    } catch (value) {
      setIsSubmitting(false);
      setError(value instanceof ApiError ? value.message : 'Không thể tạo booking');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top back title */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-subtle transition border border-border"
        >
          <ChevronLeft className="w-5 h-5 text-content-primary" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Xác nhận và thanh toán
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {error && <div className="lg:col-span-12 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
        {/* Left Column: Form & Trip details */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Trip details review */}
          <div className="pb-6 border-b border-border-hairline space-y-4">
            <h2 className="text-lg font-bold text-content-primary">Chuyến đi của bạn</h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-content-primary">Ngày lưu trú</div>
                <div className="text-xs text-content-secondary mt-0.5">
                  {checkIn} đến {checkOut} ({nights} đêm)
                </div>
              </div>
              <button
                onClick={() => navigate(`/rooms/${listing.id}`)}
                className="text-xs font-bold underline text-content-primary hover:text-rausch"
              >
                Chỉnh sửa
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-content-primary">Số lượng khách</div>
                <div className="text-xs text-content-secondary mt-0.5">{guestsCount} khách</div>
              </div>
              <button
                onClick={() => navigate(`/rooms/${listing.id}`)}
                className="text-xs font-bold underline text-content-primary hover:text-rausch"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>

          {/* 2. Guest Information */}
          <div className="pb-6 border-b border-border-hairline space-y-4">
            <h2 className="text-lg font-bold text-content-primary">Thông tin khách nhận phòng</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">Email</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="pb-6 border-b border-border-hairline space-y-4">
            <h2 className="text-lg font-bold text-content-primary">Phương thức thanh toán</h2>
            <div className="space-y-2.5">
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'credit'
                    ? 'border-rausch bg-rausch/5 text-content-primary font-semibold'
                    : 'border-border text-content-secondary hover:border-content-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-rausch" />
                  <span className="text-sm">Thẻ tín dụng hoặc ghi nợ (Visa, Mastercard, JCB)</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'credit'}
                  onChange={() => setPaymentMethod('credit')}
                  className="accent-rausch w-4 h-4"
                />
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'momo'
                    ? 'border-rausch bg-rausch/5 text-content-primary font-semibold'
                    : 'border-border text-content-secondary hover:border-content-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-pink-600" />
                  <span className="text-sm">Ví MoMo (Thanh toán tức thì)</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'momo'}
                  onChange={() => setPaymentMethod('momo')}
                  className="accent-rausch w-4 h-4"
                />
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'vnpay'
                    ? 'border-rausch bg-rausch/5 text-content-primary font-semibold'
                    : 'border-border text-content-secondary hover:border-content-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">VNPAY-QR (Ứng dụng ngân hàng)</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                  className="accent-rausch w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* 4. Cancellation Policy & Terms */}
          <div className="space-y-3 text-xs text-content-secondary">
            <h3 className="font-bold text-content-primary text-sm">Chính sách hủy phòng</h3>
            <p>{listing.cancellation_policy.description}</p>
            <p>
              Bằng việc chọn nút bên dưới, bạn đồng ý với Nội quy nhà của Chủ nhà và Quy định dịch vụ của RoomFinder.
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-rausch hover:bg-rausch-hover active:bg-rausch-active text-white font-extrabold text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý đặt phòng...' : 'Xác nhận và đặt phòng ngay'}
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Summary Card */}
        <div className="lg:col-span-5 sticky top-28 bg-white border border-border rounded-2xl p-6 shadow-airbnb-card">
          <div className="flex gap-4 pb-6 border-b border-border-hairline">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-subtle shrink-0">
              <img
                src={listing.cover_image}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-content-secondary uppercase font-bold tracking-wider">
                  {listing.room_type}
                </span>
                <h3 className="text-sm font-bold text-content-primary line-clamp-2 mt-0.5">
                  {listing.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-content-primary">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="text-content-secondary font-normal">({listing.review_count} đánh giá)</span>
              </div>
            </div>
          </div>

          {/* Price details breakdown */}
          <div className="py-6 border-b border-border-hairline space-y-3 text-sm text-content-secondary">
            <h4 className="font-bold text-content-primary text-base mb-2">Chi tiết giá</h4>
            <div className="flex justify-between">
              <span>{listing.price_per_night.toLocaleString('vi-VN')} ₫ x {nights} đêm</span>
              <span className="font-medium text-content-primary">{basePrice.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vệ sinh</span>
              <span className="font-medium text-content-primary">{cleaningFee.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>Phí dịch vụ RoomFinder</span>
              <span className="font-medium text-content-primary">{serviceFee.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-5 flex items-center justify-between font-black text-content-primary text-lg">
            <span>Tổng cộng (VND)</span>
            <span className="text-rausch">{totalPrice.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>
    </div>
  );
};
