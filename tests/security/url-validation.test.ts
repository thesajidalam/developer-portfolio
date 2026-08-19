import { describe, it, expect } from 'vitest'
import { validateUrlSafety } from '@/lib/ssrf-protection'

describe('SSRF protection - IP formats', () => {
  it('blocks 10.0.0.1', () => {
    expect(validateUrlSafety('https://10.0.0.1').safe).toBe(false)
  })

  it('blocks 172.16.0.1', () => {
    expect(validateUrlSafety('https://172.16.0.1').safe).toBe(false)
  })

  it('blocks 192.168.0.1', () => {
    expect(validateUrlSafety('https://192.168.0.1').safe).toBe(false)
  })

  it('blocks 127.0.0.1', () => {
    expect(validateUrlSafety('https://127.0.0.1').safe).toBe(false)
  })

  it('blocks 169.254.169.254', () => {
    expect(validateUrlSafety('https://169.254.169.254').safe).toBe(false)
  })

  it('blocks multicast 224.0.0.1', () => {
    expect(validateUrlSafety('https://224.0.0.1').safe).toBe(false)
  })
})

describe('URL scheme validation', () => {
  it('blocks javascript: scheme', () => {
    expect(validateUrlSafety('javascript:alert(1)').safe).toBe(false)
  })

  it('blocks file: scheme', () => {
    expect(validateUrlSafety('file:///etc/passwd').safe).toBe(false)
  })

  it('blocks data: scheme', () => {
    expect(validateUrlSafety('data:text/html,<script>alert(1)</script>').safe).toBe(false)
  })

  it('blocks http: scheme', () => {
    expect(validateUrlSafety('http://example.com').safe).toBe(false)
  })

  it('allows https: scheme', () => {
    expect(validateUrlSafety('https://example.com').safe).toBe(true)
  })
})

describe('URL validation edge cases', () => {
  it('blocks localhost with port', () => {
    expect(validateUrlSafety('https://localhost:3000').safe).toBe(false)
  })

  it('blocks localhost with path', () => {
    expect(validateUrlSafety('https://localhost/api/data').safe).toBe(false)
  })

  it('blocks .internal hostnames', () => {
    expect(validateUrlSafety('https://app.internal').safe).toBe(false)
  })

  it('blocks metadata.google.internal', () => {
    expect(validateUrlSafety('https://metadata.google.internal').safe).toBe(false)
  })

  it('rejects completely invalid URLs', () => {
    expect(validateUrlSafety(':::not-valid:::').safe).toBe(false)
  })

  it('blocks empty string', () => {
    expect(validateUrlSafety('').safe).toBe(false)
  })

  it('allows valid public domains', () => {
    expect(validateUrlSafety('https://github.com').safe).toBe(true)
    expect(validateUrlSafety('https://vercel.com').safe).toBe(true)
    expect(validateUrlSafety('https://portfolio.dev').safe).toBe(true)
  })
})
