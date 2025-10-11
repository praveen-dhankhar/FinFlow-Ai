import { rest } from 'msw'
import { server } from '@/mocks/server'
import { dashboardService } from '@/lib/api/dashboard'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())

describe('Dashboard API Integration Tests', () => {
  test('should load dashboard stats from API', async () => {
    const dashboardData = await dashboardService.getDashboardData()

    expect(dashboardData).toBeDefined()
    expect(dashboardData.stats).toBeDefined()
    expect(dashboardData.stats.currentBalance).toBeTypeOf('number')
    expect(dashboardData.stats.monthlyIncome).toBeTypeOf('number')
    expect(dashboardData.stats.monthlyExpenses).toBeTypeOf('number')
    expect(dashboardData.stats.savingsRate).toBeTypeOf('number')
    expect(dashboardData.spendingCategories).toBeInstanceOf(Array)
    expect(dashboardData.recentTransactions).toBeInstanceOf(Array)
    expect(dashboardData.forecastPreview).toBeDefined()
  })

  test('should handle API errors gracefully', async () => {
    // Override the default handler with an error response
    server.use(
      rest.get('/api/dashboard', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Internal server error' }))
      })
    )

    await expect(dashboardService.getDashboardData()).rejects.toThrow()
  })

  test('should handle network timeout', async () => {
    // Override with a timeout response
    server.use(
      rest.get('/api/dashboard', (req, res, ctx) => {
        return res(ctx.delay('infinite'))
      })
    )

    // Test with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 1000)
    })

    await expect(
      Promise.race([dashboardService.getDashboardData(), timeoutPromise])
    ).rejects.toThrow('Timeout')
  })

  test('should return valid data structure', async () => {
    const dashboardData = await dashboardService.getDashboardData()

    // Validate stats structure
    expect(dashboardData.stats).toMatchObject({
      currentBalance: expect.any(Number),
      monthlyIncome: expect.any(Number),
      monthlyExpenses: expect.any(Number),
      savingsRate: expect.any(Number),
      previousMonthIncome: expect.any(Number),
      previousMonthExpenses: expect.any(Number),
      previousMonthSavingsRate: expect.any(Number),
    })

    // Validate spending categories structure
    expect(dashboardData.spendingCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: expect.any(String),
          totalAmount: expect.any(Number),
          type: expect.stringMatching(/^(INCOME|EXPENSE)$/),
          color: expect.any(String),
          icon: expect.any(String),
        })
      ])
    )

    // Validate recent transactions structure
    expect(dashboardData.recentTransactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          date: expect.any(String),
          description: expect.any(String),
          amount: expect.any(Number),
          type: expect.stringMatching(/^(INCOME|EXPENSE)$/),
          category: expect.any(String),
          categoryColor: expect.any(String),
          categoryIcon: expect.any(String),
        })
      ])
    )

    // Validate forecast preview structure
    expect(dashboardData.forecastPreview).toMatchObject({
      projection: expect.arrayContaining([
        expect.objectContaining({
          month: expect.any(String),
          amount: expect.any(Number),
        })
      ]),
      confidence: expect.any(Number),
      trend: expect.stringMatching(/^(up|down|stable)$/),
      change: expect.any(Number),
    })
  })

  test('should handle empty data gracefully', async () => {
    // Override with empty data
    server.use(
      rest.get('/api/dashboard', (req, res, ctx) => {
        return res(ctx.json({
          stats: {
            currentBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            savingsRate: 0,
            previousMonthIncome: 0,
            previousMonthExpenses: 0,
            previousMonthSavingsRate: 0,
          },
          spendingCategories: [],
          recentTransactions: [],
          forecastPreview: {
            projection: [],
            confidence: 0,
            trend: 'stable',
            change: 0,
          },
        }))
      })
    )

    const dashboardData = await dashboardService.getDashboardData()

    expect(dashboardData.stats.currentBalance).toBe(0)
    expect(dashboardData.spendingCategories).toHaveLength(0)
    expect(dashboardData.recentTransactions).toHaveLength(0)
    expect(dashboardData.forecastPreview.projection).toHaveLength(0)
  })
})
