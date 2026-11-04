import React from 'react';
import { FeedFilter } from '../types';
import { AlertTriangle, CheckCircle2, Navigation, Layers } from 'lucide-react';

interface FilterTabsProps {
  currentFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  counts: {
    all: number;
    needsCleaning: number;
    cleaned: number;
  };
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-[#1A1A24] border border-white/[0.08] shadow-xs">
      {/* All Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] sm:min-h-[38px] ${
          currentFilter === 'all'
            ? 'bg-white/[0.12] text-white shadow-xs scale-[1.02]'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-white/[0.08] text-slate-400'
          }`}
        >
          {counts.all}
        </span>
      </button>

      {/* Restored Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('cleaned')}
        className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] sm:min-h-[38px] ${
          currentFilter === 'cleaned'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
            : 'text-emerald-400 hover:bg-emerald-500/10'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-current" />
        <span>Restored</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'cleaned'
              ? 'bg-white/20 text-white'
              : 'bg-emerald-500/20 text-emerald-300'
          }`}
        >
          {counts.cleaned}
        </span>
      </button>

      {/* Needs Cleaning Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('needs_cleaning')}
        className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] sm:min-h-[38px] ${
          currentFilter === 'needs_cleaning'
            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white shadow-xs scale-[1.02]'
            : 'text-amber-400 hover:bg-amber-500/10'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-current" />
        <span>Needs Clean</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'needs_cleaning'
              ? 'bg-black/30 text-white'
              : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {counts.needsCleaning}
        </span>
      </button>

      {/* Nearby Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('nearby')}
        className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] sm:min-h-[38px] ${
          currentFilter === 'nearby'
            ? 'bg-white/[0.12] text-white shadow-xs scale-[1.02]'
            : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        <Navigation className="w-3.5 h-3.5" />
        <span>Nearby</span>
      </button>
    </div>
  );
};
