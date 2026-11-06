import React from 'react';
import { Card } from './Card';

export interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  stats?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  badge,
  stats,
  className = '',
}) => {
  return (
    <Card
      variant="dark"
      className={`relative overflow-hidden mb-6 sm:mb-8 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
        {/* Left: Title + Description */}
        <div className="space-y-1.5 max-w-2xl text-left">
          {badge && <div className="mb-2">{badge}</div>}
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
            {description}
          </p>
          {stats && <div className="pt-2">{stats}</div>}
        </div>

        {/* Right: Exactly ONE Primary Action */}
        {action && (
          <div className="flex-shrink-0 flex items-center md:self-center">
            {action}
          </div>
        )}
      </div>

      {/* Subtle decorative civic background accents */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />
    </Card>
  );
};
