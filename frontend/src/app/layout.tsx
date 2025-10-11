import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { GlobalSearchProvider } from '@/components/search/GlobalSearchProvider'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
import { ErrorHandlingProvider } from '@/components/error/ErrorHandlingProvider'
import { SEOHead } from '@/components/seo/SEOHead'
import { DefaultStructuredData } from '@/components/seo/SEOHead'
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt'
import { AccessibilityControls } from '@/components/accessibility/AccessibilityControls'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finance Forecast App - Comprehensive Financial Management',
  description: 'Manage your finances with our comprehensive financial management app. Track transactions, set budgets, achieve goals, and forecast your financial future.',
  keywords: [
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
  authors: [{ name: 'Finance Forecast Team' }],
  creator: 'Finance Forecast Team',
  publisher: 'Finance Forecast Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finance-forecast.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Finance Forecast App - Comprehensive Financial Management',
    description: 'Manage your finances with our comprehensive financial management app. Track transactions, set budgets, achieve goals, and forecast your financial future.',
    url: 'https://finance-forecast.app',
    siteName: 'Finance Forecast App',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Finance Forecast App - Financial Management Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance Forecast App - Comprehensive Financial Management',
    description: 'Manage your finances with our comprehensive financial management app. Track transactions, set budgets, achieve goals, and forecast your financial future.',
    images: ['/images/og-image.jpg'],
    creator: '@financeforecast',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'finance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <SEOHead />
        <DefaultStructuredData />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Finance Forecast" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <AccessibilityProvider>
            <ErrorHandlingProvider>
              <GlobalSearchProvider>
                <div className="min-h-full">
                  {children}
                </div>
                
                {/* PWA Components */}
                <PWAInstallPrompt />
                
                {/* Accessibility Controls */}
                <AccessibilityControls />
                
                {/* Performance Monitor */}
                <PerformanceMonitor />
              </GlobalSearchProvider>
            </ErrorHandlingProvider>
          </AccessibilityProvider>
        </Providers>
      </body>
    </html>
  )
}