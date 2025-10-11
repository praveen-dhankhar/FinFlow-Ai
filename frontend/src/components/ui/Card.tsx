'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'gradient';
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
  ({ variant = 'default', hover = true, children, className, ...props }, ref) => {
    const baseStyles = 'rounded-lg border transition-all duration-300';

    const variants = {
      default: cn(
        'bg-white border-gray-200 shadow-sm',
        'dark:bg-gray-900 dark:border-gray-800'
      ),
      glass: cn(
        'bg-white/10 backdrop-blur-md border-white/20 shadow-xl',
        'dark:bg-gray-900/10 dark:border-gray-800/20'
      ),
      gradient: cn(
        'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md',
        'border-white/30 shadow-2xl',
        'dark:from-gray-900/20 dark:to-gray-900/5',
        'dark:border-gray-800/30'
      ),
    };

    const hoverVariants = {
      initial: { 
        scale: 1,
        y: 0,
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      },
      hover: { 
        scale: 1.02,
        y: -2,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
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
      className={cn('flex flex-col space-y-1.5 p-6', className)}
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
      className={cn('p-6 pt-0', className)}
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
      className={cn('flex items-center p-6 pt-0', className)}
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
