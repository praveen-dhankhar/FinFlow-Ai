import { MetadataRoute } from 'next'

export function generateSitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://finance-forecast.app'
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/transactions`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/goals`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/budgets`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forecasts`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic pages (would be generated from database in real app)
  const dynamicPages = [
    // Example transaction pages
    {
      url: `${baseUrl}/transactions/1`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/transactions/2`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    // Example category pages
    {
      url: `${baseUrl}/categories/food`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/categories/transportation`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    },
    // Example goal pages
    {
      url: `${baseUrl}/goals/emergency-fund`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/goals/vacation`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    // Example budget pages
    {
      url: `${baseUrl}/budgets/monthly`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/budgets/yearly`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  return [...staticPages, ...dynamicPages]
}

// Robots.txt generator
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://finance-forecast.app/sitemap.xml

# Crawl-delay for bots
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /dashboard
Allow: /transactions
Allow: /categories
Allow: /goals
Allow: /budgets
Allow: /analytics
Allow: /forecasts`
}

// Generate structured data for different page types
export function generateStructuredData(type: 'WebSite' | 'WebApplication' | 'FinancialService' | 'Organization', data: Record<string, any>) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  }

  return baseStructuredData
}

// Default structured data for the homepage
export function getHomepageStructuredData() {
  return generateStructuredData('WebApplication', {
    name: 'Finance Forecast App',
    description: 'Comprehensive financial management and forecasting application',
    url: 'https://finance-forecast.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: 'Finance Forecast Team',
      url: 'https://finance-forecast.app'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Finance Forecast Team',
      url: 'https://finance-forecast.app'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://finance-forecast.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  })
}

// Structured data for financial service
export function getFinancialServiceStructuredData() {
  return generateStructuredData('FinancialService', {
    name: 'Finance Forecast Financial Management',
    description: 'Professional financial management and forecasting services',
    url: 'https://finance-forecast.app',
    serviceType: 'Financial Management',
    areaServed: 'Worldwide',
    availableLanguage: ['English'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Financial Management Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Budget Planning',
            description: 'Comprehensive budget planning and management'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Financial Forecasting',
            description: 'Advanced financial forecasting and predictions'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Goal Tracking',
            description: 'Track and achieve your financial goals'
          }
        }
      ]
    }
  })
}
