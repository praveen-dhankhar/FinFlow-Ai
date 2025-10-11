import { rest } from 'msw'
import { server } from '@/mocks/server'
import { categoryService } from '@/lib/api/categories'
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/api/categories'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())

describe('Categories API Integration Tests', () => {
  test('should load categories list', async () => {
    const categories = await categoryService.getCategories()

    expect(categories).toBeDefined()
    expect(Array.isArray(categories)).toBe(true)
    expect(categories.length).toBeGreaterThan(0)
  })

  test('should filter categories by search term', async () => {
    const searchResults = await categoryService.getCategories({
      search: 'food',
    })

    expect(searchResults).toBeDefined()
    searchResults.forEach(category => {
      expect(
        category.name.toLowerCase().includes('food') ||
        category.description?.toLowerCase().includes('food')
      ).toBe(true)
    })
  })

  test('should filter categories by active status', async () => {
    const activeCategories = await categoryService.getCategories({
      isActive: true,
    })

    expect(activeCategories).toBeDefined()
    activeCategories.forEach(category => {
      expect(category.isActive).toBe(true)
    })
  })

  test('should filter categories by budget status', async () => {
    const categoriesWithBudget = await categoryService.getCategories({
      hasBudget: true,
    })

    expect(categoriesWithBudget).toBeDefined()
    categoriesWithBudget.forEach(category => {
      expect(category.budget).toBeDefined()
      expect(category.budget).toBeGreaterThan(0)
    })
  })

  test('should filter categories by parent category', async () => {
    const parentCategories = await categoryService.getCategories({
      parentId: undefined, // Main categories only
    })

    expect(parentCategories).toBeDefined()
    parentCategories.forEach(category => {
      expect(category.parentId).toBeUndefined()
    })
  })

  test('should get single category by ID', async () => {
    const categories = await categoryService.getCategories()
    const firstCategory = categories[0]

    const category = await categoryService.getCategory(firstCategory.id)

    expect(category).toBeDefined()
    expect(category.id).toBe(firstCategory.id)
    expect(category.name).toBe(firstCategory.name)
  })

  test('should create new category', async () => {
    const newCategory: CreateCategoryRequest = {
      name: 'Test Category',
      description: 'Test category description',
      icon: 'Home',
      color: '#3B82F6',
      budget: 1000,
    }

    const createdCategory = await categoryService.createCategory(newCategory)

    expect(createdCategory).toBeDefined()
    expect(createdCategory.id).toBeDefined()
    expect(createdCategory.name).toBe(newCategory.name)
    expect(createdCategory.description).toBe(newCategory.description)
    expect(createdCategory.icon).toBe(newCategory.icon)
    expect(createdCategory.color).toBe(newCategory.color)
    expect(createdCategory.budget).toBe(newCategory.budget)
    expect(createdCategory.isActive).toBe(true)
    expect(createdCategory.createdAt).toBeDefined()
    expect(createdCategory.updatedAt).toBeDefined()
  })

  test('should update existing category', async () => {
    // First, get an existing category
    const categories = await categoryService.getCategories()
    const existingCategory = categories[0]

    const updates: UpdateCategoryRequest = {
      name: 'Updated Category Name',
      description: 'Updated description',
      budget: 2000,
    }

    const updatedCategory = await categoryService.updateCategory(
      existingCategory.id,
      updates
    )

    expect(updatedCategory).toBeDefined()
    expect(updatedCategory.id).toBe(existingCategory.id)
    expect(updatedCategory.name).toBe(updates.name)
    expect(updatedCategory.description).toBe(updates.description)
    expect(updatedCategory.budget).toBe(updates.budget)
    expect(updatedCategory.updatedAt).not.toBe(existingCategory.updatedAt)
  })

  test('should delete category', async () => {
    // First, get an existing category
    const categories = await categoryService.getCategories()
    const existingCategory = categories[0]

    await expect(
      categoryService.deleteCategory(existingCategory.id)
    ).resolves.not.toThrow()

    // Verify category is deleted
    await expect(
      categoryService.getCategory(existingCategory.id)
    ).rejects.toThrow()
  })

  test('should reorder categories', async () => {
    const categories = await categoryService.getCategories()
    const categoryIds = categories.map(c => c.id).reverse() // Reverse order

    await expect(
      categoryService.reorderCategories({ categoryIds })
    ).resolves.not.toThrow()
  })

  test('should get category insights', async () => {
    const insights = await categoryService.getCategoryInsights()

    expect(insights).toBeDefined()
    expect(insights.topSpending).toBeDefined()
    expect(insights.monthOverMonth).toBeDefined()
    expect(insights.trending).toBeDefined()
    expect(insights.suggestions).toBeDefined()

    // Validate top spending structure
    expect(insights.topSpending).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: expect.any(Object),
          amount: expect.any(Number),
          percentage: expect.any(Number),
          trend: expect.stringMatching(/^(up|down|stable)$/),
        })
      ])
    )

    // Validate month over month structure
    expect(insights.monthOverMonth).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: expect.any(Object),
          currentMonth: expect.any(Number),
          lastMonth: expect.any(Number),
          change: expect.any(Number),
          changePercentage: expect.any(Number),
        })
      ])
    )

    // Validate trending structure
    expect(insights.trending).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: expect.any(Object),
          growth: expect.any(Number),
          period: expect.any(String),
        })
      ])
    )

    // Validate suggestions structure
    expect(insights.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: expect.stringMatching(/^(budget|spending|optimization)$/),
          message: expect.any(String),
          action: expect.any(String),
        })
      ])
    )
  })

  test('should get category spending data', async () => {
    const categories = await categoryService.getCategories()
    const firstCategory = categories[0]

    const spendingData = await categoryService.getCategorySpending(firstCategory.id, 'month')

    expect(spendingData).toBeDefined()
    expect(spendingData.categoryId).toBe(firstCategory.id)
    expect(spendingData.period).toBe('month')
    expect(spendingData.spending).toBeDefined()
    expect(spendingData.spending.currentMonth).toBeTypeOf('number')
    expect(spendingData.spending.lastMonth).toBeTypeOf('number')
    expect(spendingData.spending.yearToDate).toBeTypeOf('number')
  })

  test('should handle API errors gracefully', async () => {
    // Override with error response
    server.use(
      rest.get('/api/categories', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Internal server error' }))
      })
    )

    await expect(categoryService.getCategories()).rejects.toThrow()
  })

  test('should handle network timeout', async () => {
    // Override with timeout
    server.use(
      rest.get('/api/categories', (req, res, ctx) => {
        return res(ctx.delay('infinite'))
      })
    )

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 1000)
    })

    await expect(
      Promise.race([categoryService.getCategories(), timeoutPromise])
    ).rejects.toThrow('Timeout')
  })

  test('should validate category data structure', async () => {
    const categories = await categoryService.getCategories()
    const category = categories[0]

    expect(category).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      icon: expect.any(String),
      color: expect.any(String),
      budget: expect.any(Number),
      parentId: expect.any(String),
      isActive: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      order: expect.any(Number),
      spending: expect.objectContaining({
        currentMonth: expect.any(Number),
        lastMonth: expect.any(Number),
        yearToDate: expect.any(Number),
      }),
      transactionCount: expect.any(Number),
    })
  })

  test('should handle empty results', async () => {
    // Override with empty results
    server.use(
      rest.get('/api/categories', (req, res, ctx) => {
        return res(ctx.json([]))
      })
    )

    const categories = await categoryService.getCategories()

    expect(categories).toHaveLength(0)
  })

  test('should handle 404 errors for non-existent categories', async () => {
    await expect(
      categoryService.getCategory('non-existent-id')
    ).rejects.toThrow()
  })

  test('should handle validation errors for invalid category data', async () => {
    const invalidCategory = {
      name: '', // Invalid: empty name
      description: 'Test',
      icon: 'Home',
      color: '#3B82F6',
    }

    // Override with validation error
    server.use(
      rest.post('/api/categories', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ message: 'Validation failed', errors: ['Name is required'] })
        )
      })
    )

    await expect(
      categoryService.createCategory(invalidCategory as CreateCategoryRequest)
    ).rejects.toThrow()
  })
})
