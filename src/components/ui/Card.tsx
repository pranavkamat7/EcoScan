import React from 'react';

export type CardVariant = 'default' | 'dark' | 'stat' | 'muted';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      interactive = false,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive || Boolean(onClick);

    const variantClasses = {
      default:
        'bg-white text-ink border border-line shadow-sm rounded-lg p-5 sm:p-6',
      // Solid Jet Black (No Blue, Crisp Border)
      dark:
        'bg-[#0A0D0C] text-white border border-[#222825] shadow-md rounded-lg p-6 sm:p-8',
      stat:
        'bg-white text-ink border border-line shadow-sm rounded-lg p-4 sm:p-5',
      muted:
        'bg-[#F8FAF9] text-ink border border-line rounded-lg p-4 sm:p-5',
    }[variant];

    const interactiveClasses = isInteractive
      ? 'interactive-card cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`${variantClasses} ${interactiveClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
