/**
 * Performance Monitoring Utility
 * 
 * This utility provides comprehensive performance monitoring for the application
 */

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  renderTime: number
  memoryUsage: number
  animationFrameRate: number
}

interface PerformanceThresholds {
  pageLoadTime: number // 3 seconds
  apiResponseTime: number // 1 second
  renderTime: number // 100ms
  memoryUsage: number // 50MB
  animationFrameRate: number // 60fps
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    apiResponseTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    animationFrameRate: 0,
  }

  private thresholds: PerformanceThresholds = {
    pageLoadTime: 3000,
    apiResponseTime: 1000,
    renderTime: 100,
    memoryUsage: 50 * 1024 * 1024, // 50MB
    animationFrameRate: 60,
  }

  private observers: PerformanceObserver[] = []
  private frameCount = 0
  private lastFrameTime = 0
  private fps = 0

  constructor() {
    this.initializeObservers()
    this.startFrameRateMonitoring()
  }

  private initializeObservers(): void {
    // Monitor page load performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
        this.checkThreshold('pageLoadTime', this.metrics.pageLoadTime)
      })

      // Monitor API performance
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const startTime = performance.now()
        try {
          const response = await originalFetch(...args)
          const endTime = performance.now()
          this.metrics.apiResponseTime = endTime - startTime
          this.checkThreshold('apiResponseTime', this.metrics.apiResponseTime)
          return response
        } catch (error) {
          const endTime = performance.now()
          this.metrics.apiResponseTime = endTime - startTime
          this.checkThreshold('apiResponseTime', this.metrics.apiResponseTime)
          throw error
        }
      }
    }
  }

  private startFrameRateMonitoring(): void {
    if (typeof window !== 'undefined') {
      const measureFrameRate = () => {
        const now = performance.now()
        this.frameCount++

        if (this.lastFrameTime) {
          const delta = now - this.lastFrameTime
          if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta)
            this.metrics.animationFrameRate = this.fps
            this.checkThreshold('animationFrameRate', this.fps)
            this.frameCount = 0
            this.lastFrameTime = now
          }
        } else {
          this.lastFrameTime = now
        }

        requestAnimationFrame(measureFrameRate)
      }

      requestAnimationFrame(measureFrameRate)
    }
  }

  private checkThreshold(metric: keyof PerformanceThresholds, value: number): void {
    const threshold = this.thresholds[metric]
    if (value > threshold) {
      console.warn(`⚠️ Performance threshold exceeded for ${metric}: ${value} > ${threshold}`)
      this.reportPerformanceIssue(metric, value, threshold)
    }
  }

  private reportPerformanceIssue(metric: string, value: number, threshold: number): void {
    // In a real application, you would send this to a monitoring service
    const issue = {
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Performance Issue:', issue)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(issue)
    }
  }

  private sendToMonitoringService(issue: any): void {
    // Implement your monitoring service integration here
    // Examples: Sentry, DataDog, New Relic, etc.
    fetch('/api/performance-issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    }).catch(error => {
      console.error('Failed to send performance issue:', error)
    })
  }

  // Public methods for manual performance measurement
  measurePageLoad(): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return navigation.loadEventEnd - navigation.fetchStart
    }
    return 0
  }

  measureRenderTime(componentName: string): () => number {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      this.metrics.renderTime = renderTime
      this.checkThreshold('renderTime', renderTime)
      return renderTime
    }
  }

  measureMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize
      this.checkThreshold('memoryUsage', memory.usedJSHeapSize)
      return memory.usedJSHeapSize
    }
    return 0
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds }
  }

  setThreshold(metric: keyof PerformanceThresholds, value: number): void {
    this.thresholds[metric] = value
  }

  // Performance testing utilities
  async measureAsyncOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = performance.now()
    const result = await operation()
    const endTime = performance.now()
    const duration = endTime - startTime
    
    this.metrics.apiResponseTime = duration
    this.checkThreshold('apiResponseTime', duration)
    
    return { result, duration }
  }

  measureSyncOperation<T>(operation: () => T): { result: T; duration: number } {
    const startTime = performance.now()
    const result = operation()
    const endTime = performance.now()
    const duration = endTime - startTime
    
    this.metrics.renderTime = duration
    this.checkThreshold('renderTime', duration)
    
    return { result, duration }
  }

  // Memory leak detection
  detectMemoryLeaks(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      const currentUsage = memory.usedJSHeapSize
      
      if (currentUsage > this.metrics.memoryUsage * 1.5) {
        console.warn('⚠️ Potential memory leak detected:', {
          current: currentUsage,
          previous: this.metrics.memoryUsage,
          increase: currentUsage - this.metrics.memoryUsage,
        })
      }
      
      this.metrics.memoryUsage = currentUsage
    }
  }

  // Performance report generation
  generateReport(): string {
    const metrics = this.getMetrics()
    const thresholds = this.getThresholds()
    
    const report = `
Performance Report
=================

Page Load Time: ${metrics.pageLoadTime.toFixed(2)}ms (threshold: ${thresholds.pageLoadTime}ms)
API Response Time: ${metrics.apiResponseTime.toFixed(2)}ms (threshold: ${thresholds.apiResponseTime}ms)
Render Time: ${metrics.renderTime.toFixed(2)}ms (threshold: ${thresholds.renderTime}ms)
Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB (threshold: ${(thresholds.memoryUsage / 1024 / 1024).toFixed(2)}MB)
Animation Frame Rate: ${metrics.animationFrameRate}fps (threshold: ${thresholds.animationFrameRate}fps)

Status: ${this.isPerformanceGood() ? '✅ Good' : '⚠️ Needs Improvement'}
    `.trim()
    
    return report
  }

  private isPerformanceGood(): boolean {
    const metrics = this.getMetrics()
    const thresholds = this.getThresholds()
    
    return (
      metrics.pageLoadTime <= thresholds.pageLoadTime &&
      metrics.apiResponseTime <= thresholds.apiResponseTime &&
      metrics.renderTime <= thresholds.renderTime &&
      metrics.memoryUsage <= thresholds.memoryUsage &&
      metrics.animationFrameRate >= thresholds.animationFrameRate
    )
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

export default performanceMonitor
export { PerformanceMonitor, PerformanceMetrics, PerformanceThresholds }
