import Link from 'next/link'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PortfolioCard } from '@/components/portfolio/portfolio-card'

interface PortfolioGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  portfolios: any[]
  total: number
  page: number
  pageSize: number
  queryString?: string
}

export function PortfolioGrid({
  portfolios,
  total,
  page,
  pageSize,
  queryString = '',
}: PortfolioGridProps) {
  const totalPages = Math.ceil(total / pageSize)
  const baseQuery = queryString ? `&${queryString}` : ''

  if (portfolios.length === 0) {
    return (
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">
            <SearchX className="h-7 w-7 text-zinc-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-zinc-200">
            No portfolios match your filters
          </h3>
          <p className="mt-1.5 max-w-sm text-center text-sm text-zinc-500">
            Try adjusting your search criteria or removing some filters to see more results.
          </p>
          <Link href="/explore" className="mt-6">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            >
              Clear all filters
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing{' '}
          <span className="font-medium text-zinc-300">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
          </span>{' '}
          of{' '}
          <span className="font-medium text-zinc-300">{total}</span>{' '}
          portfolio{total !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {portfolios.map(portfolio => (
          <PortfolioCard key={portfolio.id} portfolio={portfolio} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-1">
          <PaginationLink
            href={page > 1 ? `/explore?page=${page - 1}${baseQuery}` : undefined}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </PaginationLink>

          {generatePageNumbers(page, totalPages).map((p, i) => (
            <span key={i} className="flex items-center">
              {p === '...' ? (
                <span className="px-2 text-sm text-zinc-600">…</span>
              ) : (
                <PaginationLink
                  href={`/explore?page=${p}${baseQuery}`}
                  active={p === page}
                >
                  {p}
                </PaginationLink>
              )}
            </span>
          ))}

          <PaginationLink
            href={page < totalPages ? `/explore?page=${page + 1}${baseQuery}` : undefined}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </PaginationLink>
        </nav>
      )}
    </div>
  )
}

function PaginationLink({
  href,
  active = false,
  disabled = false,
  children,
}: {
  href?: string
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={disabled ? '#' : (href ?? '#')}
      aria-disabled={disabled}
      aria-current={active ? 'page' : undefined}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors ${
        active
          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
          : disabled
            ? 'pointer-events-none border-zinc-800 bg-zinc-900/50 text-zinc-700'
            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
      }`}
    >
      {children}
    </Link>
  )
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  if (current > 3) {
    pages.push('...')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('...')
  }

  pages.push(total)

  return pages
}
