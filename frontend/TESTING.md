# Testing Guide

This document provides comprehensive information about the testing infrastructure for the Finance Forecast application.

## 🧪 Test Suite Overview

The application includes a comprehensive test suite covering:

- **API Integration Tests** - Testing all API endpoints and data flows
- **Performance Tests** - Measuring page load times, animations, and memory usage
- **Component Tests** - Unit tests for React components
- **End-to-End Tests** - Full user journey testing

## 📁 Test Structure

```
src/
├── __tests__/
│   ├── api/                    # API integration tests
│   │   ├── dashboard.test.ts
│   │   ├── transactions.test.ts
│   │   └── categories.test.ts
│   ├── performance/            # Performance tests
│   │   ├── page-load.test.ts
│   │   ├── animations.test.ts
│   │   ├── memory-leaks.test.ts
│   │   └── re-renders.test.ts
│   ├── setup.test.ts          # Test setup verification
│   └── test-runner.ts         # Comprehensive test runner
├── mocks/                      # Mock API server
│   ├── handlers.ts
│   ├── server.ts
│   └── browser.ts
├── test-utils/                 # Testing utilities
│   └── test-utils.tsx
└── utils/
    └── performance-monitor.ts  # Performance monitoring
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Specific Test Suites

```bash
# Run only API tests
npm test -- --testPathPatterns="api"

# Run only performance tests
npm test -- --testPathPatterns="performance"

# Run tests for specific component
npm test -- --testPathPatterns="CategoryCard"
```

## 📊 API Integration Tests

### Dashboard API Tests
- ✅ Dashboard stats load from API
- ✅ Error handling for API failures
- ✅ Network timeout handling
- ✅ Data structure validation
- ✅ Empty data handling

### Transaction API Tests
- ✅ Transactions list with pagination
- ✅ Add new transaction
- ✅ Edit existing transaction
- ✅ Delete transaction
- ✅ Bulk operations work
- ✅ Data exports work (CSV/JSON)
- ✅ Filtering and search
- ✅ Date range filtering
- ✅ Category filtering

### Category API Tests
- ✅ Categories CRUD operations
- ✅ Category insights
- ✅ Category spending data
- ✅ Reorder categories
- ✅ Filter categories
- ✅ Search categories

## ⚡ Performance Tests

### Page Load Performance
- ✅ Dashboard page loads within 3 seconds
- ✅ Transactions page loads within 3 seconds
- ✅ Categories page loads within 3 seconds
- ✅ Forecasts page loads within 3 seconds
- ✅ Large dataset handling
- ✅ Slow API response handling

### Animation Performance
- ✅ Maintains 60fps during animations
- ✅ Multiple simultaneous animations
- ✅ No layout thrashing
- ✅ Rapid animation triggers
- ✅ Large dataset animations
- ✅ Animation interruptions
- ✅ Memory leak prevention
- ✅ Consistent animation timing

### Memory Leak Tests
- ✅ Component mount/unmount cycles
- ✅ Large dataset handling
- ✅ API call memory management
- ✅ Event listener cleanup
- ✅ Timer and interval cleanup
- ✅ React Query cache cleanup
- ✅ Form input cleanup
- ✅ Animation cleanup
- ✅ Navigation cleanup

### Re-render Optimization
- ✅ Minimize re-renders during state updates
- ✅ Prevent unnecessary re-renders
- ✅ Large list optimization
- ✅ Form interaction optimization
- ✅ Search operation optimization
- ✅ Prevent re-render cascades
- ✅ Context update optimization
- ✅ API call optimization
- ✅ Memoized component optimization

## 🛠️ Testing Utilities

### Performance Measurement
```typescript
import { measurePerformance, measureRenderTime } from '@/test-utils/test-utils'

// Measure async operation
const duration = await measurePerformance(async () => {
  await someAsyncOperation()
})

// Measure render time
const renderTime = measureRenderTime(<MyComponent />)
```

### Memory Leak Detection
```typescript
import { checkForMemoryLeaks } from '@/test-utils/test-utils'

const initialMemory = checkForMemoryLeaks()
// ... perform operations
const finalMemory = checkForMemoryLeaks()
const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
```

### Mock Data Generation
```typescript
import { generateMockTransaction, generateMockCategory } from '@/test-utils/test-utils'

const transaction = generateMockTransaction({
  amount: 1000,
  category: 'Custom Category'
})
```

## 📈 Performance Monitoring

The application includes a comprehensive performance monitoring system:

### Metrics Tracked
- **Page Load Time** - Time to load complete page
- **API Response Time** - Time for API calls to complete
- **Render Time** - Time to render components
- **Memory Usage** - JavaScript heap usage
- **Animation Frame Rate** - FPS for animations

### Thresholds
- Page Load Time: < 3 seconds
- API Response Time: < 1 second
- Render Time: < 100ms
- Memory Usage: < 50MB
- Animation Frame Rate: > 60fps

### Usage
```typescript
import performanceMonitor from '@/utils/performance-monitor'

// Get current metrics
const metrics = performanceMonitor.getMetrics()

// Generate performance report
const report = performanceMonitor.generateReport()

// Measure custom operation
const { result, duration } = await performanceMonitor.measureAsyncOperation(
  async () => await myAsyncOperation()
)
```

## 🎯 Test Coverage

The test suite aims for comprehensive coverage:

- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## 🔧 Mock API Server

The application uses MSW (Mock Service Worker) for API mocking:

### Features
- ✅ Realistic API responses
- ✅ Error simulation
- ✅ Network delay simulation
- ✅ Request/response logging
- ✅ Dynamic data generation

### Usage in Tests
```typescript
import { server } from '@/mocks/server'
import { rest } from 'msw'

// Override default handler
server.use(
  rest.get('/api/transactions', (req, res, ctx) => {
    return res(ctx.json({ data: [] }))
  })
)
```

## 🚨 Troubleshooting

### Common Issues

1. **Request is not defined**
   - Ensure Jest setup includes Request/Response mocks
   - Check Jest configuration for proper environment setup

2. **Tests timing out**
   - Increase Jest timeout in configuration
   - Check for infinite loops in test code

3. **Memory leaks in tests**
   - Ensure proper cleanup in afterEach/afterAll
   - Check for event listener cleanup

4. **Performance tests failing**
   - Check system performance
   - Adjust performance thresholds if needed

### Debug Mode
```bash
# Run tests with debug output
npm test -- --verbose --no-cache

# Run specific test with debug
npm test -- --testNamePattern="specific test" --verbose
```

## 📝 Writing Tests

### Best Practices

1. **Test Structure**
   - Use descriptive test names
   - Group related tests with `describe`
   - Use `beforeEach`/`afterEach` for setup/cleanup

2. **Assertions**
   - Use specific assertions
   - Test both success and error cases
   - Verify data structure and types

3. **Performance Tests**
   - Set realistic thresholds
   - Test with various data sizes
   - Include cleanup verification

4. **Mock Data**
   - Use realistic test data
   - Test edge cases
   - Verify data validation

### Example Test
```typescript
describe('Transaction API', () => {
  beforeEach(() => {
    // Setup test data
  })

  afterEach(() => {
    // Cleanup
  })

  test('should create transaction successfully', async () => {
    const transaction = generateMockTransaction()
    const result = await transactionService.createTransaction(transaction)
    
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.amount).toBe(transaction.amount)
  })
})
```

## 🎉 Continuous Integration

The test suite is designed to run in CI environments:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm run test:ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Performance Testing Best Practices](https://web.dev/performance-testing/)

---

**Note**: This testing infrastructure ensures the Finance Forecast application maintains high quality, performance, and reliability across all features and user interactions.
