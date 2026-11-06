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
      // Solid rich navy with subtle gradient depth
      dark:
        'bg-navy bg-gradient-to-r from-navy to-navy-2 text-white border border-navy-700 shadow-md rounded-lg p-6 sm:p-8',
      stat:
        'bg-white text-ink border border-line shadow-sm rounded-lg p-4 sm:p-5',
      muted:
        'bg-navy-50 text-ink border border-line rounded-lg p-4 sm:p-5',
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
