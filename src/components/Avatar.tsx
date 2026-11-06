import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  indicator?: 'online' | 'active' | 'clean' | 'needs_clean' | null;
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  className = '',
  size = 'md',
  indicator = null,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-20 h-20 text-xl font-serif font-bold',
  }[size];

  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className={`${sizeClasses} rounded-full object-cover border border-[#E2DCCD] bg-[#FFFDF8]`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-medium bg-[#E2DCCD] text-[#1C2B24] border border-[#D5CEBE] select-none`}
          title={name}
        >
          {initials}
        </div>
      )}

      {indicator === 'clean' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#2F8F5B] border-2 border-[#FFFDF8]" />
      )}
      {indicator === 'needs_clean' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#D9822B] border-2 border-[#FFFDF8]" />
      )}
      {indicator === 'online' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#1E6B4B] border-2 border-[#FFFDF8]" />
      )}
    </div>
  );
};
