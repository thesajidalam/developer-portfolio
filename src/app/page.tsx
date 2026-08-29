import Link from 'next/link'
import type { Metadata } from 'next'
import { PortfolioCard } from '@/components/PortfolioCard'
import { listPortfolios } from '@/lib/repository'
import { getTrendingPortfolios, getTotalCount } from '@/lib/discovery'
import { PortfolioFiltersSchema } from '@/lib/validations'
import type { PortfolioFilters } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Discover Developer Portfolios',
  description:
    'Explore DevFolio\u2019s gallery of curated developer portfolios, filtered by technology, category and experience, and ranked by a transparent six-dimension score.',
}

function buildQuery(params: PortfolioFilters): string {
  const search = new URLSearchParams()
  if (params.search) search.set('search', params.search)
  if (params.tech) search.set('tech', params.tech)
  if (params.category) search.set('category', params.category)
  if (params.experience) search.set('experience', params.experience)
  if (params.sort) search.set('sort', params.sort)
  search.set('page', String(params.page ?? 1))
  return search.toString()
}

function Pagination({
  page,
  totalPages,
  filters,
}: {
  page: number
  totalPages: number
  filters: PortfolioFilters
}) {
  const prevPage = Math.max(1, page - 1)
  const nextPage = Math.min(totalPages, page + 1)
  const prevHref = page > 1 ? `/?${buildQuery({ ...filters, page: prevPage })}` : null
  const nextHref = page < totalPages ? `/?${buildQuery({ ...filters, page: nextPage })}` : null

  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
          >
            Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-slate-800/60 px-4 py-2 text-sm font-medium text-slate-600">
            Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-slate-800/60 px-4 py-2 text-sm font-medium text-slate-600">
            Next
          </span>
        )}
      </div>
    </div>
  )
}

const SELECT_CLASS =
  'w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 outline-none transition-colors focus:border-indigo-500/60 sm:w-auto'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const parsed = PortfolioFiltersSchema.safeParse({
    search: typeof sp.search === 'string' ? sp.search : undefined,
    tech: typeof sp.tech === 'string' ? sp.tech : undefined,
    category: typeof sp.category === 'string' ? sp.category : undefined,
    experience: typeof sp.experience === 'string' ? sp.experience : undefined,
    sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    page: typeof sp.page === 'string' ? sp.page : undefined,
  })

  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 12 }

  const [total, trending, gallery] = await Promise.all([
    getTotalCount(),
    getTrendingPortfolios(8),
    listPortfolios({
      search: filters.search,
      tech: filters.tech,
      category: filters.category,
      experience: filters.experience,
      sort: filters.sort,
      page: filters.page,
      pageSize: filters.pageSize,
    }),
  ])

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-800/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Discover standout{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">developer portfolios</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-400">
            Explore {total.toLocaleString()}+ curated portfolios, scored across performance, accessibility, SEO, design and
            content.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
            <span className="font-semibold text-white">{total.toLocaleString()}</span>
            <span>portfolios indexed</span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#gallery"
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
            >
              Browse the gallery
            </Link>
            <Link
              href="/rankings"
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
            >
              View rankings
            </Link>
          </div>
        </div>
      </section>

      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Trending now</h2>
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">Handpicked</span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((p) => (
              <PortfolioCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      <section id="gallery" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Browse all portfolios</h2>
          <p className="mt-1 text-sm text-slate-500">Filter and sort the directory to find portfolios worth studying.</p>
        </div>

        <form method="get" action="/" className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="search"
            name="search"
            defaultValue={filters.search ?? ''}
            placeholder="Search portfolios..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 outline-none transition-colors focus:border-indigo-500/60 lg:col-span-1"
          />
          <input
            type="text"
            name="tech"
            defaultValue={filters.tech ?? ''}
            placeholder="Technology (e.g. React)"
            className={SELECT_CLASS}
          />
          <input
            type="text"
            name="category"
            defaultValue={filters.category ?? ''}
            placeholder="Category (e.g. Design)"
            className={SELECT_CLASS}
          />
          <select name="experience" defaultValue={filters.experience ?? ''} className={SELECT_CLASS}>
            <option value="">Any experience</option>
            <option value="beginner">Beginner</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-1">
            <select name="sort" defaultValue={filters.sort ?? 'newest'} className={SELECT_CLASS}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="score">Top score</option>
              <option value="name">Name</option>
              <option value="trending">Trending</option>
            </select>
          </div>
          <div className="flex gap-2 lg:col-span-1">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02]"
            >
              Apply
            </button>
            <Link
              href="/"
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
            >
              Reset
            </Link>
          </div>
        </form>

        <p className="mb-6 text-sm text-slate-500">
          Showing <span className="font-semibold text-white">{gallery.meta.total.toLocaleString()}</span> portfolios
        </p>

        {gallery.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gallery.data.map((p) => (
              <PortfolioCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-16 text-center">
            <p className="text-lg font-medium text-white">No portfolios found</p>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or clearing your search.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
            >
              Clear filters
            </Link>
          </div>
        )}

        <Pagination page={gallery.meta.page} totalPages={Math.max(1, gallery.meta.totalPages)} filters={filters} />
      </section>
    </>
  )
}
