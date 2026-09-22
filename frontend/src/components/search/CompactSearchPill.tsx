import React from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

interface CompactSearchPillProps {
  onClick: () => void;
  className?: string;
}

export const CompactSearchPill: React.FC<CompactSearchPillProps> = ({ onClick, className = '' }) => {
  const { search } = useSearch();

  const totalGuests = (search.guests.adults || 0) + (search.guests.children || 0);
  const locationLabel = search.destination && search.destination !== 'Tất cả' ? search.destination : 'Địa điểm bất kỳ';
  const datesLabel = search.checkIn && search.checkOut 
    ? `${search.checkIn.split('-').slice(1).join('/')} - ${search.checkOut.split('-').slice(1).join('/')}` 
    : 'Thời gian bất kỳ';
  const guestsLabel = totalGuests > 1 ? `${totalGuests} khách` : 'Thêm khách';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center border border-border rounded-pill shadow-airbnb-search hover:shadow-airbnb-search-hover active:scale-[0.98] transition-all bg-white font-medium max-w-full ${className}`}
      aria-label="Tìm kiếm phòng"
    >
      {/* 1. Mobile Pill (< sm): Compact 2-line layout */}
      <div className="flex sm:hidden items-center gap-2 px-3 py-1.5 min-w-0">
        <div className="w-6 h-6 rounded-full bg-rausch/10 text-rausch flex items-center justify-center shrink-0">
          <Search className="w-3 h-3 stroke-[2.5]" />
        </div>
        <div className="flex flex-col text-left min-w-0 leading-tight">
          <span className="font-bold text-xs text-content-primary truncate max-w-[100px] xs:max-w-[120px]">
            {locationLabel}
          </span>
          <span className="text-[10px] text-content-secondary truncate max-w-[100px] xs:max-w-[120px]">
            {datesLabel} • {guestsLabel}
          </span>
        </div>
      </div>

      {/* 2. Desktop Pill (sm:inline-flex): 3-segment layout */}
      <div className="hidden sm:inline-flex items-center gap-3 px-4 py-2 text-sm">
        <span className="font-semibold text-content-primary truncate max-w-[110px] md:max-w-[140px]">
          {locationLabel}
        </span>
        <span className="h-4 w-px bg-border-hairline shrink-0" />
        <span className="font-semibold text-content-primary truncate max-w-[110px] md:max-w-[140px]">
          {datesLabel}
        </span>
        <span className="h-4 w-px bg-border-hairline shrink-0" />
        <span className="text-content-secondary truncate max-w-[90px] md:max-w-[120px]">
          {guestsLabel}
        </span>
        <div className="w-8 h-8 rounded-full bg-rausch flex items-center justify-center text-white shrink-0 shadow-sm ml-1">
          <Search className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
    </button>
  );
};
