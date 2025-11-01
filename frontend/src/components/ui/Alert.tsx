'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function Alert({ className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-md border p-4 text-sm',
        'border-gray-200 text-gray-900 dark:border-gray-800 dark:text-gray-100',
        'bg-white dark:bg-gray-900',
        className,
      )}
      {...props}
    />
  )
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-gray-600 dark:text-gray-300', className)}
      {...props}
    />
  )
}


