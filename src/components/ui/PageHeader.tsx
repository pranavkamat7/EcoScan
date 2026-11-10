import React from 'react';

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
    <div
      className={`relative overflow-hidden mb-6 sm:mb-8 rounded-lg bg-[#0A0D0C] text-white border border-[#1C2420] shadow-xl p-6 sm:p-8 ${className}`}
    >
      {/* Top Emerald-Lime Active Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald via-lime to-emerald/20 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
        {/* Left: Title + Description */}
        <div className="space-y-2 max-w-2xl text-left">
          {badge && <div className="mb-2">{badge}</div>}
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
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

      {/* Signature EcoScan Emerald Ambient Lighting (No Dark Blue) */}
      <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute right-40 -bottom-24 w-72 h-72 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />
    </div>
  );
};
