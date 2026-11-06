import React, { useState, useRef, useCallback } from 'react';
import { Columns2, SlidersHorizontal, Maximize2, X, MoveHorizontal } from 'lucide-react';

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
  beforeLabel = 'Before',
  afterLabel = 'After',
  aspectRatioClass = 'aspect-[16/10]',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const newPosition = Math.max(0, Math.min(100, (x / width) * 100));
    setSliderPosition(newPosition);
    setHasInteracted(true);
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
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setHasInteracted(true);
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 4));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 4));
    }
  };

  const content = (
    <div className="relative w-full bg-[#1C2B24] select-none overflow-hidden group">
      {/* View Mode & Fullscreen Controls */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-[#1C2B24]/75 p-1 rounded-[6px] border border-white/10 shadow-subtle">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'slider' ? 'side-by-side' : 'slider')}
          className="p-1 rounded-[4px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title={viewMode === 'slider' ? 'Side-by-side view' : 'Slider view'}
          aria-label="Toggle comparison view mode"
        >
          {viewMode === 'slider' ? (
            <Columns2 className="w-3.5 h-3.5" />
          ) : (
            <SlidersHorizontal className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 rounded-[4px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title={isFullscreen ? 'Close fullscreen' : 'Expand fullscreen'}
          aria-label="Toggle fullscreen mode"
        >
          {isFullscreen ? <X className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          tabIndex={0}
          role="slider"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Before and after cleanup comparison slider"
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative w-full ${aspectRatioClass} overflow-hidden cursor-ew-resize touch-none focus:outline-none focus:ring-1 focus:ring-[#1E6B4B]`}
        >
          {/* Base Layer: AFTER (Restored) Image */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

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

          {/* Divider Line & Clean Tactile Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-[2px] h-full bg-white relative shadow-[0_0_4px_rgba(0,0,0,0.4)]">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-[#1C2B24] border border-[#E2DCCD] shadow-subtle flex items-center justify-center transition-transform ${
                  isDragging ? 'scale-110' : ''
                }`}
              >
                <MoveHorizontal className="w-3.5 h-3.5 text-[#1C2B24]" />
              </div>
            </div>
          </div>

          {/* Solid Tags at Bottom Corners (as requested: brick red for Before, green for After) */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-white bg-[#B3432E] rounded-[4px] shadow-subtle tracking-wide">
              {beforeLabel}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-white bg-[#2F8F5B] rounded-[4px] shadow-subtle tracking-wide">
              {afterLabel}
            </span>
          </div>

          {/* First interaction gentle hint */}
          {!hasInteracted && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 hidden sm:block">
              <span className="px-2.5 py-1 text-[11px] font-medium text-white/90 bg-[#1C2B24]/80 rounded-[4px] border border-white/10 shadow-subtle">
                Drag slider to compare
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Side by Side layout */
        <div className={`relative w-full ${aspectRatioClass} grid grid-cols-2 divide-x divide-white/20`}>
          <div className="relative h-full overflow-hidden">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-white bg-[#B3432E] rounded-[4px] shadow-subtle">
                {beforeLabel}
              </span>
            </div>
          </div>

          <div className="relative h-full overflow-hidden">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-3 right-3 z-10">
              <span className="inline-block px-2 py-0.5 text-[11px] font-semibold text-white bg-[#2F8F5B] rounded-[4px] shadow-subtle">
                {afterLabel}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
        <div className="relative w-full max-w-5xl rounded-[12px] overflow-hidden border border-white/10 shadow-modal">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
