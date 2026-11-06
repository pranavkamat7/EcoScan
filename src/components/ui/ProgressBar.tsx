import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  valueLabel?: string;
  variant?: 'brand' | 'lime' | 'emerald';
  onDark?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  valueLabel,
  variant = 'brand',
  onDark = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantClasses = {
    // Signature brand gradient: emerald #00B86B to lime #55D62E
    brand: 'bg-gradient-to-r from-emerald to-lime',
    lime: 'bg-lime',
    emerald: 'bg-emerald',
  }[variant];

  return (
    <div className={`w-full space-y-1.5 text-left ${className}`}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && (
            <span className={onDark ? 'text-white' : 'text-navy'}>{label}</span>
          )}
          {valueLabel && (
            <span
              className={`tabular-nums ${
                onDark ? 'text-lime font-bold' : 'text-muted'
              }`}
            >
              {valueLabel}
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full h-2.5 rounded-sm overflow-hidden p-[1px] border ${
          onDark
            ? 'bg-navy-900/60 border-navy-700'
            : 'bg-navy-50 border-line'
        }`}
      >
        <div
          className={`h-full rounded-sm transition-all duration-300 ease-out shadow-xs ${variantClasses}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
