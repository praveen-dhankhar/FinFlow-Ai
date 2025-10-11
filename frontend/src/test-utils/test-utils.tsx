import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/components/ui'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now()
  await fn()
  const end = performance.now()
  return end - start
}

export const measureRenderTime = (component: ReactElement) => {
  const start = performance.now()
  const { unmount } = customRender(component)
  const end = performance.now()
  unmount()
  return end - start
}

// Memory leak detection utilities
export const checkForMemoryLeaks = () => {
  if (global.gc) {
    global.gc()
  }
  
  const memUsage = process.memoryUsage()
  return {
    rss: memUsage.rss,
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    external: memUsage.external,
  }
}

// Animation frame testing utilities
export const waitForAnimationFrame = () => {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}

export const waitForMultipleAnimationFrames = (count: number) => {
  return new Promise(resolve => {
    let frames = 0
    const callback = () => {
      frames++
      if (frames >= count) {
        resolve(undefined)
      } else {
        requestAnimationFrame(callback)
      }
    }
    requestAnimationFrame(callback)
  })
}

// Mock data generators for testing
export const generateMockTransaction = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  userId: '1',
  date: new Date().toISOString().split('T')[0],
  amount: Math.floor(Math.random() * 1000) + 100,
  category: 'Test Category',
  description: 'Test Transaction',
  type: 'EXPENSE' as const,
  tags: ['test'],
  notes: 'Test notes',
  receiptUrl: null,
  recurring: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const generateMockCategory = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  name: 'Test Category',
  description: 'Test category description',
  icon: 'Home',
  color: '#3B82F6',
  budget: 1000,
  parentId: undefined,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  order: 0,
  spending: {
    currentMonth: 500,
    lastMonth: 450,
    yearToDate: 6000,
  },
  transactionCount: 10,
  ...overrides,
})

// Test data sets
export const createLargeDataSet = (count: number, generator: () => any) => {
  return Array.from({ length: count }, generator)
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
