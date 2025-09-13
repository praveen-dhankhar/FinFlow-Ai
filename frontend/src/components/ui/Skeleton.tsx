'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'chart' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'rect', width, height, className, ...props }, ref) => {
    const shimmerVariants = {
      animate: {
        x: ['-100%', '100%'],
        transition: {
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        },
      },
    };

    const baseStyles = 'relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded';

    const variants = {
      text: 'h-4 w-full',
      card: 'h-32 w-full',
      chart: 'h-48 w-full',
      circle: 'rounded-full',
      rect: 'h-4 w-full',
    };

    const style = {
      width: width || undefined,
      height: height || undefined,
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          className
        )}
        style={style}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
          variants={shimmerVariants}
          animate="animate"
        />
      </motion.div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
export const SkeletonText = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="text" className={className} {...props} />
  )
);

export const SkeletonCard = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="card" className={className} {...props} />
  )
);

export const SkeletonChart = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="chart" className={className} {...props} />
  )
);

export const SkeletonCircle = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="circle" className={className} {...props} />
  )
);

// Compound skeleton components
export const SkeletonCardContent: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <SkeletonText className="h-4 w-3/4" />
    <SkeletonText className="h-4 w-1/2" />
    <SkeletonText className="h-4 w-5/6" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <SkeletonText className="h-4 w-1/4" />
        <SkeletonText className="h-4 w-1/3" />
        <SkeletonText className="h-4 w-1/6" />
        <SkeletonText className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <SkeletonCircle className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <SkeletonText className="h-4 w-3/4" />
          <SkeletonText className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

SkeletonText.displayName = 'SkeletonText';
SkeletonCard.displayName = 'SkeletonCard';
SkeletonChart.displayName = 'SkeletonChart';
SkeletonCircle.displayName = 'SkeletonCircle';

export { Skeleton };
