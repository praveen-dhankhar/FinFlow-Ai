'use client';

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mask?: string;
  floatingLabel?: boolean;
  variant?: 'default' | 'glass';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      mask,
      floatingLabel = true,
      type = 'text',
      className,
      variant = 'glass',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState(props.value || '');

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasValue = value !== '' || isFocused;
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const baseStyles = 'w-full px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none text-white placeholder-gray-500';

    const variants = {
      default: 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:border-gray-700',
      glass: 'bg-white/5 border border-white/10 focus:bg-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm',
    };

    const stateStyles = {
      default: '',
      error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5',
      success: 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20 bg-green-500/5',
    };

    const getStateStyle = () => {
      if (hasError) return stateStyles.error;
      if (hasSuccess) return stateStyles.success;
      return stateStyles.default;
    };

    const shakeVariants = {
      shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      }
    };

    return (
      <div className="relative group">
        {floatingLabel && label && (
          <motion.label
            className={cn(
              'absolute left-4 transition-all duration-200 pointer-events-none z-10',
              hasValue || isFocused
                ? 'top-2 text-[10px] text-blue-400 font-medium'
                : 'top-3.5 text-sm text-gray-400'
            )}
            animate={{
              y: hasValue || isFocused ? -4 : 0,
            }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className={cn(
              "absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200",
              isFocused ? "text-blue-400" : "text-gray-500"
            )}>
              {leftIcon}
            </div>
          )}

          <motion.input
            ref={ref}
            type={inputType}
            className={cn(
              baseStyles,
              variants[variant],
              getStateStyle(),
              leftIcon && 'pl-11',
              (rightIcon || isPassword || hasSuccess || hasError) && 'pr-11',
              floatingLabel && label && 'pt-6 pb-2',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            variants={hasError ? shakeVariants : undefined}
            animate={hasError ? 'shake' : undefined}
            {...(props as any)}
          />

          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {hasSuccess && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-4 w-4 text-green-400" />
              </motion.div>
            )}

            {hasError && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="h-4 w-4 text-red-400" />
              </motion.div>
            )}

            {isPassword && (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </motion.button>
            )}

            {rightIcon && !isPassword && !hasSuccess && !hasError && (
              <div className="text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-xs text-red-400 ml-1 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
