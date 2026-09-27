import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, ChevronRight, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Booking } from '../../types';

export const HostReservationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const [allReservations, setAllReservations] = useState<Booking[]>([]);
  useEffect(() => { api.hostReservations().then(setAllReservations).catch(() => setAllReservations([])); }, []);

  const filteredReservations = useMemo(() => {
    if (filter === 'ALL') return allReservations;
    return allReservations.filter((b) => b.status === filter);
  }, [allReservations, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
            Lượt đặt phòng của khách
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Theo dõi danh sách khách lưu trú, ngày nhận/trả phòng và doanh thu
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-hairline">
        <button
          onClick={() => setFilter('ALL')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            filter === 'ALL'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Tất cả ({allReservations.length})
        </button>
        <button
          onClick={() => setFilter('UPCOMING')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            filter === 'UPCOMING'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Sắp tới ({allReservations.filter((b) => b.status === 'UPCOMING').length})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            filter === 'COMPLETED'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Đã hoàn thành ({allReservations.filter((b) => b.status === 'COMPLETED').length})
        </button>
        <button
          onClick={() => setFilter('CANCELLED')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            filter === 'CANCELLED'
              ? 'border-content-primary text-content-primary'
              : 'border-transparent text-content-secondary hover:text-content-primary'
          }`}
        >
          Đã hủy ({allReservations.filter((b) => b.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center text-xs text-content-secondary">
            Không có lượt đặt phòng nào trong mục này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-hairline text-content-secondary font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Đặt</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Ngày lưu trú</th>
                  <th className="py-3 px-4">Số khách</th>
                  <th className="py-3 px-4">Tổng thu</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {filteredReservations.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-subtle/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-rausch">{b.booking_code}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-content-primary">{b.guest_name}</div>
                      <div className="text-[11px] text-content-secondary">{b.guest_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-content-secondary truncate max-w-xs">{b.listing_name}</td>
                    <td className="py-3.5 px-4 text-content-secondary">
                      {b.check_in} → {b.check_out} ({b.nights} đêm)
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-content-primary">{b.guests} khách</td>
                    <td className="py-3.5 px-4 font-bold text-content-primary">
                      {b.total_price.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          b.status === 'UPCOMING'
                            ? 'bg-sky-50 text-sky-700'
                            : b.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {b.status === 'UPCOMING' ? 'Sắp tới' : b.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/host/reservations/${b.id}`}
                        className="px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-surface-subtle text-content-primary font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
