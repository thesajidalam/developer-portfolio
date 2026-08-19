import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindMany = vi.fn()
const mockCount = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    portfolio: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}))

import { GET as portfoliosGet } from '@/app/api/v1/portfolios/route'
import { GET as searchGet } from '@/app/api/v1/search/route'
import { POST as validateUrlPost } from '@/app/api/v1/validate-url/route'

function makeRequest(url: string, init?: RequestInit) {
  return new Request(url, init)
}

function makePostRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFindMany.mockResolvedValue([])
  mockCount.mockResolvedValue(0)
})

describe('GET /api/v1/portfolios', () => {
  it('returns paginated data', async () => {
    mockCount.mockResolvedValue(25)
    mockFindMany.mockResolvedValue([
      { id: '1', name: 'Portfolio 1', technologies: [], categories: [], tags: [], score: null },
    ])

    const req = makeRequest('http://localhost:3000/api/v1/portfolios?page=1&pageSize=10')
    const res = await portfoliosGet(req as never)
    const json = await res.json()

    expect(json.data).toBeDefined()
    expect(json.meta).toBeDefined()
    expect(json.meta.page).toBe(1)
    expect(json.meta.pageSize).toBe(10)
    expect(json.meta.total).toBe(25)
  })

  it('returns 400 for invalid params', async () => {
    const req = makeRequest('http://localhost:3000/api/v1/portfolios?page=-1')
    const res = await portfoliosGet(req as never)
    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/search', () => {
  it('returns results for valid query', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', name: 'React Portfolio', technologies: [], categories: [], score: null },
    ])

    const req = makeRequest('http://localhost:3000/api/v1/search?q=react')
    const res = await searchGet(req as never)
    const json = await res.json()

    expect(json.portfolios).toBeDefined()
    expect(json.total).toBe(1)
    expect(json.query).toBe('react')
  })

  it('returns 400 when query is empty', async () => {
    const req = makeRequest('http://localhost:3000/api/v1/search?q=')
    const res = await searchGet(req as never)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/validate-url', () => {
  it('validates a safe public URL', async () => {
    const req = makePostRequest('http://localhost:3000/api/v1/validate-url', {
      url: 'https://example.com',
    })
    const res = await validateUrlPost(req as never)
    const json = await res.json()

    expect(json.valid).toBe(true)
  })

  it('rejects invalid URL format', async () => {
    const req = makePostRequest('http://localhost:3000/api/v1/validate-url', {
      url: 'not-a-url',
    })
    const res = await validateUrlPost(req as never)
    const json = await res.json()

    expect(json.valid).toBe(false)
  })

  it('rejects private IP', async () => {
    const req = makePostRequest('http://localhost:3000/api/v1/validate-url', {
      url: 'https://192.168.1.1',
    })
    const res = await validateUrlPost(req as never)
    const json = await res.json()

    expect(json.valid).toBe(false)
  })

  it('returns 400 for missing body', async () => {
    const req = makePostRequest('http://localhost:3000/api/v1/validate-url', {})
    const res = await validateUrlPost(req as never)
    expect(res.status).toBe(400)
  })
})
