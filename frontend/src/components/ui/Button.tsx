'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
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
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg',
        'hover:from-blue-700 hover:to-purple-700 hover:shadow-xl',
        'focus:ring-blue-500',
        'backdrop-blur-sm bg-white/10 border border-white/20'
      ),
      secondary: cn(
        'bg-gray-100 text-gray-900 border border-gray-200',
        'hover:bg-gray-200 hover:border-gray-300',
        'focus:ring-gray-500',
        'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
        'dark:hover:bg-gray-700 dark:hover:border-gray-600'
      ),
      ghost: cn(
        'text-gray-700 hover:bg-gray-100',
        'focus:ring-gray-500',
        'dark:text-gray-300 dark:hover:bg-gray-800'
      ),
      destructive: cn(
        'bg-red-600 text-white shadow-lg',
        'hover:bg-red-700 hover:shadow-xl',
        'focus:ring-red-500'
      ),
      outline: cn(
        'border border-gray-300 text-gray-700 bg-transparent',
        'hover:bg-gray-50 hover:border-gray-400',
        'focus:ring-gray-500',
        'dark:border-gray-600 dark:text-gray-300',
        'dark:hover:bg-gray-800 dark:hover:border-gray-500'
      ),
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      icon: 'h-4 w-4',
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
