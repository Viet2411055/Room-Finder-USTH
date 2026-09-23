import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Grid, Image as ImageIcon } from 'lucide-react';
import { optimizeImageUrl } from '../../utils/image';

interface RoomGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  roomName: string;
  initialIndex?: number;
}

export const RoomGalleryModal: React.FC<RoomGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  roomName,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setViewMode('slider');
  }, [initialIndex, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (viewMode === 'slider') {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, viewMode]);

  if (!isOpen) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col t-modal-backdrop select-none overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between text-white border-b border-white/10 shrink-0 bg-black/40 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs sm:text-sm font-semibold transition"
          aria-label="Đóng thư viện ảnh"
        >
          <X className="w-5 h-5" />
          <span className="hidden xs:inline">Đóng</span>
        </button>

        <div className="flex items-center gap-2">
          {viewMode === 'slider' && (
            <span className="text-xs sm:text-sm font-medium text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
          )}
          {/* View Mode Switcher */}
          <button
            onClick={() => setViewMode(viewMode === 'slider' ? 'grid' : 'slider')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold transition"
          >
            {viewMode === 'slider' ? (
              <>
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Xem tất cả</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Xem từng ảnh</span>
              </>
            )}
          </button>
        </div>

        <div className="text-xs sm:text-sm font-medium text-white/80 truncate max-w-[120px] sm:max-w-xs text-right">
          {roomName}
        </div>
      </div>

      {/* Main Content: Slider View or Grid View */}
      {viewMode === 'slider' ? (
        <div 
          className="flex-1 flex flex-col min-h-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Photo Area */}
          <div className="flex-1 relative flex items-center justify-center p-2 sm:p-6 min-h-0">
            {/* Left Nav Button */}
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 z-20 shadow-lg"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Current Image */}
            <div className="h-full w-full flex items-center justify-center overflow-hidden">
              <img
                src={optimizeImageUrl(images[currentIndex], 1600)}
                alt={`${roomName} - Ảnh ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-lg sm:rounded-xl shadow-2xl transition-all duration-200"
              />
            </div>

            {/* Right Nav Button */}
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 z-20 shadow-lg"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Bottom Thumbnails Carousel */}
          <div className="h-16 sm:h-20 bg-black/60 border-t border-white/10 flex items-center gap-2 px-3 sm:px-6 overflow-x-auto no-scrollbar shrink-0 pb-safe">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-11 w-16 sm:h-14 sm:w-20 rounded-md sm:rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-rausch scale-105 opacity-100 ring-2 ring-rausch/50'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img src={optimizeImageUrl(img, 320)} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Grid of All Photos */
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pb-8">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setViewMode('slider');
                }}
                className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer relative group bg-white/5 border border-white/10 hover:border-rausch transition-all"
              >
                <img
                  src={optimizeImageUrl(img, 720)}
                  alt={`${roomName} - Ảnh ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  Ảnh {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
