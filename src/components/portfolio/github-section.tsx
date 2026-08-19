'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, GitFork, ExternalLink, Calendar, Code2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GitHubProfileData {
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

interface GitHubRepoData {
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

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4f5d95',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dart: '#00b4ab',
  Scala: '#c22d40',
  R: '#198ce7',
  Lua: '#000080',
  Zig: '#ec915c',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Clojure: '#db5855',
  'Objective-C': '#438eff',
  VimScript: '#199f4b',
  Jupyter: '#F37626',
  Vue: '#41b883',
  Svelte: '#ff3e00',
}

interface GitHubSectionProps {
  username: string
}

export function GitHubSection({ username }: GitHubSectionProps) {
  const [profile, setProfile] = useState<GitHubProfileData | null>(null)
  const [repos, setRepos] = useState<GitHubRepoData[]>([])
  const [languages, setLanguages] = useState<Record<string, number>>({})
  const [accountAge, setAccountAge] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(false)

      try {
        const res = await fetch(`/api/v1/github/${encodeURIComponent(username)}`)
        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        if (!cancelled) {
          setProfile(data.profile)
          setRepos(data.repos)
          setLanguages(data.languages)
          const age = Math.floor(
            (Date.now() - new Date(data.profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
          )
          setAccountAge(age)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [username])

  if (loading) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
            <Code2 className="h-4 w-4 text-amber-500" />
            GitHub Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-zinc-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-zinc-800" />
                <div className="h-3 w-48 rounded bg-zinc-800" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-zinc-800" />
            <div className="h-3 w-3/4 rounded bg-zinc-800" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !profile) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Code2 className="h-8 w-8 text-zinc-700" />
          <p className="mt-3 text-sm text-zinc-500">Could not load GitHub data.</p>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs text-amber-500 hover:text-amber-400 transition-colors"
          >
            View on GitHub →
          </a>
        </CardContent>
      </Card>
    )
  }

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
  const recentUpdate = repos.length > 0 ? repos[0].updated_at : null
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0)

  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
          <Code2 className="h-4 w-4 text-amber-500" />
          GitHub Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {/* Profile header */}
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar_url}
            alt={`${profile.login}'s avatar`}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-zinc-800"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100 truncate">
                {profile.name || profile.login}
              </h3>
              <a
                href={profile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Open GitHub profile"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="text-xs text-zinc-500">@{profile.login}</p>
            {profile.bio && (
              <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{profile.bio}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </span>
              )}
              <span>
                {profile.followers.toLocaleString()} followers
              </span>
              <span>
                {profile.public_repos} repos
              </span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-zinc-800/40 p-2.5 text-center">
            <p className="text-lg font-bold tabular-nums text-zinc-100">{totalStars}</p>
            <p className="text-[10px] text-zinc-500">Stars</p>
          </div>
          <div className="rounded-lg bg-zinc-800/40 p-2.5 text-center">
            <p className="text-lg font-bold tabular-nums text-zinc-100">{profile.public_repos}</p>
            <p className="text-[10px] text-zinc-500">Repos</p>
          </div>
          <div className="rounded-lg bg-zinc-800/40 p-2.5 text-center">
            <p className="text-lg font-bold tabular-nums text-zinc-100">{accountAge}y</p>
            <p className="text-[10px] text-zinc-500">Account Age</p>
          </div>
        </div>

        {/* Language breakdown */}
        {topLanguages.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Languages
            </p>
            {/* Bar */}
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              {topLanguages.map(([lang, bytes]) => {
                const pct = (bytes / totalBytes) * 100
                return (
                  <div
                    key={lang}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: LANGUAGE_COLORS[lang] || '#8b8b8b',
                    }}
                    title={`${lang}: ${pct.toFixed(1)}%`}
                  />
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {topLanguages.map(([lang, bytes]) => {
                const pct = (bytes / totalBytes) * 100
                return (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: LANGUAGE_COLORS[lang] || '#8b8b8b' }}
                    />
                    {lang}
                    <span className="text-zinc-600">{pct.toFixed(0)}%</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Top repos */}
        {repos.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Top Repositories
            </p>
            <div className="space-y-2">
              {repos.slice(0, 5).map(repo => (
                <a
                  key={repo.full_name}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-lg border border-zinc-800 bg-zinc-800/30 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                      {repo.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {repo.stargazers_count > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-500">
                          <Star className="h-3 w-3" />
                          {repo.stargazers_count}
                        </span>
                      )}
                      {repo.forks_count > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-500">
                          <GitFork className="h-3 w-3" />
                          {repo.forks_count}
                        </span>
                      )}
                    </div>
                  </div>
                  {repo.description && (
                    <p className="mt-1 text-[11px] text-zinc-500 line-clamp-1">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#8b8b8b' }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {repo.topics.slice(0, 3).map(topic => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Activity footer */}
        {recentUpdate && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 border-t border-zinc-800 pt-3">
            <Calendar className="h-3 w-3" />
            <span>
              Last active {formatDate(recentUpdate)}
            </span>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-zinc-600 border-t border-zinc-800 pt-3">
          This data is fetched from the public GitHub API. Not affiliated with GitHub, Inc.
        </p>
      </CardContent>
    </Card>
  )
}
