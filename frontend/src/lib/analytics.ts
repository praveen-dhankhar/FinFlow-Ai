// Analytics configuration and utilities
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

// Google Analytics page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Google Analytics event tracking
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Web Vitals tracking
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_WEB_VITALS_REPORTING === 'true') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          navigationType: metric.navigationType,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      }).catch(console.error)
    }
  }
}

// Initialize Web Vitals tracking
export const initWebVitals = () => {
  if (process.env.NODE_ENV === 'production') {
    getCLS(reportWebVitals)
    getFID(reportWebVitals)
    getFCP(reportWebVitals)
    getLCP(reportWebVitals)
    getTTFB(reportWebVitals)
  }
}

// Custom analytics events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }

    // Mixpanel (if configured)
    if (window.mixpanel) {
      window.mixpanel.track(eventName, properties)
    }

    // Custom analytics endpoint
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error)
  }
}

// User identification
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', GA_TRACKING_ID, {
        user_id: userId,
        custom_map: traits,
      })
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.identify(userId)
      if (traits) {
        window.mixpanel.people.set(traits)
      }
    }
  }
}

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    pageview(url)

    // Custom analytics
    trackEvent('page_view', {
      page: url,
      title: title || document.title,
    })
  }
}

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, currency: string = 'USD') => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
      })
    }

    // Custom analytics
    trackEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
    })
  }
}

// Error tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        ...context,
      })
    }

    // Custom analytics
    trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    })
  }
}

// Performance tracking
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  if (process.env.NODE_ENV === 'production') {
    trackEvent('performance_metric', {
      metric,
      value,
      unit,
    })
  }
}

// Feature usage tracking
export const trackFeatureUsage = (feature: string, action: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    trackEvent('feature_usage', {
      feature,
      action,
      ...properties,
    })
  }
}

// A/B testing tracking
export const trackExperiment = (experimentId: string, variant: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    trackEvent('experiment_view', {
      experiment_id: experimentId,
      variant,
      ...properties,
    })
  }
}

// Initialize analytics
export const initAnalytics = () => {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Initialize Web Vitals
    initWebVitals()

    // Track initial page view
    trackPageView(window.location.pathname)

    // Track app load time
    window.addEventListener('load', () => {
      trackPerformance('app_load_time', performance.now())
    })
  }
}

// TypeScript declarations
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    mixpanel: {
      track: (event: string, properties?: Record<string, any>) => void
      identify: (userId: string) => void
      people: {
        set: (properties: Record<string, any>) => void
      }
    }
  }
}
