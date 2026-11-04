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
    <div className="inline-flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      {/* All Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px] ${
          currentFilter === 'all'
            ? 'bg-[#17171F] text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-[#17171F] hover:bg-slate-100'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {counts.all}
        </span>
      </button>

      {/* Restored Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('cleaned')}
        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px] ${
          currentFilter === 'cleaned'
            ? 'bg-[#16A34A] text-white shadow-btn-green scale-[1.02]'
            : 'text-[#16A34A] hover:bg-green-50'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-current" />
        <span>Restored</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'cleaned'
              ? 'bg-white/20 text-white'
              : 'bg-green-100 text-[#16A34A]'
          }`}
        >
          {counts.cleaned}
        </span>
      </button>

      {/* Needs Cleaning Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('needs_cleaning')}
        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px] ${
          currentFilter === 'needs_cleaning'
            ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 text-white shadow-btn-orange scale-[1.02]'
            : 'text-orange-600 hover:bg-orange-50'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-current" />
        <span>Needs Clean</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'needs_cleaning'
              ? 'bg-black/20 text-white'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {counts.needsCleaning}
        </span>
      </button>

      {/* Nearby Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('nearby')}
        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px] ${
          currentFilter === 'nearby'
            ? 'bg-[#17171F] text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-[#17171F] hover:bg-slate-100'
        }`}
      >
        <Navigation className="w-3.5 h-3.5" />
        <span>Nearby</span>
      </button>
    </div>
  );
};
