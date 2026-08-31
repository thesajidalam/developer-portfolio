export interface ScoringMethodology {
  version: string
  dimensions: {
    name: string
    key: string
    weight: number
    description: string
    automated: boolean
  }[]
  calculateOverall(scores: Record<string, number>): number
}

export const SCORING_V1: ScoringMethodology = {
  version: '1.0',
  dimensions: [
    { name: 'Performance', key: 'performancescore', weight: 0.2, description: 'Page load speed, bundle size, Core Web Vitals (LCP, CLS, INP)', automated: true },
    { name: 'Accessibility', key: 'accessibilityscore', weight: 0.15, description: 'WCAG compliance, keyboard navigation, screen reader support', automated: true },
    { name: 'SEO', key: 'seoscore', weight: 0.15, description: 'Meta tags, semantic HTML, structured data, crawlability', automated: true },
    { name: 'Best Practices', key: 'bestpracticesscore', weight: 0.1, description: 'HTTPS, security headers, no known vulnerable dependencies', automated: true },
    { name: 'Design', key: 'designscore', weight: 0.2, description: 'Visual hierarchy, typography, color, spacing, consistency', automated: false },
    { name: 'Content', key: 'contentscore', weight: 0.2, description: 'Clarity, storytelling, project presentation, personality', automated: false },
  ],
  calculateOverall(scores) {
    let total = 0
    let totalWeight = 0
    for (const dim of this.dimensions) {
      const score = scores[dim.key]
      if (score !== undefined) {
        total += score * dim.weight
        totalWeight += dim.weight
      }
    }
    return totalWeight > 0 ? Math.round(total / totalWeight) : 0
  },
}

export function calculateScore(scores: Record<string, number>, methodology: ScoringMethodology = SCORING_V1): number {
  return methodology.calculateOverall(scores)
}

export function getScoreBreakdown(
  score: {
    performanceScore: number
    accessibilityScore: number
    seoScore: number
    bestPracticesScore: number
    designScore: number
    contentScore: number
  },
  methodology: ScoringMethodology = SCORING_V1,
) {
  const mapping: Record<string, number> = {
    performancescore: score.performanceScore,
    accessibilityscore: score.accessibilityScore,
    seoscore: score.seoScore,
    bestpracticesscore: score.bestPracticesScore,
    designscore: score.designScore,
    contentscore: score.contentScore,
  }
  return methodology.dimensions.map((dim) => ({
    name: dim.name,
    key: dim.key,
    score: mapping[dim.key] ?? 0,
    weight: dim.weight,
    weightedScore: (mapping[dim.key] ?? 0) * dim.weight,
    automated: dim.automated,
    description: dim.description,
  }))
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Exceptional', color: 'text-emerald-400' }
  if (score >= 75) return { label: 'Excellent', color: 'text-emerald-400' }
  if (score >= 60) return { label: 'Good', color: 'text-amber-400' }
  if (score >= 40) return { label: 'Fair', color: 'text-orange-400' }
  return { label: 'Needs work', color: 'text-red-400' }
}
