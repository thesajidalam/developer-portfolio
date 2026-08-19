import { validateUrlSafety, safeFetch } from '@/lib/ssrf-protection'

const GITHUB_API = 'https://api.github.com'

export interface GitHubProfile {
  login: string
  name: string
  bio: string
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  blog: string
  location: string
  company: string
}

export interface GitHubRepo {
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  topics: string[]
  created_at: string
  updated_at: string
  homepage: string
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const REQUEST_TIMEOUT = 5000

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL })
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(username) &&
    username.length >= 1 &&
    username.length <= 39
}

async function githubFetch<T>(path: string): Promise<T | null> {
  const url = `${GITHUB_API}${path}`
  const cached = getCached<T>(url)
  if (cached !== null) return cached

  const safety = validateUrlSafety(url)
  if (!safety.safe) return null

  try {
    const response = await safeFetch(url, REQUEST_TIMEOUT)

    if (response.status === 403 || response.status === 429) {
      console.warn(`GitHub API rate limited: ${response.status}`)
      return null
    }

    if (!response.ok) return null

    const data = (await response.json()) as T
    setCache(url, data)
    return data
  } catch (error) {
    console.error(`GitHub API request failed for ${path}:`, error)
    return null
  }
}

export async function getGitHubProfile(username: string): Promise<GitHubProfile | null> {
  if (!isValidUsername(username)) return null
  return githubFetch<GitHubProfile>(`/users/${encodeURIComponent(username)}`)
}

export async function getGitHubRepos(
  username: string,
  limit = 10
): Promise<GitHubRepo[]> {
  if (!isValidUsername(username)) return []

  const cacheKey = `repos:${username}:${limit}`
  const cached = getCached<GitHubRepo[]>(cacheKey)
  if (cached) return cached

  const repos = await githubFetch<GitHubRepo[]>(
    `/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${Math.min(limit, 100)}&type=public`
  )

  if (!repos) return []

  const data = repos.slice(0, limit)
  setCache(cacheKey, data)
  return data
}

export async function getGitHubLanguages(
  username: string
): Promise<Record<string, number>> {
  if (!isValidUsername(username)) return {}

  const cacheKey = `langs:${username}`
  const cached = getCached<Record<string, number>>(cacheKey)
  if (cached) return cached

  const repos = await getGitHubRepos(username, 10)
  if (repos.length === 0) return {}

  const languages: Record<string, number> = {}

  const langFetches = repos
    .filter(repo => repo.language)
    .map(async repo => {
      const data = await githubFetch<Record<string, number>>(
        `/repos/${repo.full_name}/languages`
      )
      if (data) {
        for (const [lang, bytes] of Object.entries(data)) {
          languages[lang] = (languages[lang] || 0) + bytes
        }
      }
    })

  await Promise.allSettled(langFetches)

  setCache(cacheKey, languages)
  return languages
}

export async function validateGitHubUsername(username: string): Promise<boolean> {
  if (!isValidUsername(username)) return false
  const profile = await getGitHubProfile(username)
  return profile !== null
}
