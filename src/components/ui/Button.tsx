import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      icon,
      iconRight,
      isLoading = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Strict 10px radius, 150-250ms ease-out, consistent typography
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-sm transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1';

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-xs sm:text-sm gap-2',
      lg: 'h-12 px-6 text-sm sm:text-base gap-2.5',
    }[size];

    const variantClasses = {
      // Signature primary: Forest background + electric lime text
      primary:
        'bg-forest hover:bg-forest-hover text-lime font-semibold shadow-sm border border-forest-border hover:shadow-md',
      // Lime alternate primary
      lime:
        'bg-lime hover:bg-lime-hover text-forest font-semibold shadow-sm border border-lime hover:shadow-md',
      // Secondary: crisp warm surface with border
      secondary:
        'bg-surface hover:bg-surface-hover text-ink border border-border hover:border-border-strong shadow-sm',
      // Ghost: minimal chrome
      ghost:
        'bg-transparent hover:bg-surface-muted text-muted hover:text-ink',
      // Danger: coral alert
      danger:
        'bg-coral hover:bg-coral-hover text-white font-medium shadow-sm',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
