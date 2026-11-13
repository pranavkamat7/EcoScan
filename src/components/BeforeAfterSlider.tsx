import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, MoveHorizontal, Maximize2, X } from 'lucide-react';
import { Badge } from './ui';

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeUrl?: string;
  afterUrl?: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatioClass?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
  aspectRatioClass = 'aspect-[16/10] sm:aspect-[16/9]',
  className = '',
}) => {
  const finalBefore = beforeImage || beforeUrl || '';
  const finalAfter = afterImage || afterUrl || '';
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(position);
      setHasInteracted(true);
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
      setHasInteracted(true);
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
      setHasInteracted(true);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  return (
    <div
      className={`relative select-none overflow-hidden bg-navy-100 ${className} ${
        isFullscreen
          ? 'fixed inset-0 z-[70] bg-navy/95 flex items-center justify-center p-4'
          : ''
      }`}
    >
      {/* View Mode & Fullscreen Controls */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'slider' ? 'side-by-side' : 'slider')}
          className="p-1.5 rounded-sm bg-navy/75 hover:bg-navy text-white transition-colors shadow-sm"
          title={viewMode === 'slider' ? 'Side-by-side view' : 'Split slider view'}
          aria-label="Toggle comparison view"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-sm bg-navy/75 hover:bg-navy text-white transition-colors shadow-sm"
          title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          aria-label="Toggle fullscreen comparison"
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
          className={`relative w-full ${aspectRatioClass} overflow-hidden cursor-ew-resize touch-none focus:outline-none focus:ring-2 focus:ring-emerald`}
        >
          {/* Base Layer: AFTER (Restored) Image */}
          <img
            src={finalAfter}
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
              src={finalBefore}
              alt={beforeLabel}
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: '100%',
              }}
              loading="lazy"
            />
          </div>

          {/* Divider Line & Tactile Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-[2px] h-full bg-white relative shadow-[0_0_6px_rgba(23,37,54,0.45)]">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-navy border border-line shadow-md flex items-center justify-center transition-transform ${
                  isDragging ? 'scale-110' : ''
                }`}
              >
                <MoveHorizontal className="w-4 h-4 text-navy" />
              </div>
            </div>
          </div>

          {/* Solid Corner Tags: Coral for Before (bottom-left), Emerald for After (bottom-right) */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <Badge variant="coral" size="sm">
              {beforeLabel}
            </Badge>
          </div>

          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <Badge variant="emerald" size="sm">
              {afterLabel}
            </Badge>
          </div>

          {/* First interaction gentle hint */}
          {!hasInteracted && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 hidden sm:block">
              <span className="px-3 py-1 text-[11px] font-semibold text-white bg-navy/80 rounded-sm border border-white/10 shadow-sm">
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
              src={finalBefore}
              alt={beforeLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-3 left-3">
              <Badge variant="coral" size="sm">
                {beforeLabel}
              </Badge>
            </div>
          </div>

          <div className="relative h-full overflow-hidden">
            <img
              src={finalAfter}
              alt={afterLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-3 right-3">
              <Badge variant="emerald" size="sm">
                {afterLabel}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
