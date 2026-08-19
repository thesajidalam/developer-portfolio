import { isIPv4 } from 'net'

const BLOCKED_RANGES: [number, number][] = [
  [0x0a000000, 0x0affffff],   // 10.0.0.0/8
  [0xac100000, 0xac1fffff],   // 172.16.0.0/12
  [0xc0a80000, 0xc0a8ffff],   // 192.168.0.0/16
  [0x7f000000, 0x7fffffff],   // 127.0.0.0/8
  [0xa9fe0000, 0xa9feffff],   // 169.254.0.0/16
  [0xc0000000, 0xc00000ff],   // 192.0.0.0/24
  [0xc0000200, 0xc00002ff],   // 192.0.2.0/24
  [0xc6336400, 0xc63364ff],   // 198.51.100.0/24
  [0xcb007100, 0xcb0071ff],   // 203.0.113.0/24
  [0xe0000000, 0xffffffff],   // 224.0.0.0/4 (multicast+)
]

function ipToLong(ip: string): number {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function isPrivateIp(ip: string): boolean {
  if (!isIPv4(ip)) return false
  const long = ipToLong(ip)
  return BLOCKED_RANGES.some(([start, end]) => long >= start && long <= end)
}

export interface UrlCheckResult {
  safe: boolean
  reason?: string
}

export function validateUrlSafety(raw: string): UrlCheckResult {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { safe: false, reason: 'Invalid URL format' }
  }

  if (url.protocol !== 'https:') {
    return { safe: false, reason: 'Only HTTPS URLs are accepted' }
  }

  const hostname = url.hostname.toLowerCase()

  if (hostname === 'localhost' || hostname === '[::1]' || hostname === '0.0.0.0') {
    return { safe: false, reason: 'Localhost URLs are not allowed' }
  }

  if (hostname === '169.254.169.254' || hostname.endsWith('.169.254.169.254')) {
    return { safe: false, reason: 'Cloud metadata endpoints are not allowed' }
  }

  if (isIPv4(hostname) && isPrivateIp(hostname)) {
    return { safe: false, reason: 'Private IP addresses are not allowed' }
  }

  if (/^[a-z0-9-]+\.internal$/i.test(hostname)) {
    return { safe: false, reason: 'Internal hostnames are not allowed' }
  }

  const blacklistedHosts = ['metadata.google.internal', '169.254.169.254']
  if (blacklistedHosts.includes(hostname)) {
    return { safe: false, reason: 'Blocked metadata endpoint' }
  }

  return { safe: true }
}

export async function safeFetch(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'DeveloperPortfolio/1.0 (Portfolio-Checker)',
      },
    })
    return response
  } finally {
    clearTimeout(timer)
  }
}
