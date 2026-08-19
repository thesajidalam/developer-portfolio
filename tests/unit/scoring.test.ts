import { describe, it, expect } from 'vitest'
import { calculateScore, SCORING_V1, getScoreBreakdown } from '@/lib/scoring'

describe('calculateScore', () => {
  it('returns weighted average with all dimensions present', () => {
    const scores = {
      performancescore: 100,
      accessibilityscore: 100,
      seoscore: 100,
      bestpracticesscore: 100,
      designscore: 100,
      contentscore: 100,
    }
    expect(calculateScore(scores)).toBe(100)
  })

  it('returns 0 when all scores are zero', () => {
    const scores = {
      performancescore: 0,
      accessibilityscore: 0,
      seoscore: 0,
      bestpracticesscore: 0,
      designscore: 0,
      contentscore: 0,
    }
    expect(calculateScore(scores)).toBe(0)
  })

  it('returns 0 for empty scores object', () => {
    expect(calculateScore({})).toBe(0)
  })

  it('handles partial scores by normalizing weights', () => {
    const scores = {
      performancescore: 80,
      designscore: 80,
    }
    const result = calculateScore(scores)
    expect(result).toBe(80)
  })

  it('weights dimensions correctly', () => {
    const scores = {
      performancescore: 100,
      accessibilityscore: 0,
      seoscore: 0,
      bestpracticesscore: 0,
      designscore: 0,
      contentscore: 0,
    }
    const result = calculateScore(scores)
    expect(result).toBe(20)
  })

  it('rounds to nearest integer', () => {
    const scores = {
      performancescore: 55,
      accessibilityscore: 0,
      seoscore: 0,
      bestpracticesscore: 0,
      designscore: 0,
      contentscore: 0,
    }
    const result = calculateScore(scores)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('SCORING_V1', () => {
  it('has version 1.0', () => {
    expect(SCORING_V1.version).toBe('1.0')
  })

  it('has 6 dimensions', () => {
    expect(SCORING_V1.dimensions).toHaveLength(6)
  })

  it('has weights that sum to 1.0', () => {
    const totalWeight = SCORING_V1.dimensions.reduce((sum, d) => sum + d.weight, 0)
    expect(totalWeight).toBeCloseTo(1.0)
  })

  it('marks performance, accessibility, seo, and best practices as automated', () => {
    const automated = SCORING_V1.dimensions.filter((d) => d.automated)
    expect(automated).toHaveLength(4)
  })
})

describe('getScoreBreakdown', () => {
  it('returns array of dimension breakdowns', () => {
    const breakdown = getScoreBreakdown({
      performanceScore: 90,
      accessibilityScore: 80,
      seoScore: 70,
      bestPracticesScore: 60,
      designScore: 50,
      contentScore: 40,
    })
    expect(breakdown).toHaveLength(6)
    expect(breakdown[0].name).toBe('Performance')
    expect(breakdown[0].score).toBe(90)
  })

  it('computes weighted scores', () => {
    const breakdown = getScoreBreakdown({
      performanceScore: 100,
      accessibilityScore: 0,
      seoScore: 0,
      bestPracticesScore: 0,
      designScore: 0,
      contentScore: 0,
    })
    const perf = breakdown.find((d) => d.key === 'performancescore')
    expect(perf?.weightedScore).toBe(20)
  })

  it('defaults missing scores to 0', () => {
    const breakdown = getScoreBreakdown({
      performanceScore: 50,
      accessibilityScore: 0,
      seoScore: 0,
      bestPracticesScore: 0,
      designScore: 0,
      contentScore: 0,
    })
    const seo = breakdown.find((d) => d.key === 'seoscore')
    expect(seo?.score).toBe(0)
  })
})
