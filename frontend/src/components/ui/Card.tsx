'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hover?: boolean;
  children?: React.ReactNode;
}

export interface CardHeaderProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
}

export interface CardBodyProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
}

export interface CardFooterProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', hover = true, children, className, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-300 overflow-hidden';

    const variants = {
      default: cn(
        'bg-white border-gray-200 shadow-sm',
        'dark:bg-gray-900 dark:border-gray-800'
      ),
      glass: cn(
        'glass border-white/10 shadow-lg shadow-black/5',
        'hover:bg-white/10 hover:border-white/20'
      ),
      gradient: cn(
        'gradient-card border-white/10 shadow-xl',
        'hover:shadow-purple-500/20'
      ),
      outline: cn(
        'bg-transparent border border-gray-200 dark:border-white/10',
        'hover:bg-gray-50 dark:hover:bg-white/5'
      ),
    };

    const hoverVariants = {
      initial: {
        y: 0,
      },
      hover: {
        y: -4,
        transition: { duration: 0.3, ease: 'easeOut' }
      },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        variants={hover ? hoverVariants : undefined}
        initial="initial"
        whileHover={hover ? "hover" : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-white/5', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('flex items-center p-6 pt-0 border-t border-white/5 bg-black/20', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
