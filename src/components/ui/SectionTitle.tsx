import React from 'react';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-baseline justify-between gap-4 pb-2 text-left ${className}`}>
      <div className="space-y-0.5">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-ink tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-muted font-normal">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
