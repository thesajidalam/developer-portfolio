'use client'

import { useState, useTransition } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortfolioVoteProps {
  portfolioId: string
  averageRating: number
  totalVotes: number
}

export function PortfolioVote({
  portfolioId,
  averageRating,
  totalVotes,
}: PortfolioVoteProps) {
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedStar, setSelectedStar] = useState(0)
  const [currentAverage, setCurrentAverage] = useState(averageRating)
  const [currentTotal, setCurrentTotal] = useState(totalVotes)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleVote(rating: number) {
    if (submitted || isPending) return
    setSelectedStar(rating)
    setSubmitted(true)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/portfolios/${portfolioId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating }),
        })

        if (res.ok) {
          const data = await res.json()
          setCurrentAverage(data.averageRating ?? currentAverage)
          setCurrentTotal(data.totalVotes ?? currentTotal + 1)
        }
      } catch {
        setSubmitted(false)
        setSelectedStar(0)
      }
    })
  }

  const displayRating = hoveredStar || selectedStar || currentAverage

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={submitted}
              className={cn(
                'transition-transform duration-150',
                !submitted && 'cursor-pointer hover:scale-110',
                submitted && 'cursor-default',
              )}
              onMouseEnter={() => !submitted && setHoveredStar(star)}
              onMouseLeave={() => !submitted && setHoveredStar(0)}
              onClick={() => handleVote(star)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'h-6 w-6 transition-colors duration-150',
                  star <= Math.round(displayRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-zinc-600',
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-300 tabular-nums">
            {currentAverage > 0 ? currentAverage.toFixed(1) : '—'}
          </span>
          <span>
            {currentTotal} vote{currentTotal !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {submitted && (
        <span className="text-xs text-emerald-400 font-medium">
          Thanks for rating!
        </span>
      )}
    </div>
  )
}
