import { generateRobotsTxt } from '@/lib/seo/sitemap'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/', '/static/'],
    },
    sitemap: 'https://finance-forecast.app/sitemap.xml',
  }
}
