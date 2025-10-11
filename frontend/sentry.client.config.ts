import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance Monitoring
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (process.env.NODE_ENV === 'production' && event.level !== 'error') {
      return null
    }
    
    // Add custom tags
    event.tags = {
      ...event.tags,
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
    }
    
    // Add user context if available
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      if (user) {
        try {
          event.user = JSON.parse(user)
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    
    return event
  },
  
  // Custom error filtering
  beforeBreadcrumb(breadcrumb) {
    // Filter out sensitive data
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null
    }
    
    // Filter out network requests to external services
    if (breadcrumb.category === 'fetch' && breadcrumb.data?.url) {
      const url = breadcrumb.data.url
      if (url.includes('google-analytics.com') || url.includes('googletagmanager.com')) {
        return null
      }
    }
    
    return breadcrumb
  },
  
  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Server-side configuration
  serverName: process.env.NEXT_PUBLIC_APP_NAME || 'finance-forecast',
  
  // Custom integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance monitoring
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/api\.finance-forecast\.app/,
    /^https:\/\/finance-forecast\.app/,
  ],
  
  // Error boundaries
  beforeSendTransaction(event) {
    // Filter out health check requests
    if (event.transaction === '/api/health') {
      return null
    }
    
    return event
  },
})
