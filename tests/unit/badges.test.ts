import { describe, it, expect } from 'vitest'
import { BADGES, getPortfolioBadges } from '@/lib/badges'

function makePortfolio(overrides: Record<string, unknown> = {}) {
  return {
    featured: false,
    health: 'offline',
    score: {
      overallScore: 50,
      performanceScore: 50,
      accessibilityScore: 50,
      seoScore: 50,
      contentScore: 50,
    },
    submittedAt: new Date().toISOString(),
    latestHealthCheck: null,
    healthChecks: [],
    ...overrides,
  }
}

describe('BADGES', () => {
  it('defines 8 badges', () => {
    expect(BADGES).toHaveLength(8)
  })

  it('each badge has required fields', () => {
    for (const badge of BADGES) {
      expect(badge.id).toBeTruthy()
      expect(badge.name).toBeTruthy()
      expect(badge.description).toBeTruthy()
      expect(typeof badge.criteria).toBe('function')
    }
  })
})

describe('featured badge', () => {
  it('awards when featured is true', () => {
    const badge = BADGES.find((b) => b.id === 'featured')!
    expect(badge.criteria(makePortfolio({ featured: true }))).toBe(true)
  })

  it('does not award when featured is false', () => {
    const badge = BADGES.find((b) => b.id === 'featured')!
    expect(badge.criteria(makePortfolio({ featured: false }))).toBe(false)
  })
})

describe('performance badge', () => {
  it('awards when performanceScore >= 90', () => {
    const badge = BADGES.find((b) => b.id === 'performance')!
    expect(badge.criteria(makePortfolio({ score: { overallScore: 90, performanceScore: 90, accessibilityScore: 0, seoScore: 0, contentScore: 0 } }))).toBe(true)
  })

  it('does not award when performanceScore < 90', () => {
    const badge = BADGES.find((b) => b.id === 'performance')!
    expect(badge.criteria(makePortfolio({ score: { overallScore: 50, performanceScore: 89, accessibilityScore: 0, seoScore: 0, contentScore: 0 } }))).toBe(false)
  })
})

describe('accessibility badge', () => {
  it('awards when accessibilityScore >= 90', () => {
    const badge = BADGES.find((b) => b.id === 'accessibility')!
    expect(badge.criteria(makePortfolio({ score: { overallScore: 90, performanceScore: 0, accessibilityScore: 90, seoScore: 0, contentScore: 0 } }))).toBe(true)
  })
})

describe('seo badge', () => {
  it('awards when seoScore >= 90', () => {
    const badge = BADGES.find((b) => b.id === 'seo')!
    expect(badge.criteria(makePortfolio({ score: { overallScore: 90, performanceScore: 0, accessibilityScore: 0, seoScore: 90, contentScore: 0 } }))).toBe(true)
  })
})

describe('rising-star badge', () => {
  it('awards when overallScore >= 80 and submitted within 30 days', () => {
    const badge = BADGES.find((b) => b.id === 'rising-star')!
    const recent = new Date()
    recent.setDate(recent.getDate() - 5)
    expect(badge.criteria(makePortfolio({
      score: { overallScore: 85, performanceScore: 0, accessibilityScore: 0, seoScore: 0, contentScore: 0 },
      submittedAt: recent.toISOString(),
    }))).toBe(true)
  })

  it('does not award when submitted more than 30 days ago', () => {
    const badge = BADGES.find((b) => b.id === 'rising-star')!
    const old = new Date()
    old.setDate(old.getDate() - 40)
    expect(badge.criteria(makePortfolio({
      score: { overallScore: 85, performanceScore: 0, accessibilityScore: 0, seoScore: 0, contentScore: 0 },
      submittedAt: old.toISOString(),
    }))).toBe(false)
  })

  it('does not award when overallScore < 80', () => {
    const badge = BADGES.find((b) => b.id === 'rising-star')!
    expect(badge.criteria(makePortfolio({
      score: { overallScore: 70, performanceScore: 0, accessibilityScore: 0, seoScore: 0, contentScore: 0 },
    }))).toBe(false)
  })
})

describe('community-pick badge', () => {
  it('awards when contentScore >= 90', () => {
    const badge = BADGES.find((b) => b.id === 'community-pick')!
    expect(badge.criteria(makePortfolio({ score: { overallScore: 90, performanceScore: 0, accessibilityScore: 0, seoScore: 0, contentScore: 90 } }))).toBe(true)
  })
})

describe('hidden-gem badge', () => {
  it('awards when overallScore >= 85 and responseTime < 500', () => {
    const badge = BADGES.find((b) => b.id === 'hidden-gem')!
    expect(badge.criteria(makePortfolio({
      score: { overallScore: 90, performanceScore: 0, accessibilityScore: 0, seoScore: 0, contentScore: 0 },
      latestHealthCheck: { responseTime: 300 },
    }))).toBe(true)
  })

  it('does not award when responseTime >= 500', () => {
    const badge = BADGES.find((b) => b.id === 'hidden-gem')!
    expect(badge.criteria(makePortfolio({
      score: { overallScore: 90, performanceScore: 0, accessibilityScore: 0, seoScore: 0, contentScore: 0 },
      latestHealthCheck: { responseTime: 600 },
    }))).toBe(false)
  })

  it('does not award when no health check available', () => {
    const badge = BADGES.find((b) => b.id === 'hidden-gem')!
    expect(badge.criteria(makePortfolio({
      score: { overallScore: 90, performanceScore: 0, accessibilityScore: 0, seoScore: 0, contentScore: 0 },
      latestHealthCheck: null,
      healthChecks: [],
    }))).toBe(false)
  })
})

describe('well-maintained badge', () => {
  it('awards when health is healthy', () => {
    const badge = BADGES.find((b) => b.id === 'well-maintained')!
    expect(badge.criteria(makePortfolio({ health: 'healthy' }))).toBe(true)
  })

  it('does not award when health is offline', () => {
    const badge = BADGES.find((b) => b.id === 'well-maintained')!
    expect(badge.criteria(makePortfolio({ health: 'offline' }))).toBe(false)
  })
})

describe('getPortfolioBadges', () => {
  it('returns empty array for a mediocre portfolio', () => {
    const badges = getPortfolioBadges(makePortfolio())
    expect(badges).toHaveLength(0)
  })

  it('returns multiple matching badges', () => {
    const recent = new Date()
    recent.setDate(recent.getDate() - 5)
    const badges = getPortfolioBadges(makePortfolio({
      featured: true,
      health: 'healthy',
      score: { overallScore: 95, performanceScore: 95, accessibilityScore: 95, seoScore: 95, contentScore: 95 },
      submittedAt: recent.toISOString(),
      latestHealthCheck: { responseTime: 200 },
    }))
    expect(badges.length).toBeGreaterThanOrEqual(3)
  })
})
