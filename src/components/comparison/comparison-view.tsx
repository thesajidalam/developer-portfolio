'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, ArrowRight, Lightbulb, Trophy, Zap, Eye, SearchCode, CheckCircle, Palette, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface Portfolio {
  id: string
  name: string
  slug: string
  title?: string | null
  avatarUrl?: string | null
  health: string
  framework?: string | null
  hostingProvider?: string | null
  experienceLevel: string
  technologies: string[]
  score: {
    overallScore: number
    performanceScore: number
    accessibilityScore: number
    seoScore: number
    bestPracticesScore: number
    designScore: number
    contentScore: number
  } | null
}

const dimensions = [
  { key: 'performanceScore', label: 'Performance', icon: Zap },
  { key: 'accessibilityScore', label: 'Accessibility', icon: Eye },
  { key: 'seoScore', label: 'SEO', icon: SearchCode },
  { key: 'bestPracticesScore', label: 'Best Practices', icon: CheckCircle },
  { key: 'designScore', label: 'Design', icon: Palette },
  { key: 'contentScore', label: 'Content', icon: FileText },
] as const

function getScoreColor(score: number) {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#eab308'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

function getScoreTextClass(score: number) {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 70) return 'text-yellow-400'
  if (score >= 50) return 'text-orange-400'
  return 'text-red-400'
}

function getHealthDot(health: string) {
  switch (health) {
    case 'healthy': return 'bg-emerald-500'
    case 'needs_attention': return 'bg-yellow-500'
    case 'offline': return 'bg-red-500'
    default: return 'bg-zinc-500'
  }
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getExperienceLabel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

function ComparisonRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size / 2) - 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-lg font-bold tabular-nums', getScoreTextClass(score))}>
          {score}
        </span>
        <span className="text-[8px] font-medium text-zinc-500 uppercase tracking-wider">
          Overall
        </span>
      </div>
    </div>
  )
}

function InsightSection({ portfolios }: { portfolios: Portfolio[] }) {
  if (portfolios.length < 2) return null

  const allHaveScores = portfolios.every(p => p.score)
  if (!allHaveScores) return null

  const scores = portfolios.map(p => ({
    name: p.name,
    score: p.score!,
  }))

  const allTechs = portfolios.flatMap(p => p.technologies)
  const sharedTechs = allTechs.filter(t =>
    portfolios.every(p => p.technologies.includes(t))
  )
  const uniqueTechs = portfolios.map(p => ({
    name: p.name,
    techs: p.technologies.filter(t => !sharedTechs.includes(t)),
  }))

  const perfWinner = scores.reduce((best, curr) =>
    curr.score.performanceScore > best.score.performanceScore ? curr : best
  )
  const a11yWinner = scores.reduce((best, curr) =>
    curr.score.accessibilityScore > best.score.accessibilityScore ? curr : best
  )
  const seoWinner = scores.reduce((best, curr) =>
    curr.score.seoScore > best.score.seoScore ? curr : best
  )

  return (
    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-zinc-100">What can I learn?</h3>
      </div>
      <div className="space-y-4 text-sm text-zinc-400">
        <p>
          <span className="font-medium text-zinc-200">{perfWinner.name}</span> leads in performance
          with a score of <span className={cn('font-bold', getScoreTextClass(perfWinner.score.performanceScore))}>
          {perfWinner.score.performanceScore}</span>. Consider studying their optimization techniques.
        </p>
        <p>
          <span className="font-medium text-zinc-200">{a11yWinner.name}</span> excels in accessibility
          (<span className={cn('font-bold', getScoreTextClass(a11yWinner.score.accessibilityScore))}>
          {a11yWinner.score.accessibilityScore}</span>). Their implementation could inform best practices
          for inclusive design.
        </p>
        <p>
          <span className="font-medium text-zinc-200">{seoWinner.name}</span> has the strongest SEO
          profile (<span className={cn('font-bold', getScoreTextClass(seoWinner.score.seoScore))}>
          {seoWinner.score.seoScore}</span>). Their metadata and content strategy is worth reviewing.
        </p>

        {sharedTechs.length > 0 && (
          <p>
            All portfolios share <span className="font-medium text-zinc-200">{sharedTechs.join(', ')}</span>{''}
            — a common foundation in this space.
          </p>
        )}

        {uniqueTechs.filter(u => u.techs.length > 0).length > 0 && (
          <div>
            <p className="mb-1">Unique technology choices:</p>
            <div className="flex flex-wrap gap-2">
              {uniqueTechs.filter(u => u.techs.length > 0).map(u => (
                <div key={u.name} className="rounded-lg bg-zinc-800/50 px-3 py-1.5">
                  <span className="text-xs font-medium text-zinc-300">{u.name}:</span>{' '}
                  <span className="text-xs text-zinc-500">{u.techs.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ComparisonView({ portfolios }: { portfolios: Portfolio[] }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Portfolio[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const filtered = useMemo(() => {
    if (!query.trim()) return portfolios.slice(0, 20)
    const q = query.toLowerCase()
    return portfolios
      .filter(p =>
        !selected.some(s => s.id === p.id) &&
        (p.name.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q) || p.framework?.toLowerCase().includes(q))
      )
      .slice(0, 20)
  }, [portfolios, query, selected])

  function addPortfolio(p: Portfolio) {
    if (selected.length >= 4) return
    if (selected.some(s => s.id === p.id)) return
    setSelected(prev => [...prev, p])
    setQuery('')
    setShowDropdown(false)
  }

  function removePortfolio(id: string) {
    setSelected(prev => prev.filter(p => p.id !== id))
  }

  function getWinner(key: string): string | null {
    if (selected.length < 2) return null
    let maxScore = -1
    let winnerId = ''
    for (const p of selected) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (p.score && (p.score as any)[key] > maxScore) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        maxScore = (p.score as any)[key]
        winnerId = p.id
      }
    }
    return winnerId
  }

  return (
    <div>
      {/* Search & Chips */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search portfolios to compare..."
            className="h-11 border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-500/50"
            disabled={selected.length >= 4}
          />
        </div>

        {showDropdown && query.trim() && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => addPortfolio(p)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/50"
              >
                {p.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatarUrl} alt={p.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
                    <span className="text-xs font-bold text-amber-400">{getInitials(p.name)}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-100 truncate">{p.name}</p>
                  {p.title && <p className="text-xs text-zinc-500 truncate">{p.title}</p>}
                </div>
                {p.score && (
                  <span className={cn('text-xs font-bold tabular-nums', getScoreTextClass(p.score.overallScore))}>
                    {p.score.overallScore}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selected.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/80 pl-1 pr-2 py-1"
            >
              {p.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatarUrl} alt={p.name} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20">
                  <span className="text-[8px] font-bold text-amber-400">{getInitials(p.name)}</span>
                </div>
              )}
              <span className="text-xs font-medium text-zinc-200">{p.name}</span>
              <button
                onClick={() => removePortfolio(p.id)}
                className="ml-0.5 rounded-full p-0.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {selected.length < 4 && (
            <span className="flex items-center text-xs text-zinc-500">
              Add {4 - selected.length} more
            </span>
          )}
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Comparison grid */}
      {selected.length >= 2 ? (
        <div className="space-y-6">
          {/* Overall score rings */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-amber-400" />
              Overall Score
            </h3>
            <div className={cn(
              'grid gap-6',
              selected.length === 2 ? 'grid-cols-2' : selected.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'
            )}>
              {selected.map(p => (
                <Link key={p.id} href={`/p/${p.slug}`} className="flex flex-col items-center gap-3 group">
                  <ComparisonRing score={p.score?.overallScore ?? 0} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">{p.name}</p>
                    {p.title && <p className="text-xs text-zinc-500 mt-0.5">{p.title}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Dimension bars */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-6 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Score Breakdown
            </h3>
            <div className="space-y-6">
              {dimensions.map(dim => {
                const Icon = dim.icon
                const winnerId = getWinner(dim.key)
                return (
                  <div key={dim.key}>
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-400">{dim.label}</span>
                    </div>
                    <div className="space-y-2">
                      {selected.map(p => {
                        const val = p.score?.[dim.key] ?? 0
                        const isWinner = winnerId === p.id
                        return (
                          <div key={p.id} className="flex items-center gap-3">
                            <span className="w-24 flex-shrink-0 truncate text-xs text-zinc-500">{p.name}</span>
                            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                  width: `${val}%`,
                                  backgroundColor: getScoreColor(val),
                                  opacity: isWinner ? 1 : 0.6,
                                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                              />
                            </div>
                            <span className={cn(
                              'w-8 text-right text-xs font-bold tabular-nums',
                              getScoreTextClass(val)
                            )}>
                              {val}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info grid */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="pb-3 pr-4 text-left text-xs font-medium text-zinc-500">Property</th>
                    {selected.map(p => (
                      <th key={p.id} className="pb-3 px-4 text-left text-xs font-medium text-zinc-300">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 pr-4 text-zinc-500">Experience</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-zinc-200">{getExperienceLabel(p.experienceLevel)}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 pr-4 text-zinc-500">Health</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cn('h-2 w-2 rounded-full', getHealthDot(p.health))} />
                          <span className="text-zinc-200">{p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Needs Attention' : p.health === 'offline' ? 'Offline' : 'Unknown'}</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-3 pr-4 text-zinc-500">Framework</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-zinc-200">{p.framework || '—'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-zinc-500">Hosting</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-zinc-200">{p.hostingProvider || '—'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tech stack comparison */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Technology Stack
            </h3>
            <div className={cn(
              'grid gap-4',
              selected.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
            )}>
              {selected.map(p => (
                <div key={p.id}>
                  <p className="mb-2 text-xs font-medium text-zinc-300">{p.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.technologies.length > 0 ? (
                      p.technologies.map(t => (
                        <span
                          key={t}
                          className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700/50"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-600">No data</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <InsightSection portfolios={selected} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">
            <ArrowRight className="h-7 w-7 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
            {selected.length === 0
              ? 'Search and add portfolios to start comparing'
              : 'Add at least one more portfolio to compare'}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            You can select up to 4 portfolios for a side-by-side comparison
          </p>
        </div>
      )}
    </div>
  )
}
