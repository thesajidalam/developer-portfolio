export interface AnalyticsEvent {
  event: string
  properties?: Record<string, string | number | boolean>
  timestamp: string
}

const BATCH_KEY = 'developer_portfolio_events'
const BATCH_SIZE = 20

export function trackEvent(event: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return

  const analyticsEvent: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  }

  const stored = localStorage.getItem(BATCH_KEY)
  const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : []
  events.push(analyticsEvent)

  if (events.length >= BATCH_SIZE) {
    flushEvents()
  } else {
    localStorage.setItem(BATCH_KEY, JSON.stringify(events))
  }
}

export function flushEvents() {
  if (typeof window === 'undefined') return

  const stored = localStorage.getItem(BATCH_KEY)
  if (!stored) return

  const events: AnalyticsEvent[] = JSON.parse(stored)
  localStorage.removeItem(BATCH_KEY)

  if (events.length === 0) return

  fetch('/api/v1/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  }).catch(() => {})
}

export function logServerEvent(event: string, details?: Record<string, unknown>) {
  const entry = {
    level: 'info',
    event,
    details,
    timestamp: new Date().toISOString(),
  }
  console.log(JSON.stringify(entry))
}
