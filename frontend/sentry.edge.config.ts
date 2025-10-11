import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
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
      edge: true,
    }
    
    return event
  },
  
  // Environment-specific configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Server-side configuration
  serverName: process.env.NEXT_PUBLIC_APP_NAME || 'finance-forecast-edge',
  
  // Performance monitoring
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/api\.finance-forecast\.app/,
    /^https:\/\/finance-forecast\.app/,
  ],
})
