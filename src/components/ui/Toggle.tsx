import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative inline-flex items-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-line-strong rounded-full peer-checked:bg-emerald peer-focus-visible:ring-2 peer-focus-visible:ring-emerald transition-colors duration-180" />
        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-180 peer-checked:translate-x-5 shadow-sm" />
      </div>
      {(label || description) && (
        <div className="text-left">
          {label && <p className="text-sm font-semibold text-navy leading-tight">{label}</p>}
          {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
};
