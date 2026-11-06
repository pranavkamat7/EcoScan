import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-navy select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3.5 text-muted pointer-events-none flex items-center">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full h-10 rounded-sm bg-white text-navy text-sm border transition-all duration-180 placeholder:text-muted/60 disabled:bg-navy-50 disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-emerald focus:border-emerald ${
              startIcon ? 'pl-10' : 'pl-3.5'
            } ${endIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-coral focus:ring-coral/20'
                : 'border-line hover:border-line-strong'
            } ${className}`}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3.5 text-muted flex items-center">
              {endIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-coral font-medium flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
