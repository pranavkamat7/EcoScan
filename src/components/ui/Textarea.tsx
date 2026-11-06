import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      disabled,
      className = '',
      id,
      rows = 3,
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

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          rows={rows}
          className={`w-full rounded-sm bg-white text-navy text-sm p-3.5 border transition-all duration-180 placeholder:text-muted/60 disabled:bg-navy-50 disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-emerald focus:border-emerald resize-y ${
            error
              ? 'border-coral focus:ring-coral/20'
              : 'border-line hover:border-line-strong'
          } ${className}`}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
