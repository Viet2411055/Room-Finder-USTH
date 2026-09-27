import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, ChevronDown, Plus, Minus, AlertCircle } from 'lucide-react';
import { Listing } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BookingWidgetProps {
  listing: Listing;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ listing }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const guestPickerRef = useRef<HTMLDivElement>(null);

  const bookedDates = listing.booked_dates || [];

  useEffect(() => {
    if (!isGuestPickerOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!guestPickerRef.current?.contains(event.target as Node)) setIsGuestPickerOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsGuestPickerOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isGuestPickerOpen]);

  // Calculate nights
  const calculateNights = (): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const nights = calculateNights();
  const basePrice = (nights > 0 ? nights : 1) * listing.price_per_night;
  const cleaningFee = listing.cleaning_fee || 120000;
  const serviceFee = Math.round(basePrice * (listing.service_fee_rate || 0.08));
  const totalPrice = basePrice + cleaningFee + serviceFee;

  // Check if selected range conflicts with booked dates
  const isRangeBooked = (startStr: string, endStr: string): boolean => {
    if (!startStr || !endStr) return false;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();

    return bookedDates.some((b) => {
      const bStart = new Date(b.check_in).getTime();
      const bEnd = new Date(b.check_out).getTime();
      return (start < bEnd && end > bStart);
    });
  };

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      setErrorMessage('Vui lòng chọn ngày nhận phòng và ngày trả phòng');
      return;
    }
    if (nights <= 0) {
      setErrorMessage('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }
    if (isRangeBooked(checkIn, checkOut)) {
      setErrorMessage('Khoảng thời gian này đã có người đặt, vui lòng chọn ngày khác');
      return;
    }

    setErrorMessage('');
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(adults + children),
    });

    navigate(`/booking/${listing.id}?${params.toString()}`);
  };

  return (
    <div className="sticky top-28 bg-white border border-border rounded-2xl p-6 shadow-airbnb-card">
      {/* Header: Price & Rating */}
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <span className="text-2xl font-extrabold text-content-primary">
            {listing.price_per_night.toLocaleString('vi-VN')} ₫
          </span>
          <span className="text-sm text-content-secondary font-normal"> / đêm</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-content-primary">
          <Star className="w-4 h-4 fill-current text-amber-500" />
          <span>{listing.rating.toFixed(2)}</span>
          <span className="text-content-secondary font-normal">· {listing.review_count} đánh giá</span>
        </div>
      </div>

      {/* Date & Guest Selectors Box */}
      <div className="border border-border rounded-xl mb-4">
        {/* Dates */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border rounded-t-xl overflow-hidden">
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary">
              Nhận phòng
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setErrorMessage('');
              }}
              className="w-full text-xs font-medium text-content-primary bg-transparent focus:outline-none cursor-pointer mt-0.5"
            />
          </div>
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary">
              Trả phòng
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setErrorMessage('');
              }}
              className="w-full text-xs font-medium text-content-primary bg-transparent focus:outline-none cursor-pointer mt-0.5"
            />
          </div>
        </div>

        {/* Guests Dropdown */}
        <div ref={guestPickerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
            className="w-full p-3 text-left flex items-center justify-between hover:bg-surface-subtle/50 transition"
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                Khách
              </div>
              <div className="text-xs font-semibold text-content-primary mt-0.5">
                {adults + children} khách (tối đa {listing.specs.guests})
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-content-secondary" />
          </button>

          {isGuestPickerOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-xl shadow-airbnb-modal p-4 z-50 mt-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Người lớn</div>
                  <div className="text-[11px] text-content-secondary">Từ 13 tuổi trở lên</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults(adults - 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold">{adults}</span>
                  <button
                    type="button"
                    disabled={adults + children >= listing.specs.guests}
                    onClick={() => setAdults(adults + 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Trẻ em</div>
                  <div className="text-[11px] text-content-secondary">2–12 tuổi</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren(children - 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold">{children}</span>
                  <button
                    type="button"
                    disabled={adults + children >= listing.specs.guests}
                    onClick={() => setChildren(children + 1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGuestPickerOpen(false)}
                className="w-full py-1.5 bg-surface-subtle text-content-primary rounded-lg text-xs font-semibold hover:bg-border transition text-center"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Booked dates indicator */}
      {bookedDates.length > 0 && (
        <div className="mb-4 text-xs text-content-secondary bg-surface-subtle p-2.5 rounded-xl">
          <span className="font-semibold text-content-primary">Lưu ý:</span> Phòng này đã có lịch bận trong các ngày:{' '}
          {bookedDates.map(b => `${b.check_in.split('-').slice(1).join('/')} - ${b.check_out.split('-').slice(1).join('/')}`).join(', ')}.
        </div>
      )}

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleReserve}
        className="w-full py-3.5 rounded-xl bg-rausch hover:bg-rausch-hover active:bg-rausch-active text-white font-bold text-base transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
      >
        Đặt phòng
      </button>

      <div className="text-center text-xs text-content-secondary mt-3">
        Bạn vẫn chưa bị trừ tiền
      </div>

      {/* Pricing Breakdown */}
      <div className="mt-5 pt-4 border-t border-border-hairline space-y-2.5 text-sm text-content-secondary">
        <div className="flex justify-between">
          <span className="underline">
            {listing.price_per_night.toLocaleString('vi-VN')} ₫ x {nights > 0 ? nights : 1} đêm
          </span>
          <span>{basePrice.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex justify-between">
          <span className="underline">Phí vệ sinh</span>
          <span>{cleaningFee.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex justify-between">
          <span className="underline">Phí dịch vụ RoomFinder</span>
          <span>{serviceFee.toLocaleString('vi-VN')} ₫</span>
        </div>

        <div className="pt-3 border-t border-border flex justify-between font-extrabold text-content-primary text-base">
          <span>Tổng trước thuế</span>
          <span>{totalPrice.toLocaleString('vi-VN')} ₫</span>
        </div>
      </div>
    </div>
  );
};
