import React from 'react';

export type LogoSize = 'sm' | 'md' | 'lg' | 'icon';
export type LogoVariant = 'default' | 'onDark' | 'badge';

export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  onClick?: () => void;
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  onClick,
  className = '',
  alt = 'EcoScan',
}) => {
  // Size specifications: 40-48px on desktop, 32-36px on mobile
  const heightClasses = {
    sm: 'h-8 sm:h-9',          /* 32-36px */
    md: 'h-10 sm:h-12',        /* 40-48px */
    lg: 'h-12 sm:h-16',        /* 48-64px */
    icon: 'w-10 h-10 sm:w-12 sm:h-12',
  }[size];

  const isIcon = size === 'icon';
  const src = isIcon ? '/images/logo-icon.png' : '/images/logo-web.png';

  const imageElement = (
    <img
      src={src}
      alt={alt}
      className={`${heightClasses} w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]`}
      loading="eager"
    />
  );

  // When used on dark backgrounds, wrap in a white rounded badge to maintain brand integrity
  if (variant === 'onDark') {
    const content = (
      <div className={`inline-flex items-center justify-center p-1.5 sm:p-2 bg-white rounded-sm shadow-sm border border-line ${className}`}>
        {imageElement}
      </div>
    );

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className="group inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-sm"
          title={`${alt} — Return to feed`}
        >
          {content}
        </button>
      );
    }
    return content;
  }

  if (variant === 'badge') {
    const content = (
      <div className={`inline-flex items-center justify-center p-2 bg-white rounded-md border border-line shadow-sm ${className}`}>
        {imageElement}
      </div>
    );

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className="group inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-md"
        >
          {content}
        </button>
      );
    }
    return content;
  }

  // Default clean layout on light surface with generous clear space
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-sm ${className}`}
        title={`${alt} — Return to feed`}
      >
        {imageElement}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {imageElement}
    </div>
  );
};
