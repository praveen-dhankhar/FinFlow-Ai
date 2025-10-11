#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Finance Forecast App
 * 
 * This script runs all tests and provides detailed performance metrics
 */

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

interface TestResults {
  apiTests: {
    passed: number
    failed: number
    duration: number
  }
  performanceTests: {
    passed: number
    failed: number
    duration: number
  }
  coverage: {
    statements: number
    branches: number
    functions: number
    lines: number
  }
}

class TestRunner {
  private results: TestResults = {
    apiTests: { passed: 0, failed: 0, duration: 0 },
    performanceTests: { passed: 0, failed: 0, duration: 0 },
    coverage: { statements: 0, branches: 0, functions: 0, lines: 0 }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive test suite...\n')

    try {
      // Run API integration tests
      await this.runApiTests()
      
      // Run performance tests
      await this.runPerformanceTests()
      
      // Run coverage analysis
      await this.runCoverageAnalysis()
      
      // Generate report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Test suite failed:', error)
      process.exit(1)
    }
  }

  private async runApiTests(): Promise<void> {
    console.log('📡 Running API Integration Tests...')
    const startTime = performance.now()

    try {
      const output = execSync('npm test -- --testPathPattern="api" --verbose', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      const endTime = performance.now()
      this.results.apiTests.duration = endTime - startTime

      // Parse test results
      const passedMatches = output.match(/(\d+) passing/g)
      const failedMatches = output.match(/(\d+) failing/g)

      this.results.apiTests.passed = passedMatches ? 
        parseInt(passedMatches[0].match(/\d+/)?.[0] || '0') : 0
      this.results.apiTests.failed = failedMatches ? 
        parseInt(failedMatches[0].match(/\d+/)?.[0] || '0') : 0

      console.log(`✅ API Tests completed in ${this.results.apiTests.duration.toFixed(2)}ms`)
      console.log(`   Passed: ${this.results.apiTests.passed}, Failed: ${this.results.apiTests.failed}\n`)

    } catch (error) {
      console.error('❌ API Tests failed:', error)
      this.results.apiTests.failed = 1
    }
  }

  private async runPerformanceTests(): Promise<void> {
    console.log('⚡ Running Performance Tests...')
    const startTime = performance.now()

    try {
      const output = execSync('npm test -- --testPathPattern="performance" --verbose', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      const endTime = performance.now()
      this.results.performanceTests.duration = endTime - startTime

      // Parse test results
      const passedMatches = output.match(/(\d+) passing/g)
      const failedMatches = output.match(/(\d+) failing/g)

      this.results.performanceTests.passed = passedMatches ? 
        parseInt(passedMatches[0].match(/\d+/)?.[0] || '0') : 0
      this.results.performanceTests.failed = failedMatches ? 
        parseInt(failedMatches[0].match(/\d+/)?.[0] || '0') : 0

      console.log(`✅ Performance Tests completed in ${this.results.performanceTests.duration.toFixed(2)}ms`)
      console.log(`   Passed: ${this.results.performanceTests.passed}, Failed: ${this.results.performanceTests.failed}\n`)

    } catch (error) {
      console.error('❌ Performance Tests failed:', error)
      this.results.performanceTests.failed = 1
    }
  }

  private async runCoverageAnalysis(): Promise<void> {
    console.log('📊 Running Coverage Analysis...')

    try {
      const output = execSync('npm run test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      // Parse coverage results
      const coverageMatch = output.match(/All files\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)/)
      
      if (coverageMatch) {
        this.results.coverage.statements = parseFloat(coverageMatch[1])
        this.results.coverage.branches = parseFloat(coverageMatch[2])
        this.results.coverage.functions = parseFloat(coverageMatch[3])
        this.results.coverage.lines = parseFloat(coverageMatch[4])
      }

      console.log('✅ Coverage Analysis completed\n')

    } catch (error) {
      console.error('❌ Coverage Analysis failed:', error)
    }
  }

  private generateReport(): void {
    console.log('📋 Test Results Summary')
    console.log('=' .repeat(50))
    
    // API Tests Summary
    console.log('\n📡 API Integration Tests:')
    console.log(`   ✅ Passed: ${this.results.apiTests.passed}`)
    console.log(`   ❌ Failed: ${this.results.apiTests.failed}`)
    console.log(`   ⏱️  Duration: ${this.results.apiTests.duration.toFixed(2)}ms`)
    
    // Performance Tests Summary
    console.log('\n⚡ Performance Tests:')
    console.log(`   ✅ Passed: ${this.results.performanceTests.passed}`)
    console.log(`   ❌ Failed: ${this.results.performanceTests.failed}`)
    console.log(`   ⏱️  Duration: ${this.results.performanceTests.duration.toFixed(2)}ms`)
    
    // Coverage Summary
    console.log('\n📊 Code Coverage:')
    console.log(`   📝 Statements: ${this.results.coverage.statements.toFixed(1)}%`)
    console.log(`   🌿 Branches: ${this.results.coverage.branches.toFixed(1)}%`)
    console.log(`   🔧 Functions: ${this.results.coverage.functions.toFixed(1)}%`)
    console.log(`   📄 Lines: ${this.results.coverage.lines.toFixed(1)}%`)
    
    // Overall Status
    const totalPassed = this.results.apiTests.passed + this.results.performanceTests.passed
    const totalFailed = this.results.apiTests.failed + this.results.performanceTests.failed
    
    console.log('\n🎯 Overall Results:')
    console.log(`   ✅ Total Passed: ${totalPassed}`)
    console.log(`   ❌ Total Failed: ${totalFailed}`)
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! The application is ready for production.')
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix the issues.')
    }
    
    // Performance Benchmarks
    console.log('\n🏆 Performance Benchmarks:')
    console.log(`   📡 API Tests: ${this.results.apiTests.duration.toFixed(2)}ms`)
    console.log(`   ⚡ Performance Tests: ${this.results.performanceTests.duration.toFixed(2)}ms`)
    
    // Coverage Thresholds
    console.log('\n📈 Coverage Thresholds:')
    const thresholds = { statements: 70, branches: 70, functions: 70, lines: 70 }
    const coverageMet = Object.entries(thresholds).every(([key, threshold]) => 
      this.results.coverage[key as keyof typeof this.results.coverage] >= threshold
    )
    
    if (coverageMet) {
      console.log('   ✅ All coverage thresholds met')
    } else {
      console.log('   ⚠️  Some coverage thresholds not met')
    }
  }
}

// Run the test suite
if (require.main === module) {
  const runner = new TestRunner()
  runner.runAllTests().catch(console.error)
}

export default TestRunner
