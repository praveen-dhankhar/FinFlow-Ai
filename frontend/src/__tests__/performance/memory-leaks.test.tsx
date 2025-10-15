// Helper functions for testing
const checkForMemoryLeaks = () => {
  if (global.gc) {
    global.gc()
  }
  return process.memoryUsage()
}

const createLargeDataSet = (count: number, generator: () => any) => {
  return Array.from({ length: count }, generator)
}

const generateMockTransaction = () => ({
  id: Math.random().toString(36).substr(2, 9),
  description: `Transaction ${Math.random()}`,
  amount: Math.random() * 1000,
  date: new Date().toISOString(),
  type: 'expense',
  category: 'Test Category'
})

const generateMockCategory = () => ({
  id: Math.random().toString(36).substr(2, 9),
  name: `Category ${Math.random()}`,
  icon: '📁',
  color: '#3B82F6'
})
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { server } from '@/mocks/server'
import { rest } from 'msw'
import '@testing-library/jest-dom'

// Establish API mocking before all tests
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Memory Leak Tests', () => {
  test('should not leak memory during component mount/unmount cycles', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Mount and unmount component multiple times
    for (let i = 0; i < 20; i++) {
      const { unmount } = render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
      unmount()
    }

    // Force garbage collection
    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Memory increase should be minimal (less than 5MB)
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024)
  })

  test('should not leak memory with large datasets', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default
    
    // Create large dataset
    const largeTransactionSet = createLargeDataSet(1000, generateMockTransaction)

    // Mock API to return large dataset
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.json({
          data: largeTransactionSet.slice(0, 20),
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

    const initialMemory = checkForMemoryLeaks()

    // Mount component with large dataset
    const { unmount } = render(<TransactionsPage />)
    await waitFor(() => {
      expect(screen.getByText(/transactions/i)).toBeInTheDocument()
    })

    // Simulate user interactions
    const filterButton = screen.queryByText(/filters/i)
    if (filterButton) {
      filterButton.click()
    }

    // Unmount and check memory
    unmount()

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Should not leak significant memory even with large datasets
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // Less than 10MB
  })

  test('should not leak memory during API calls', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Mount component and trigger multiple API calls
    const { unmount } = render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Simulate multiple API calls (refresh data)
    for (let i = 0; i < 10; i++) {
      // Trigger data refresh by re-rendering
      const refreshButton = screen.queryByText(/refresh/i)
      if (refreshButton) {
        refreshButton.click()
        await waitFor(() => {
          expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
        })
      }
    }

    unmount()

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Should not leak memory from API calls
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024) // Less than 5MB
  })

  test('should not leak memory with event listeners', async () => {
    const CategoriesPage = require('@/app/(dashboard)/categories/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Mount component and trigger events
    const { unmount } = render(<CategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText(/categories/i)).toBeInTheDocument()
    })

    // Simulate various user interactions
    const addButton = screen.queryByText(/add category/i)
    if (addButton) {
      addButton.click()
      // Close modal if it opens
      const closeButton = screen.queryByText(/cancel/i)
      if (closeButton) {
        closeButton.click()
      }
    }

    // Trigger hover events
    const cards = screen.queryAllByTestId('category-card')
    cards.forEach(card => {
      card.dispatchEvent(new Event('mouseenter'))
      card.dispatchEvent(new Event('mouseleave'))
    })

    unmount()

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Should not leak memory from event listeners
    expect(memoryIncrease).toBeLessThan(3 * 1024 * 1024) // Less than 3MB
  })

  test('should not leak memory with timers and intervals', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Mount component (may have timers for auto-refresh)
    const { unmount } = render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Wait for any timers to run
    await new Promise(resolve => setTimeout(resolve, 1000))

    unmount()

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100))

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Should not leak memory from timers
    expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024) // Less than 2MB
  })

  test('should not leak memory with React Query cache', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Mount multiple components that use React Query
    const components = []
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<TransactionsPage />)
      components.push(unmount)
      await waitFor(() => {
        expect(screen.getByText(/transactions/i)).toBeInTheDocument()
      })
    }

    // Unmount all components
    components.forEach(unmount => unmount())

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // React Query should clean up cache properly
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024) // Less than 5MB
  })

  test('should not leak memory with form inputs', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Mount component and interact with forms
    const { unmount } = render(<TransactionsPage />)
    await waitFor(() => {
      expect(screen.getByText(/transactions/i)).toBeInTheDocument()
    })

    // Open add transaction modal
    const addButton = screen.queryByText(/add transaction/i)
    if (addButton) {
      addButton.click()
      
      // Fill form inputs
      const inputs = screen.queryAllByRole('textbox')
      inputs.forEach(input => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      // Close modal
      const cancelButton = screen.queryByText(/cancel/i)
      if (cancelButton) {
        cancelButton.click()
      }
    }

    unmount()

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Should not leak memory from form inputs
    expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024) // Less than 2MB
  })

  test('should not leak memory with animations', async () => {
    const CategoriesPage = require('@/app/(dashboard)/categories/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Mount component and trigger animations
    const { unmount } = render(<CategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText(/categories/i)).toBeInTheDocument()
    })

    // Trigger animations
    const cards = screen.queryAllByTestId('category-card')
    for (let i = 0; i < 10; i++) {
      cards.forEach(card => {
        card.dispatchEvent(new Event('mouseenter'))
        card.dispatchEvent(new Event('mouseleave'))
      })
    }

    unmount()

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Should not leak memory from animations
    expect(memoryIncrease).toBeLessThan(3 * 1024 * 1024) // Less than 3MB
  })

  test('should not leak memory with navigation', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default
    const CategoriesPage = require('@/app/(dashboard)/categories/page').default
    
    const initialMemory = checkForMemoryLeaks()

    // Simulate navigation between pages
    const pages = [DashboardPage, TransactionsPage, CategoriesPage]
    
    for (let i = 0; i < 3; i++) {
      const { unmount } = render(pages[i])
      await waitFor(() => {
        expect(screen.getByText(/dashboard|transactions|categories/i)).toBeInTheDocument()
      })
      unmount()
    }

    if (global.gc) {
      global.gc()
    }

    const finalMemory = checkForMemoryLeaks()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Should not leak memory from navigation
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024) // Less than 5MB
  })
})
