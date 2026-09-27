import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, CalendarCheck, DollarSign, Star, Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { Booking, Listing } from '../../types';

export const HostDashboardPage: React.FC = () => {
  const [hostListings, setHostListings] = useState<Listing[]>([]);
  const [hostBookings, setHostBookings] = useState<Booking[]>([]);
  useEffect(() => { Promise.all([api.hostListings(), api.hostReservations()]).then(([listings, bookings]) => { setHostListings(listings); setHostBookings(bookings); }); }, []);

  // Calculate metrics
  const totalRevenue = useMemo(() => {
    return hostBookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.total_price, 0);
  }, [hostBookings]);

  const upcomingBookings = useMemo(() => {
    return hostBookings.filter((b) => b.status === 'UPCOMING');
  }, [hostBookings]);
  const averageRating = hostListings.length ? hostListings.reduce((sum, item) => sum + item.rating, 0) / hostListings.length : 0;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            Bảng điều khiển Chủ nhà
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Chào mừng trở lại! Dưới đây là tình hình hoạt động kinh doanh nơi lưu trú của bạn.
          </p>
        </div>

        <Link
          to="/host/listings/new"
          className="px-5 py-2.5 rounded-xl bg-rausch hover:bg-rausch-hover text-white text-xs font-bold flex items-center gap-2 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo phòng mới</span>
        </Link>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
              Phòng cho thuê
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-content-primary">{hostListings.length}</div>
          <div className="text-xs text-content-secondary mt-1">Đang hoạt động trên hệ thống</div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
              Đặt phòng sắp tới
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-content-primary">{upcomingBookings.length}</div>
          <div className="text-xs text-content-secondary mt-1">Chờ đón tiếp khách</div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
              Doanh thu tạm tính
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rausch">
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-xs text-content-secondary mt-1">Từ các lượt đặt thành công</div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
              Điểm đánh giá TB
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-content-primary">{averageRating.toFixed(2)} ★</div>
          <div className="text-xs text-content-secondary mt-1">Từ các đánh giá thực tế</div>
        </div>
      </div>

      {/* 3. Recent Bookings Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border-hairline flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-content-primary">Lượt đặt phòng gần đây</h3>
            <p className="text-xs text-content-secondary">Khách hàng đã đặt phòng của bạn</p>
          </div>
          <Link
            to="/host/reservations"
            className="text-xs font-bold text-rausch hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {hostBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-content-secondary">
            Chưa có lượt đặt phòng nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-hairline text-content-secondary font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Đặt</th>
                  <th className="py-3 px-4">Tên khách</th>
                  <th className="py-3 px-4">Phòng lưu trú</th>
                  <th className="py-3 px-4">Ngày lưu trú</th>
                  <th className="py-3 px-4">Tổng tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {hostBookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-surface-subtle/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-rausch">{b.booking_code}</td>
                    <td className="py-3.5 px-4 font-semibold text-content-primary">{b.guest_name}</td>
                    <td className="py-3.5 px-4 text-content-secondary truncate max-w-xs">{b.listing_name}</td>
                    <td className="py-3.5 px-4 text-content-secondary">
                      {b.check_in} → {b.check_out} ({b.nights} đêm)
                    </td>
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
                        className="text-xs font-bold text-content-primary hover:text-rausch transition"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Host Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/host/listings"
          className="p-5 bg-white border border-border rounded-2xl hover:shadow-airbnb-card transition flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-rausch/10 text-rausch flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-content-primary">Quản lý {hostListings.length} căn phòng</h4>
            <p className="text-xs text-content-secondary">Xem và chỉnh sửa giá, mô tả và hình ảnh</p>
          </div>
        </Link>

        <Link
          to="/host/calendar"
          className="p-5 bg-white border border-border rounded-2xl hover:shadow-airbnb-card transition flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-content-primary">Quản lý Lịch bận</h4>
            <p className="text-xs text-content-secondary">Khóa hoặc mở ngày đón khách</p>
          </div>
        </Link>

        <Link
          to="/host/reviews"
          className="p-5 bg-white border border-border rounded-2xl hover:shadow-airbnb-card transition flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-content-primary">Đánh giá & Trả lời</h4>
            <p className="text-xs text-content-secondary">Tương tác và chăm sóc khách hàng</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
