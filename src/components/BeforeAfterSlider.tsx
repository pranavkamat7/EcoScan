import React, { useState, useRef, useCallback } from 'react';
import { Columns2, SlidersHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatioClass?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'CLEANED & RESTORED',
  aspectRatioClass = 'aspect-[16/10]',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const newPosition = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(newPosition);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className="w-full select-none">
      {/* Mode Switcher pill */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F4F4F0] border-b border-[#E3E3DC] text-xs text-[#535A55]">
        <span className="font-mono text-[11px] uppercase tracking-wider font-medium text-[#2C302D]">
          Proof Comparison
        </span>
        <div className="flex items-center gap-1 bg-white border border-[#E3E3DC] p-0.5 rounded-md">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition-colors ${
              viewMode === 'slider'
                ? 'bg-[#2D513B] text-white font-medium'
                : 'text-[#535A55] hover:text-[#181A19]'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-[#2D513B] text-white font-medium'
                : 'text-[#535A55] hover:text-[#181A19]'
            }`}
          >
            <Columns2 className="w-3 h-3" />
            Side by Side
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          role="slider"
          aria-valuenow={sliderPosition}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full ${aspectRatioClass} overflow-hidden bg-[#ECECE5] cursor-ew-resize select-none touch-none focus:outline-none focus:ring-2 focus:ring-[#2D513B]`}
        >
          {/* Base Layer: AFTER (Cleaned) Image */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />

          {/* After Badge: Top Right */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-[#14231A]/90 text-[#F2F7F4] rounded border border-white/20 backdrop-blur-none shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4D8262]"></span>
              {afterLabel}
            </span>
          </div>

          {/* Top Layer: BEFORE (Dirty) Image clipped by slider position */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: '100%',
              }}
              loading="lazy"
            />
          </div>

          {/* Before Badge: Top Left */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-[#842D18]/90 text-white rounded border border-white/20 backdrop-blur-none shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FDEEEA]"></span>
              {beforeLabel}
            </span>
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-[2px] h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] relative">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-[#181A19] border border-[#CACECB] shadow-md flex items-center justify-center transition-transform ${
                  isDragging ? 'scale-110 ring-2 ring-[#2D513B]' : 'hover:scale-105'
                }`}
              >
                <svg
                  className="w-4 h-4 text-[#2C302D]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18-6-6 6-6" />
                  <path d="m15 6 6 6-6 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Hint text at bottom center (fades slightly) */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-black/60 text-white/90 rounded border border-white/10">
              DRAG SLIDER TO REVEAL
            </span>
          </div>
        </div>
      ) : (
        /* Side by Side layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-[#E3E3DC] p-1">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#ECECE5]">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase bg-[#842D18] text-white rounded">
              {beforeLabel}
            </span>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#ECECE5]">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase bg-[#2D513B] text-white rounded">
              {afterLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

