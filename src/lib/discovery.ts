import { fetchApprovedBatch, getSimilar, countApproved } from '@/lib/repository'
import type { PortfolioWithScore } from '@/lib/types'

function recencyBonus(submittedAt: string, now = Date.now()): number {
  const days = (now - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24)
  if (days < 7) return 100
  if (days < 14) return 80
  if (days < 30) return 60
  if (days < 90) return 40
  if (days < 180) return 20
  return 10
}

function healthBonus(health: string): number {
  if (health === 'healthy') return 100
  if (health === 'needs_attention') return 50
  return 0
}

export async function getTrendingPortfolios(limit = 10): Promise<PortfolioWithScore[]> {
  const batch = await fetchApprovedBatch(200)
  return batch
    .map((p) => ({
      p,
      t: (p.score?.overallScore ?? 0) * 0.6 + recencyBonus(p.submittedAt) * 0.2 + healthBonus(p.health) * 0.2,
    }))
    .sort((a, b) => b.t - a.t)
    .slice(0, limit)
    .map((x) => x.p)
}

export async function getRisingPortfolios(limit = 10): Promise<PortfolioWithScore[]> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const batch = await fetchApprovedBatch(200)
  return batch
    .filter((p) => new Date(p.submittedAt) >= thirtyDaysAgo && (p.score?.overallScore ?? 0) >= 80)
    .slice(0, limit)
}

export async function getHiddenGems(limit = 10): Promise<PortfolioWithScore[]> {
  const batch = await fetchApprovedBatch(100)
  return batch
    .filter((p) => !p.featured && p.health === 'healthy' && (p.score?.overallScore ?? 0) >= 85)
    .sort((a, b) => (b.score?.overallScore ?? 0) - (a.score?.overallScore ?? 0))
    .slice(0, limit)
}

export async function getSimilarPortfolios(portfolio: PortfolioWithScore, limit = 6): Promise<PortfolioWithScore[]> {
  return getSimilar(portfolio, limit)
}

export async function getTotalCount(): Promise<number> {
  try {
    return await countApproved()
  } catch {
    return 0
  }
}
