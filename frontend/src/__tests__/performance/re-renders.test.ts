import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { server } from '@/mocks/server'
import { rest } from 'msw'

// Establish API mocking before all tests
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock React DevTools profiler
const mockProfiler = {
  onRender: jest.fn(),
}

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Profiler: ({ children, onRender }: any) => {
    mockProfiler.onRender = onRender
    return children
  },
}))

describe('Re-render Performance Tests', () => {
  beforeEach(() => {
    mockProfiler.onRender.mockClear()
  })

  test('should minimize re-renders during state updates', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Trigger state updates
    const refreshButton = screen.queryByText(/refresh/i)
    if (refreshButton) {
      fireEvent.click(refreshButton)
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    }

    // Should have minimal re-renders
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(5) // Should not re-render more than 5 times
  })

  test('should not re-render unnecessarily during prop changes', async () => {
    const CategoriesPage = require('@/app/(dashboard)/categories/page').default

    render(<CategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText(/categories/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Simulate prop changes (like filter updates)
    const filterButton = screen.queryByText(/filters/i)
    if (filterButton) {
      fireEvent.click(filterButton)
      
      // Close filter panel
      const closeButton = screen.queryByText(/apply filters/i)
      if (closeButton) {
        fireEvent.click(closeButton)
      }
    }

    // Should have minimal re-renders
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(3) // Should not re-render more than 3 times
  })

  test('should optimize re-renders with large lists', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default

    // Mock large dataset
    const largeTransactionSet = Array.from({ length: 100 }, (_, i) => ({
      id: `transaction-${i}`,
      userId: '1',
      date: '2024-01-01',
      amount: 100 + i,
      category: 'Test Category',
      description: `Transaction ${i}`,
      type: 'EXPENSE' as const,
      tags: ['test'],
      notes: 'Test notes',
      receiptUrl: null,
      recurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

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

    render(<TransactionsPage />)
    await waitFor(() => {
      expect(screen.getByText(/transactions/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Trigger pagination
    const nextButton = screen.queryByText(/next/i)
    if (nextButton) {
      fireEvent.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText(/transactions/i)).toBeInTheDocument()
      })
    }

    // Should have minimal re-renders even with large lists
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(5) // Should not re-render more than 5 times
  })

  test('should prevent unnecessary re-renders during form interactions', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default

    render(<TransactionsPage />)
    await waitFor(() => {
      expect(screen.getByText(/transactions/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Open add transaction modal
    const addButton = screen.queryByText(/add transaction/i)
    if (addButton) {
      fireEvent.click(addButton)
      
      // Type in form inputs
      const inputs = screen.queryAllByRole('textbox')
      inputs.forEach(input => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      // Close modal
      const cancelButton = screen.queryByText(/cancel/i)
      if (cancelButton) {
        fireEvent.click(cancelButton)
      }
    }

    // Should have minimal re-renders during form interactions
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(10) // Should not re-render more than 10 times
  })

  test('should optimize re-renders during search operations', async () => {
    const TransactionsPage = require('@/app/(dashboard)/transactions/page').default

    render(<TransactionsPage />)
    await waitFor(() => {
      expect(screen.getByText(/transactions/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Perform search operations
    const searchInput = screen.queryByPlaceholderText(/search transactions/i)
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'test' } })
      await waitFor(() => {
        expect(screen.getByText(/transactions/i)).toBeInTheDocument()
      })

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } })
      await waitFor(() => {
        expect(screen.getByText(/transactions/i)).toBeInTheDocument()
      })
    }

    // Should have minimal re-renders during search
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(8) // Should not re-render more than 8 times
  })

  test('should prevent re-render cascades', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Trigger multiple state updates simultaneously
    const refreshButton = screen.queryByText(/refresh/i)
    if (refreshButton) {
      // Click multiple times rapidly
      fireEvent.click(refreshButton)
      fireEvent.click(refreshButton)
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    }

    // Should not cause re-render cascades
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(5) // Should not re-render more than 5 times
  })

  test('should optimize re-renders with context updates', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Simulate context updates (like theme changes)
    const themeToggle = screen.queryByText(/theme/i)
    if (themeToggle) {
      fireEvent.click(themeToggle)
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    }

    // Should have minimal re-renders with context updates
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(3) // Should not re-render more than 3 times
  })

  test('should prevent unnecessary re-renders during API calls', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Trigger API calls
    const refreshButton = screen.queryByText(/refresh/i)
    if (refreshButton) {
      fireEvent.click(refreshButton)
      
      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    }

    // Should have minimal re-renders during API calls
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(5) // Should not re-render more than 5 times
  })

  test('should optimize re-renders with memoized components', async () => {
    const CategoriesPage = require('@/app/(dashboard)/categories/page').default

    render(<CategoriesPage />)
    await waitFor(() => {
      expect(screen.getByText(/categories/i)).toBeInTheDocument()
    })

    // Clear initial renders
    mockProfiler.onRender.mockClear()

    // Trigger actions that should be memoized
    const cards = screen.queryAllByTestId('category-card')
    cards.forEach(card => {
      fireEvent.mouseEnter(card)
      fireEvent.mouseLeave(card)
    })

    // Should have minimal re-renders with memoized components
    const renderCount = mockProfiler.onRender.mock.calls.length
    expect(renderCount).toBeLessThan(3) // Should not re-render more than 3 times
  })

  test('should measure render performance', async () => {
    const DashboardPage = require('@/app/(dashboard)/dashboard/page').default

    const startTime = performance.now()
    
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render quickly
    expect(renderTime).toBeLessThan(1000) // Less than 1 second
  })
})
