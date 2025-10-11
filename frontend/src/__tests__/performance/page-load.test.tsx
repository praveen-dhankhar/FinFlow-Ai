import { measurePerformance, measureRenderTime, createLargeDataSet, generateMockTransaction } from '@/test-utils/test-utils'
import { render, screen, waitFor } from '@testing-library/react'
import { server } from '@/mocks/server'
import { rest } from 'msw'

// Establish API mocking before all tests
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Page Load Performance Tests', () => {
  test('dashboard page should load within 3 seconds', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    const loadTime = await measurePerformance(async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })

    expect(loadTime).toBeLessThan(3000) // 3 seconds
  })

  test('transactions page should load within 3 seconds', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default

    const loadTime = await measurePerformance(async () => {
      render(<TransactionsPage />)
      await waitFor(() => {
        expect(screen.getByText(/transactions/i)).toBeInTheDocument()
      })
    })

    expect(loadTime).toBeLessThan(3000) // 3 seconds
  })

  test('categories page should load within 3 seconds', async () => {
    const CategoriesPage = require('@/app/(dashboard)/categories/page').default

    const loadTime = await measurePerformance(async () => {
      render(<CategoriesPage />)
      await waitFor(() => {
        expect(screen.getByText(/categories/i)).toBeInTheDocument()
      })
    })

    expect(loadTime).toBeLessThan(3000) // 3 seconds
  })

  test('forecasts page should load within 3 seconds', async () => {
    const ForecastsPage = require('@/app/(dashboard)/forecasts/page').default

    const loadTime = await measurePerformance(async () => {
      render(<ForecastsPage />)
      await waitFor(() => {
        expect(screen.getByText(/forecasts/i)).toBeInTheDocument()
      })
    })

    expect(loadTime).toBeLessThan(3000) // 3 seconds
  })

  test('should handle large datasets efficiently', async () => {
    // Create a large dataset of transactions
    const largeTransactionSet = createLargeDataSet(1000, generateMockTransaction)

    // Mock API to return large dataset
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.json({
          data: largeTransactionSet.slice(0, 20), // Return first 20 for pagination
          pagination: {
            totalElements: largeTransactionSet.length,
            totalPages: Math.ceil(largeTransactionSet.length / 20),
            currentPage: 0,
            pageSize: 20,
            hasNext: true,
            hasPrevious: false,
          },
        }))
      })
    )

    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default

    const loadTime = await measurePerformance(async () => {
      render(<TransactionsPage />)
      await waitFor(() => {
        expect(screen.getByText(/transactions/i)).toBeInTheDocument()
      })
    })

    expect(loadTime).toBeLessThan(3000) // Should still load within 3 seconds
  })

  test('should handle slow API responses gracefully', async () => {
    // Mock slow API response
    server.use(
      rest.get('/api/dashboard', (req, res, ctx) => {
        return res(ctx.delay(2000), ctx.json({
          stats: {
            currentBalance: 1000,
            monthlyIncome: 5000,
            monthlyExpenses: 3000,
            savingsRate: 40,
            previousMonthIncome: 4800,
            previousMonthExpenses: 3200,
            previousMonthSavingsRate: 33,
          },
          spendingCategories: [],
          recentTransactions: [],
          forecastPreview: {
            projection: [],
            confidence: 0.8,
            trend: 'up',
            change: 5,
          },
        }))
      })
    )

    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    const loadTime = await measurePerformance(async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })

    // Should handle slow API gracefully and still load within reasonable time
    expect(loadTime).toBeLessThan(5000) // 5 seconds for slow API
  })

  test('should not have memory leaks during repeated renders', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default
    const initialMemory = process.memoryUsage()

    // Render and unmount multiple times
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
      unmount()
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    const finalMemory = process.memoryUsage()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
  })

  test('should render components efficiently', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    const renderTime = measureRenderTime(<DashboardPage />)

    expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
  })

  test('should handle concurrent API requests efficiently', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    const loadTime = await measurePerformance(async () => {
      // Render multiple instances concurrently
      const promises = Array.from({ length: 5 }, () => {
        return new Promise<void>((resolve) => {
          const { unmount } = render(<DashboardPage />)
          setTimeout(() => {
            unmount()
            resolve()
          }, 100)
        })
      })

      await Promise.all(promises)
    })

    expect(loadTime).toBeLessThan(2000) // Should handle concurrent requests efficiently
  })

  test('should maintain performance with complex filters', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default

    const loadTime = await measurePerformance(async () => {
      render(<TransactionsPage />)
      await waitFor(() => {
        expect(screen.getByText(/transactions/i)).toBeInTheDocument()
      })

      // Simulate complex filtering operations
      const filterButton = screen.getByText(/filters/i)
      if (filterButton) {
        filterButton.click()
      }
    })

    expect(loadTime).toBeLessThan(3000) // Should handle complex filters efficiently
  })
})
