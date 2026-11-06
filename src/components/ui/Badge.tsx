import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'points' | 'neutral' | 'mint' | 'coral' | 'lime';

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
    // Restored / Cleaned / Success
    success: 'bg-mint-subtle text-mint border border-mint/20 font-medium',
    mint: 'bg-mint text-white font-semibold shadow-sm',
    // Needs clean / Before / Urgent / Danger
    danger: 'bg-coral-subtle text-coral border border-coral/20 font-medium',
    coral: 'bg-coral text-white font-semibold shadow-sm',
    // Warning / Open bounties
    warning: 'bg-amber-subtle text-amber border border-amber/30 font-medium',
    // Civic Points
    points: 'bg-forest text-lime font-semibold border border-forest-border shadow-sm tabular-nums',
    lime: 'bg-lime text-forest font-semibold shadow-sm tabular-nums',
    // Neutral
    neutral: 'bg-surface-muted text-muted border border-border font-medium',
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
