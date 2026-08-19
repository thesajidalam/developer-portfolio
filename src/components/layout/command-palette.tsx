'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Compass,
  Trophy,
  PlusCircle,
  Sun,
  Map,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface CommandAction {
  id: string
  label: string
  description: string
  icon: React.ElementType
  action: () => void
  keywords: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const actions: CommandAction[] = [
    {
      id: 'explore',
      label: 'Go to Explore',
      description: 'Browse developer portfolios',
      icon: Compass,
      action: () => { router.push('/explore'); onOpenChange(false) },
      keywords: ['explore', 'browse', 'portfolios', 'discover'],
    },
    {
      id: 'rankings',
      label: 'Go to Rankings',
      description: 'View top-ranked developers',
      icon: Trophy,
      action: () => { router.push('/rankings'); onOpenChange(false) },
      keywords: ['rankings', 'top', 'leaderboard', 'best'],
    },
    {
      id: 'submit',
      label: 'Submit Portfolio',
      description: 'Add your portfolio to Developer Portfolio',
      icon: PlusCircle,
      action: () => { router.push('/submit'); onOpenChange(false) },
      keywords: ['submit', 'add', 'portfolio', 'register'],
    },
    {
      id: 'theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: Sun,
      action: () => {
        document.documentElement.classList.toggle('dark')
        onOpenChange(false)
      },
      keywords: ['theme', 'dark', 'light', 'mode', 'toggle'],
    },
    {
      id: 'categories',
      label: 'Browse Categories',
      description: 'Browse portfolios by category',
      icon: Map,
      action: () => { router.push('/categories'); onOpenChange(false) },
      keywords: ['categories', 'browse', 'filter', 'group'],
    },
  ]

  const filtered = query
    ? actions.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : actions

  const runAction = useCallback((action: CommandAction) => {
    action.action()
    setQuery('')
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      runAction(filtered[selectedIndex])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-zinc-800 bg-zinc-900 p-0 shadow-2xl shadow-black/40 sm:max-w-[560px]">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleListKeyDown}
            placeholder="Search actions..."
            className="h-12 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            autoFocus
          />
          <kbd className="hidden select-none rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No results found.
            </div>
          ) : (
            <ul role="listbox">
              {filtered.map((action, index) => {
                const Icon = action.icon
                const isSelected = index === selectedIndex
                return (
                  <li
                    key={action.id}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      isSelected
                        ? 'bg-amber-500/10 text-amber-50'
                        : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => runAction(action)}
                  >
                    <Icon className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isSelected ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-zinc-500 truncate">{action.description}</div>
                    </div>
                    <ArrowRight className={cn(
                      'h-3.5 w-3.5 shrink-0 transition-all',
                      isSelected ? 'translate-x-0 opacity-100 text-amber-400' : '-translate-x-1 opacity-0'
                    )} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-zinc-800 px-4 py-2.5">
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">↑</kbd>
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
            select
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
