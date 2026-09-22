import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar as CalendarIcon, Users, Plus, Minus, SlidersHorizontal } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

export const HeroSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { search, setDestination, setDates, setGuests, setIsSearchModalOpen } = useSearch();

  const [activeTab, setActiveTab] = useState<'destination' | 'dates' | 'guests' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [localDest, setLocalDest] = useState(search.destination || '');
  const [localCheckIn, setLocalCheckIn] = useState(search.checkIn || '');
  const [localCheckOut, setLocalCheckOut] = useState(search.checkOut || '');
  const [adults, setAdults] = useState(search.guests.adults || 1);
  const [children, setChildren] = useState(search.guests.children || 0);

  // Sync with search state when it changes externally
  useEffect(() => {
    setLocalDest(search.destination || '');
    setLocalCheckIn(search.checkIn || '');
    setLocalCheckOut(search.checkOut || '');
    setAdults(search.guests.adults || 1);
    setChildren(search.guests.children || 0);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTab(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setDestination(localDest || 'Tất cả');
    setDates(localCheckIn, localCheckOut);
    setGuests({ adults, children, infants: 0 });
    setActiveTab(null);
    const destination = localDest || 'Tất cả';
    navigate(destination === 'Tất cả' ? '/rooms' : `/rooms?dest=${encodeURIComponent(destination)}`);
  };

  const cities = [
    { name: 'Tất cả', desc: 'Khám phá mọi miền Việt Nam' },
    { name: 'Hà Nội', desc: 'Thủ đô ngàn năm văn hiến, phố cổ' },
    { name: 'Đà Nẵng', desc: 'Thành phố biển xinh đẹp, cầu Rồng' },
    { name: 'Hồ Chí Minh', desc: 'Sôi động, sầm uất và hiện đại' },
  ];

  const totalGuests = adults + children;
  const mobileDestLabel = localDest && localDest !== 'Tất cả' ? localDest : 'Bạn muốn đi đâu?';
  const mobileDatesLabel = localCheckIn && localCheckOut ? `${localCheckIn} → ${localCheckOut}` : 'Thời gian bất kỳ';
  const mobileGuestsLabel = totalGuests > 1 ? `${totalGuests} khách` : 'Thêm khách';

  return (
    <div id="hero-search-bar" ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* 1. Mobile Search Bar (md:hidden) */}
      <div className="md:hidden w-full">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full bg-white border border-border rounded-full shadow-airbnb-search hover:shadow-airbnb-card active:scale-[0.99] p-3 flex items-center gap-3 transition-all text-left"
          aria-label="Tìm kiếm phòng trên điện thoại"
        >
          <div className="w-10 h-10 rounded-full bg-rausch text-white flex items-center justify-center shrink-0 shadow-sm">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-content-primary truncate">
              {mobileDestLabel}
            </div>
            <div className="text-xs text-content-secondary truncate flex items-center gap-1.5 mt-0.5">
              <span>{mobileDatesLabel}</span>
              <span className="text-border-hairline">•</span>
              <span>{mobileGuestsLabel}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-content-secondary shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 2. Desktop Search Bar (hidden md:block) */}
      <div className="hidden md:block">
        <div className="bg-white border border-border rounded-full shadow-airbnb-search hover:shadow-airbnb-card transition-all flex items-center divide-x divide-border-hairline p-1.5">
          {/* Destination */}
          <div
            onClick={() => setActiveTab('destination')}
            className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition-colors ${
              activeTab === 'destination' ? 'bg-surface-subtle shadow-sm' : 'hover:bg-surface-subtle/60'
            }`}
          >
            <div className="text-xs font-bold text-content-primary">Địa điểm</div>
            <input
              type="text"
              placeholder="Tìm kiếm điểm đến"
              value={localDest === 'Tất cả' ? '' : localDest}
              onChange={(e) => setLocalDest(e.target.value)}
              className="w-full bg-transparent text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none truncate font-normal"
            />
          </div>

          {/* Dates */}
          <div
            onClick={() => setActiveTab('dates')}
            className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition-colors ${
              activeTab === 'dates' ? 'bg-surface-subtle shadow-sm' : 'hover:bg-surface-subtle/60'
            }`}
          >
            <div className="text-xs font-bold text-content-primary">Thời gian</div>
            <div className="text-sm text-content-primary truncate">
              {localCheckIn && localCheckOut ? (
                <span className="font-medium">{localCheckIn} → {localCheckOut}</span>
              ) : (
                <span className="text-content-tertiary">Thêm ngày</span>
              )}
            </div>
          </div>

          {/* Guests & Search Button */}
          <div
            onClick={() => setActiveTab('guests')}
            className={`flex-1 pl-6 pr-2 py-2 rounded-full cursor-pointer transition-colors flex items-center justify-between ${
              activeTab === 'guests' ? 'bg-surface-subtle shadow-sm' : 'hover:bg-surface-subtle/60'
            }`}
          >
            <div className="truncate pr-2">
              <div className="text-xs font-bold text-content-primary">Khách</div>
              <div className="text-sm text-content-primary truncate">
                {totalGuests > 1 ? (
                  <span className="font-medium">{totalGuests} khách</span>
                ) : (
                  <span className="text-content-tertiary">Thêm khách</span>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              className="h-12 px-6 rounded-full bg-rausch hover:bg-rausch-hover active:bg-rausch-active text-white font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg shrink-0"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span className="text-sm">Tìm kiếm</span>
            </button>
          </div>
        </div>

        {/* Desktop Popovers */}
        {activeTab === 'destination' && (
          <div className="absolute top-full left-0 mt-3 w-96 bg-white rounded-card shadow-airbnb-modal border border-border p-5 z-50 t-modal-content">
            <div className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-3">
              Tìm kiếm theo khu vực
            </div>
            <div className="grid grid-cols-1 gap-2">
              {cities.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setLocalDest(c.name);
                    setActiveTab('dates');
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition text-left hover:bg-surface-subtle ${
                    localDest === c.name ? 'bg-surface-subtle ring-1 ring-content-primary' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-content-primary shrink-0">
                    <MapPin className="w-5 h-5 text-rausch" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-content-primary">{c.name}</div>
                    <div className="text-xs text-content-secondary">{c.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dates' && (
          <div className="absolute top-full left-1/4 mt-3 w-[420px] bg-white rounded-card shadow-airbnb-modal border border-border p-6 z-50 t-modal-content">
            <div className="text-sm font-bold text-content-primary mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-rausch" />
              Chọn ngày lưu trú
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Ngày nhận phòng</label>
                <input
                  type="date"
                  value={localCheckIn}
                  onChange={(e) => setLocalCheckIn(e.target.value)}
                  className="w-full border border-border rounded-lg p-2.5 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-content-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Ngày trả phòng</label>
                <input
                  type="date"
                  value={localCheckOut}
                  min={localCheckIn}
                  onChange={(e) => setLocalCheckOut(e.target.value)}
                  className="w-full border border-border rounded-lg p-2.5 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-content-primary"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('guests')}
                className="text-xs font-bold text-rausch hover:underline"
              >
                Tiếp tục chọn số lượng khách →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'guests' && (
          <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-card shadow-airbnb-modal border border-border p-5 z-50 t-modal-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-content-primary">Người lớn</div>
                  <div className="text-xs text-content-secondary">Từ 13 tuổi trở lên</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => setAdults(adults - 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-content-primary disabled:opacity-30 hover:border-content-primary transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-4 text-center font-semibold text-sm">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-content-primary hover:border-content-primary transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-px bg-border-hairline" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-content-primary">Trẻ em</div>
                  <div className="text-xs text-content-secondary">Độ tuổi 2–12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={children <= 0}
                    onClick={() => setChildren(children - 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-content-primary disabled:opacity-30 hover:border-content-primary transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-4 text-center font-semibold text-sm">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-content-primary hover:border-content-primary transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-border-hairline flex justify-end">
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 bg-content-primary text-white text-xs font-semibold rounded-lg hover:bg-black transition"
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
