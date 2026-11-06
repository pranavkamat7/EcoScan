import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy/60 backdrop-blur-[2px] transition-opacity duration-180"
        aria-hidden="true"
      />

      {/* Modal Dialog Card (20px radius) */}
      <div
        className={`relative w-full ${sizeClasses} bg-white rounded-lg border border-line shadow-modal overflow-hidden z-10 my-auto transform transition-all duration-180 animate-scaleUp text-left ${className}`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-line bg-navy-50/50">
            <div className="space-y-1 pr-6">
              {title && (
                <h3 className="font-heading text-lg sm:text-xl font-bold text-navy leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-muted">{description}</p>
              )}
            </div>
            <IconButton
              label="Close modal"
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="-mr-1.5 -mt-1.5 text-muted hover:text-navy"
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};
