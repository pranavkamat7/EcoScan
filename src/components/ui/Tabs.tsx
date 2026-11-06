import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  items,
  activeTab,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <nav
      className={`flex items-center gap-4 sm:gap-6 border-b border-border overflow-x-auto flex-nowrap pb-0 w-full ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      aria-label="Tabs"
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`relative pb-3 text-xs sm:text-sm font-medium transition-colors select-none whitespace-nowrap outline-none flex items-center gap-1.5 flex-shrink-0 ${
              isActive
                ? 'text-ink font-semibold'
                : 'text-muted hover:text-ink font-normal'
            }`}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={`text-xs tabular-nums ${
                  isActive ? 'text-forest font-semibold' : 'text-faint'
                }`}
              >
                ({item.count})
              </span>
            )}
            {/* Signature Lime Underline for active state */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-lime rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
