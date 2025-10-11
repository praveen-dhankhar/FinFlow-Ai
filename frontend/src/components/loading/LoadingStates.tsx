'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

// Base skeleton component with animation
interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function AnimatedSkeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded',
        animate && 'animate-pulse',
        className
      )}
    />
  )
}

// Dashboard loading skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <AnimatedSkeleton className="h-8 w-64" />
        <AnimatedSkeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <AnimatedSkeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <AnimatedSkeleton className="h-8 w-20 mb-2" />
              <AnimatedSkeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <AnimatedSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <AnimatedSkeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <AnimatedSkeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <AnimatedSkeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Transactions loading skeleton
export function TransactionsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AnimatedSkeleton className="h-8 w-48" />
        <AnimatedSkeleton className="h-10 w-32" />
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <AnimatedSkeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Table */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <AnimatedSkeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <AnimatedSkeleton className="h-4 w-32" />
              <AnimatedSkeleton className="h-3 w-24" />
            </div>
            <AnimatedSkeleton className="h-6 w-16" />
            <AnimatedSkeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Categories loading skeleton
export function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AnimatedSkeleton className="h-8 w-40" />
        <AnimatedSkeleton className="h-10 w-32" />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AnimatedSkeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <AnimatedSkeleton className="h-4 w-24" />
                  <AnimatedSkeleton className="h-3 w-16" />
                </div>
                <AnimatedSkeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Goals loading skeleton
export function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AnimatedSkeleton className="h-8 w-32" />
        <AnimatedSkeleton className="h-10 w-28" />
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AnimatedSkeleton className="h-8 w-8 rounded" />
                <div className="flex-1">
                  <AnimatedSkeleton className="h-5 w-32 mb-2" />
                  <AnimatedSkeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <AnimatedSkeleton className="h-4 w-16" />
                  <AnimatedSkeleton className="h-4 w-20" />
                </div>
                <AnimatedSkeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between text-sm">
                  <AnimatedSkeleton className="h-3 w-12" />
                  <AnimatedSkeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Charts loading skeleton
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <AnimatedSkeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <AnimatedSkeleton className="w-full" style={{ height }} />
      </CardContent>
    </Card>
  )
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <AnimatedSkeleton key={i} className="h-4 w-20" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, j) => (
            <AnimatedSkeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Progressive loading component
interface ProgressiveLoadingProps {
  children: React.ReactNode
  isLoading: boolean
  skeleton: React.ReactNode
  className?: string
}

export function ProgressiveLoading({ children, isLoading, skeleton, className }: ProgressiveLoadingProps) {
  return (
    <div className={className}>
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

// Shimmer effect for loading states
export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="h-full w-full bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}

// Loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  )
}

// Loading overlay
interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
}

export function LoadingOverlay({ isLoading, children, message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
