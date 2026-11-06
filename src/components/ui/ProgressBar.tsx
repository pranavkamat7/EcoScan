import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  valueLabel?: string;
  variant?: 'lime' | 'mint' | 'forest';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  valueLabel,
  variant = 'lime',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantClasses = {
    lime: 'bg-lime',
    mint: 'bg-mint',
    forest: 'bg-forest',
  }[variant];

  return (
    <div className={`w-full space-y-1.5 text-left ${className}`}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && <span className="text-ink">{label}</span>}
          {valueLabel && <span className="text-muted tabular-nums">{valueLabel}</span>}
        </div>
      )}

      <div className="w-full h-2.5 bg-surface-muted border border-border rounded-sm overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-sm transition-all duration-300 ease-out ${variantClasses}`}
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
