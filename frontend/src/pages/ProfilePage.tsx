import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, ShieldCheck, Heart, Compass, Home, Edit3, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <User className="w-16 h-16 text-content-secondary mx-auto mb-4 stroke-1" />
        <h1 className="text-2xl font-black mb-2">Chưa đăng nhập</h1>
        <p className="text-sm text-content-secondary mb-6">
          Vui lòng đăng nhập để xem và quản lý thông tin hồ sơ của bạn.
        </p>
        <Link
          to="/login"
          className="px-6 py-3 bg-rausch hover:bg-rausch-hover text-white rounded-full text-sm font-bold shadow-md transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="md:col-span-4 bg-white border border-border rounded-2xl p-6 shadow-airbnb-card text-center space-y-4">
          <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-border shadow-sm">
            {currentUser.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center bg-rausch/10 text-rausch text-3xl font-bold">{currentUser.name.slice(0, 1)}</span>}
          </div>

          <div>
            <h2 className="text-xl font-bold text-content-primary">{currentUser.name}</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rausch/10 text-rausch uppercase tracking-wider mt-1 inline-block">
              {currentUser.role === 'host' ? 'Chủ phòng (Host)' : 'Du khách (Traveler)'}
            </span>
          </div>

          <div className="pt-2">
            <Link
              to="/profile/edit"
              className="w-full py-2.5 px-4 rounded-xl border border-border hover:border-content-primary text-xs font-bold text-content-primary flex items-center justify-center gap-2 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa hồ sơ</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-border-hairline text-left text-xs text-content-secondary space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Đã xác minh danh tính</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-600" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Tham gia từ {new Date(currentUser.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Shortcuts */}
        <div className="md:col-span-8 space-y-6">
          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/trips"
              className="p-5 bg-white border border-border rounded-2xl hover:shadow-airbnb-card transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-content-primary">Chuyến đi của tôi</h4>
                  <p className="text-xs text-content-secondary">Xem lịch đặt phòng và nhận phòng</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-content-secondary group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/wishlist"
              className="p-5 bg-white border border-border rounded-2xl hover:shadow-airbnb-card transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-rausch flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-rausch" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-content-primary">Danh sách yêu thích</h4>
                  <p className="text-xs text-content-secondary">Các phòng lưu trú đã lưu</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-content-secondary group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/host"
              className="p-5 bg-white border border-border rounded-2xl hover:shadow-airbnb-card transition flex items-center justify-between group sm:col-span-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-content-primary">Cổng quản trị Dành cho Chủ nhà</h4>
                  <p className="text-xs text-content-secondary">
                    Thêm phòng mới, quản lý lịch bận, duyệt đặt phòng và quản lý doanh thu
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-content-secondary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
