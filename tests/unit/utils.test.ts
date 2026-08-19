import { describe, it, expect } from 'vitest'
import { cn, slugify, formatDate, getScoreColor, truncate } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates classes', () => {
    expect(cn('foo', 'foo')).toBe('foo')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra')
    expect(result).toContain('base')
    expect(result).toContain('extra')
    expect(result).not.toContain('hidden')
  })
})

describe('slugify', () => {
  it('converts to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('handles multiple consecutive special chars', () => {
    expect(slugify('foo---bar___baz')).toBe('foo-bar-baz')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2025-01-15'))
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2025/)
  })

  it('formats a date string', () => {
    const result = formatDate('2025-06-20')
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/20/)
  })
})

describe('getScoreColor', () => {
  it('returns emerald for score >= 90', () => {
    expect(getScoreColor(95)).toBe('text-emerald-500')
  })

  it('returns yellow for score >= 70', () => {
    expect(getScoreColor(75)).toBe('text-yellow-500')
  })

  it('returns orange for score >= 50', () => {
    expect(getScoreColor(55)).toBe('text-orange-500')
  })

  it('returns red for score < 50', () => {
    expect(getScoreColor(30)).toBe('text-red-500')
  })
})

describe('truncate', () => {
  it('returns text unchanged if shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates text exceeding limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  it('returns full text at exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})
