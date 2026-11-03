import React, { useState, useRef, useCallback } from 'react';
import { Columns2, SlidersHorizontal, Maximize2, X, MoveHorizontal, Sparkles } from 'lucide-react';

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
    <div className="w-full select-none overflow-hidden bg-slate-950">
      {/* Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-white">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-wider font-extrabold text-violet-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Transformation Proof
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold">
            {Math.round(100 - sliderPosition)}% Restored
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'slider'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Slider
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns2 className="w-3 h-3" />
              Split
            </button>
          </div>

          {/* Fullscreen Expand */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
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
          } overflow-hidden bg-slate-950 cursor-ew-resize select-none touch-none focus:outline-none`}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase bg-black/75 text-violet-200 rounded-full border border-violet-400/40 shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
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
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-violet-600 border-2 border-violet-500 shadow-md flex items-center justify-center transition-all ${
                  isDragging
                    ? 'scale-110 ring-4 ring-violet-500/30 bg-slate-50'
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
                <MoveHorizontal className="w-3.5 h-3.5 text-violet-400" />
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
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900 border border-violet-500/30">
            <img
              src={afterImage}
              alt={afterLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-extrabold uppercase bg-black/80 text-violet-300 border border-violet-500/40 rounded-full shadow-md backdrop-blur-md">
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
