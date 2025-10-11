import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { GlobalSearchProvider } from '@/components/search/GlobalSearchProvider'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
import { ErrorHandlingProvider } from '@/components/error/ErrorHandlingProvider'

// Mock providers for testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AccessibilityProvider>
          <ErrorHandlingProvider>
            <GlobalSearchProvider>
              {children}
            </GlobalSearchProvider>
          </ErrorHandlingProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data generators
export const mockTransaction = {
  id: '1',
  description: 'Test Transaction',
  amount: 100.50,
  type: 'EXPENSE',
  category: 'Food',
  date: '2024-01-15',
  tags: ['test'],
  notes: 'Test transaction',
  userId: 'user-1',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

export const mockCategory = {
  id: '1',
  name: 'Food',
  description: 'Food and dining expenses',
  icon: '🍕',
  color: '#3B82F6',
  isActive: true,
  parentId: null,
  order: 0,
  budget: 500,
  spending: {
    currentMonth: 250,
    lastMonth: 300,
    yearToDate: 3000,
  },
  transactionCount: 15,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

export const mockGoal = {
  id: '1',
  name: 'Emergency Fund',
  description: 'Build a 6-month emergency fund',
  targetAmount: 15000,
  currentAmount: 8500,
  targetDate: '2024-12-31',
  category: 'Emergency',
  categoryId: 'cat-emergency',
  icon: '🛡️',
  color: '#3B82F6',
  status: 'active',
  priority: 'high',
  autoSaveAmount: 500,
  autoSaveFrequency: 'monthly',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

export const mockBudget = {
  id: '1',
  name: 'Monthly Budget - January 2024',
  description: 'Monthly budget for January 2024',
  period: 'monthly',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  totalAmount: 5000,
  categories: [
    {
      id: 'budget-cat-1',
      categoryId: 'cat-food',
      categoryName: 'Food & Dining',
      budgetedAmount: 800,
      spentAmount: 650,
      remainingAmount: 150,
      percentage: 16,
      color: '#3B82F6',
      icon: '🍕',
    },
  ],
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://example.com/avatar.jpg',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1990-01-15',
  address: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
  },
  preferences: {
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
  },
  isActive: true,
  emailVerified: true,
  phoneVerified: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

// Mock API responses
export const mockApiResponses = {
  transactions: {
    data: [mockTransaction],
    pagination: {
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
      hasNext: false,
      hasPrevious: false,
    },
  },
  categories: [mockCategory],
  goals: [mockGoal],
  budgets: [mockBudget],
  user: mockUser,
}

// Mock functions
export const mockFunctions = {
  onAddTransaction: jest.fn(),
  onEditTransaction: jest.fn(),
  onDeleteTransaction: jest.fn(),
  onCreateCategory: jest.fn(),
  onEditCategory: jest.fn(),
  onDeleteCategory: jest.fn(),
  onCreateGoal: jest.fn(),
  onEditGoal: jest.fn(),
  onDeleteGoal: jest.fn(),
  onCreateBudget: jest.fn(),
  onEditBudget: jest.fn(),
  onDeleteBudget: jest.fn(),
  onUpdateProfile: jest.fn(),
  onExportData: jest.fn(),
  onImportData: jest.fn(),
}

// Test helpers
export const testHelpers = {
  // Wait for async operations
  waitFor: (callback: () => void, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const check = () => {
        try {
          callback()
          resolve(undefined)
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error)
          } else {
            setTimeout(check, 10)
          }
        }
      }
      check()
    })
  },

  // Mock localStorage
  mockLocalStorage: () => {
    const store: Record<string, string> = {}
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      }),
    }
  },

  // Mock fetch
  mockFetch: (response: any, status = 200) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      })
    ) as jest.Mock
  },

  // Mock fetch error
  mockFetchError: (message = 'Network error') => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error(message))
    ) as jest.Mock
  },

  // Create mock form data
  createMockFormData: (data: Record<string, any>) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return formData
  },

  // Generate test data
  generateTransactions: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      ...mockTransaction,
      id: `transaction-${i + 1}`,
      description: `Test Transaction ${i + 1}`,
      amount: Math.random() * 1000,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }))
  },

  generateCategories: (count: number) => {
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills']
    return Array.from({ length: count }, (_, i) => ({
      ...mockCategory,
      id: `category-${i + 1}`,
      name: categories[i % categories.length],
      order: i,
    }))
  },

  generateGoals: (count: number) => {
    const goals = ['Emergency Fund', 'Vacation', 'New Car', 'House Down Payment', 'Retirement']
    return Array.from({ length: count }, (_, i) => ({
      ...mockGoal,
      id: `goal-${i + 1}`,
      name: goals[i % goals.length],
      targetAmount: (i + 1) * 10000,
      currentAmount: (i + 1) * 5000,
    }))
  },
}

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (received: any) => {
    const pass = received && received.ownerDocument && received.ownerDocument.body.contains(received)
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
    }
  },
}

// Export everything
export * from '@testing-library/react'
export { customRender as render }
export { AllTheProviders }