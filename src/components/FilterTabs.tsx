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
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
          currentFilter === 'all'
            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-sm scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'all'
              ? 'bg-black/20 text-white'
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
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
          currentFilter === 'cleaned'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm scale-[1.02]'
            : 'text-purple-700 hover:bg-purple-50'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-current" />
        <span>Restored</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
            currentFilter === 'cleaned'
              ? 'bg-black/20 text-white'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {counts.cleaned}
        </span>
      </button>

      {/* Needs Cleaning Tab */}
      <button
        type="button"
        onClick={() => onFilterChange('needs_cleaning')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
          currentFilter === 'nearby'
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Navigation className="w-3.5 h-3.5 text-violet-600" />
        <span>Nearby</span>
      </button>
    </div>
  );
};
