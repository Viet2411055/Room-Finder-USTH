import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { RoomGalleryModal } from './RoomGalleryModal';
import { optimizeImageUrl } from '../../utils/image';

interface BentoGalleryProps {
  images: string[];
  roomName: string;
}

export const BentoGallery: React.FC<BentoGalleryProps> = ({ images, roomName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const displayImages = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

  const heroImage = displayImages[0];
  const secondaryImages = displayImages.slice(1);

  // Group secondary images into pairs (2 photos per column)
  const columns: string[][] = [];
  for (let i = 0; i < secondaryImages.length; i += 2) {
    columns.push(secondaryImages.slice(i, i + 2));
  }

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden select-none group">
      {/* Bento Horizontal Scroll Container */}
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto bento-scroll-container pb-2 pt-1 no-scrollbar items-stretch h-[240px] sm:h-[320px] md:h-[400px]">
        {/* Column 1: 1 Single Large Hero Image */}
        <div
          onClick={() => openLightbox(0)}
          className="bento-scroll-item shrink-0 w-[80vw] sm:w-[440px] md:w-[500px] h-full rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer relative group/item"
        >
          <img
            src={optimizeImageUrl(heroImage, 1280)}
            alt={`${roomName} - Ảnh chính`}
            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
        </div>

        {/* Subsequent Columns: 2 Stacked Images Per Column */}
        {columns.map((pair, colIdx) => (
          <div
            key={colIdx}
            className="bento-scroll-item shrink-0 w-[55vw] sm:w-[260px] md:w-[300px] h-full flex flex-col gap-2 sm:gap-2.5"
          >
            {pair.map((img, rowIdx) => {
              const globalIndex = 1 + colIdx * 2 + rowIdx;
              return (
                <div
                  key={rowIdx}
                  onClick={() => openLightbox(globalIndex)}
                  className="flex-1 w-full rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer relative group/item"
                >
                  <img
                    src={optimizeImageUrl(img, 720)}
                    alt={`${roomName} - Ảnh ${globalIndex + 1}`}
                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Floating "Hiển thị tất cả ảnh" Button */}
      <button
        type="button"
        onClick={() => openLightbox(0)}
        className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/95 hover:bg-white text-content-primary rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 shadow-airbnb-search hover:shadow-airbnb-card border border-border transition-all z-20 backdrop-blur-sm active:scale-95"
      >
        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-content-primary" />
        <span>Hiển thị tất cả {displayImages.length} ảnh</span>
      </button>

      {/* Lightbox Modal */}
      <RoomGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={displayImages}
        roomName={roomName}
        initialIndex={selectedPhotoIndex}
      />
    </div>
  );
};
