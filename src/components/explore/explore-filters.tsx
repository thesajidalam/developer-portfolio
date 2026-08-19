'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface FilterOption {
  slug: string
  name: string
  count: number
}

interface ActiveFilters {
  search?: string
  tech: string[]
  category: string[]
  experience: string[]
  health: string[]
  sort: string
}

interface ExploreFiltersProps {
  technologies: FilterOption[]
  categories: FilterOption[]
  activeFilters: ActiveFilters
}

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'principal', label: 'Principal' },
]

const HEALTH_OPTIONS = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'needs_attention', label: 'Needs Attention' },
  { value: 'offline', label: 'Offline' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'score', label: 'Score' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'featured', label: 'Featured' },
]

function buildFilterCount(filters: ActiveFilters) {
  let count = 0
  if (filters.search) count++
  count += filters.tech.length
  count += filters.category.length
  count += filters.experience.length
  count += filters.health.length
  if (filters.sort !== 'newest') count++
  return count
}

export function ExploreFilters({
  technologies,
  categories,
  activeFilters,
}: ExploreFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(activeFilters.search ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [techExpanded, setTechExpanded] = useState(true)
  const [categoryExpanded, setCategoryExpanded] = useState(true)
  const [experienceExpanded, setExperienceExpanded] = useState(true)
  const [healthExpanded, setHealthExpanded] = useState(true)

  const activeCount = buildFilterCount(activeFilters)

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          next.delete(key)
        } else if (Array.isArray(value)) {
          next.set(key, value.join(','))
        } else {
          next.set(key, value)
        }
      }
      next.delete('page')
      router.push(`/explore?${next.toString()}`)
    },
    [router, searchParams]
  )

  function handleSearchChange(value: string) {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value || null })
    }, 300)
  }

  function toggleArrayFilter(
    key: 'tech' | 'category' | 'experience' | 'health',
    value: string
  ) {
    const current = activeFilters[key]
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    updateParams({ [key]: next })
  }

  function handleSortChange(value: string) {
    updateParams({ sort: value === 'newest' ? null : value })
  }

  function clearAll() {
    setSearchValue('')
    router.push('/explore')
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const filterContent = (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search portfolios..."
            value={searchValue}
            onChange={e => handleSearchChange(e.target.value)}
            className="h-10 pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('')
                updateParams({ search: null })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Sort */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Sort by
        </label>
        <Select
          value={activeFilters.sort}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="h-9 border-zinc-800 bg-zinc-900 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900">
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-zinc-300">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Technology */}
      <CollapsibleSection
        title="Technology"
        count={activeFilters.tech.length}
        expanded={techExpanded}
        onToggle={() => setTechExpanded(!techExpanded)}
      >
        <div className="flex flex-wrap gap-1.5">
          {technologies.slice(0, 20).map(tech => {
            const active = activeFilters.tech.includes(tech.slug)
            return (
              <button
                key={tech.slug}
                onClick={() => toggleArrayFilter('tech', tech.slug)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                )}
              >
                {tech.name}
                <span className="text-[10px] text-zinc-600">{tech.count}</span>
              </button>
            )
          })}
        </div>
      </CollapsibleSection>

      <Separator className="bg-zinc-800" />

      {/* Categories */}
      <CollapsibleSection
        title="Category"
        count={activeFilters.category.length}
        expanded={categoryExpanded}
        onToggle={() => setCategoryExpanded(!categoryExpanded)}
      >
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => {
            const active = activeFilters.category.includes(cat.slug)
            return (
              <button
                key={cat.slug}
                onClick={() => toggleArrayFilter('category', cat.slug)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                )}
              >
                {cat.name}
                <span className="text-[10px] text-zinc-600">{cat.count}</span>
              </button>
            )
          })}
        </div>
      </CollapsibleSection>

      <Separator className="bg-zinc-800" />

      {/* Experience Level */}
      <CollapsibleSection
        title="Experience Level"
        count={activeFilters.experience.length}
        expanded={experienceExpanded}
        onToggle={() => setExperienceExpanded(!experienceExpanded)}
      >
        <div className="space-y-1.5">
          {EXPERIENCE_LEVELS.map(level => {
            const active = activeFilters.experience.includes(level.value)
            return (
              <label
                key={level.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                    active
                      ? 'border-amber-500 bg-amber-500'
                      : 'border-zinc-600 bg-zinc-800'
                  )}
                >
                  {active && (
                    <svg className="h-2.5 w-2.5 text-zinc-950" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  onChange={() => toggleArrayFilter('experience', level.value)}
                />
                {level.label}
              </label>
            )
          })}
        </div>
      </CollapsibleSection>

      <Separator className="bg-zinc-800" />

      {/* Health */}
      <CollapsibleSection
        title="Health"
        count={activeFilters.health.length}
        expanded={healthExpanded}
        onToggle={() => setHealthExpanded(!healthExpanded)}
      >
        <div className="space-y-1.5">
          {HEALTH_OPTIONS.map(opt => {
            const active = activeFilters.health.includes(opt.value)
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                    active
                      ? 'border-amber-500 bg-amber-500'
                      : 'border-zinc-600 bg-zinc-800'
                  )}
                >
                  {active && (
                    <svg className="h-2.5 w-2.5 text-zinc-950" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  onChange={() => toggleArrayFilter('health', opt.value)}
                />
                {opt.label}
              </label>
            )
          })}
        </div>
      </CollapsibleSection>

      {/* Clear all */}
      {activeCount > 0 && (
        <>
          <Separator className="bg-zinc-800" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="w-full text-zinc-400 hover:text-zinc-100"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear all filters ({activeCount})
          </Button>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="border-zinc-800 bg-zinc-900 text-zinc-400"
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge className="ml-1.5 h-5 w-5 rounded-full p-0 text-[10px] bg-amber-500 text-zinc-950">
              {activeCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <div className="sticky top-24">
          {activeCount > 0 && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {activeCount} filter{activeCount !== 1 ? 's' : ''} active
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear all
              </button>
            </div>
          )}
          {filterContent}
        </div>
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-zinc-950 p-6 shadow-xl lg:hidden">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Filters</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </>
      )}
    </>
  )
}

function CollapsibleSection({
  title,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="mb-2 flex w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500"
      >
        <span className="flex items-center gap-1.5">
          {title}
          {count > 0 && (
            <span className="h-4 min-w-4 rounded-full bg-amber-500/15 px-1 text-[10px] font-bold text-amber-400">
              {count}
            </span>
          )}
        </span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && children}
    </div>
  )
}
