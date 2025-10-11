import { test, expect } from '@playwright/test'

test.describe('Dashboard and Data Visualization', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display dashboard with key metrics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Check for key metrics
    await expect(page.getByText('Total Balance')).toBeVisible()
    await expect(page.getByText('Monthly Income')).toBeVisible()
    await expect(page.getByText('Monthly Expenses')).toBeVisible()
    await expect(page.getByText('Savings Rate')).toBeVisible()
  })

  test('should display spending chart', async ({ page }) => {
    await expect(page.getByTestId('spending-chart')).toBeVisible()
    await expect(page.getByText('Spending Trends')).toBeVisible()
  })

  test('should display category breakdown', async ({ page }) => {
    await expect(page.getByTestId('category-breakdown')).toBeVisible()
    await expect(page.getByText('Category Breakdown')).toBeVisible()
  })

  test('should display recent transactions', async ({ page }) => {
    await expect(page.getByText('Recent Transactions')).toBeVisible()
    await expect(page.getByTestId('recent-transactions')).toBeVisible()
  })

  test('should display upcoming bills', async ({ page }) => {
    await expect(page.getByText('Upcoming Bills')).toBeVisible()
    await expect(page.getByTestId('upcoming-bills')).toBeVisible()
  })

  test('should display financial goals progress', async ({ page }) => {
    await expect(page.getByText('Financial Goals')).toBeVisible()
    await expect(page.getByTestId('goals-progress')).toBeVisible()
  })

  test('should update charts when date range changes', async ({ page }) => {
    // Change date range
    await page.getByLabel('Date Range').selectOption('last-3-months')
    
    // Charts should update
    await expect(page.getByTestId('spending-chart')).toBeVisible()
    await expect(page.getByTestId('category-breakdown')).toBeVisible()
  })

  test('should display empty state when no data', async ({ page }) => {
    // Mock empty data
    await page.route('**/api/dashboard', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          savingsRate: 0,
          recentTransactions: [],
          upcomingBills: [],
          goals: []
        })
      })
    })
    
    await page.reload()
    
    // Should show empty state
    await expect(page.getByText('No data available')).toBeVisible()
    await expect(page.getByText('Start by adding your first transaction')).toBeVisible()
  })

  test('should handle chart loading states', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/dashboard', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalBalance: 5000,
            monthlyIncome: 3000,
            monthlyExpenses: 2000,
            savingsRate: 33.3,
            recentTransactions: [],
            upcomingBills: [],
            goals: []
          })
        })
      }, 1000)
    })
    
    await page.reload()
    
    // Should show loading state
    await expect(page.getByTestId('dashboard-skeleton')).toBeVisible()
    
    // Should show data after loading
    await expect(page.getByText('$5,000.00')).toBeVisible()
  })

  test('should display responsive charts on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByTestId('spending-chart')).toBeVisible()
    await expect(page.getByTestId('category-breakdown')).toBeVisible()
  })

  test('should allow chart interaction', async ({ page }) => {
    // Hover over chart
    await page.hover('[data-testid="spending-chart"]')
    
    // Should show tooltip
    await expect(page.getByTestId('chart-tooltip')).toBeVisible()
  })

  test('should display error state when charts fail to load', async ({ page }) => {
    // Mock chart error
    await page.route('**/api/dashboard', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    await page.reload()
    
    // Should show error state
    await expect(page.getByText('Failed to load dashboard data')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  test('should display different chart types', async ({ page }) => {
    // Switch to different chart view
    await page.getByRole('button', { name: 'Chart View' }).click()
    await page.getByRole('menuitem', { name: 'Bar Chart' }).click()
    
    await expect(page.getByTestId('bar-chart')).toBeVisible()
  })

  test('should export dashboard data', async ({ page }) => {
    await page.getByRole('button', { name: 'Export' }).click()
    
    // Should show export options
    await expect(page.getByText('Export Dashboard Data')).toBeVisible()
    
    // Select PDF format
    await page.getByRole('radio', { name: 'PDF' }).click()
    await page.getByRole('button', { name: 'Download' }).click()
    
    // Should trigger download
    const downloadPromise = page.waitForEvent('download')
    await downloadPromise
  })

  test('should display real-time updates', async ({ page }) => {
    // Mock real-time update
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('transaction-added', {
        detail: { amount: 100, description: 'New Transaction' }
      }))
    })
    
    // Dashboard should update
    await expect(page.getByText('New Transaction')).toBeVisible()
  })

  test('should handle offline state', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true)
    
    // Should show offline indicator
    await expect(page.getByText('You\'re offline')).toBeVisible()
    
    // Go back online
    await page.context().setOffline(false)
    
    // Should hide offline indicator
    await expect(page.getByText('You\'re offline')).not.toBeVisible()
  })
})
