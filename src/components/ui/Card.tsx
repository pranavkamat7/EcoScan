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
        'bg-surface text-ink border border-border shadow-sm rounded-lg p-5 sm:p-6',
      dark:
        'bg-forest text-white border border-forest-border shadow-md rounded-lg p-6 sm:p-8',
      stat:
        'bg-surface text-ink border border-border shadow-sm rounded-lg p-4 sm:p-5',
      muted:
        'bg-surface-muted text-ink border border-border rounded-lg p-4 sm:p-5',
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
