import { rest } from 'msw'
import { server } from '@/mocks/server'
import { transactionService } from '@/lib/api/transactions'
import { Transaction, TransactionType } from '@/lib/api/transactions'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())

describe('Transactions API Integration Tests', () => {
  test('should load transactions list with pagination', async () => {
    const result = await transactionService.getTransactions(0, 10)

    expect(result).toBeDefined()
    expect(result.data).toBeInstanceOf(Array)
    expect(result.pagination).toBeDefined()
    expect(result.pagination.totalElements).toBeTypeOf('number')
    expect(result.pagination.totalPages).toBeTypeOf('number')
    expect(result.pagination.currentPage).toBe(0)
    expect(result.pagination.pageSize).toBe(10)
    expect(result.pagination.hasNext).toBeTypeOf('boolean')
    expect(result.pagination.hasPrevious).toBeTypeOf('boolean')
  })

  test('should handle pagination correctly', async () => {
    const page1 = await transactionService.getTransactions(0, 5)
    const page2 = await transactionService.getTransactions(1, 5)

    expect(page1.data).toHaveLength(5)
    expect(page2.data).toHaveLength(5)
    expect(page1.pagination.currentPage).toBe(0)
    expect(page2.pagination.currentPage).toBe(1)
  })

  test('should filter transactions by type', async () => {
    const incomeTransactions = await transactionService.getTransactions(0, 10, {
      type: 'INCOME' as TransactionType,
    })

    expect(incomeTransactions.data).toBeDefined()
    incomeTransactions.data.forEach(transaction => {
      expect(transaction.type).toBe('INCOME')
    })
  })

  test('should filter transactions by category', async () => {
    const filteredTransactions = await transactionService.getTransactions(0, 10, {
      categories: ['Salary'],
    })

    expect(filteredTransactions.data).toBeDefined()
    filteredTransactions.data.forEach(transaction => {
      expect(transaction.category).toBe('Salary')
    })
  })

  test('should filter transactions by date range', async () => {
    const startDate = '2024-01-01'
    const endDate = '2024-01-31'
    
    const filteredTransactions = await transactionService.getTransactions(0, 10, {
      startDate,
      endDate,
    })

    expect(filteredTransactions.data).toBeDefined()
    filteredTransactions.data.forEach(transaction => {
      expect(transaction.date).toBeGreaterThanOrEqual(startDate)
      expect(transaction.date).toBeLessThanOrEqual(endDate)
    })
  })

  test('should search transactions by description', async () => {
    const searchTerm = 'salary'
    
    const searchResults = await transactionService.getTransactions(0, 10, {
      search: searchTerm,
    })

    expect(searchResults.data).toBeDefined()
    searchResults.data.forEach(transaction => {
      expect(transaction.description.toLowerCase()).toContain(searchTerm.toLowerCase())
    })
  })

  test('should add new transaction', async () => {
    const newTransaction: Partial<Transaction> = {
      date: '2024-01-20',
      amount: 500,
      category: 'Test Category',
      description: 'Test Transaction',
      type: 'EXPENSE' as TransactionType,
      tags: ['test'],
      notes: 'Test notes',
    }

    const createdTransaction = await transactionService.createTransaction(newTransaction)

    expect(createdTransaction).toBeDefined()
    expect(createdTransaction.id).toBeDefined()
    expect(createdTransaction.description).toBe(newTransaction.description)
    expect(createdTransaction.amount).toBe(newTransaction.amount)
    expect(createdTransaction.category).toBe(newTransaction.category)
    expect(createdTransaction.type).toBe(newTransaction.type)
    expect(createdTransaction.createdAt).toBeDefined()
    expect(createdTransaction.updatedAt).toBeDefined()
  })

  test('should edit existing transaction', async () => {
    // First, get an existing transaction
    const transactions = await transactionService.getTransactions(0, 1)
    const existingTransaction = transactions.data[0]

    const updates = {
      description: 'Updated Description',
      amount: 999,
      notes: 'Updated notes',
    }

    const updatedTransaction = await transactionService.updateTransaction(
      existingTransaction.id,
      updates
    )

    expect(updatedTransaction).toBeDefined()
    expect(updatedTransaction.id).toBe(existingTransaction.id)
    expect(updatedTransaction.description).toBe(updates.description)
    expect(updatedTransaction.amount).toBe(updates.amount)
    expect(updatedTransaction.notes).toBe(updates.notes)
    expect(updatedTransaction.updatedAt).not.toBe(existingTransaction.updatedAt)
  })

  test('should delete transaction', async () => {
    // First, get an existing transaction
    const transactions = await transactionService.getTransactions(0, 1)
    const existingTransaction = transactions.data[0]

    await expect(
      transactionService.deleteTransaction(existingTransaction.id)
    ).resolves.not.toThrow()

    // Verify transaction is deleted by trying to get it
    await expect(
      transactionService.getTransaction(existingTransaction.id)
    ).rejects.toThrow()
  })

  test('should handle bulk operations', async () => {
    // Get multiple transactions
    const transactions = await transactionService.getTransactions(0, 3)
    const transactionIds = transactions.data.map(t => t.id)

    // Test bulk delete
    const bulkDeleteResult = await transactionService.bulkDeleteTransactions(transactionIds)

    expect(bulkDeleteResult).toBeDefined()
    expect(bulkDeleteResult.deletedCount).toBe(transactionIds.length)
  })

  test('should export transactions as CSV', async () => {
    const csvData = await transactionService.exportTransactions('csv')

    expect(csvData).toBeDefined()
    expect(typeof csvData).toBe('string')
    expect(csvData).toContain('Date,Description,Amount,Category,Type')
  })

  test('should export transactions as JSON', async () => {
    const jsonData = await transactionService.exportTransactions('json')

    expect(jsonData).toBeDefined()
    expect(Array.isArray(jsonData)).toBe(true)
    expect(jsonData.length).toBeGreaterThan(0)
  })

  test('should export selected transactions only', async () => {
    const transactions = await transactionService.getTransactions(0, 2)
    const selectedIds = transactions.data.map(t => t.id)

    const csvData = await transactionService.exportTransactions('csv', selectedIds)

    expect(csvData).toBeDefined()
    expect(typeof csvData).toBe('string')
    
    // Count the number of data rows (excluding header)
    const lines = csvData.split('\n').filter(line => line.trim())
    expect(lines.length - 1).toBe(selectedIds.length) // -1 for header
  })

  test('should handle API errors gracefully', async () => {
    // Override with error response
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Internal server error' }))
      })
    )

    await expect(transactionService.getTransactions(0, 10)).rejects.toThrow()
  })

  test('should handle network timeout', async () => {
    // Override with timeout
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.delay('infinite'))
      })
    )

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 1000)
    })

    await expect(
      Promise.race([transactionService.getTransactions(0, 10), timeoutPromise])
    ).rejects.toThrow('Timeout')
  })

  test('should validate transaction data structure', async () => {
    const transactions = await transactionService.getTransactions(0, 1)
    const transaction = transactions.data[0]

    expect(transaction).toMatchObject({
      id: expect.any(String),
      userId: expect.any(String),
      date: expect.any(String),
      amount: expect.any(Number),
      category: expect.any(String),
      description: expect.any(String),
      type: expect.stringMatching(/^(INCOME|EXPENSE)$/),
      tags: expect.any(Array),
      notes: expect.any(String),
      receiptUrl: expect.any(String),
      recurring: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  test('should handle empty results', async () => {
    // Override with empty results
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.json({
          data: [],
          pagination: {
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            pageSize: 10,
            hasNext: false,
            hasPrevious: false,
          },
        }))
      })
    )

    const result = await transactionService.getTransactions(0, 10)

    expect(result.data).toHaveLength(0)
    expect(result.pagination.totalElements).toBe(0)
    expect(result.pagination.totalPages).toBe(0)
  })
})
