import React from 'react';

export interface StatNumberProps {
  value: string | number;
  label?: string;
  unit?: string;
  trend?: string;
  highlight?: boolean;
  className?: string;
}

export const StatNumber: React.FC<StatNumberProps> = ({
  value,
  label,
  unit,
  highlight = false,
  className = '',
}) => {
  return (
    <div className={`space-y-0.5 text-left ${className}`}>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-heading text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${
            highlight ? 'text-lime' : 'text-ink'
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-medium text-muted">
            {unit}
          </span>
        )}
      </div>
      {label && <p className="text-xs text-muted leading-tight">{label}</p>}
    </div>
  );
};
