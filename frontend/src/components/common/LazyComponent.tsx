'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

interface LazyComponentProps {
  fallback?: React.ReactNode
  [key: string]: any
}

// Default loading fallback
const DefaultFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-32 w-full" />
  </div>
)

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyWrapper(props: T & LazyComponentProps) {
    const { fallback: propFallback, ...restProps } = props
    
    return (
      <Suspense fallback={propFallback || fallback || <DefaultFallback />}>
        <LazyComponent {...(restProps as T)} />
      </Suspense>
    )
  }
}

// Lazy load heavy components
export const LazyDashboard = withLazyLoading(() => import('@/app/(dashboard)/dashboard/page'))
export const LazyTransactions = withLazyLoading(() => import('@/app/(dashboard)/transactions/page'))
export const LazyCategories = withLazyLoading(() => import('@/app/(dashboard)/categories/page'))
export const LazyGoals = withLazyLoading(() => import('@/app/(dashboard)/goals/page'))
export const LazyBudgets = withLazyLoading(() => import('@/app/(dashboard)/budgets/page'))
export const LazyAnalytics = withLazyLoading(() => import('@/app/(dashboard)/analytics/page'))
export const LazyForecasts = withLazyLoading(() => import('@/app/(dashboard)/forecasts/page'))
export const LazySettings = withLazyLoading(() => import('@/app/(dashboard)/settings/page'))
export const LazyProfile = withLazyLoading(() => import('@/app/(dashboard)/profile/page'))

// Lazy load heavy UI components
export const LazyCharts = withLazyLoading(() => import('@/components/charts/ChartContainer'))
export const LazyDataTable = withLazyLoading(() => import('@/components/common/DataTable'))
export const LazyCommandPalette = withLazyLoading(() => import('@/components/search/CommandPalette'))

// Lazy load with custom fallbacks
export const LazyDashboardWithFallback = withLazyLoading(
  () => import('@/app/(dashboard)/dashboard/page'),
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  </div>
)

export const LazyAnalyticsWithFallback = withLazyLoading(
  () => import('@/app/(dashboard)/analytics/page'),
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-96 bg-gray-200 rounded"></div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  </div>
)
