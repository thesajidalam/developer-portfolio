import { CheckCircle2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WhyItStandsOutProps {
  score?: {
    performanceScore: number
    accessibilityScore: number
    seoScore: number
    bestPracticesScore: number
    designScore: number
    contentScore: number
    overallScore: number
  } | null
}

function getInsights(score: WhyItStandsOutProps['score']) {
  if (!score) return []

  const insights: { text: string; score: number }[] = []

  if (score.performanceScore > 85) {
    insights.push({
      text: 'Strong performance with fast load times',
      score: score.performanceScore,
    })
  }
  if (score.accessibilityScore > 85) {
    insights.push({
      text: 'Excellent accessibility — keyboard navigable, screen-reader friendly',
      score: score.accessibilityScore,
    })
  }
  if (score.seoScore > 85) {
    insights.push({
      text: 'Well-optimized for search engines',
      score: score.seoScore,
    })
  }
  if (score.designScore > 85) {
    insights.push({
      text: 'Outstanding visual design and presentation',
      score: score.designScore,
    })
  }
  if (score.contentScore > 85) {
    insights.push({
      text: 'Clear, compelling content and storytelling',
      score: score.contentScore,
    })
  }
  if (score.bestPracticesScore > 85) {
    insights.push({
      text: 'Follows web development best practices',
      score: score.bestPracticesScore,
    })
  }

  return insights
}

function getScoreLabel(score: number) {
  if (score >= 95) return 'Exceptional'
  if (score >= 85) return 'Strong'
  if (score >= 70) return 'Good'
  return 'Average'
}

export function WhyItStandsOut({ score }: WhyItStandsOutProps) {
  const insights = getInsights(score)

  if (insights.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Why This Portfolio Stands Out
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-zinc-500">
            Score data will generate specific insights once analysis is complete.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Why This Portfolio Stands Out
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {insights.map(insight => (
            <li key={insight.text} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm text-zinc-300">{insight.text}</p>
                <p className="text-[11px] text-zinc-600">
                  {getScoreLabel(insight.score)} ({Math.round(insight.score)}/100)
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
