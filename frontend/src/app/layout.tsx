import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Finance Forecast - Smart Financial Management",
    template: "%s | Finance Forecast"
  },
  description: "A comprehensive financial management application with AI-powered forecasting, transaction tracking, and intelligent insights to help you take control of your finances.",
  keywords: [
    "finance",
    "financial management",
    "budgeting",
    "expense tracking",
    "AI forecasting",
    "personal finance",
    "money management",
    "financial planning"
  ],
  authors: [{ name: "Finance Forecast Team" }],
  creator: "Finance Forecast",
  publisher: "Finance Forecast",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Finance Forecast - Smart Financial Management',
    description: 'A comprehensive financial management application with AI-powered forecasting and intelligent insights.',
    siteName: 'Finance Forecast',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Finance Forecast - Smart Financial Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance Forecast - Smart Financial Management',
    description: 'A comprehensive financial management application with AI-powered forecasting and intelligent insights.',
    images: ['/og-image.png'],
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
