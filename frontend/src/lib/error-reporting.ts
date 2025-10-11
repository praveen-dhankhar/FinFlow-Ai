interface ErrorReport {
  id: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  level: 'error' | 'warning' | 'info'
  context?: Record<string, any>
  breadcrumbs?: Breadcrumb[]
}

interface Breadcrumb {
  timestamp: string
  category: string
  message: string
  level: 'error' | 'warning' | 'info'
  data?: Record<string, any>
}

class ErrorReportingService {
  private sessionId: string
  private breadcrumbs: Breadcrumb[] = []
  private isEnabled: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true'
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Add breadcrumb for debugging
  addBreadcrumb(category: string, message: string, level: 'error' | 'warning' | 'info' = 'info', data?: Record<string, any>) {
    if (!this.isEnabled) return

    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      level,
      data
    }

    this.breadcrumbs.push(breadcrumb)

    // Keep only last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50)
    }
  }

  // Report error
  async reportError(
    error: Error,
    context?: Record<string, any>,
    level: 'error' | 'warning' | 'info' = 'error'
  ) {
    if (!this.isEnabled) {
      console.error('Error reporting disabled:', error)
      return
    }

    const errorReport: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      level,
      context,
      breadcrumbs: [...this.breadcrumbs]
    }

    try {
      // In a real app, you would send this to your error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })

      // For now, just log to console
      console.error('Error reported:', errorReport)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  // Report warning
  async reportWarning(message: string, context?: Record<string, any>) {
    const error = new Error(message)
    await this.reportError(error, context, 'warning')
  }

  // Report info
  async reportInfo(message: string, context?: Record<string, any>) {
    const error = new Error(message)
    await this.reportError(error, context, 'info')
  }

  // Set user context
  setUserContext(userId: string, userInfo?: Record<string, any>) {
    this.addBreadcrumb('user', `User context set: ${userId}`, 'info', userInfo)
  }

  // Clear breadcrumbs
  clearBreadcrumbs() {
    this.breadcrumbs = []
  }

  // Get current session ID
  getSessionId(): string {
    return this.sessionId
  }

  // Enable/disable error reporting
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }
}

// Global error reporting instance
export const errorReporting = new ErrorReportingService()

// React error boundary helper
export function reportReactError(error: Error, errorInfo: any) {
  errorReporting.addBreadcrumb('react', 'React error boundary triggered', 'error', {
    componentStack: errorInfo.componentStack
  })
  
  errorReporting.reportError(error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  })
}

// Unhandled promise rejection handler
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorReporting.addBreadcrumb('promise', 'Unhandled promise rejection', 'error', {
      reason: event.reason?.toString(),
      promise: event.promise
    })
    
    errorReporting.reportError(
      new Error(`Unhandled promise rejection: ${event.reason}`),
      {
        reason: event.reason?.toString(),
        promise: event.promise
      }
    )
  })

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    errorReporting.addBreadcrumb('javascript', 'Global JavaScript error', 'error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
    
    errorReporting.reportError(
      new Error(`Global error: ${event.message}`),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    )
  })
}

// Performance monitoring integration
export function reportPerformanceIssue(metric: string, value: number, threshold: number) {
  errorReporting.addBreadcrumb('performance', `Performance issue: ${metric}`, 'warning', {
    metric,
    value,
    threshold
  })
  
  errorReporting.reportWarning(
    `Performance issue: ${metric} is ${value}ms (threshold: ${threshold}ms)`,
    { metric, value, threshold }
  )
}

// Network error reporting
export function reportNetworkError(url: string, status: number, message: string) {
  errorReporting.addBreadcrumb('network', `Network error: ${status}`, 'error', {
    url,
    status,
    message
  })
  
  errorReporting.reportError(
    new Error(`Network error: ${status} - ${message}`),
    { url, status, message }
  )
}

// User action tracking
export function trackUserAction(action: string, data?: Record<string, any>) {
  errorReporting.addBreadcrumb('user-action', action, 'info', data)
}

// API error reporting
export function reportApiError(endpoint: string, method: string, status: number, message: string) {
  errorReporting.addBreadcrumb('api', `API error: ${method} ${endpoint}`, 'error', {
    endpoint,
    method,
    status,
    message
  })
  
  errorReporting.reportError(
    new Error(`API error: ${method} ${endpoint} - ${status} ${message}`),
    { endpoint, method, status, message }
  )
}
