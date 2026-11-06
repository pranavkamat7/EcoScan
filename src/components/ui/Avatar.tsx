import React, { useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarIndicator = 'clean' | 'needs_clean' | 'online';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  indicator?: AvatarIndicator;
  className?: string;
}

export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'GM';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Volunteer',
  size = 'md',
  indicator,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size];

  const indicatorSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }[size];

  const indicatorColors = {
    clean: 'bg-mint ring-surface',
    needs_clean: 'bg-coral ring-surface',
    online: 'bg-lime ring-surface',
  };

  const showImage = Boolean(src && !imageError);

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClasses} rounded-full border border-border bg-surface-muted text-ink flex items-center justify-center font-serif font-bold tracking-tight overflow-hidden shadow-sm`}
        title={name}
      >
        {showImage ? (
          <img
            src={src!}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="leading-none text-forest">{initials}</span>
        )}
      </div>

      {indicator && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorSizeClasses} rounded-full ring-2 ${indicatorColors[indicator]}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
