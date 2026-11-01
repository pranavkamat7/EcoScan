import React from 'react';
import { FeedFilter } from '../types';
import { Sparkles, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

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
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
          currentFilter === 'all'
            ? 'bg-[#181A19] text-white border-[#181A19]'
            : 'bg-white text-[#535A55] border-[#E3E3DC] hover:text-[#181A19] hover:bg-[#F9F9F6]'
        }`}
      >
        All Updates ({counts.all})
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('cleaned')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
          currentFilter === 'cleaned'
            ? 'bg-[#2D513B] text-white border-[#2D513B]'
            : 'bg-white text-[#233F2E] border-[#E3E3DC] hover:bg-[#F2F7F4]'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Transformed ({counts.cleaned})</span>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('needs_cleaning')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
          currentFilter === 'needs_cleaning'
            ? 'bg-[#BA4A2B] text-white border-[#BA4A2B]'
            : 'bg-white text-[#842D18] border-[#E3E3DC] hover:bg-[#FDF7F5]'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Needs Cleaning ({counts.needsCleaning})</span>
      </button>

      <button
        type="button"
        onClick={() => onFilterChange('nearby')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
          currentFilter === 'nearby'
            ? 'bg-[#181A19] text-white border-[#181A19]'
            : 'bg-white text-[#535A55] border-[#E3E3DC] hover:text-[#181A19] hover:bg-[#F9F9F6]'
        }`}
      >
        <Navigation className="w-3.5 h-3.5 text-[#2D513B]" />
        <span>Nearby Me</span>
      </button>
    </div>
  );
};

