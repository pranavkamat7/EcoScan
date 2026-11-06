import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <Card className={`relative text-center p-8 sm:p-12 space-y-4 max-w-lg mx-auto overflow-hidden ${className}`}>
      {/* Subtle brand motif */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald/5 rounded-full blur-2xl pointer-events-none" />

      {icon && (
        <div className="w-12 h-12 rounded-full bg-emerald text-white flex items-center justify-center mx-auto shadow-sm relative z-10">
          {icon}
        </div>
      )}

      <div className="space-y-1 relative z-10">
        <h4 className="font-heading text-base sm:text-lg font-bold text-navy leading-tight">
          {title}
        </h4>
        {description && (
          <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="pt-2 relative z-10">
          <Button
            variant="primary"
            size="md"
            icon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
};
