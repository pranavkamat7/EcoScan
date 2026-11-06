import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'restored'
  | 'needs_clean'
  | 'danger'
  | 'points'
  | 'pointsNavy'
  | 'sky'
  | 'neutral'
  | 'coral'
  | 'emerald'
  | 'warning';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  const variantClasses = {
    // Restored / After / Verified: Emerald tag with sky accents
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    restored: 'bg-emerald text-white font-bold shadow-sm',
    emerald: 'bg-emerald text-white font-bold shadow-sm',

    // Before / Needs clean / Urgent: Coral
    needs_clean: 'bg-coral text-white font-bold shadow-sm',
    coral: 'bg-coral text-white font-bold shadow-sm',
    danger: 'bg-coral-50 text-coral-800 border border-coral-200 font-semibold',
    warning: 'bg-coral-50 text-coral-800 border border-coral-200 font-semibold',

    // Points / Rewards / Level: Contrast-compliant (Navy text on Lime, or Lime text on Navy)
    points: 'bg-lime text-navy font-extrabold shadow-sm tabular-nums tracking-tight',
    pointsNavy: 'bg-navy text-lime font-extrabold border border-navy-700 shadow-sm tabular-nums tracking-tight',

    // Info / Map: Sky blue
    sky: 'bg-sky-50 text-sky-900 border border-sky-200 font-semibold',

    // Neutral
    neutral: 'bg-navy-50 text-muted border border-line font-medium',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-sm select-none tracking-normal ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
