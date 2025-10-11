import { http, HttpResponse } from 'msw'
import { mockCategories, mockCategoryInsights } from '@/lib/api/categories'
import { mockTransactions } from '@/lib/api/transactions'
import { mockDashboardData } from '@/lib/api/dashboard'

// Mock data generators
const generateId = () => Math.random().toString(36).substr(2, 9)
const generateDate = () => new Date().toISOString()

// Generate mock forecast data
const generateMockForecastData = (startDate?: string | null, endDate?: string | null, scenarioId?: string | null) => {
  const start = startDate ? new Date(startDate) : new Date()
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  
  const data = []
  const currentDate = new Date(start)
  
  // Historical data (last 6 months)
  const historicalStart = new Date()
  historicalStart.setMonth(historicalStart.getMonth() - 6)
  
  while (currentDate <= end) {
    const isHistorical = currentDate <= new Date()
    const baseAmount = 5000 + Math.sin(currentDate.getTime() / (1000 * 60 * 60 * 24 * 30)) * 1000 // Monthly variation
    const trend = (currentDate.getTime() - start.getTime()) / (365 * 24 * 60 * 60 * 1000) * 200 // Annual trend
    
    const predicted = baseAmount + trend + (Math.random() - 0.5) * 500
    const confidence = Math.max(0.7, 1 - (currentDate.getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)) // Confidence decreases over time
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      actual: isHistorical ? predicted + (Math.random() - 0.5) * 200 : undefined,
      predicted,
      confidenceLower: predicted * (1 - confidence * 0.2),
      confidenceUpper: predicted * (1 + confidence * 0.2),
    })
    
    currentDate.setDate(currentDate.getDate() + 7) // Weekly data points
  }
  
  return data
}

// Mock user data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  roles: ['USER'],
  isActive: true,
  createdAt: generateDate(),
  updatedAt: generateDate(),
}

// Mock authentication responses
const mockAuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: mockUser,
}

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post('/api/auth/refresh-token', () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUser)
  }),

  // Dashboard endpoints
  http.get('/api/dashboard', () => {
    return HttpResponse.json(mockDashboardData)
  }),

  // Transaction endpoints
  http.get('/api/transactions', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '20')
    const search = url.searchParams.get('search') || ''
    const type = url.searchParams.get('type') || 'ALL'
    const category = url.searchParams.get('category') || ''
    const startDate = url.searchParams.get('startDate') || ''
    const endDate = url.searchParams.get('endDate') || ''
    const sort = url.searchParams.get('sort') || 'date,desc'

    // Filter transactions based on query parameters
    let filteredTransactions = [...mockTransactions]

    if (search) {
      filteredTransactions = filteredTransactions.filter(t =>
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (type !== 'ALL') {
      filteredTransactions = filteredTransactions.filter(t => t.type === type)
    }

    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category)
    }

    if (startDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date >= startDate)
    }

    if (endDate) {
      filteredTransactions = filteredTransactions.filter(t => t.date <= endDate)
    }

    // Sort transactions
    const [sortField, sortOrder] = sort.split(',')
    filteredTransactions.sort((a, b) => {
      const aValue = a[sortField as keyof typeof a]
      const bValue = b[sortField as keyof typeof b]
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })

    // Paginate results
    const startIndex = page * size
    const endIndex = startIndex + size
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

    return HttpResponse.json({
      data: paginatedTransactions,
      pagination: {
        totalElements: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / size),
        currentPage: page,
        pageSize: size,
        hasNext: endIndex < filteredTransactions.length,
        hasPrevious: page > 0,
      },
    })
  }),

  http.get('/api/transactions/:id', ({ params }) => {
    const transaction = mockTransactions.find(t => t.id === params.id)
    if (!transaction) {
      return HttpResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(transaction)
  }),

  http.post('/api/transactions', async ({ request }) => {
    const newTransaction = await request.json()
    const transaction = {
      id: generateId(),
      ...newTransaction,
      userId: '1',
      createdAt: generateDate(),
      updatedAt: generateDate(),
    }
    mockTransactions.unshift(transaction)
    return HttpResponse.json(transaction, { status: 201 })
  }),

  http.put('/api/transactions/:id', async ({ params, request }) => {
    const updates = await request.json()
    const index = mockTransactions.findIndex(t => t.id === params.id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    mockTransactions[index] = {
      ...mockTransactions[index],
      ...updates,
      updatedAt: generateDate(),
    }

    return HttpResponse.json(mockTransactions[index])
  }),

  http.delete('/api/transactions/:id', ({ params }) => {
    const index = mockTransactions.findIndex(t => t.id === params.id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    mockTransactions.splice(index, 1)
    return HttpResponse.json({ message: 'Transaction deleted successfully' })
  }),

  http.post('/api/transactions/bulk-delete', async ({ request }) => {
    const { ids } = await request.json()
    const deletedCount = ids.filter((id: string) => {
      const index = mockTransactions.findIndex(t => t.id === id)
      if (index !== -1) {
        mockTransactions.splice(index, 1)
        return true
      }
      return false
    }).length

    return HttpResponse.json({
      message: `${deletedCount} transactions deleted successfully`,
      deletedCount,
    })
  }),

  http.get('/api/transactions/export', ({ request }) => {
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'csv'
    const ids = url.searchParams.get('ids')?.split(',') || []

    let transactionsToExport = mockTransactions
    if (ids.length > 0) {
      transactionsToExport = mockTransactions.filter(t => ids.includes(t.id))
    }

    if (format === 'csv') {
      const csvContent = [
        'Date,Description,Amount,Category,Type,Tags,Notes',
        ...transactionsToExport.map(t => 
          `${t.date},${t.description},${t.amount},${t.category},${t.type},"${t.tags.join(',')}",${t.notes || ''}`
        ).join('\n')
      ].join('\n')

      return new HttpResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=transactions.csv',
        },
      })
    } else {
      return HttpResponse.json(transactionsToExport)
    }
  }),

  // Category endpoints
  http.get('/api/categories', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const parentId = url.searchParams.get('parentId') || ''
    const isActive = url.searchParams.get('isActive')
    const hasBudget = url.searchParams.get('hasBudget')

    let filteredCategories = [...mockCategories]

    if (search) {
      filteredCategories = filteredCategories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (parentId) {
      filteredCategories = filteredCategories.filter(c => c.parentId === parentId)
    }

    if (isActive !== null) {
      const active = isActive === 'true'
      filteredCategories = filteredCategories.filter(c => c.isActive === active)
    }

    if (hasBudget !== null) {
      const hasBudgetValue = hasBudget === 'true'
      filteredCategories = filteredCategories.filter(c => 
        hasBudgetValue ? (c.budget && c.budget > 0) : (!c.budget || c.budget === 0)
      )
    }

    return HttpResponse.json(filteredCategories)
  }),

  http.get('/api/categories/:id', ({ params }) => {
    const category = mockCategories.find(c => c.id === params.id)
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(category)
  }),

  http.post('/api/categories', async ({ request }) => {
    const newCategory = await request.json()
    const category = {
      id: generateId(),
      ...newCategory,
      isActive: true,
      createdAt: generateDate(),
      updatedAt: generateDate(),
      order: mockCategories.length,
      spending: {
        currentMonth: 0,
        lastMonth: 0,
        yearToDate: 0,
      },
      transactionCount: 0,
    }
    mockCategories.push(category)
    return HttpResponse.json(category, { status: 201 })
  }),

  http.put('/api/categories/:id', async ({ params, request }) => {
    const updates = await request.json()
    const index = mockCategories.findIndex(c => c.id === params.id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    mockCategories[index] = {
      ...mockCategories[index],
      ...updates,
      updatedAt: generateDate(),
    }

    return HttpResponse.json(mockCategories[index])
  }),

  http.delete('/api/categories/:id', ({ params }) => {
    const index = mockCategories.findIndex(c => c.id === params.id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    mockCategories.splice(index, 1)
    return HttpResponse.json({ message: 'Category deleted successfully' })
  }),

  http.post('/api/categories/reorder', async ({ request }) => {
    const { categoryIds } = await request.json()
    
    // Update the order of categories based on the provided IDs
    categoryIds.forEach((id: string, index: number) => {
      const category = mockCategories.find(c => c.id === id)
      if (category) {
        category.order = index
      }
    })

    return HttpResponse.json({ message: 'Categories reordered successfully' })
  }),

  http.get('/api/categories/insights', () => {
    return HttpResponse.json(mockCategoryInsights)
  }),

  http.get('/api/categories/:id/spending', ({ params, request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'
    
    const category = mockCategories.find(c => c.id === params.id)
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      categoryId: params.id,
      period,
      spending: category.spending,
    })
  }),

  // Forecast endpoints
  http.get('/api/forecasts', ({ request }) => {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const scenarioId = url.searchParams.get('scenarioId')
    
    // Generate mock forecast data based on parameters
    const data = generateMockForecastData(startDate, endDate, scenarioId)
    return HttpResponse.json(data, { status: 200 })
  }),

  http.get('/api/forecasts/scenarios', () => {
    const mockScenarios = [
      {
        id: 'scenario-1',
        name: 'Conservative',
        description: 'Conservative growth with minimal changes',
        incomeAdjustment: 5,
        expenseAdjustment: -10,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'scenario-2',
        name: 'Optimistic',
        description: 'High growth scenario with increased income',
        incomeAdjustment: 25,
        expenseAdjustment: 5,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'scenario-3',
        name: 'Pessimistic',
        description: 'Economic downturn scenario',
        incomeAdjustment: -20,
        expenseAdjustment: 15,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    return HttpResponse.json(mockScenarios, { status: 200 })
  }),

  http.post('/api/forecasts/scenarios', async ({ request }) => {
    const newScenario = await request.json()
    const createdScenario = {
      id: `scenario-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newScenario,
    }
    return HttpResponse.json(createdScenario, { status: 201 })
  }),

  http.put('/api/forecasts/scenarios/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json()
    // Mock update - in real app, you'd update the scenario
    const updatedScenario = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(updatedScenario, { status: 200 })
  }),

  http.delete('/api/forecasts/scenarios/:id', ({ params }) => {
    const { id } = params
    // Mock delete - in real app, you'd remove the scenario
    return HttpResponse.json(null, { status: 204 })
  }),

  http.get('/api/forecasts/insights', ({ request }) => {
    const url = new URL(request.url)
    const scenarioId = url.searchParams.get('scenarioId')
    
    const mockInsights = [
      {
        id: 'insight-1',
        type: 'prediction',
        title: 'Net Worth Growth',
        description: 'Your net worth is projected to grow by 15% over the next 12 months based on current trends.',
        confidence: 85,
        impact: 'high',
        timeframe: 'long',
        actionable: true,
        category: 'wealth',
      },
      {
        id: 'insight-2',
        type: 'risk',
        title: 'Expense Volatility',
        description: 'High variability in entertainment expenses could impact budget stability.',
        confidence: 70,
        impact: 'medium',
        timeframe: 'short',
        actionable: true,
        category: 'expenses',
      },
      {
        id: 'insight-3',
        type: 'opportunity',
        title: 'Investment Opportunity',
        description: 'Consider increasing investment allocation by 5% to maximize long-term returns.',
        confidence: 80,
        impact: 'high',
        timeframe: 'medium',
        actionable: true,
        category: 'investments',
      },
      {
        id: 'insight-4',
        type: 'recommendation',
        title: 'Emergency Fund',
        description: 'Build emergency fund to 6 months of expenses for better financial security.',
        confidence: 95,
        impact: 'high',
        timeframe: 'medium',
        actionable: true,
        category: 'savings',
      },
    ]
    
    return HttpResponse.json(mockInsights, { status: 200 })
  }),

  http.get('/api/forecasts/summary', ({ request }) => {
    const url = new URL(request.url)
    const scenarioId = url.searchParams.get('scenarioId')
    
    const mockSummary = {
      totalPredictedIncome: 75000,
      totalPredictedExpenses: 45000,
      netWorthProjection: 30000,
      confidenceScore: 82,
      riskLevel: 'medium',
      keyTrends: [
        'Steady income growth projected',
        'Expense optimization opportunities identified',
        'Investment returns improving',
      ],
      recommendations: [
        'Consider increasing emergency fund',
        'Optimize high-expense categories',
        'Diversify investment portfolio',
      ],
    }
    
    return HttpResponse.json(mockSummary, { status: 200 })
  }),

  http.post('/api/forecasts/export', async ({ request }) => {
    const { format, filters } = await request.json()
    
    if (format === 'csv') {
      const csvContent = 'Date,Actual,Predicted,Confidence Lower,Confidence Upper\n2024-01-01,5000,5200,4800,5600'
      return HttpResponse.text(csvContent, { 
        status: 200, 
        headers: { 'Content-Type': 'text/csv' } 
      })
    } else if (format === 'json') {
      const data = generateMockForecastData(filters?.startDate, filters?.endDate, filters?.scenarioId)
      return HttpResponse.json(data, { status: 200 })
    } else {
      // Mock PDF
      return HttpResponse.text('PDF content', { 
        status: 200, 
        headers: { 'Content-Type': 'application/pdf' } 
      })
    }
  }),

  // Error simulation endpoints for testing error handling
  http.get('/api/test/error/:code', ({ params }) => {
    const code = parseInt(params.code as string)
    return HttpResponse.json(
      { message: `Test error ${code}` },
      { status: code }
    )
  }),

  http.get('/api/test/timeout', () => {
    return new Promise(() => {}) // Never resolves, simulates timeout
  }),

  // Analytics handlers
  http.get('/api/analytics/spending-trends', () => {
    const mockSpendingTrends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: Math.random() * 500 + 100,
      category: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills'][Math.floor(Math.random() * 5)],
      categoryId: `cat-${Math.floor(Math.random() * 5) + 1}`,
      isAnomaly: Math.random() < 0.1,
      anomalyReason: Math.random() < 0.1 ? 'Unusual spending pattern detected' : undefined,
    }));
    return HttpResponse.json(mockSpendingTrends);
  }),

  http.get('/api/analytics/income', () => {
    const mockIncomeData = {
      sources: [
        {
          id: 'salary-1',
          name: 'Primary Salary',
          amount: 5000,
          percentage: 70,
          stability: 'high' as const,
          growthRate: 3.2,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'freelance-1',
          name: 'Freelance Work',
          amount: 1500,
          percentage: 21,
          stability: 'medium' as const,
          growthRate: 8.5,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'investment-1',
          name: 'Investment Returns',
          amount: 700,
          percentage: 9,
          stability: 'low' as const,
          growthRate: -2.1,
          lastUpdated: new Date().toISOString(),
        },
      ],
      summary: {
        totalIncome: 7200,
        averageMonthly: 7200,
        growthRate: 4.2,
        stability: 85,
      },
    };
    return HttpResponse.json(mockIncomeData);
  }),

  http.get('/api/analytics/savings-goals', () => {
    const mockSavingsGoals = [
      {
        id: 'goal-1',
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 7500,
        targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        monthlyContribution: 500,
        progress: 75,
        status: 'on-track' as const,
        milestones: [
          { id: 'milestone-1', amount: 2500, achieved: true, achievedDate: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'milestone-2', amount: 5000, achieved: true, achievedDate: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'milestone-3', amount: 7500, achieved: true, achievedDate: new Date().toISOString() },
          { id: 'milestone-4', amount: 10000, achieved: false },
        ],
      },
      {
        id: 'goal-2',
        name: 'Vacation Fund',
        targetAmount: 3000,
        currentAmount: 1200,
        targetDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        monthlyContribution: 300,
        progress: 40,
        status: 'at-risk' as const,
        milestones: [
          { id: 'milestone-5', amount: 1000, achieved: true, achievedDate: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'milestone-6', amount: 2000, achieved: false },
          { id: 'milestone-7', amount: 3000, achieved: false },
        ],
      },
    ];
    return HttpResponse.json(mockSavingsGoals);
  }),

  http.get('/api/analytics/budget-performance', () => {
    const mockBudgetPerformance = [
      {
        categoryId: 'cat-1',
        categoryName: 'Food & Dining',
        budgetedAmount: 800,
        actualAmount: 750,
        variance: -50,
        variancePercentage: -6.25,
        status: 'under' as const,
        trend: 'improving' as const,
        recommendations: [
          'Great job staying under budget!',
          'Consider meal planning to maintain this trend',
        ],
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Transportation',
        budgetedAmount: 400,
        actualAmount: 450,
        variance: 50,
        variancePercentage: 12.5,
        status: 'over' as const,
        trend: 'declining' as const,
        recommendations: [
          'Consider carpooling or public transport',
          'Review gas prices and optimize routes',
        ],
      },
      {
        categoryId: 'cat-3',
        categoryName: 'Entertainment',
        budgetedAmount: 300,
        actualAmount: 295,
        variance: -5,
        variancePercentage: -1.67,
        status: 'on-target' as const,
        trend: 'stable' as const,
        recommendations: [
          'Perfect budget management!',
          'Consider setting aside extra for special events',
        ],
      },
    ];
    return HttpResponse.json(mockBudgetPerformance);
  }),

  http.get('/api/analytics/reports', () => {
    const mockReports = [
      {
        id: 'report-1',
        name: 'Monthly Spending Analysis',
        description: 'Comprehensive monthly spending breakdown with trends',
        widgets: [
          {
            id: 'widget-1',
            type: 'chart' as const,
            title: 'Spending Trends',
            dataSource: 'spending',
            config: { chartType: 'line' },
            position: { x: 0, y: 0, width: 400, height: 300 },
          },
          {
            id: 'widget-2',
            type: 'table' as const,
            title: 'Category Breakdown',
            dataSource: 'categories',
            config: { sortBy: 'amount' },
            position: { x: 400, y: 0, width: 300, height: 300 },
          },
        ],
        filters: {
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
        },
        schedule: {
          frequency: 'monthly' as const,
          time: '09:00',
          email: 'user@example.com',
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return HttpResponse.json(mockReports);
  }),

  http.get('/api/analytics/summary', () => {
    const mockSummary = {
      totalSpending: 2500,
      totalIncome: 7200,
      netSavings: 4700,
      savingsRate: 65.3,
      topSpendingCategory: 'Food & Dining',
      biggestVariance: -150,
      anomalyCount: 3,
      goalProgress: 75,
    };
    return HttpResponse.json(mockSummary);
  }),

  http.get('/api/analytics/seasonal-patterns', () => {
    const mockSeasonalPatterns = [
      {
        category: 'Food & Dining',
        pattern: 'cyclical' as const,
        seasonality: 0.7,
        peakMonths: [11, 12, 0], // Nov, Dec, Jan
        lowMonths: [2, 3, 4], // Feb, Mar, Apr
      },
      {
        category: 'Transportation',
        pattern: 'stable' as const,
        seasonality: 0.2,
        peakMonths: [],
        lowMonths: [],
      },
    ];
    return HttpResponse.json(mockSeasonalPatterns);
  }),

  http.post('/api/analytics/reports', async ({ request }) => {
    const body = await request.json();
    const newReport = {
      id: `report-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newReport);
  }),

  http.put('/api/analytics/reports/:id', async ({ request }) => {
    const body = await request.json();
    const updatedReport = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updatedReport);
  }),

  http.delete('/api/analytics/reports/:id', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

    http.post('/api/analytics/export', () => {
      const mockCsvData = 'Date,Category,Amount\n2024-01-01,Food,100\n2024-01-02,Transport,50';
      return HttpResponse.text(mockCsvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="analytics_export.csv"',
        },
      });
    }),

    // Goals handlers
    http.get('/api/goals', () => {
      const mockGoals = [
        {
          id: 'goal-1',
          name: 'Emergency Fund',
          description: 'Build a 6-month emergency fund for unexpected expenses',
          targetAmount: 15000,
          currentAmount: 8500,
          targetDate: new Date(Date.now() + 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Emergency',
          categoryId: 'cat-emergency',
          icon: '🛡️',
          color: '#3B82F6',
          status: 'active' as const,
          priority: 'high' as const,
          autoSaveAmount: 500,
          autoSaveFrequency: 'monthly' as const,
          createdAt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'goal-2',
          name: 'Vacation to Japan',
          description: 'Save for a 2-week vacation to Japan including flights and accommodation',
          targetAmount: 8000,
          currentAmount: 3200,
          targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Travel',
          categoryId: 'cat-travel',
          icon: '✈️',
          color: '#10B981',
          status: 'active' as const,
          priority: 'medium' as const,
          autoSaveAmount: 300,
          autoSaveFrequency: 'monthly' as const,
          createdAt: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'goal-3',
          name: 'New Laptop',
          description: 'Upgrade to a new MacBook Pro for work',
          targetAmount: 2500,
          currentAmount: 2500,
          targetDate: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Electronics',
          categoryId: 'cat-electronics',
          icon: '💻',
          color: '#8B5CF6',
          status: 'completed' as const,
          priority: 'medium' as const,
          autoSaveAmount: 200,
          autoSaveFrequency: 'monthly' as const,
          createdAt: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'goal-4',
          name: 'Home Down Payment',
          description: 'Save for a 20% down payment on a house',
          targetAmount: 80000,
          currentAmount: 12000,
          targetDate: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Housing',
          categoryId: 'cat-housing',
          icon: '🏠',
          color: '#F59E0B',
          status: 'active' as const,
          priority: 'high' as const,
          autoSaveAmount: 1000,
          autoSaveFrequency: 'monthly' as const,
          createdAt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      return HttpResponse.json(mockGoals);
    }),

    http.get('/api/goals/:id', ({ params }) => {
      const goalId = params.id;
      const mockGoal = {
        id: goalId,
        name: 'Emergency Fund',
        description: 'Build a 6-month emergency fund for unexpected expenses',
        targetAmount: 15000,
        currentAmount: 8500,
        targetDate: new Date(Date.now() + 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Emergency',
        categoryId: 'cat-emergency',
        icon: '🛡️',
        color: '#3B82F6',
        status: 'active' as const,
        priority: 'high' as const,
        autoSaveAmount: 500,
        autoSaveFrequency: 'monthly' as const,
        createdAt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(mockGoal);
    }),

    http.post('/api/goals', async ({ request }) => {
      const body = await request.json();
      const newGoal = {
        id: `goal-${Date.now()}`,
        ...body,
        currentAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(newGoal);
    }),

    http.put('/api/goals/:id', async ({ request }) => {
      const body = await request.json();
      const updatedGoal = {
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(updatedGoal);
    }),

    http.delete('/api/goals/:id', () => {
      return HttpResponse.json(null, { status: 204 });
    }),

    http.get('/api/goals/:id/progress', ({ params }) => {
      const goalId = params.id;
      const mockProgress = {
        goalId,
        currentAmount: 8500,
        targetAmount: 15000,
        progressPercentage: 56.7,
        daysRemaining: 240,
        projectedCompletionDate: new Date(Date.now() + 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        isOnTrack: true,
        monthlyContributionNeeded: 500,
        weeklyContributionNeeded: 115,
      };
      return HttpResponse.json(mockProgress);
    }),

    http.get('/api/goals/:id/contributions', ({ params }) => {
      const goalId = params.id;
      const mockContributions = [
        {
          id: 'contrib-1',
          goalId,
          amount: 500,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'auto-save' as const,
          description: 'Monthly auto-save',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'contrib-2',
          goalId,
          amount: 1000,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual' as const,
          description: 'Bonus contribution',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      return HttpResponse.json(mockContributions);
    }),

    http.post('/api/goals/contributions', async ({ request }) => {
      const body = await request.json();
      const newContribution = {
        id: `contrib-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      };
      return HttpResponse.json(newContribution);
    }),

    http.get('/api/goals/categories', () => {
      const mockCategories = [
        { id: 'cat-emergency', name: 'Emergency', icon: '🛡️', color: '#3B82F6' },
        { id: 'cat-travel', name: 'Travel', icon: '✈️', color: '#10B981' },
        { id: 'cat-electronics', name: 'Electronics', icon: '💻', color: '#8B5CF6' },
        { id: 'cat-housing', name: 'Housing', icon: '🏠', color: '#F59E0B' },
        { id: 'cat-education', name: 'Education', icon: '🎓', color: '#EC4899' },
        { id: 'cat-vehicle', name: 'Vehicle', icon: '🚗', color: '#06B6D4' },
        { id: 'cat-health', name: 'Health', icon: '💊', color: '#84CC16' },
        { id: 'cat-entertainment', name: 'Entertainment', icon: '🎮', color: '#F97316' },
      ];
      return HttpResponse.json(mockCategories);
    }),

    http.get('/api/goals/insights', () => {
      const mockInsights = {
        totalGoals: 4,
        activeGoals: 3,
        completedGoals: 1,
        totalSaved: 24200,
        totalTarget: 105500,
        averageProgress: 22.9,
        onTrackGoals: 2,
        atRiskGoals: 1,
      };
      return HttpResponse.json(mockInsights);
    }),

    // Budgets handlers
    http.get('/api/budgets', () => {
      const mockBudgets = [
        {
          id: 'budget-1',
          name: 'Monthly Budget - December 2024',
          description: 'Monthly budget for December 2024',
          period: 'monthly' as const,
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
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
            {
              id: 'budget-cat-2',
              categoryId: 'cat-transport',
              categoryName: 'Transportation',
              budgetedAmount: 400,
              spentAmount: 320,
              remainingAmount: 80,
              percentage: 8,
              color: '#10B981',
              icon: '🚗',
            },
            {
              id: 'budget-cat-3',
              categoryId: 'cat-entertainment',
              categoryName: 'Entertainment',
              budgetedAmount: 300,
              spentAmount: 180,
              remainingAmount: 120,
              percentage: 6,
              color: '#8B5CF6',
              icon: '🎮',
            },
            {
              id: 'budget-cat-4',
              categoryId: 'cat-bills',
              categoryName: 'Bills & Utilities',
              budgetedAmount: 1200,
              spentAmount: 1200,
              remainingAmount: 0,
              percentage: 24,
              color: '#F59E0B',
              icon: '⚡',
            },
            {
              id: 'budget-cat-5',
              categoryId: 'cat-shopping',
              categoryName: 'Shopping',
              budgetedAmount: 500,
              spentAmount: 750,
              remainingAmount: -250,
              percentage: 10,
              color: '#EC4899',
              icon: '🛍️',
            },
          ],
          status: 'active' as const,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      return HttpResponse.json(mockBudgets);
    }),

    http.get('/api/budgets/current', () => {
      const mockCurrentBudget = {
        id: 'budget-1',
        name: 'Monthly Budget - December 2024',
        description: 'Monthly budget for December 2024',
        period: 'monthly' as const,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
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
          {
            id: 'budget-cat-2',
            categoryId: 'cat-transport',
            categoryName: 'Transportation',
            budgetedAmount: 400,
            spentAmount: 320,
            remainingAmount: 80,
            percentage: 8,
            color: '#10B981',
            icon: '🚗',
          },
          {
            id: 'budget-cat-3',
            categoryId: 'cat-entertainment',
            categoryName: 'Entertainment',
            budgetedAmount: 300,
            spentAmount: 180,
            remainingAmount: 120,
            percentage: 6,
            color: '#8B5CF6',
            icon: '🎮',
          },
          {
            id: 'budget-cat-4',
            categoryId: 'cat-bills',
            categoryName: 'Bills & Utilities',
            budgetedAmount: 1200,
            spentAmount: 1200,
            remainingAmount: 0,
            percentage: 24,
            color: '#F59E0B',
            icon: '⚡',
          },
          {
            id: 'budget-cat-5',
            categoryId: 'cat-shopping',
            categoryName: 'Shopping',
            budgetedAmount: 500,
            spentAmount: 750,
            remainingAmount: -250,
            percentage: 10,
            color: '#EC4899',
            icon: '🛍️',
          },
        ],
        status: 'active' as const,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(mockCurrentBudget);
    }),

    http.get('/api/budgets/:id/insights', ({ params }) => {
      const budgetId = params.id;
      const mockInsights = {
        totalBudgeted: 5000,
        totalSpent: 3100,
        totalRemaining: 1900,
        overspentCategories: 1,
        underSpentCategories: 3,
        averageSpendingRate: 103.33,
        projectedOverspend: false,
        daysRemaining: 15,
        recommendedAdjustments: [],
      };
      return HttpResponse.json(mockInsights);
    }),

    http.get('/api/budgets/:id/recommendations', ({ params }) => {
      const budgetId = params.id;
      const mockRecommendations = [
        {
          id: 'rec-1',
          type: 'optimization' as const,
          title: 'Reduce Shopping Budget',
          description: 'You\'ve exceeded your shopping budget by $250. Consider reducing discretionary purchases or reallocating funds from other categories.',
          impact: 'high' as const,
          potentialSavings: 250,
          categoryId: 'cat-shopping',
          categoryName: 'Shopping',
          actionRequired: true,
          priority: 9,
        },
        {
          id: 'rec-2',
          type: 'allocation' as const,
          title: 'Reallocate Entertainment Funds',
          description: 'You have $120 remaining in entertainment budget. Consider moving some funds to shopping to cover the overspend.',
          impact: 'medium' as const,
          categoryId: 'cat-entertainment',
          categoryName: 'Entertainment',
          actionRequired: false,
          priority: 6,
        },
        {
          id: 'rec-3',
          type: 'savings' as const,
          title: 'Optimize Food Spending',
          description: 'You\'re doing well with food spending. Consider meal planning to maintain this trend and potentially save more.',
          impact: 'low' as const,
          potentialSavings: 50,
          categoryId: 'cat-food',
          categoryName: 'Food & Dining',
          actionRequired: false,
          priority: 3,
        },
        {
          id: 'rec-4',
          type: 'spending' as const,
          title: 'Track Transportation Costs',
          description: 'Your transportation spending is on track. Consider carpooling or public transport to reduce costs further.',
          impact: 'low' as const,
          potentialSavings: 30,
          categoryId: 'cat-transport',
          categoryName: 'Transportation',
          actionRequired: false,
          priority: 2,
        },
      ];
      return HttpResponse.json(mockRecommendations);
    }),

    http.post('/api/budgets', async ({ request }) => {
      const body = await request.json();
      const newBudget = {
        id: `budget-${Date.now()}`,
        ...body,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(newBudget);
    }),

    http.put('/api/budgets/:id', async ({ request }) => {
      const body = await request.json();
      const updatedBudget = {
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(updatedBudget);
    }),

    http.delete('/api/budgets/:id', () => {
      return HttpResponse.json(null, { status: 204 });
    }),

    http.post('/api/budgets/optimal-allocations', async ({ request }) => {
      const body = await request.json();
      const { totalAmount, categories } = body;
      const mockAllocations = categories.map((categoryId: string, index: number) => ({
        categoryId,
        categoryName: `Category ${index + 1}`,
        currentAllocation: Math.floor(totalAmount / categories.length),
        recommendedAllocation: Math.floor(totalAmount / categories.length) + (index === 0 ? 100 : -50),
        difference: index === 0 ? 100 : -50,
        reason: index === 0 ? 'High spending pattern' : 'Low spending pattern',
      }));
      return HttpResponse.json(mockAllocations);
    }),

    http.post('/api/budgets/:id/duplicate', async ({ request }) => {
      const body = await request.json();
      const duplicatedBudget = {
        id: `budget-${Date.now()}`,
        name: 'Duplicated Budget',
        description: 'Duplicated budget',
        period: 'monthly' as const,
        ...body,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(duplicatedBudget);
    }),

    http.post('/api/budgets/:id/archive', async ({ params }) => {
      const budgetId = params.id;
      const archivedBudget = {
        id: budgetId,
        name: 'Archived Budget',
        description: 'Archived budget',
        period: 'monthly' as const,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        totalAmount: 5000,
        categories: [],
        status: 'archived' as const,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(archivedBudget);
    }),
]
