import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Lock, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { Listing } from '../../types';

export const HostCalendarPage: React.FC = () => {
  const [hostListings, setHostListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [calendarEntries, setCalendarEntries] = useState<any[]>([]);
  useEffect(() => { api.hostListings().then(rows => { setHostListings(rows); setSelectedListingId(value => value || rows[0]?.id || ''); }); }, []);
  useEffect(() => { if (selectedListingId) api.calendar(selectedListingId).then(setCalendarEntries); else setCalendarEntries([]); }, [selectedListingId]);

  const selectedListing = useMemo(() => {
    return hostListings.find((l) => l.id === selectedListingId) || hostListings[0];
  }, [hostListings, selectedListingId]);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const bookedRanges = calendarEntries.map(entry => ({ check_in: String(entry.checkIn).slice(0, 10), check_out: String(entry.checkOut).slice(0, 10) }));

  // Generate days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const isDayBooked = (day: number): boolean => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const time = new Date(dateStr).getTime();

    return bookedRanges.some((r) => {
      const start = new Date(r.check_in).getTime();
      const end = new Date(r.check_out).getTime();
      return time >= start && time < end;
    });
  };

  const handleToggleBlockDate = async (day: number) => {
    if (!selectedListing) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const existing = calendarEntries.find(entry => dateStr >= String(entry.checkIn).slice(0, 10) && dateStr < String(entry.checkOut).slice(0, 10));
    if (existing?.bookingId) return;
    if (existing) await api.deleteCalendar(selectedListing.id, existing.id);
    else {
      const end = new Date(dateStr + 'T00:00:00'); end.setDate(end.getDate() + 1);
      await api.createCalendar(selectedListing.id, { checkIn: dateStr, checkOut: end.toISOString().slice(0, 10), isBlocked: true, note: 'Host khóa ngày' });
    }
    setCalendarEntries(await api.calendar(selectedListing.id));
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
            Quản lý Lịch bận & Giá phòng
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Xem lịch đặt phòng của khách hoặc chủ động khóa các ngày bạn muốn giữ riêng
          </p>
        </div>

        {/* Listing selector */}
        {hostListings.length > 0 && (
          <div className="w-full sm:w-72">
            <label className="text-[11px] font-bold text-content-secondary uppercase block mb-1">
              Chọn phòng cho thuê
            </label>
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="w-full border border-border rounded-xl p-2.5 text-xs font-bold text-content-primary bg-white focus:outline-none"
            >
              {hostListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isSavedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Đã lưu cập nhật trạng thái ngày phòng!</span>
        </div>
      )}

      {/* Calendar Card */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rausch" />
            <h2 className="text-lg font-black text-content-primary">
              {monthNames[currentMonth]} năm {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface-subtle"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface-subtle"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">
          <span>CN</span>
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before 1st day */}
          {[...Array(firstDayOfWeek)].map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 bg-surface-subtle/30 rounded-xl" />
          ))}

          {/* Days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const booked = isDayBooked(day);

            return (
              <div
                key={day}
                onClick={() => handleToggleBlockDate(day)}
                className={`h-20 sm:h-24 rounded-xl border p-2 flex flex-col justify-between transition cursor-pointer select-none ${
                  booked
                    ? 'bg-red-50/60 border-red-200 text-red-900'
                    : 'bg-white border-border hover:border-content-primary hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${booked ? 'text-red-700' : 'text-content-primary'}`}>
                    {day}
                  </span>
                  {booked && <Lock className="w-3 h-3 text-red-500" />}
                </div>

                <div className="text-[10px] font-semibold truncate">
                  {booked ? (
                    <span className="text-red-600 font-bold">Đã khóa / Đặt</span>
                  ) : (
                    <span className="text-content-secondary">
                      {selectedListing?.price_per_night ? `${Math.round(selectedListing.price_per_night / 1000)}k` : '850k'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t border-border-hairline flex flex-wrap items-center gap-6 text-xs text-content-secondary">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-white border border-border" />
            <span>Còn trống (Nhấn để khóa ngày)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-red-100 border border-red-300" />
            <span>Ngày bận / Đã đặt (Nhấn để mở lại)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
