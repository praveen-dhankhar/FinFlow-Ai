import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Mock animejs to be a callable function with needed methods
vi.mock('animejs', () => {
  const fn: any = vi.fn(() => ({}))
  fn.stagger = vi.fn((n: number) => n)
  fn.remove = vi.fn()
  fn.pause = vi.fn()
  fn.play = vi.fn()
  return { default: fn }
})

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())
