import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'sm' | 'lg' | 'full';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'sm',
  width,
  height,
}) => {
  const radiusClass = {
    sm: 'rounded-sm',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[variant];

  return (
    <div
      className={`skeleton-shimmer ${radiusClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
};
