'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      className,
      glow = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-xl';

    const variants = {
      primary: cn(
        'gradient-primary text-white shadow-lg shadow-purple-500/25',
        'hover:shadow-purple-500/40 border border-white/10',
        'focus:ring-blue-500'
      ),
      secondary: cn(
        'bg-white text-gray-900 border border-gray-200',
        'hover:bg-gray-50 hover:border-gray-300',
        'focus:ring-gray-500',
        'dark:bg-white/10 dark:text-white dark:border-white/10',
        'dark:hover:bg-white/20 dark:hover:border-white/20'
      ),
      glass: cn(
        'glass text-white border border-white/20',
        'hover:bg-white/20 hover:border-white/30',
        'focus:ring-white/50'
      ),
      ghost: cn(
        'text-gray-600 hover:bg-gray-100',
        'focus:ring-gray-500',
        'dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
      ),
      destructive: cn(
        'bg-red-500 text-white shadow-lg shadow-red-500/25',
        'hover:bg-red-600 hover:shadow-red-500/40',
        'focus:ring-red-500'
      ),
      outline: cn(
        'border border-gray-300 text-gray-700 bg-transparent',
        'hover:bg-gray-50 hover:border-gray-400',
        'focus:ring-gray-500',
        'dark:border-white/20 dark:text-gray-300',
        'dark:hover:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'
      ),
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    const iconSizes = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      icon: 'h-5 w-5',
    };

    const buttonVariants = {
      initial: { scale: 1 },
      hover: {
        scale: 1.02,
        transition: { duration: 0.2 }
      },
      tap: {
        scale: 0.98,
        transition: { duration: 0.1 }
      },
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glow && 'animate-pulse-glow',
          className
        )}
        disabled={isDisabled}
        variants={buttonVariants}
        initial="initial"
        whileHover={!isDisabled ? "hover" : "initial"}
        whileTap={!isDisabled ? "tap" : "initial"}
        {...props}
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mr-2"
          >
            <Loader2 className={cn('animate-spin', iconSizes[size])} />
          </motion.div>
        )}

        {!loading && leftIcon && (
          <span className={cn('mr-2', iconSizes[size])}>
            {leftIcon}
          </span>
        )}

        {children && (
          <motion.span
            initial={{ opacity: loading ? 0 : 1 }}
            animate={{ opacity: loading ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.span>
        )}

        {!loading && rightIcon && (
          <span className={cn('ml-2', iconSizes[size])}>
            {rightIcon}
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
