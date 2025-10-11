'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  noindex?: boolean
  canonical?: string
}

export function SEOHead({
  title = 'Finance Forecast App - Comprehensive Financial Management',
  description = 'Manage your finances with our comprehensive financial management app. Track transactions, set budgets, achieve goals, and forecast your financial future.',
  keywords = [
    'finance',
    'budget',
    'money management',
    'financial planning',
    'expense tracking',
    'investment',
    'savings',
    'financial forecasting',
    'personal finance',
    'financial analytics'
  ],
  image = '/images/og-image.jpg',
  url = 'https://finance-forecast.app',
  type = 'website',
  author = 'Finance Forecast Team',
  publishedTime,
  modifiedTime,
  section,
  tags,
  noindex = false,
  canonical
}: SEOHeadProps) {
  const fullTitle = title.includes('Finance Forecast') ? title : `${title} | Finance Forecast App`
  const fullUrl = url.startsWith('http') ? url : `https://finance-forecast.app${url}`
  const fullImage = image.startsWith('http') ? image : `https://finance-forecast.app${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Finance Forecast App" />
      <meta property="og:locale" content="en_US" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@financeforecast" />
      <meta name="twitter:creator" content="@financeforecast" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* PWA Meta Tags */}
      <meta name="application-name" content="Finance Forecast" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Finance Forecast" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" />

      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  )
}

// Structured Data Component
interface StructuredDataProps {
  type: 'WebSite' | 'WebApplication' | 'Organization' | 'FinancialService'
  data: Record<string, any>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Default structured data for the app
export function DefaultStructuredData() {
  return (
    <StructuredData
      type="WebApplication"
      data={{
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
      }}
    />
  )
}
