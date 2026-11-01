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
  beforeLabel = 'BEFORE (DIRTY)',
  afterLabel = 'AFTER (CLEANED)',
  aspectRatioClass = 'aspect-[16/10]',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
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
      // Ignore
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
    <div className="w-full select-none">
      {/* Control bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#F4F4F0] border-b border-[#E3E3DC] text-xs text-[#535A55]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[#181A19]">
            Visual Proof
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E3E3DC] text-[#2D513B] font-bold">
            {Math.round(100 - sliderPosition)}% Revealed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-white border border-[#E3E3DC] p-0.5 rounded-md shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 font-medium transition-colors ${
                viewMode === 'slider'
                  ? 'bg-[#2D513B] text-white shadow-xs'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Slider
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 font-medium transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-[#2D513B] text-white shadow-xs'
                  : 'text-[#535A55] hover:text-[#181A19]'
              }`}
            >
              <Columns2 className="w-3 h-3" />
              Split
            </button>
          </div>

          {/* Fullscreen Expand button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-md bg-white border border-[#E3E3DC] hover:bg-[#F2F2EC] text-[#535A55] hover:text-[#181A19] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
          >
            {isFullscreen ? <X className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
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
          className={`relative w-full ${
            isFullscreen ? 'h-[75vh]' : aspectRatioClass
          } overflow-hidden bg-[#181A19] cursor-ew-resize select-none touch-none focus:outline-none focus:ring-2 focus:ring-[#2D513B]`}
        >
          {/* Base Layer: AFTER (Cleaned) Image */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />

          {/* After Badge: Top Right */}
          <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#14231A]/90 text-white rounded border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#842D18]/90 text-white rounded border border-white/20 shadow-md">
              <span className="w-2 h-2 rounded-full bg-rose-300"></span>
              {beforeLabel}
            </span>
          </div>

          {/* Divider Line & Tactile Knob */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-[2px] h-full bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)] relative">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-[#181A19] border-2 border-[#181A19] shadow-xl flex items-center justify-center transition-all ${
                  isDragging ? 'scale-110 ring-4 ring-[#2D513B]/40 bg-[#EDF3EE]' : 'hover:scale-105'
                }`}
              >
                <MoveHorizontal className="w-4 h-4 text-[#2D513B]" />
              </div>
            </div>
          </div>

          {/* Subtle initial hint pill at bottom center */}
          {!hasInteracted && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 animate-bounce">
              <span className="px-3 py-1 text-[11px] font-medium tracking-wide bg-black/75 text-white rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                <MoveHorizontal className="w-3.5 h-3.5 text-yellow-300" />
                Drag to compare
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Side by Side layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-[#E3E3DC] p-1.5">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#ECECE5] rounded-xs">
            <img
              src={beforeImage}
              alt={beforeLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-[#842D18] text-white rounded shadow-sm">
              {beforeLabel}
            </span>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#ECECE5] rounded-xs">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-[#2D513B] text-white rounded shadow-sm">
              {afterLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
        <div className="w-full max-w-5xl bg-white rounded-lg overflow-hidden shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
