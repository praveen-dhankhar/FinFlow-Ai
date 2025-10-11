'use client'

import { useEffect } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { OfflineHandler } from '../offline/OfflineHandler'
import { errorReporting, setupGlobalErrorHandlers } from '@/lib/error-reporting'

interface ErrorHandlingProviderProps {
  children: React.ReactNode
}

export function ErrorHandlingProvider({ children }: ErrorHandlingProviderProps) {
  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers()
    
    // Track app initialization
    errorReporting.addBreadcrumb('app', 'Application initialized', 'info')
    
    // Track user session
    errorReporting.addBreadcrumb('session', 'User session started', 'info', {
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
  }, [])

  return (
    <ErrorBoundary level="page">
      <OfflineHandler>
        {children}
      </OfflineHandler>
    </ErrorBoundary>
  )
}
