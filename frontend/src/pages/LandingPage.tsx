import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSearchBar } from '../components/search/HeroSearchBar';
import { RoomCard } from '../components/room/RoomCard';
import { api } from '../services/api';
import type { Listing } from '../types';
import { useSearch } from '../context/SearchContext';
import { ChevronRight, Sparkles, Building, Waves, TreePine, Coffee } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDestination, activeCityTab, setActiveCityTab } = useSearch();

  const [danangListings, setDanangListings] = useState<Listing[]>([]);
  const [hanoiListings, setHanoiListings] = useState<Listing[]>([]);
  const [hcmcListings, setHcmcListings] = useState<Listing[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    Promise.all(['Đà Nẵng', 'Hà Nội', 'Hồ Chí Minh'].map(destination => api.rooms({ destination, limit: 8, sort: 'rating_desc' })))
      .then(([danang, hanoi, hcmc]) => {
        if (!active) return;
        setDanangListings(danang.data);
        setHanoiListings(hanoi.data);
        setHcmcListings(hcmc.data);
        setTotals({ 'Đà Nẵng': danang.meta.total, 'Hà Nội': hanoi.meta.total, 'Hồ Chí Minh': hcmc.meta.total });
      })
      .catch(() => { if (active) setTotals({}); });
    return () => { active = false; };
  }, []);

  const categories = [
    { label: 'Tất cả', icon: Sparkles, query: 'Tất cả' },
    { label: 'Hà Nội', icon: Coffee, query: 'Hà Nội' },
    { label: 'Đà Nẵng', icon: Waves, query: 'Đà Nẵng' },
    { label: 'TP. Hồ Chí Minh', icon: Building, query: 'Hồ Chí Minh' },
  ];

  const handleCitySelect = (city: string) => {
    setActiveCityTab(city);
    setDestination(city);
    navigate(`/rooms?dest=${encodeURIComponent(city)}`);
  };

  const destinations = [
    {
      city: 'Đà Nẵng',
      title: 'Bãi biển Mỹ Khê & Cầu Rồng',
      listingsCount: `${totals['Đà Nẵng'] ?? 0} chỗ ở`,
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Hà Nội',
      title: 'Phố cổ 36 phố phường & Hồ Gươm',
      listingsCount: `${totals['Hà Nội'] ?? 0} chỗ ở`,
      image: 'https://images.unsplash.com/photo-1509030450996-932152a514d2?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Hồ Chí Minh',
      title: 'Sài Gòn năng động, ẩm thực đường phố',
      listingsCount: `${totals['Hồ Chí Minh'] ?? 0} chỗ ở`,
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="w-full pb-20">
      {/* 1. Hero Section with Large Search Bar */}
      <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-border-hairline bg-gradient-to-b from-surface-subtle/50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Headline */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-content-primary mb-3">
              Tìm nơi dừng chân lý tưởng tại <span className="text-rausch">Việt Nam</span>
            </h1>
            <p className="text-sm sm:text-base text-content-secondary">
              Khám phá hơn 450+ căn hộ cao cấp, homestay boutique và biệt thự ven biển tuyệt đẹp.
            </p>
          </div>

          {/* Hero Search Bar */}
          <HeroSearchBar />

          {/* City / Category Quick Chips */}
          <div className="flex items-center justify-center gap-3 mt-8 overflow-x-auto no-scrollbar py-1">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = activeCityTab === c.query;
              return (
                <button
                  key={c.label}
                  onClick={() => handleCitySelect(c.query)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-content-primary text-white border-content-primary shadow-sm'
                      : 'bg-white border-border text-content-secondary hover:border-content-primary hover:text-content-primary shadow-airbnb-search'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Da Nang Listings Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-content-primary">
              Khám phá nơi lưu trú tại Đà Nẵng
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Căn hộ view biển Sơn Trà, Ngũ Hành Sơn được yêu thích nhất
            </p>
          </div>
          <button
            onClick={() => handleCitySelect('Đà Nẵng')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-content-primary hover:text-rausch transition"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {danangListings.map((listing) => (
            <RoomCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* 3. Explore Top Destinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-content-primary">
            Khám phá các điểm đến hàng đầu
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
            Những thành phố du lịch sôi động và đậm nét văn hóa bản địa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.city}
              onClick={() => handleCitySelect(dest.city)}
              className="group cursor-pointer relative h-72 rounded-2xl overflow-hidden shadow-airbnb-card hover:shadow-airbnb-card-hover transition-all t-card-hover"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-rausch bg-white/90 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {dest.listingsCount}
                </span>
                <h3 className="text-2xl font-black mb-1">{dest.city}</h3>
                <p className="text-xs text-white/80 line-clamp-1">{dest.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Hanoi Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-content-primary">
              Căn hộ & Studio phong cách tại Hà Nội
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Gần Hoàn Kiếm, Tây Hồ và các khu phố cổ lãng mạn
            </p>
          </div>
          <button
            onClick={() => handleCitySelect('Hà Nội')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-content-primary hover:text-rausch transition"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hanoiListings.map((listing) => (
            <RoomCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* 5. Ho Chi Minh City Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-content-primary">
              Nơi lưu trú được ưa chuộng tại TP. Hồ Chí Minh
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
              Tọa lạc tại Quận 1, Bình Thạnh và Quận 2 sầm uất
            </p>
          </div>
          <button
            onClick={() => handleCitySelect('Hồ Chí Minh')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-content-primary hover:text-rausch transition"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {hcmcListings.map((listing) => (
            <RoomCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* 6. Become a Host Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative rounded-3xl overflow-hidden bg-content-primary text-white p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-rausch text-white text-xs font-extrabold tracking-wider uppercase inline-block">
              Dành cho chủ nhà
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Bạn có phòng hoặc căn hộ trống? Trở thành Chủ nhà RoomFinder ngay hôm nay
            </h2>
            <p className="text-sm sm:text-base text-white/80">
              Tiếp cận hàng nghìn du khách trong nước và quốc tế. Quản lý phòng, lịch bận và nhận thanh toán tiện lợi, minh bạch.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/host')}
                className="px-6 py-3.5 rounded-full bg-rausch hover:bg-rausch-hover text-white font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                Bắt đầu đón tiếp khách
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl relative">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
              alt="Chủ nhà RoomFinder"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
