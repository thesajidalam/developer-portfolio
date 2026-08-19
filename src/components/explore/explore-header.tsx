'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dices, LayoutGrid, List } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ExploreHeaderProps {
  total: number
}

export function ExploreHeader({ total }: ExploreHeaderProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            Explore
          </h1>
          <Badge variant="secondary" className="text-xs">
            {total} portfolios
          </Badge>
        </div>
        <p className="text-sm text-zinc-400">
          Discover exceptional developer portfolios
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
        >
          <Link href="/explore?sort=featured">
            <Dices className="mr-1.5 h-3.5 w-3.5" />
            Random
          </Link>
        </Button>

        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              view === 'grid'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              view === 'list'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
