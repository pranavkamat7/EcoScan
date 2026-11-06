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
    <Card className={`text-center p-8 sm:p-12 space-y-4 max-w-lg mx-auto ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-forest text-lime flex items-center justify-center mx-auto shadow-sm">
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <h4 className="font-heading text-base sm:text-lg font-bold text-ink leading-tight">
          {title}
        </h4>
        {description && (
          <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
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
