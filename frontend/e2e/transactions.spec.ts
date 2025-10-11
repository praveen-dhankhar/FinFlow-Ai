import { test, expect } from '@playwright/test'

test.describe('Transaction CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display transactions page', async ({ page }) => {
    await page.getByRole('link', { name: 'Transactions' }).click()
    await expect(page).toHaveURL('/transactions')
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
  })

  test('should add new transaction', async ({ page }) => {
    await page.goto('/transactions')
    
    await page.getByRole('button', { name: 'Add Transaction' }).click()
    
    // Fill transaction form
    await page.getByLabel('Amount').fill('100.50')
    await page.getByLabel('Description').fill('Test Transaction')
    await page.getByLabel('Category').selectOption('Food')
    await page.getByLabel('Type').selectOption('expense')
    await page.getByLabel('Date').fill('2024-01-15')
    
    await page.getByRole('button', { name: 'Add Transaction' }).click()
    
    // Should show success message
    await expect(page.getByText('Transaction added successfully')).toBeVisible()
    
    // Should appear in transactions list
    await expect(page.getByText('Test Transaction')).toBeVisible()
    await expect(page.getByText('$100.50')).toBeVisible()
  })

  test('should edit transaction', async ({ page }) => {
    await page.goto('/transactions')
    
    // Find and click edit button for first transaction
    await page.getByRole('button', { name: 'Edit' }).first().click()
    
    // Update transaction
    await page.getByLabel('Description').fill('Updated Transaction')
    await page.getByLabel('Amount').fill('150.75')
    
    await page.getByRole('button', { name: 'Update Transaction' }).click()
    
    // Should show success message
    await expect(page.getByText('Transaction updated successfully')).toBeVisible()
    
    // Should show updated values
    await expect(page.getByText('Updated Transaction')).toBeVisible()
    await expect(page.getByText('$150.75')).toBeVisible()
  })

  test('should delete transaction', async ({ page }) => {
    await page.goto('/transactions')
    
    // Find and click delete button for first transaction
    await page.getByRole('button', { name: 'Delete' }).first().click()
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click()
    
    // Should show success message
    await expect(page.getByText('Transaction deleted successfully')).toBeVisible()
  })

  test('should filter transactions by category', async ({ page }) => {
    await page.goto('/transactions')
    
    // Select category filter
    await page.getByLabel('Category').selectOption('Food')
    
    // Should show only food transactions
    await expect(page.getByText('Food')).toBeVisible()
  })

  test('should filter transactions by date range', async ({ page }) => {
    await page.goto('/transactions')
    
    // Set date range
    await page.getByLabel('Start Date').fill('2024-01-01')
    await page.getByLabel('End Date').fill('2024-01-31')
    
    // Should show only transactions in date range
    await expect(page.getByText('January 2024')).toBeVisible()
  })

  test('should search transactions', async ({ page }) => {
    await page.goto('/transactions')
    
    // Enter search term
    await page.getByLabel('Search').fill('test')
    
    // Should show only matching transactions
    await expect(page.getByText('test', { exact: false })).toBeVisible()
  })

  test('should sort transactions by amount', async ({ page }) => {
    await page.goto('/transactions')
    
    // Click amount column header to sort
    await page.getByRole('columnheader', { name: 'Amount' }).click()
    
    // Should sort transactions by amount
    const amounts = await page.locator('[data-testid="transaction-amount"]').allTextContents()
    const sortedAmounts = [...amounts].sort((a, b) => parseFloat(a) - parseFloat(b))
    expect(amounts).toEqual(sortedAmounts)
  })

  test('should export transactions', async ({ page }) => {
    await page.goto('/transactions')
    
    // Click export button
    await page.getByRole('button', { name: 'Export' }).click()
    
    // Should show export options
    await expect(page.getByText('Export Format')).toBeVisible()
    
    // Select CSV format
    await page.getByRole('radio', { name: 'CSV' }).click()
    await page.getByRole('button', { name: 'Download' }).click()
    
    // Should trigger download
    const downloadPromise = page.waitForEvent('download')
    await downloadPromise
  })

  test('should bulk delete transactions', async ({ page }) => {
    await page.goto('/transactions')
    
    // Select multiple transactions
    await page.getByRole('checkbox', { name: 'Select all' }).check()
    
    // Click bulk delete
    await page.getByRole('button', { name: 'Delete Selected' }).click()
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click()
    
    // Should show success message
    await expect(page.getByText('Transactions deleted successfully')).toBeVisible()
  })

  test('should show transaction details', async ({ page }) => {
    await page.goto('/transactions')
    
    // Click on transaction row
    await page.getByText('Test Transaction').click()
    
    // Should show transaction details modal
    await expect(page.getByText('Transaction Details')).toBeVisible()
    await expect(page.getByText('Amount: $100.50')).toBeVisible()
    await expect(page.getByText('Category: Food')).toBeVisible()
  })

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/transactions')
    await page.getByRole('button', { name: 'Add Transaction' }).click()
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Add Transaction' }).click()
    
    // Should show validation errors
    await expect(page.getByText('Amount is required')).toBeVisible()
    await expect(page.getByText('Description is required')).toBeVisible()
    await expect(page.getByText('Category is required')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/transactions', route => route.abort())
    
    await page.goto('/transactions')
    
    // Should show error message
    await expect(page.getByText('Failed to load transactions')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })
})
