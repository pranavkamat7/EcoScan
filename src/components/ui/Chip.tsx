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
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors select-none ${
          active
            ? 'bg-emerald text-white border-emerald shadow-sm'
            : 'bg-white text-navy border-line hover:border-line-strong'
        } ${className}`}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {typeof count === 'number' && (
          <span className="tabular-nums opacity-85">({count})</span>
        )}
      </button>
    );
  }

  // FilterTab variant with signature emerald active underline
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 pb-2.5 text-xs sm:text-sm font-medium transition-colors select-none whitespace-nowrap outline-none flex-shrink-0 ${
        active
          ? 'text-navy font-bold'
          : 'text-muted hover:text-navy font-normal'
      } ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {typeof count === 'number' && (
        <span
          className={`text-xs tabular-nums ${
            active ? 'text-emerald font-bold' : 'text-muted'
          }`}
        >
          ({count})
        </span>
      )}
      {/* Signature emerald active underline indicator */}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald rounded-full" />
      )}
    </button>
  );
};
