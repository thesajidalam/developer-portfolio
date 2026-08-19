import { describe, it, expect } from 'vitest'
import { validateUrlSafety } from '@/lib/ssrf-protection'

describe('validateUrlSafety', () => {
  describe('blocks private IPs', () => {
    it('blocks 10.x.x.x', () => {
      expect(validateUrlSafety('https://10.0.0.1/api')).toEqual({ safe: false, reason: 'Private IP addresses are not allowed' })
    })

    it('blocks 172.16.x.x', () => {
      expect(validateUrlSafety('https://172.16.0.1/api')).toEqual({ safe: false, reason: 'Private IP addresses are not allowed' })
    })

    it('blocks 172.31.x.x', () => {
      expect(validateUrlSafety('https://172.31.255.255')).toEqual({ safe: false, reason: 'Private IP addresses are not allowed' })
    })

    it('blocks 192.168.x.x', () => {
      expect(validateUrlSafety('https://192.168.1.1')).toEqual({ safe: false, reason: 'Private IP addresses are not allowed' })
    })
  })

  describe('blocks localhost', () => {
    it('blocks localhost', () => {
      expect(validateUrlSafety('https://localhost')).toEqual({ safe: false, reason: 'Localhost URLs are not allowed' })
    })

    it('blocks 0.0.0.0', () => {
      expect(validateUrlSafety('https://0.0.0.0')).toEqual({ safe: false, reason: 'Localhost URLs are not allowed' })
    })
  })

  describe('blocks metadata endpoints', () => {
    it('blocks AWS metadata endpoint', () => {
      expect(validateUrlSafety('https://169.254.169.254/latest/meta-data/')).toEqual({ safe: false, reason: 'Cloud metadata endpoints are not allowed' })
    })
  })

  describe('blocks internal hostnames', () => {
    it('blocks .internal hostnames', () => {
      expect(validateUrlSafety('https://service.internal/api')).toEqual({ safe: false, reason: 'Internal hostnames are not allowed' })
    })
  })

  describe('blocks invalid schemes', () => {
    it('rejects http', () => {
      expect(validateUrlSafety('http://example.com')).toEqual({ safe: false, reason: 'Only HTTPS URLs are accepted' })
    })

    it('rejects invalid URL format', () => {
      expect(validateUrlSafety('not-a-url')).toEqual({ safe: false, reason: 'Invalid URL format' })
    })
  })

  describe('allows public URLs', () => {
    it('allows https://example.com', () => {
      expect(validateUrlSafety('https://example.com')).toEqual({ safe: true })
    })

    it('allows https://github.com', () => {
      expect(validateUrlSafety('https://github.com/user/repo')).toEqual({ safe: true })
    })

    it('allows https://vercel.app', () => {
      expect(validateUrlSafety('https://my-project.vercel.app')).toEqual({ safe: true })
    })
  })
})
