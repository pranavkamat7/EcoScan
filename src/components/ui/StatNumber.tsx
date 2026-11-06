import React from 'react';

export interface StatNumberProps {
  value: string | number;
  label?: string;
  unit?: string;
  trend?: string;
  highlight?: boolean;
  onDark?: boolean;
  className?: string;
}

export const StatNumber: React.FC<StatNumberProps> = ({
  value,
  label,
  unit,
  highlight = false,
  onDark = false,
  className = '',
}) => {
  const numberColor = highlight
    ? onDark
      ? 'text-lime font-extrabold'
      : 'text-emerald font-extrabold'
    : onDark
    ? 'text-white font-bold'
    : 'text-navy font-bold';

  return (
    <div className={`space-y-0.5 text-left ${className}`}>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-heading text-xl sm:text-2xl tabular-nums tracking-tight ${numberColor}`}
        >
          {value}
        </span>
        {unit && (
          <span className={`text-xs sm:text-sm font-medium ${onDark ? 'text-white/70' : 'text-muted'}`}>
            {unit}
          </span>
        )}
      </div>
      {label && (
        <p className={`text-xs leading-tight ${onDark ? 'text-white/70' : 'text-muted'}`}>
          {label}
        </p>
      )}
    </div>
  );
};
