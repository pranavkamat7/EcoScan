import React from 'react';
import { FeedFilter } from '../types';

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
  const tabs: { id: FeedFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'cleaned', label: 'Restored', count: counts.cleaned },
    { id: 'needs_cleaning', label: 'Needs clean', count: counts.needsCleaning },
    { id: 'nearby', label: 'Nearby' },
  ];

  return (
    <nav
      className="flex items-center gap-4 sm:gap-6 border-b border-[#E2DCCD] overflow-x-auto flex-nowrap pb-0 w-full"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      aria-label="Feed filters"
    >
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`whitespace-nowrap pb-2.5 text-xs sm:text-sm transition-colors border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
              isActive
                ? 'border-[#1E6B4B] text-[#1C2B24] font-semibold'
                : 'border-transparent text-[#6B7468] hover:text-[#1C2B24] font-normal'
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-xs tabular-nums ${
                  isActive ? 'text-[#1E6B4B] font-semibold' : 'text-[#A39E93]'
                }`}
              >
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
