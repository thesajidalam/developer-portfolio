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
  if (score >= 90) return 'text-emerald-400'
  if (score >= 75) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-400/10'
  if (score >= 75) return 'bg-green-500/10'
  if (score >= 60) return 'bg-amber-400/10'
  if (score >= 40) return 'bg-orange-400/10'
  return 'bg-red-400/10'
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
    // tolerate scheme-less urls
    return url.split('/')[0].replace(/^www\./, '')
  }
}

// Guarantee an outbound portfolio URL has a scheme, otherwise the browser treats
// scheme-less hrefs as relative links on the current host and 404s.
export function absoluteUrl(raw: string): string {
  const u = (raw || '').trim()
  if (!u) return u
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u)) return u
  return `https://${u}`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
