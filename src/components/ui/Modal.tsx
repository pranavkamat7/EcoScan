import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden animate-fadeIn"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy/70 backdrop-blur-xs transition-opacity duration-180"
        aria-hidden="true"
      />

      {/* Modal Dialog Card (Centered, never exceeds viewport, internal smooth scroll) */}
      <div
        className={`relative w-full ${sizeClasses} max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-white rounded-lg border border-line shadow-2xl z-10 my-auto transform transition-all duration-180 animate-scaleUp text-left overflow-hidden ${className}`}
      >
        {/* Header - Fixed at top */}
        {(title || description) && (
          <div className="flex-shrink-0 flex items-start justify-between p-4 sm:p-5 border-b border-line bg-navy-50/60">
            <div className="space-y-0.5 pr-6">
              {title && (
                <h3 className="font-heading text-base sm:text-lg font-bold text-navy leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-muted leading-relaxed">{description}</p>
              )}
            </div>
            <IconButton
              label="Close modal"
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="-mr-1.5 -mt-1 text-muted hover:text-navy"
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        )}

        {/* Scrollable Content Body with proper padding & bottom clearance */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
