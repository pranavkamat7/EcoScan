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
      className={`relative overflow-hidden mb-6 sm:mb-8 brand-motif-hero ${className}`}
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

      {/* Subtle organic leaf & sparkle decorative motif (10-15% opacity) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-15 overflow-hidden">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full object-cover"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M320 40 C380 90, 390 180, 340 240 C280 300, 200 280, 210 200 C220 120, 260 60, 320 40 Z"
            fill="url(#headerGlow)"
          />
          <path
            d="M180 80 Q200 120 240 130 Q200 140 180 180 Q160 140 120 130 Q160 120 180 80 Z"
            fill="#55D62E"
            opacity="0.4"
          />
          <defs>
            <linearGradient id="headerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00B86B" />
              <stop offset="100%" stopColor="#55D62E" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </Card>
  );
};
