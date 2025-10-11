import { waitForAnimationFrame, waitForMultipleAnimationFrames, measurePerformance } from '@/test-utils/test-utils'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { server } from '@/mocks/server'
import CategoryCard from '@/components/categories/CategoryCard'
import { mockCategories } from '@/lib/api/categories'

// Establish API mocking before all tests
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Animation Performance Tests', () => {
  test('should maintain 60fps during animations', async () => {
    const category = mockCategories[0]
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const { container } = render(
      <CategoryCard
        category={category}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const card = container.firstChild as HTMLElement

    // Measure animation performance
    const animationTime = await measurePerformance(async () => {
      // Trigger hover animation
      fireEvent.mouseEnter(card)
      await waitForAnimationFrame()
      
      // Trigger click animation
      fireEvent.click(card)
      await waitForAnimationFrame()
      
      // Trigger mouse leave
      fireEvent.mouseLeave(card)
      await waitForMultipleAnimationFrames(3) // Wait for animation to complete
    })

    // Animation should complete quickly (less than 100ms for smooth 60fps)
    expect(animationTime).toBeLessThan(100)
  })

  test('should handle multiple simultaneous animations', async () => {
    const categories = mockCategories.slice(0, 5)
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const { container } = render(
      <div>
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        ))}
      </div>
    )

    const cards = container.querySelectorAll('[data-testid="category-card"]')

    const animationTime = await measurePerformance(async () => {
      // Trigger animations on all cards simultaneously
      cards.forEach(card => {
        fireEvent.mouseEnter(card)
      })
      
      await waitForAnimationFrame()
      
      cards.forEach(card => {
        fireEvent.mouseLeave(card)
      })
      
      await waitForMultipleAnimationFrames(5)
    })

    // Multiple animations should still be smooth
    expect(animationTime).toBeLessThan(200)
  })

  test('should not cause layout thrashing during animations', async () => {
    const category = mockCategories[0]
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const { container } = render(
      <CategoryCard
        category={category}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const card = container.firstChild as HTMLElement
    const initialRect = card.getBoundingClientRect()

    // Trigger animations that might cause layout changes
    fireEvent.mouseEnter(card)
    await waitForAnimationFrame()
    
    const hoverRect = card.getBoundingClientRect()
    
    fireEvent.mouseLeave(card)
    await waitForAnimationFrame()
    
    const finalRect = card.getBoundingClientRect()

    // Layout should not change significantly during animations
    expect(Math.abs(finalRect.width - initialRect.width)).toBeLessThan(1)
    expect(Math.abs(finalRect.height - initialRect.height)).toBeLessThan(1)
  })

  test('should handle rapid animation triggers smoothly', async () => {
    const category = mockCategories[0]
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const { container } = render(
      <CategoryCard
        category={category}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const card = container.firstChild as HTMLElement

    const animationTime = await measurePerformance(async () => {
      // Rapidly trigger hover events
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(card)
        fireEvent.mouseLeave(card)
        await waitForAnimationFrame()
      }
    })

    // Should handle rapid triggers without performance degradation
    expect(animationTime).toBeLessThan(500)
  })

  test('should maintain smooth animations with large datasets', async () => {
    const categories = mockCategories.slice(0, 20) // Large dataset
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const { container } = render(
      <div>
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        ))}
      </div>
    )

    const cards = container.querySelectorAll('[data-testid="category-card"]')

    const animationTime = await measurePerformance(async () => {
      // Animate all cards
      cards.forEach(card => {
        fireEvent.mouseEnter(card)
      })
      
      await waitForMultipleAnimationFrames(2)
      
      cards.forEach(card => {
        fireEvent.mouseLeave(card)
      })
      
      await waitForMultipleAnimationFrames(3)
    })

    // Should maintain performance even with large datasets
    expect(animationTime).toBeLessThan(1000)
  })

  test('should handle animation interruptions gracefully', async () => {
    const category = mockCategories[0]
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const { container } = render(
      <CategoryCard
        category={category}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const card = container.firstChild as HTMLElement

    const animationTime = await measurePerformance(async () => {
      // Start animation
      fireEvent.mouseEnter(card)
      await waitForAnimationFrame()
      
      // Interrupt with another animation
      fireEvent.mouseLeave(card)
      fireEvent.mouseEnter(card)
      await waitForAnimationFrame()
      
      // Complete animation
      fireEvent.mouseLeave(card)
      await waitForMultipleAnimationFrames(3)
    })

    // Should handle interruptions smoothly
    expect(animationTime).toBeLessThan(200)
  })

  test('should not cause memory leaks during animations', async () => {
    const category = mockCategories[0]
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const initialMemory = process.memoryUsage()

    // Create and destroy multiple components with animations
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CategoryCard
          category={category}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      )

      const card = screen.getByTestId('category-card')
      fireEvent.mouseEnter(card)
      await waitForAnimationFrame()
      fireEvent.mouseLeave(card)
      await waitForAnimationFrame()
      
      unmount()
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    const finalMemory = process.memoryUsage()
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed

    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // Less than 10MB
  })

  test('should maintain consistent animation timing', async () => {
    const category = mockCategories[0]
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const animationTimes: number[] = []

    // Measure animation timing multiple times
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(
        <CategoryCard
          category={category}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      )

      const card = screen.getByTestId('category-card')
      
      const animationTime = await measurePerformance(async () => {
        fireEvent.mouseEnter(card)
        await waitForMultipleAnimationFrames(3)
        fireEvent.mouseLeave(card)
        await waitForMultipleAnimationFrames(3)
      })

      animationTimes.push(animationTime)
      unmount()
    }

    // Calculate standard deviation
    const average = animationTimes.reduce((a, b) => a + b, 0) / animationTimes.length
    const variance = animationTimes.reduce((acc, time) => acc + Math.pow(time - average, 2), 0) / animationTimes.length
    const standardDeviation = Math.sqrt(variance)

    // Animation timing should be consistent (low standard deviation)
    expect(standardDeviation).toBeLessThan(average * 0.2) // Less than 20% variation
  })
})
