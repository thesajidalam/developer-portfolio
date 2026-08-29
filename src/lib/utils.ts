export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-500'
  if (score >= 70) return 'text-yellow-500'
  if (score >= 50) return 'text-orange-500'
  return 'text-red-500'
}

export function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500/10'
  if (score >= 70) return 'bg-yellow-500/10'
  if (score >= 50) return 'bg-orange-500/10'
  return 'bg-red-500/10'
}

export function getHealthColor(health: string): string {
  switch (health) {
    case 'healthy':
      return 'bg-emerald-500'
    case 'needs_attention':
      return 'bg-yellow-500'
    case 'down':
    case 'offline':
      return 'bg-red-500'
    default:
      return 'bg-zinc-400'
  }
}

export function getHealthLabel(health: string): string {
  switch (health) {
    case 'healthy':
      return 'Healthy'
    case 'needs_attention':
      return 'Needs attention'
    case 'down':
    case 'offline':
      return 'Offline'
    default:
      return 'Unknown'
  }
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '…'
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
