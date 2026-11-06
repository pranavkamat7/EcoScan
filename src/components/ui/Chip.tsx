import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
  variant?: 'filter' | 'tag';
}

export const Chip: React.FC<ChipProps> = ({
  children,
  active = false,
  count,
  icon,
  variant = 'filter',
  className = '',
  onClick,
  ...props
}) => {
  if (variant === 'tag') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-sm border transition-colors select-none ${
          active
            ? 'bg-forest text-lime border-forest'
            : 'bg-surface text-ink border-border'
        } ${className}`}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {typeof count === 'number' && (
          <span className="tabular-nums opacity-80">({count})</span>
        )}
      </span>
    );
  }

  // FilterTab variant with signature lime underline
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-medium transition-colors select-none whitespace-nowrap outline-none flex-shrink-0 ${
        active
          ? 'text-ink font-semibold'
          : 'text-muted hover:text-ink font-normal'
      } ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={`text-xs tabular-nums ${
            active ? 'text-forest font-semibold' : 'text-faint'
          }`}
        >
          ({count})
        </span>
      )}
      {/* Lime active underline indicator */}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-lime rounded-full" />
      )}
    </button>
  );
};
