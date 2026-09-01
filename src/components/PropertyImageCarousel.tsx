import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyImageCarouselProps {
  images: string[];
  title?: string;
  className?: string;
  aspectRatio?: 'video' | 'wide' | 'auto' | 'square';
  showThumbnails?: boolean;
  allowFullscreen?: boolean;
}

export const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({
  images,
  title = 'Propriété',
  className = '',
  aspectRatio = 'wide',
  showThumbnails = true,
  allowFullscreen = true,
}) => {
  // Ensure we have at least one image or fallback
  const validImages = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState<number>(0);

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  const goToImage = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, isFullscreen]);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video';
      case 'square':
        return 'aspect-square';
      case 'wide':
        return 'h-[320px] md:h-[420px] w-full';
      case 'auto':
      default:
        return 'h-full w-full';
    }
  };

  return (
    <div className={`flex flex-col gap-3 select-none ${className}`}>
      {/* Main Image Container */}
      <div className={`relative overflow-hidden bg-[#0D0D0D] border border-[#8C6D3E]/20 group ${getAspectClass()}`}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.img
            key={currentIndex}
            src={validImages[currentIndex]}
            alt={`${title} - Photo ${currentIndex + 1}`}
            decoding="async"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full object-cover object-center transform-gpu"
          />
        </AnimatePresence>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-10">
          <div className="bg-[#0D0D0D]/80 backdrop-blur-md border border-[#8C6D3E]/40 px-3 py-1 text-[#F9F7F2] font-sans text-[11px] font-semibold tracking-wider flex items-center gap-1.5 pointer-events-auto">
            <ImageIcon size={13} className="text-[#C5A059]" />
            <span>
              {currentIndex + 1} / {validImages.length}
            </span>
          </div>

          {allowFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Agrandir en plein écran"
              className="bg-[#0D0D0D]/80 hover:bg-[#C5A059] text-[#F9F7F2] hover:text-[#0D0D0D] p-2 backdrop-blur-md border border-[#8C6D3E]/40 transition-colors pointer-events-auto cursor-pointer"
            >
              <Maximize2 size={15} />
            </button>
          )}
        </div>

        {/* Navigation Arrow Controls (if more than 1 image) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0D0D0D]/80 hover:bg-[#C5A059] text-[#F9F7F2] hover:text-[#0D0D0D] border border-[#8C6D3E]/40 flex items-center justify-center transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-105 z-10 cursor-pointer shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0D0D0D]/80 hover:bg-[#C5A059] text-[#F9F7F2] hover:text-[#0D0D0D] border border-[#8C6D3E]/40 flex items-center justify-center transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-105 z-10 cursor-pointer shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot Indicators for quick visual status */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#0D0D0D]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 z-10">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-1.5 bg-[#C5A059]'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Aller à la photo ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Strip */}
      {showThumbnails && validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin pt-1">
          {validImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToImage(idx)}
              className={`relative shrink-0 w-20 h-14 md:w-24 md:h-16 overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                currentIndex === idx
                  ? 'border-[#C5A059] scale-[1.02] shadow-sm'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Miniature ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {currentIndex === idx && (
                <div className="absolute inset-0 bg-[#C5A059]/10" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0D0D0D]/95 backdrop-blur-lg flex flex-col justify-between p-4 md:p-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center text-[#F9F7F2] pb-4 border-b border-[#8C6D3E]/30">
              <div>
                <h3 className="font-serif text-lg md:text-xl font-bold text-[#F9F7F2]">{title}</h3>
                <span className="font-sans text-xs text-[#C5A059]">
                  Photo {currentIndex + 1} sur {validImages.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-white/10 hover:bg-[#C5A059] text-white hover:text-[#0D0D0D] transition-colors rounded-full cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Central High-Res View */}
            <div className="relative flex-grow flex items-center justify-center my-4 overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.img
                  key={currentIndex}
                  src={validImages[currentIndex]}
                  alt={`${title} - Plein écran ${currentIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl border border-[#8C6D3E]/30"
                />
              </AnimatePresence>

              {validImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0D0D0D]/80 hover:bg-[#C5A059] text-[#F9F7F2] hover:text-[#0D0D0D] border border-[#8C6D3E]/50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={28} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0D0D0D]/80 hover:bg-[#C5A059] text-[#F9F7F2] hover:text-[#0D0D0D] border border-[#8C6D3E]/50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Fullscreen Thumbnails */}
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
              {validImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToImage(idx)}
                  className={`w-16 h-12 md:w-20 md:h-14 overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    currentIndex === idx
                      ? 'border-[#C5A059] scale-105'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
