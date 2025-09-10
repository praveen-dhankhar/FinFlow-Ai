import { http, HttpResponse } from 'msw'
import type { User, AuthResponse, FinancialData, Category } from '../../types'

// Mock data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  user: mockUser,
}

const mockFinancialData: FinancialData[] = [
  {
    id: 1,
    userId: 1,
    amount: 1000,
    category: 'Salary',
    description: 'Monthly salary',
    date: '2024-01-01',
    type: 'INCOME',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    amount: 500,
    category: 'Rent',
    description: 'Monthly rent',
    date: '2024-01-01',
    type: 'EXPENSE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Salary',
    description: 'Income from salary',
    color: '#10B981',
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Rent',
    description: 'Housing expenses',
    color: '#EF4444',
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      data: mockAuthResponse,
      success: true,
    })
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      data: mockAuthResponse,
      success: true,
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      data: null,
      success: true,
    })
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      data: { token: 'new-mock-jwt-token' },
      success: true,
    })
  }),

  // Financial data endpoints
  http.get('/api/financial-data', () => {
    return HttpResponse.json({
      data: {
        content: mockFinancialData,
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true,
      },
      success: true,
    })
  }),

  http.get('/api/financial-data/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const data = mockFinancialData.find(item => item.id === id)
    
    if (!data) {
      return HttpResponse.json(
        { message: 'Financial data not found', success: false },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      data,
      success: true,
    })
  }),

  http.post('/api/financial-data', () => {
    const newData: FinancialData = {
      id: 3,
      userId: 1,
      amount: 200,
      category: 'Food',
      description: 'Grocery shopping',
      date: '2024-01-02',
      type: 'EXPENSE',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    }
    
    return HttpResponse.json({
      data: newData,
      success: true,
    })
  }),

  // Categories endpoints
  http.get('/api/categories', () => {
    return HttpResponse.json({
      data: mockCategories,
      success: true,
    })
  }),

  http.get('/api/categories/:id', ({ params }) => {
    const id = parseInt(params.id as string)
    const data = mockCategories.find(item => item.id === id)
    
    if (!data) {
      return HttpResponse.json(
        { message: 'Category not found', success: false },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      data,
      success: true,
    })
  }),

  http.post('/api/categories', () => {
    const newCategory: Category = {
      id: 3,
      name: 'Transportation',
      description: 'Transportation expenses',
      color: '#3B82F6',
      userId: 1,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    }
    
    return HttpResponse.json({
      data: newCategory,
      success: true,
    })
  }),
]
