import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, MapPin, Calendar, Users, Plus, Minus } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

export const SearchModal: React.FC = () => {
  const navigate = useNavigate();
  const { search, setDestination, setDates, setGuests, isSearchModalOpen, setIsSearchModalOpen } = useSearch();

  const [dest, setDest] = useState(search.destination || 'Tất cả');
  const [checkIn, setCheckIn] = useState(search.checkIn || '');
  const [checkOut, setCheckOut] = useState(search.checkOut || '');
  const [adults, setAdults] = useState(search.guests.adults || 1);
  const [children, setChildren] = useState(search.guests.children || 0);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isSearchModalOpen) {
      setDest(search.destination || 'Tất cả');
      setCheckIn(search.checkIn || '');
      setCheckOut(search.checkOut || '');
      setAdults(search.guests.adults || 1);
      setChildren(search.guests.children || 0);
    }
  }, [isSearchModalOpen, search]);

  if (!isSearchModalOpen) return null;

  const handleSearch = () => {
    setDestination(dest || 'Tất cả');
    setDates(checkIn, checkOut);
    setGuests({ adults, children, infants: 0 });
    setIsSearchModalOpen(false);
    navigate(`/rooms?dest=${encodeURIComponent(dest || 'Tất cả')}`);
  };

  const cities = ['Tất cả', 'Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm t-modal-backdrop">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-card shadow-airbnb-modal border border-border flex flex-col t-modal-content overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-border rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-border-hairline shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-content-primary">Tìm kiếm nơi lưu trú</h2>
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle transition text-content-secondary hover:text-content-primary"
            aria-label="Đóng tìm kiếm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-5">
          {/* Destination */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rausch" />
              Điểm đến
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDest(c)}
                  className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition text-center ${
                    dest === c
                      ? 'border-content-primary bg-surface-subtle text-content-primary ring-1 ring-content-primary'
                      : 'border-border text-content-secondary hover:border-content-primary hover:text-content-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border-hairline" />

          {/* Dates */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rausch" />
              Thời gian lưu trú
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-medium text-content-secondary mb-1 block">Ngày nhận phòng</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border border-border rounded-xl p-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-content-primary bg-white"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-content-secondary mb-1 block">Ngày trả phòng</span>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-border rounded-xl p-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-content-primary bg-white"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-border-hairline" />

          {/* Guests */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rausch" />
              Số lượng khách
            </label>
            <div className="space-y-3">
              {/* Adults */}
              <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-content-primary">Người lớn</div>
                  <div className="text-[11px] text-content-secondary">Từ 13 tuổi trở lên</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults(adults - 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-content-primary transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-bold text-sm">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-content-primary transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-content-primary">Trẻ em</div>
                  <div className="text-[11px] text-content-secondary">Độ tuổi 2–12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren(children - 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-content-primary transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-bold text-sm">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-content-primary transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 pb-8 sm:pb-4 border-t border-border-hairline bg-surface-subtle/50 shrink-0">
          <button
            type="button"
            onClick={() => {
              setDest('Tất cả');
              setCheckIn('');
              setCheckOut('');
              setAdults(1);
              setChildren(0);
            }}
            className="text-xs sm:text-sm font-semibold underline text-content-secondary hover:text-content-primary"
          >
            Xóa tất cả
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="px-6 py-2.5 sm:py-3 rounded-full bg-rausch hover:bg-rausch-hover active:bg-rausch-active text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md shrink-0"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
};
