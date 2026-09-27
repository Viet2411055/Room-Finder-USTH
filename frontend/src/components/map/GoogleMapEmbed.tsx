import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as maptilersdk from '@maptiler/sdk';
import { Navigation } from 'lucide-react';
import { Listing } from '../../types';
import { optimizeImageUrl } from '../../utils/image';

// MapTiler API Key
const MAPTILER_API_KEY = '7yqiLbTHPEU42kJChoge';

// Zoom threshold below which POIs collapse to dots (Airbnb pattern)
const ZOOM_COLLAPSE_THRESHOLD = 11.5;
const CITY_COORDS: Record<string, [number, number, number]> = {
  'Hà Nội': [105.8542, 21.0285, 12],
  'Đà Nẵng': [108.2022, 16.0544, 13],
  'Hồ Chí Minh': [106.6297, 10.8231, 12],
};

interface GoogleMapEmbedProps {
  listings?: Listing[];
  singleListing?: Listing;
  centerCity?: string;
  hoveredListingId?: string | null;
  onHoverListing?: (id: string | null) => void;
  className?: string;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  listings = [],
  singleListing,
  centerCity = 'Hà Nội',
  hoveredListingId,
  onHoverListing,
  className = '',
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maptilersdk.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: maptilersdk.Marker; element: HTMLElement }>>(new Map());

  // Track whether the map is zoomed out far
  const [isZoomedOut, setIsZoomedOut] = useState(false);

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const onHoverRef = useRef(onHoverListing);
  onHoverRef.current = onHoverListing;

  const displayListings = useMemo(() => singleListing ? [singleListing] : listings, [listings, singleListing]);

  // 1. Initialize MapTiler Map with WebGL vector style
  useEffect(() => {
    if (!mapContainerRef.current) return;

    maptilersdk.config.apiKey = MAPTILER_API_KEY;

    let initialLng = 105.8542;
    let initialLat = 21.0285;
    let initialZoom = 12;

    if (singleListing && singleListing.latitude && singleListing.longitude) {
      initialLng = singleListing.longitude;
      initialLat = singleListing.latitude;
      initialZoom = 15;
    } else {
      const matchedCity = Object.keys(CITY_COORDS).find((c) =>
        centerCity.toLowerCase().includes(c.toLowerCase())
      );
      if (matchedCity) {
        [initialLng, initialLat, initialZoom] = CITY_COORDS[matchedCity];
      }
    }

    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS, // Standard Maps / Streets vector style
      center: [initialLng, initialLat],
      zoom: initialZoom,
      navigationControl: false,
      geolocateControl: false,
    });

    // Add navigation controls
    map.addControl(new maptilersdk.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

    mapInstanceRef.current = map;

    // Listen to zoom changes to toggle between compact pill and compact dot
    const handleZoom = () => {
      const z = map.getZoom();
      setIsZoomedOut(z < ZOOM_COLLAPSE_THRESHOLD);
    };

    map.on('zoom', handleZoom);
    handleZoom();

    // Trigger map resize once loaded to guarantee full container rendering
    const timer = setTimeout(() => {
      map.resize();
    }, 150);

    const handleWindowResize = () => {
      map.resize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleWindowResize);
      map.off('zoom', handleZoom);
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Adjust View when city or singleListing changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const syncView = () => {
      if (singleListing && singleListing.latitude && singleListing.longitude) {
        map.flyTo({ center: [singleListing.longitude, singleListing.latitude], zoom: 15, speed: 1.2 });
      } else if (displayListings.length > 0) {
        const validMarkers = displayListings.filter(
          (listing) => Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude)
        );
        if (validMarkers.length > 0) {
          const bounds = new maptilersdk.LngLatBounds();
          validMarkers.forEach((listing) => bounds.extend([listing.longitude, listing.latitude]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 14, speed: 1.2 });
        }
      } else {
        const matchedCity = Object.keys(CITY_COORDS).find((city) =>
          centerCity.toLowerCase().includes(city.toLowerCase())
        );
        const [lng, lat, zoom] = matchedCity ? CITY_COORDS[matchedCity] : [105.8542, 21.0285, 12];
        map.flyTo({ center: [lng, lat], zoom, speed: 1.2 });
      }
    };
    if (map.loaded()) syncView(); else map.once('load', syncView);
    return () => { map.off('load', syncView); };
  }, [centerCity, displayListings, singleListing]);

  // 3. Render and update interactive WebGL markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers that are not in current displayListings
    const currentListingIds = new Set(displayListings.map((l) => l.id));
    markersRef.current.forEach(({ marker }, id) => {
      if (!currentListingIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    displayListings.forEach((listing) => {
      if (typeof listing.latitude !== 'number' || typeof listing.longitude !== 'number') return;

      const formattedPrice = listing.price_per_night >= 1000000
        ? `${(listing.price_per_night / 1000000).toFixed(1)} tr`
        : `${(listing.price_per_night / 1000).toFixed(0)}k ₫`;

      const coverImg = optimizeImageUrl(listing.cover_image || listing.images?.[0] || '', 320);

      let markerRecord = markersRef.current.get(listing.id);

      if (!markerRecord) {
        const el = document.createElement('div');
        el.className = 'custom-maptiler-marker group cursor-pointer select-none';
        el.dataset.listingId = listing.id;

        el.innerHTML = `
          <!-- Normal Pill Price Pin (Fixed compact width, never scales) -->
          <div
            class="poi-pill hidden items-center justify-center px-2 py-0.5 min-w-[50px] max-w-[68px] h-[26px] rounded-full text-[11px] font-extrabold shadow-md transition-all duration-150 bg-white text-neutral-900 border border-neutral-300 hover:scale-105 whitespace-nowrap text-center"
          >
            <span class="truncate">${formattedPrice}</span>
          </div>

          <!-- Zoomed-Out Circle Dot Pin (Compact dot when viewing wide map) -->
          <div
            class="poi-dot hidden w-3 h-3 rounded-full bg-neutral-800 border-2 border-white shadow-md transition-all duration-150 hover:scale-125 hover:bg-black"
          ></div>

          <!-- Hover Popup Preview (Airbnb style tooltip) -->
          <div class="custom-marker-popup absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-white rounded-xl shadow-2xl border border-neutral-200 p-2 z-[9999] pointer-events-auto cursor-pointer animate-in fade-in duration-150">
            ${
              coverImg
                ? `<div class="relative aspect-[16/10] w-full rounded-lg overflow-hidden mb-1.5 bg-neutral-100">
                    <img src="${coverImg}" alt="${listing.name}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                   </div>`
                : ''
            }
            <div class="text-[11px] font-bold text-neutral-800 line-clamp-1">
              ${listing.name}
            </div>
            <div class="flex items-center justify-between mt-1 text-[10px] text-neutral-500 font-medium">
              <div class="flex items-center gap-0.5 text-amber-500 font-semibold">
                ★ <span>${listing.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span class="font-bold text-neutral-900">
                ${listing.price_per_night.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          navigateRef.current(`/rooms/${listing.id}`);
        });

        el.addEventListener('mouseenter', () => {
          if (onHoverRef.current) onHoverRef.current(listing.id);
        });

        el.addEventListener('mouseleave', () => {
          if (onHoverRef.current) onHoverRef.current(null);
        });

        const marker = new maptilersdk.Marker({ element: el, anchor: 'center' })
          .setLngLat([listing.longitude, listing.latitude])
          .addTo(map);

        markersRef.current.set(listing.id, { marker, element: el });
        markerRecord = { marker, element: el };
      }

      // Update appearance based on zoom and hover state
      const isHovered = hoveredListingId === listing.id;
      const pill = markerRecord.element.querySelector('.poi-pill') as HTMLElement | null;
      const dot = markerRecord.element.querySelector('.poi-dot') as HTMLElement | null;

      if (pill && dot) {
        // If hovered, always show the pill so user can see the price even when zoomed out
        if (isZoomedOut && !isHovered) {
          pill.classList.add('hidden');
          pill.classList.remove('flex');
          dot.classList.remove('hidden');
        } else {
          dot.classList.add('hidden');
          pill.classList.remove('hidden');
          pill.classList.add('flex');
        }

        // Apply active/hover styles
        if (isHovered) {
          pill.className = 'poi-pill flex items-center justify-center px-2 py-0.5 min-w-[50px] max-w-[68px] h-[26px] rounded-full text-[11px] font-extrabold shadow-xl transition-all duration-150 bg-neutral-900 text-white scale-110 ring-2 ring-white ring-offset-2 whitespace-nowrap text-center';
          markerRecord.element.style.zIndex = '999';
        } else {
          pill.className = 'poi-pill flex items-center justify-center px-2 py-0.5 min-w-[50px] max-w-[68px] h-[26px] rounded-full text-[11px] font-extrabold shadow-md transition-all duration-150 bg-white hover:bg-neutral-100 text-neutral-900 hover:scale-105 border border-neutral-300 whitespace-nowrap text-center';
          markerRecord.element.style.zIndex = '10';
        }
      }
    });
  }, [displayListings, hoveredListingId, isZoomedOut]);

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-surface-subtle border border-border shadow-inner ${className}`}>
      {/* 1. MapTiler WebGL Vector Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 2. Map Counter Indicator / Badge */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md border border-border flex items-center gap-2 text-xs font-semibold text-content-primary pointer-events-none z-[10]">
        <Navigation className="w-3.5 h-3.5 text-rausch animate-pulse" />
        <span>Bản đồ trực tiếp · {displayListings.length} nơi lưu trú</span>
      </div>
    </div>
  );
};
