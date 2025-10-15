'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'section'
  className?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Report error to monitoring service
    this.reportError(error, errorInfo)

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your error reporting service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    }

    // Example: Send to error reporting service
    if (typeof window !== 'undefined') {
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // }).catch(console.error)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    // Open bug report with pre-filled details
    const bugReportUrl = `mailto:support@finance-forecast.app?subject=Bug Report - ${this.state.errorId}&body=${encodeURIComponent(JSON.stringify(errorDetails, null, 2))}`
    window.open(bugReportUrl)
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI based on level
      return (
        <div className={cn('p-4', this.props.className)}>
          {this.props.level === 'page' ? (
            <PageErrorFallback
              error={this.state.error}
              errorId={this.state.errorId}
              onRetry={this.handleRetry}
              onReload={this.handleReload}
              onGoHome={this.handleGoHome}
              onReportBug={this.handleReportBug}
            />
          ) : this.props.level === 'section' ? (
            <SectionErrorFallback
              error={this.state.error}
              errorId={this.state.errorId}
              onRetry={this.handleRetry}
            />
          ) : (
            <ComponentErrorFallback
              error={this.state.error}
              errorId={this.state.errorId}
              onRetry={this.handleRetry}
            />
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Page-level error fallback
interface PageErrorFallbackProps {
  error: Error | null
  errorId: string
  onRetry: () => void
  onReload: () => void
  onGoHome: () => void
  onReportBug: () => void
}

function PageErrorFallback({ error, errorId, onRetry, onReload, onGoHome, onReportBug }: PageErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              Error ID: {errorId}
            </Badge>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onReload} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            <Button variant="outline" onClick={onGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="ghost" onClick={onReportBug} className="w-full">
              <Bug className="w-4 h-4 mr-2" />
              Report Bug
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Section-level error fallback
interface SectionErrorFallbackProps {
  error: Error | null
  errorId: string
  onRetry: () => void
}

function SectionErrorFallback({ error, errorId, onRetry }: SectionErrorFallbackProps) {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Failed to load section
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          This section couldn&apos;t be loaded. Your other data is still available.
        </p>
        <div className="flex flex-col space-y-2">
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Badge variant="outline" className="text-xs">
            ID: {errorId}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Component-level error fallback
interface ComponentErrorFallbackProps {
  error: Error | null
  errorId: string
  onRetry: () => void
}

function ComponentErrorFallback({ error, errorId, onRetry }: ComponentErrorFallbackProps) {
  return (
    <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <span className="text-sm font-medium text-red-900 dark:text-red-100">
          Component Error
        </span>
      </div>
      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
        This component failed to load properly.
      </p>
      <Button onClick={onRetry} size="sm" variant="outline">
        <RefreshCw className="w-3 h-3 mr-1" />
        Retry
      </Button>
    </div>
  )
}
