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
            className="block text-xs font-medium text-ink select-none"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          rows={rows}
          className={`w-full rounded-sm bg-surface text-ink text-sm p-3 border transition-all duration-200 placeholder:text-muted/60 disabled:bg-surface-muted disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-lime focus:border-forest resize-y ${
            error
              ? 'border-coral focus:ring-coral/20'
              : 'border-border hover:border-border-strong'
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
