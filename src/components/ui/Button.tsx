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
    // 12px radius, 180ms ease-out, Poppins/Inter brand typography
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-sm transition-all duration-180 select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-1';

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-xs sm:text-sm gap-2',
      lg: 'h-12 px-6 text-sm sm:text-base gap-2.5',
    }[size];

    const variantClasses = {
      // Primary: The ONE primary button style (Emerald background + white text)
      primary:
        'bg-emerald hover:bg-emerald-600 text-white font-semibold shadow-sm hover:shadow-md',
      // Secondary: White surface + Line border + Navy text
      secondary:
        'bg-white hover:bg-navy-50 text-navy border border-line hover:border-line-strong shadow-sm',
      // Ghost: Minimal chrome
      ghost:
        'bg-transparent hover:bg-navy-50 text-muted hover:text-navy',
      // Danger: Coral alert for destructive actions
      danger:
        'bg-coral hover:bg-coral-600 text-white font-semibold shadow-sm',
      // Lime: Navy text on Lime background (contrast compliant)
      lime:
        'bg-lime hover:bg-lime-600 text-navy font-bold shadow-sm hover:shadow-md',
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
