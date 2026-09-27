import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  CalendarCheck,
  Star,
  Settings,
  ArrowLeftRight,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HostLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading, becomeHost } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !currentUser) navigate('/login', { replace: true });
  }, [currentUser, isLoading, navigate]);

  const navItems = [
    { label: 'Tổng quan (Dashboard)', icon: LayoutDashboard, path: '/host' },
    { label: 'Phòng cho thuê', icon: Home, path: '/host/listings' },
    { label: 'Lượt đặt phòng', icon: CalendarCheck, path: '/host/reservations' },
    { label: 'Lịch & Giá phòng', icon: CalendarDays, path: '/host/calendar' },
    { label: 'Đánh giá từ khách', icon: Star, path: '/host/reviews' },
    { label: 'Cài đặt tài khoản Host', icon: Settings, path: '/host/settings' },
  ];

  if (isLoading || !currentUser) return <div className="min-h-screen grid place-items-center text-sm text-content-secondary">Đang kiểm tra phiên đăng nhập…</div>;
  if (currentUser.role !== 'host') return (
    <div className="min-h-screen grid place-items-center bg-surface-subtle px-4">
      <div className="max-w-md bg-white border border-border rounded-2xl p-8 text-center shadow-airbnb-card">
        <Home className="w-12 h-12 text-rausch mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Kích hoạt hồ sơ Chủ nhà</h1>
        <p className="text-sm text-content-secondary mb-6">Hồ sơ Host giúp bạn đăng phòng, quản lý lịch, booking và phản hồi đánh giá.</p>
        <button onClick={() => void becomeHost()} className="px-6 py-3 bg-rausch text-white rounded-xl text-sm font-bold">Trở thành Chủ nhà</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-subtle flex">
      {/* 1. Mobile Menu Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-border-hairline p-5 flex flex-col justify-between z-50 transition-transform duration-200 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-border-hairline mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rausch flex items-center justify-center text-white font-black text-sm">
                R
              </div>
              <div>
                <span className="font-extrabold text-base text-content-primary">RoomFinder</span>
                <span className="text-[10px] block font-bold text-rausch uppercase tracking-wider">
                  Kênh Chủ Nhà
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-content-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Listing CTA */}
          <div className="mb-6">
            <Link
              to="/host/listings/new"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-rausch hover:bg-rausch-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng phòng mới</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/host'}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-rausch/10 text-rausch font-bold'
                        : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switch to Traveler */}
        <div className="pt-4 border-t border-border-hairline space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-content-primary hover:bg-surface-subtle transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-content-secondary" />
            <span>Chuyển sang chế độ du khách</span>
          </Link>

          <div className="flex items-center gap-3 p-2 bg-surface-subtle rounded-xl">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
              {currentUser.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center bg-rausch/10 text-rausch font-bold">{currentUser.name.slice(0, 1)}</span>}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-content-primary truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-content-secondary truncate">
                Chủ nhà RoomFinder
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. Main Outlet Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="lg:hidden bg-white border-b border-border-hairline p-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1 text-content-primary"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm text-content-primary">Kênh Quản Trị Chủ Nhà</span>
          <div className="w-6" />
        </div>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
