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
        'bg-emerald hover:bg-emerald-600 text-white shadow-sm',
      secondary:
        'bg-white hover:bg-navy-50 text-navy border border-line hover:border-line-strong shadow-sm',
      ghost:
        'bg-transparent hover:bg-navy-50 text-muted hover:text-navy',
      danger:
        'bg-coral hover:bg-coral-600 text-white shadow-sm',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`inline-flex items-center justify-center rounded-sm transition-all duration-180 select-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-emerald ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
