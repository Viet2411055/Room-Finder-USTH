import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  ArrowLeft,
  ArrowUpDown,
  X,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { RoomCard } from '../components/room/RoomCard';
import { BentoGallery } from '../components/room/BentoGallery';
import { GoogleMapEmbed } from '../components/map/GoogleMapEmbed';
import { api } from '../services/api';
import type { Listing } from '../types';
import { useSearch } from '../context/SearchContext';

export const RoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const destQuery = searchParams.get('dest');

  const { search, setDestination, filters, setFilters, resetFilters, setIsSearchModalOpen } = useSearch();

  // The URL is the source of truth so deep links and city switches behave identically.
  useEffect(() => {
    const destination = destQuery && destQuery !== 'Tất cả' ? destQuery : 'Tất cả';
    if (search.destination !== destination) setDestination(destination);
  }, [destQuery, search.destination, setDestination]);

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Mobile Drawer State: 'collapsed' | 'half' | 'expanded'
  const [drawerSnap, setDrawerSnap] = useState<'collapsed' | 'half' | 'expanded'>('half');
  const [dragStartY, setDragStartY] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const listingsTopRef = useRef<HTMLDivElement>(null);

  // Local filter states for modal
  const [modalMinPrice, setModalMinPrice] = useState(filters.minPrice || 0);
  const [modalMaxPrice, setModalMaxPrice] = useState(filters.maxPrice || 10000000);
  const [modalSuperhost, setModalSuperhost] = useState(filters.superhostOnly || false);
  const [modalMinRating, setModalMinRating] = useState(filters.minRating || 0);
  const [modalBedrooms, setModalBedrooms] = useState(filters.bedrooms || 0);
  const [modalAmenities, setModalAmenities] = useState<string[]>(filters.amenities || []);

  const cities = ['Tất cả', 'Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh'];
  const popularAmenities = [
    'Wi-fi',
    'Điều hòa nhiệt độ',
    'Nhà bếp',
    'Máy giặt',
    'Chỗ đỗ xe miễn phí trong khuôn viên',
    'TV',
    'Tự nhận phòng',
  ];

  // Quick chips for mobile
  const quickChips = [
    { label: 'Wi-fi', isSpecial: false },
    { label: 'TV', isSpecial: false },
    { label: 'Được khách yêu thích', isSpecial: true },
    { label: 'Bể bơi', isSpecial: false },
    { label: 'Điều hòa nhiệt độ', isSpecial: false },
    { label: 'Nhà bếp', isSpecial: false },
    { label: 'Chỗ đỗ xe miễn phí trong khuôn viên', isSpecial: false },
  ];

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setIsLoading(true);
    api.rooms({
      page: currentPage,
      limit: pageSize,
      destination: search.destination === 'Tất cả' ? undefined : search.destination,
      checkIn: search.checkIn || undefined,
      checkOut: search.checkOut || undefined,
      adults: search.guests.adults,
      children: search.guests.children,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice && filters.maxPrice < 10000000 ? filters.maxPrice : undefined,
      amenities: filters.amenities.length ? filters.amenities.join(',') : undefined,
      roomTypes: filters.roomTypes.length ? filters.roomTypes.join(',') : undefined,
      minRating: filters.minRating,
      superhostOnly: filters.superhostOnly,
      bedrooms: filters.bedrooms,
      sort: sortBy === 'price-asc' ? 'price_asc' : sortBy === 'price-desc' ? 'price_desc' : sortBy === 'rating' ? 'rating_desc' : 'newest',
    }, controller.signal).then(result => {
      if (!active) return;
      setAllListings(result.data);
      setTotalItems(result.meta.total);
      setTotalPages(Math.max(result.meta.totalPages, 1));
    }).catch(error => {
      if (active && error?.name !== 'AbortError') { setAllListings([]); setTotalItems(0); setTotalPages(1); }
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [currentPage, search, filters, sortBy]);

  const sortedListings = allListings;

  // Reset to first page when search criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [search.destination, filters, sortBy]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + allListings.length, totalItems);
  const paginatedListings = sortedListings;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    listingsTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectCity = (city: string) => {
    const next = new URLSearchParams(searchParams);
    if (city === 'Tất cả') next.delete('dest'); else next.set('dest', city);
    setSearchParams(next);
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }
    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  };

  // Featured first listing for BentoGrid presentation
  const featuredSuite = sortedListings[0];

  const applyModalFilters = () => {
    setFilters({
      minPrice: modalMinPrice,
      maxPrice: modalMaxPrice,
      superhostOnly: modalSuperhost,
      minRating: modalMinRating,
      bedrooms: modalBedrooms,
      amenities: modalAmenities,
      roomTypes: [],
    });
    setIsFilterModalOpen(false);
  };

  const handleAmenityToggle = (amenity: string) => {
    if (modalAmenities.includes(amenity)) {
      setModalAmenities(modalAmenities.filter((a) => a !== amenity));
    } else {
      setModalAmenities([...modalAmenities, amenity]);
    }
  };

  const handleQuickChipToggle = (label: string, isSpecial: boolean) => {
    if (isSpecial) {
      setFilters((prev) => ({ ...prev, superhostOnly: !prev.superhostOnly }));
    } else {
      setFilters((prev) => {
        const has = prev.amenities.includes(label);
        return {
          ...prev,
          amenities: has ? prev.amenities.filter((a) => a !== label) : [...prev.amenities, label],
        };
      });
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice && filters.minPrice > 0) count++;
    if (filters.maxPrice && filters.maxPrice < 10000000) count++;
    if (filters.superhostOnly) count++;
    if (filters.minRating && filters.minRating > 0) count++;
    if (filters.bedrooms && filters.bedrooms > 0) count++;
    if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
    return count;
  }, [filters]);

  // Mobile Drawer Touch Handlers
  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY === null) return;
    const diff = dragStartY - e.changedTouches[0].clientY;
    // Dragged UP
    if (diff > 35) {
      if (drawerSnap === 'collapsed') setDrawerSnap('half');
      else if (drawerSnap === 'half') setDrawerSnap('expanded');
    }
    // Dragged DOWN
    else if (diff < -35) {
      if (drawerSnap === 'expanded') setDrawerSnap('half');
      else if (drawerSnap === 'half') setDrawerSnap('collapsed');
    }
    setDragStartY(null);
  };

  const handleMapPinSelect = (listingId: string | null) => {
    setHoveredListingId(listingId);
    if (listingId && drawerSnap === 'collapsed') {
      setDrawerSnap('half');
    }
  };

  const totalGuests = (search.guests.adults || 0) + (search.guests.children || 0);
  const mobileDatesLabel = search.checkIn && search.checkOut
    ? `${search.checkIn.split('-').slice(1).join('/')} - ${search.checkOut.split('-').slice(1).join('/')}`
    : 'cuối tuần bất kỳ';
  const mobileGuestsLabel = totalGuests > 1 ? `${totalGuests} khách` : 'Thêm khách';

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* =========================================================================
          MOBILE VIEW (< lg): DUAL-LAYER MAP + FLOATING DRAWER (AIRBNB SPEC)
          ========================================================================= */}
      <div className="lg:hidden">
        {/* 1. Mobile Fixed Top Search & Filter Navigation */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-hairline shadow-sm">
          <div className="px-3 pt-2.5 pb-1 flex items-center justify-between gap-2">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-subtle active:scale-95 text-content-primary shrink-0 transition"
              aria-label="Quay lại trang chủ"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Centered Floating Search Pill */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex-1 min-w-0 bg-white border border-border rounded-full py-1.5 px-3.5 shadow-airbnb-search active:scale-[0.99] transition text-center"
            >
              <div className="text-xs font-bold text-content-primary truncate">
                {search.destination && search.destination !== 'Tất cả'
                  ? `Chỗ ở tại ${search.destination}`
                  : 'Chỗ ở tại Việt Nam'}
              </div>
              <div className="text-[10px] text-content-secondary truncate font-medium mt-0.5">
                {mobileDatesLabel} · {mobileGuestsLabel}
              </div>
            </button>

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="w-10 h-10 rounded-full border border-border bg-white flex items-center justify-center text-content-primary hover:border-content-primary active:scale-95 shrink-0 transition shadow-sm relative"
              aria-label="Mở bộ lọc"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rausch text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Filter Chips (Horizontal Scroll row matching screenshot) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 pb-2.5 pt-1">
            {quickChips.map((chip) => {
              const isSelected = chip.isSpecial
                ? filters.superhostOnly
                : filters.amenities.includes(chip.label);
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleQuickChipToggle(chip.label, chip.isSpecial)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-content-primary text-white shadow-sm ring-1 ring-content-primary'
                      : 'bg-white border border-border text-content-secondary hover:border-content-primary hover:text-content-primary'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Full-Screen Interactive Google Map Background Layer */}
        <div className="fixed inset-0 top-[106px] z-10 bg-surface-subtle">
          <GoogleMapEmbed
            listings={sortedListings}
            centerCity={search.destination}
            hoveredListingId={hoveredListingId}
            onHoverListing={handleMapPinSelect}
          />
        </div>

        {/* 3. Floating Bottom Drawer (Snap Points: collapsed / half / expanded) */}
        <div
          className={`fixed inset-x-0 bottom-0 z-20 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.18)] border-t border-border flex flex-col transition-[height] duration-300 ease-out select-none ${
            drawerSnap === 'collapsed'
              ? 'h-16'
              : drawerSnap === 'half'
              ? 'h-[50vh]'
              : 'h-[calc(100dvh-106px)]'
          }`}
        >
          {/* Drag Handle Bar */}
          <div
            onTouchStart={handleDrawerTouchStart}
            onTouchEnd={handleDrawerTouchEnd}
            onClick={() => {
              if (drawerSnap === 'collapsed') setDrawerSnap('half');
              else if (drawerSnap === 'half') setDrawerSnap('expanded');
              else setDrawerSnap('half');
            }}
            className="pt-2.5 pb-2 px-4 cursor-pointer select-none shrink-0 text-center"
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
            {drawerSnap === 'collapsed' && (
              <div className="text-xs font-bold text-content-primary mt-2 flex items-center justify-center gap-1.5">
                <span>📍 Hiển thị {totalItems} nơi lưu trú (Chạm để mở)</span>
              </div>
            )}
          </div>

          {drawerSnap !== 'collapsed' && (
            <>
              {/* Notice: Giá đã bao gồm mọi khoản phí */}
              <div className="px-5 py-2 flex items-center gap-2 text-xs font-semibold text-content-primary shrink-0 border-b border-border-hairline bg-surface-subtle/50">
                <span className="text-sm">🏷️</span>
                <span>Giá đã bao gồm mọi khoản phí</span>
                <div className="ml-auto text-[11px] text-content-secondary font-medium">
                  {totalItems} kết quả
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
                {paginatedListings.map((listing) => (
                  <RoomCard
                    key={listing.id}
                    listing={listing}
                    isHovered={hoveredListingId === listing.id}
                    onHover={setHoveredListingId}
                  />
                ))}

                {/* Bottom Pagination Inside Drawer */}
                {totalPages > 1 && (
                  <div className="pt-4 pb-12 border-t border-border-hairline flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => goToPage(currentPage - 1)}
                        className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-bold disabled:opacity-30"
                      >
                        Trước
                      </button>
                      <span className="text-xs font-bold px-2">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => goToPage(currentPage + 1)}
                        className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-bold disabled:opacity-30"
                      >
                        Tiếp
                      </button>
                    </div>
                    <div className="text-[11px] text-content-secondary">
                      Hiển thị {totalItems ? startIndex + 1 : 0} - {endIndex} trong số {totalItems} nơi lưu trú
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          DESKTOP VIEW (>= lg): SPLIT VIEW (LIST ON LEFT, STICKY MAP ON RIGHT)
          ========================================================================= */}
      <div className="hidden lg:flex flex-col flex-1">
        {/* Sub-Header: City Selector & Filter Toolbar */}
        <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-border-hairline px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* City Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {cities.map((c) => {
                const isSelected =
                  search.destination === c ||
                  (c === 'Tất cả' && (!search.destination || search.destination === 'Tất cả'));
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => selectCity(c)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-content-primary text-white shadow-sm'
                        : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface-container'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex items-center gap-2.5">
              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition ${
                  activeFiltersCount > 0
                    ? 'border-content-primary bg-content-primary text-white'
                    : 'border-border text-content-primary hover:border-content-primary bg-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Bộ lọc</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rausch text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-border rounded-full px-3.5 py-2 pr-8 text-xs font-semibold text-content-primary focus:outline-none hover:border-content-primary cursor-pointer"
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-content-secondary absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Split View: Left List, Right Map */}
        <div ref={listingsTopRef} className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-6">
          {/* Results Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold text-content-primary">
              Nơi lưu trú tại {search.destination || 'Việt Nam'}
            </h1>
            <p className="text-xs text-content-secondary mt-0.5">
              Tìm thấy {totalItems} căn hộ & homestay phù hợp với tiêu chí của bạn
            </p>
          </div>

          {/* Featured BentoGrid Suite Showcase */}
          {featuredSuite && (
            <div className="mb-8 p-5 bg-surface-subtle/80 rounded-2xl border border-border-hairline">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rausch flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Căn hộ nổi bật tuần này · BentoGrid Scroll ngang
                </span>
                <button
                  type="button"
                  onClick={() => (window.location.href = `/rooms/${featuredSuite.id}`)}
                  className="text-xs font-bold text-content-primary hover:underline"
                >
                  Xem chi tiết phòng →
                </button>
              </div>
              <BentoGallery images={featuredSuite.images} roomName={featuredSuite.name} />
            </div>
          )}

          {/* Split Grid */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Column: Listings Grid */}
            <div className="col-span-7">
              {isLoading ? (
                <div className="text-center py-20 text-sm text-content-secondary">Đang tải nơi lưu trú…</div>
              ) : sortedListings.length === 0 ? (
                <div className="text-center py-20 bg-surface-subtle rounded-2xl border border-border p-8">
                  <h3 className="text-lg font-bold text-content-primary mb-2">
                    Không tìm thấy nơi lưu trú phù hợp
                  </h3>
                  <p className="text-sm text-content-secondary mb-4">
                    Hãy thử mở rộng khoảng giá hoặc bỏ bớt các tiêu chí lọc.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-5 py-2.5 bg-content-primary text-white text-xs font-bold rounded-full hover:bg-black transition"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    {paginatedListings.map((listing) => (
                      <RoomCard
                        key={listing.id}
                        listing={listing}
                        isHovered={hoveredListingId === listing.id}
                        onHover={setHoveredListingId}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-10 pt-6 border-t border-border-hairline flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => goToPage(currentPage - 1)}
                          className="px-3 py-2 border border-border rounded-xl text-xs font-bold text-content-primary hover:bg-surface-subtle disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center gap-1"
                          aria-label="Trang trước"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Trước</span>
                        </button>

                        {getPageNumbers().map((p, idx) => {
                          if (p === '...') {
                            return (
                              <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs text-content-secondary font-bold">
                                ...
                              </span>
                            );
                          }
                          const pageNum = Number(p);
                          const isActive = pageNum === currentPage;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => goToPage(pageNum)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                                isActive
                                  ? 'bg-content-primary text-white shadow-sm'
                                  : 'text-content-primary hover:bg-surface-subtle border border-border'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => goToPage(currentPage + 1)}
                          className="px-3 py-2 border border-border rounded-xl text-xs font-bold text-content-primary hover:bg-surface-subtle disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center gap-1"
                          aria-label="Trang tiếp theo"
                        >
                          <span>Tiếp</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-content-secondary font-medium">
                        Hiển thị <span className="font-bold text-content-primary">{totalItems ? startIndex + 1 : 0} - {endIndex}</span> trong tổng số <span className="font-bold text-content-primary">{totalItems}</span> nơi lưu trú
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column: Sticky Google Map Embed */}
            <div className="col-span-5 sticky top-36 h-[calc(100vh-140px)]">
              <GoogleMapEmbed
                listings={paginatedListings}
                centerCity={search.destination}
                hoveredListingId={hoveredListingId}
                onHoverListing={setHoveredListingId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. FILTER MODAL DIALOG (BOTTOM SHEET ON MOBILE, CENTERED ON DESKTOP)
          ========================================================================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm t-modal-backdrop">
          <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-airbnb-modal border border-border flex flex-col t-modal-content overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-border rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-border-hairline shrink-0">
              <h2 className="text-base font-bold text-content-primary">Bộ lọc tìm kiếm</h2>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition"
                aria-label="Đóng bộ lọc"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-content-primary mb-1">Khoảng giá</h3>
                <p className="text-xs text-content-secondary mb-4">Giá mỗi đêm chưa bao gồm thuế và phí</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-content-secondary block mb-1">Giá tối thiểu</label>
                    <input
                      type="number"
                      step={50000}
                      value={modalMinPrice}
                      onChange={(e) => setModalMinPrice(Number(e.target.value))}
                      className="w-full border border-border rounded-xl p-2.5 text-xs sm:text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-content-secondary block mb-1">Giá tối đa</label>
                    <input
                      type="number"
                      step={50000}
                      value={modalMaxPrice}
                      onChange={(e) => setModalMaxPrice(Number(e.target.value))}
                      className="w-full border border-border rounded-xl p-2.5 text-xs sm:text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-hairline" />

              {/* Bedrooms */}
              <div>
                <h3 className="text-sm font-bold text-content-primary mb-3">Số phòng ngủ</h3>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setModalBedrooms(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                        modalBedrooms === num
                          ? 'bg-content-primary text-white border-content-primary'
                          : 'border-border text-content-primary hover:border-content-primary'
                      }`}
                    >
                      {num === 0 ? 'Bất kỳ' : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border-hairline" />

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-bold text-content-primary mb-3">Tiện nghi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {popularAmenities.map((amenity) => {
                    const isChecked = modalAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition ${
                          isChecked
                            ? 'border-rausch bg-rausch/5 text-content-primary font-bold'
                            : 'border-border text-content-secondary hover:border-content-primary hover:text-content-primary'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isChecked && <Check className="w-4 h-4 text-rausch shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border-hairline" />

              {/* Superhost & Rating */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-content-primary">Chủ nhà siêu cấp (Superhost)</div>
                    <div className="text-xs text-content-secondary">Lưu trú cùng các chủ nhà được đánh giá cao nhất</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={modalSuperhost}
                    onChange={(e) => setModalSuperhost(e.target.checked)}
                    className="w-5 h-5 accent-rausch rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-content-primary">Đánh giá từ 4.8★ trở lên</div>
                    <div className="text-xs text-content-secondary">Chỉ hiển thị phòng có điểm đánh giá xuất sắc</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={modalMinRating >= 4.8}
                    onChange={(e) => setModalMinRating(e.target.checked ? 4.8 : 0)}
                    className="w-5 h-5 accent-rausch rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 pb-8 sm:pb-4 border-t border-border-hairline flex items-center justify-between bg-surface-subtle shrink-0">
              <button
                type="button"
                onClick={() => {
                  setModalMinPrice(0);
                  setModalMaxPrice(10000000);
                  setModalSuperhost(false);
                  setModalMinRating(0);
                  setModalBedrooms(0);
                  setModalAmenities([]);
                }}
                className="text-xs font-bold underline text-content-secondary hover:text-content-primary"
              >
                Xóa tất cả
              </button>
              <button
                type="button"
                onClick={applyModalFilters}
                className="px-6 py-2.5 bg-content-primary text-white text-xs font-bold rounded-xl hover:bg-black transition shadow-sm"
              >
                Hiện kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
