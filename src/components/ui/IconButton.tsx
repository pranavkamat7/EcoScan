import React from 'react';

export type IconButtonVariant = 'secondary' | 'ghost' | 'primary' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      label,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    }[size];

    const variantClasses = {
      primary:
        'bg-forest hover:bg-forest-hover text-lime border border-forest-border shadow-sm',
      secondary:
        'bg-surface hover:bg-surface-hover text-ink border border-border hover:border-border-strong shadow-sm',
      ghost:
        'bg-transparent hover:bg-surface-muted text-muted hover:text-ink',
      danger:
        'bg-coral hover:bg-coral-hover text-white shadow-sm',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`inline-flex items-center justify-center rounded-sm transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-forest ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
