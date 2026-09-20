import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User as UserIcon, Heart, Compass, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import { CompactSearchPill } from '../search/CompactSearchPill';
import { SearchModal } from '../search/SearchModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isHost, logout } = useAuth();
  const { setIsSearchModalOpen } = useSearch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    if (!isLandingPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const heroEl = document.getElementById('hero-search-bar');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // Only show compact search pill when the hero search bar has scrolled completely out of view
        setIsScrolled(rect.bottom <= 75);
      } else {
        setIsScrolled(window.scrollY > 200);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isLandingPage]);

  // On non-landing pages, search pill is always shown
  const showCompactSearch = !isLandingPage || isScrolled;

  return (
    <>
      <header className={`sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border-hairline transition-all duration-300 ${location.pathname === '/rooms' ? 'hidden lg:block' : 'block'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* 1. Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rausch flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className={`flex flex-col ${showCompactSearch ? 'hidden md:flex' : 'flex'}`}>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-rausch group-hover:opacity-90 transition-opacity">
                RoomFinder
              </span>
              <span className="text-[9px] sm:text-[10px] -mt-1 font-bold text-content-secondary tracking-widest uppercase">
                Việt Nam
              </span>
            </div>
          </Link>

          {/* 2. Middle: Morphing search pill when scrolled or on room pages */}
          <div className="flex-1 flex justify-center items-center max-w-xl px-1 sm:px-2 min-w-0">
            {showCompactSearch && (
              <div className="animate-in fade-in zoom-in-95 duration-200 w-full flex justify-center">
                <CompactSearchPill onClick={() => setIsSearchModalOpen(true)} />
              </div>
            )}
          </div>

          {/* 3. Right side: Host Mode / User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              to={isHost ? '/host' : '/host'}
              className="hidden lg:inline-flex items-center px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold text-content-primary hover:bg-surface-subtle transition"
            >
              {isHost ? 'Kênh chủ nhà' : 'Trở thành chủ nhà'}
            </Link>

            {/* User Pill Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 sm:p-1.5 sm:pl-3 border border-border rounded-pill hover:shadow-airbnb-search transition-all bg-white"
                aria-label="Menu tài khoản"
              >
                <Menu className="w-4 h-4 text-content-primary stroke-[2.2] ml-1 sm:ml-0" />
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-subtle overflow-hidden flex items-center justify-center border border-border-hairline shrink-0">
                  {currentUser?.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-content-secondary" />
                  )}
                </div>
              </button>

              {/* User Dropdown */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-72 bg-white rounded-2xl shadow-airbnb-modal border border-border py-2 z-50 t-dropdown">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-border-hairline bg-surface-subtle/50">
                      <div className="text-xs font-medium text-content-secondary">Đang đăng nhập</div>
                      <div className="text-sm font-bold text-content-primary truncate">
                        {currentUser ? currentUser.name : 'Khách vãng lai'}
                      </div>
                      <div className="text-[11px] font-semibold text-rausch uppercase tracking-wider mt-0.5">
                        {currentUser?.role === 'host' ? 'Chủ phòng (Host)' : currentUser?.role === 'traveler' ? 'Du khách (Traveler)' : 'Chưa đăng nhập'}
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1">
                      <Link
                        to="/wishlist"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary hover:bg-surface-subtle transition font-medium"
                      >
                        <Heart className="w-4 h-4 text-rausch" />
                        Danh sách yêu thích
                      </Link>
                      <Link
                        to="/trips"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary hover:bg-surface-subtle transition font-medium"
                      >
                        <Compass className="w-4 h-4 text-sky-600" />
                        Chuyến đi của tôi
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary hover:bg-surface-subtle transition font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-content-secondary" />
                        Hồ sơ cá nhân
                      </Link>
                    </div>

                    <div className="h-px bg-border-hairline my-1" />

                    {/* Host Portal Link */}
                    <div className="py-1">
                      <Link
                        to="/host"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary hover:bg-surface-subtle transition font-semibold"
                      >
                        <Home className="w-4 h-4 text-amber-600" />
                        Cổng quản trị Chủ phòng (Host)
                      </Link>
                    </div>

                    <div className="h-px bg-border-hairline my-1" />

                    {/* Auth links */}
                    <div className="py-1">
                      {currentUser ? (
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-primary hover:bg-surface-subtle transition font-semibold"
                        >
                          Đăng nhập hoặc Đăng ký
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal />
    </>
  );
};
