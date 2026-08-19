interface PortfolioBadgeEmbedProps {
  slug: string
  name: string
  score?: number | null
  title?: string | null
  technologies?: { name: string }[]
  variant?: 'compact' | 'full'
  baseUrl?: string
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#eab308'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PortfolioBadgeEmbed({
  slug,
  name,
  score,
  title,
  technologies = [],
  variant = 'compact',
  baseUrl = '',
}: PortfolioBadgeEmbedProps) {
  const scoreColor = score != null ? getScoreColor(score) : '#71717a'
  const portfolioUrl = `${baseUrl}/p/${slug}`

  if (variant === 'compact') {
    return (
      <a
        href={portfolioUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 no-underline transition-colors hover:border-zinc-700"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        <span className="text-sm font-semibold truncate max-w-[140px]">{name}</span>
        {score != null && (
          <span
            className="ml-auto flex-shrink-0 text-sm font-bold tabular-nums"
            style={{ color: scoreColor }}
          >
            {score}
          </span>
        )}
      </a>
    )
  }

  return (
    <a
      href={portfolioUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 no-underline transition-colors hover:border-zinc-700"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 380 }}
    >
      {/* Avatar */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.4))' }}
      >
        <span className="text-sm font-bold text-amber-400">{getInitials(name)}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-zinc-100">{name}</div>
        {title && (
          <div className="truncate text-xs text-zinc-500">{title}</div>
        )}
        {technologies.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {technologies.slice(0, 4).map((tech, i) => (
              <span
                key={i}
                className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400"
              >
                {tech.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-1 text-[10px] text-zinc-600">Developer Portfolio</div>
      </div>

      {/* Score */}
      {score != null && (
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums"
          style={{ background: `${scoreColor}15`, color: scoreColor }}
        >
          {score}
        </div>
      )}
    </a>
  )
}
