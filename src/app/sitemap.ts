import type { MetadataRoute } from 'next'
import { fetchApprovedBatch } from '@/lib/repository'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '')
  const now = new Date()
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/rankings`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/submit`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
  try {
    const batch = await fetchApprovedBatch(200)
    for (const portfolio of batch) {
      pages.push({
        url: `${base}/p/${portfolio.slug}`,
        lastModified: portfolio.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch {
    // Database not ready yet — serve the static sitemap without portfolio URLs.
  }
  return pages
}