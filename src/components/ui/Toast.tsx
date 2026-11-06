import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" />,
      border: 'border-mint/30',
      bg: 'bg-surface',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-coral flex-shrink-0" />,
      border: 'border-coral/30',
      bg: 'bg-surface',
    },
    info: {
      icon: <Info className="w-4 h-4 text-forest flex-shrink-0" />,
      border: 'border-border',
      bg: 'bg-surface',
    },
  }[type];

  return (
    <div
      role="alert"
      className={`fixed bottom-5 right-5 z-[80] max-w-sm flex items-center gap-3 p-3.5 sm:p-4 rounded-sm border shadow-lg ${typeConfig.border} ${typeConfig.bg} text-ink animate-slideUp select-none`}
    >
      {typeConfig.icon}
      <p className="text-xs sm:text-sm font-medium leading-tight flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="text-muted hover:text-ink p-1 rounded-sm transition-colors"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
