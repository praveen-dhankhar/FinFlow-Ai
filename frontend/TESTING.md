# Testing Guide

This document provides a comprehensive guide for testing the Finance Forecast App.

## Table of Contents

- [Testing Overview](#testing-overview)
- [Unit Tests](#unit-tests)
- [Component Tests](#component-tests)
- [E2E Tests](#e2e-tests)
- [Performance Tests](#performance-tests)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)

## Testing Overview

Our testing strategy includes:

- **Unit Tests**: Test individual functions and utilities
- **Component Tests**: Test React components in isolation
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test application performance and bundle size

## Unit Tests

### Setup

Unit tests use Jest with React Testing Library for component testing.

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── error/
│   │   └── loading/
│   ├── hooks/
│   ├── utils/
│   └── performance/
├── test-utils/
│   └── test-utils.tsx
└── jest.config.js
```

### Writing Unit Tests

```typescript
import { render, screen, fireEvent } from '@/test-utils/test-utils'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Component Tests

### Test Categories

1. **UI Components**: Button, Input, Card, etc.
2. **Form Components**: Form validation, input handling
3. **Error Components**: Error boundaries, error states
4. **Loading Components**: Skeleton screens, loading states
5. **Empty States**: Empty state components

### Test Utilities

Our test utilities provide:

- **Custom render function** with all providers
- **Mock data generators** for consistent test data
- **Helper functions** for common test operations
- **Mock API responses** for integration testing

```typescript
import { render, screen, mockTransaction, testHelpers } from '@/test-utils/test-utils'

describe('TransactionForm', () => {
  it('should submit valid transaction', async () => {
    const onSubmit = jest.fn()
    render(<TransactionForm onSubmit={onSubmit} />)
    
    // Fill form
    await screen.getByLabelText('Amount').fill('100.50')
    await screen.getByLabelText('Description').fill('Test Transaction')
    
    // Submit
    await screen.getByRole('button', { name: 'Add Transaction' }).click()
    
    expect(onSubmit).toHaveBeenCalledWith({
      amount: '100.50',
      description: 'Test Transaction'
    })
  })
})
```

## E2E Tests

### Setup

E2E tests use Playwright for cross-browser testing.

```bash
# Install Playwright browsers
npm run test:setup

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Test Structure

```
e2e/
├── auth.spec.ts          # Authentication flow
├── transactions.spec.ts  # Transaction CRUD
├── dashboard.spec.ts     # Dashboard and charts
└── goals.spec.ts         # Goals management
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})
```

### E2E Test Categories

1. **Authentication**: Login, logout, registration
2. **Transaction Management**: CRUD operations, filtering, searching
3. **Dashboard**: Data visualization, metrics display
4. **Goals Management**: Goal creation, progress tracking
5. **Budget Management**: Budget creation, tracking
6. **Settings**: User preferences, account management

## Performance Tests

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Run bundle analysis tests
npm run test:performance
```

### Lighthouse CI

```bash
# Run Lighthouse CI
npm run lighthouse

# Run Lighthouse CI with upload
npm run lighthouse:ci
```

### Performance Metrics

- **Bundle Size**: < 500KB main bundle, < 2MB total
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Total Blocking Time**: < 300ms

## Running Tests

### All Tests

```bash
# Run all tests (unit + E2E + performance)
npm run test:all
```

### Individual Test Suites

```bash
# Unit tests only
npm run test

# E2E tests only
npm run test:e2e

# Performance tests only
npm run test:performance
```

### Test Modes

```bash
# Watch mode (unit tests)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (no watch)
npm run test:ci
```

## Test Coverage

### Coverage Goals

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
      - run: npm run lighthouse:ci
```

### Test Reports

- **Unit Tests**: Jest HTML reporter
- **E2E Tests**: Playwright HTML reporter
- **Performance**: Lighthouse CI reports
- **Coverage**: LCOV format for integration

## Best Practices

### Writing Tests

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test User Interactions**: Simulate real user behavior
4. **Keep Tests Simple**: One assertion per test when possible
5. **Use Descriptive Names**: Test names should describe the behavior being tested

### Test Data

1. **Use Mock Data**: Consistent, predictable test data
2. **Isolate Tests**: Each test should be independent
3. **Clean Up**: Reset state between tests
4. **Use Factories**: Generate test data programmatically

### Performance

1. **Mock Heavy Operations**: Mock API calls, file operations
2. **Use Virtual DOM**: Test components in isolation
3. **Avoid Real Timers**: Use fake timers for time-dependent tests
4. **Optimize Test Data**: Use minimal data sets

## Troubleshooting

### Common Issues

1. **MSW Not Working**: Ensure handlers are properly imported
2. **Async Operations**: Use `waitFor` for async operations
3. **Router Issues**: Mock Next.js router in tests
4. **Theme Issues**: Provide theme context in tests

### Debugging

```bash
# Debug E2E tests
npm run test:e2e:debug

# Run specific test
npm run test -- --testNamePattern="Button"

# Run tests in specific file
npm run test -- src/components/__tests__/Button.test.tsx
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [MSW Documentation](https://mswjs.io/docs/)