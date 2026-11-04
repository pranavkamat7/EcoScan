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
  beforeLabel = 'BEFORE (LITTERED)',
  afterLabel = 'AFTER (RESTORED)',
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
    <div className="relative w-full bg-slate-950 select-none overflow-hidden group">
      {/* View Mode & Fullscreen Controls Bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'slider' ? 'side-by-side' : 'slider')}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title={viewMode === 'slider' ? 'Switch to side-by-side view' : 'Switch to slider view'}
          aria-label="Toggle comparison view mode"
        >
          {viewMode === 'slider' ? (
            <Columns2 className="w-4 h-4" />
          ) : (
            <SlidersHorizontal className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title={isFullscreen ? 'Close full screen' : 'Expand full screen'}
          aria-label="Toggle fullscreen mode"
        >
          {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
          className={`relative w-full ${aspectRatioClass} overflow-hidden cursor-ew-resize touch-none focus:outline-none focus:ring-2 focus:ring-[#16A34A]`}
        >
          {/* Base Layer: AFTER (Restored) Image */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

          {/* After Badge: Top Right */}
          <div className="absolute top-3.5 right-14 sm:right-16 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase bg-black/75 text-green-300 rounded-full border border-green-500/40 shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
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
          <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase bg-black/75 text-orange-200 rounded-full border border-orange-400/40 shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              {beforeLabel}
            </span>
          </div>

          {/* Divider Line & Tactile Knob */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-[2px] h-full bg-white shadow-md relative">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-[#16A34A] border-2 border-[#16A34A] shadow-md flex items-center justify-center transition-all ${
                  isDragging
                    ? 'scale-110 ring-4 ring-[#16A34A]/30 bg-slate-50'
                    : 'hover:scale-105'
                }`}
              >
                <MoveHorizontal className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Interactive Hint */}
          {!hasInteracted && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 animate-bounce">
              <span className="px-3.5 py-1.5 text-xs font-bold tracking-wide bg-black/80 text-white rounded-full border border-white/20 shadow-md flex items-center gap-2 backdrop-blur-md">
                <MoveHorizontal className="w-3.5 h-3.5 text-[#16A34A]" />
                Drag slider to view cleanup
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Side by Side layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900 border border-orange-500/30">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-extrabold uppercase bg-black/80 text-orange-300 border border-orange-500/40 rounded-full shadow-md backdrop-blur-md">
              {beforeLabel}
            </span>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900 border border-green-500/30">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-extrabold uppercase bg-black/80 text-green-300 border border-green-500/40 rounded-full shadow-md backdrop-blur-md">
              {afterLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-modal border border-slate-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
