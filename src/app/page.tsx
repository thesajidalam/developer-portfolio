import Link from 'next/link'
import type { Metadata } from 'next'
import { PortfolioCard } from '@/components/PortfolioCard'
import { Reveal } from '@/components/Reveal'
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
            scroll={false}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
          >
            ← Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-white/5 px-4 py-2 text-sm font-medium text-slate-600">
            ← Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            scroll={false}
            className="shine rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
          >
            Next →
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-white/5 px-4 py-2 text-sm font-medium text-slate-600">
            Next →
          </span>
        )}
      </div>
    </div>
  )
}

const SELECT_CLASS =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-indigo-500/60 focus:bg-white/[0.06] sm:w-auto'

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

  const [total, trending, topPortfolio, gallery] = await Promise.all([
    getTotalCount(),
    getTrendingPortfolios(8),
    listPortfolios({ sort: 'score', page: 1, pageSize: 1 }).then((r) => r.data[0] ?? null),
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
      {/* ---- cinematic hero ------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="bg-aurora absolute inset-0" />
        <div className="bg-grid absolute inset-0" />

        {/* drifting orbs */}
        <div className="pointer-events-none absolute -top-24 right-[-6rem] h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute top-32 left-[-5rem] h-72 w-72 rounded-full bg-sky-400/20 blur-3xl animate-float-slow [animation-delay:3s]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            {/* copy */}
            <div className="flex-1">
              <p className="animate-hero mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wide text-indigo-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
                </span>
                A living directory of standout portfolios
              </p>

              <h1 className="animate-hero delay-1 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Discover standout{' '}
                <span className="text-gradient">developer portfolios</span>
              </h1>

              <p className="animate-hero delay-2 mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                Explore a curated collection of portfolios, transparently scored across performance, accessibility, SEO,
                design and content.
              </p>

              <div className="animate-hero delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#gallery"
                  className="shine rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/50 active:scale-95"
                >
                  Browse the gallery
                </Link>
                <Link
                  href="/rankings"
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-indigo-500/50 hover:bg-white/[0.06] hover:text-white"
                >
                  View rankings
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              {/* stat strip */}
              <div className="animate-hero delay-4 mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8">
                <div>
                  <div className="text-3xl font-bold text-white">{total.toLocaleString()}+</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">Portfolios</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">6</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">Score dims</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    <span className="text-gradient">∞</span>
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">Inspiration</div>
                </div>
              </div>
            </div>

            {/* floating top-portfolio card */}
            <div className="hidden flex-1 justify-center lg:flex">
              <div className="reveal reveal-visible relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Top portfolio</span>
                  <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">★★★★★</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
                    {topPortfolio?.name?.charAt(0) ?? 'D'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{topPortfolio?.name ?? 'Discover something new'}</div>
                    <div className="text-sm text-slate-500">
                      {topPortfolio?.score ? `Score ${topPortfolio.score.overallScore} / 100` : 'Rated across six dimensions'}
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ['Performance', topPortfolio?.score?.performanceScore],
                    ['Design', topPortfolio?.score?.designScore],
                    ['Content', topPortfolio?.score?.contentScore],
                  ].map(([label, v]) => {
                    const value = typeof v === 'number' ? v : 0
                    return (
                      <div key={label as string}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-400">{label}</span>
                          <span className="font-semibold text-white">{value}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {topPortfolio?.slug && (
                  <Link
                    href={`/p/${topPortfolio.slug}`}
                    className="group mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm transition-all hover:border-indigo-500/50 hover:bg-white/[0.06]"
                  >
                    <span className="text-slate-300">
                      See why <span className="font-semibold text-white">{topPortfolio.name}</span> ranks here
                    </span>
                    <span className="inline-block text-indigo-400 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                )}
                <div className="mt-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-3.5 text-center">
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-indigo-300">Your portfolio could be the next pick.</span>
                  </p>
                  <Link
                    href="/submit"
                    className="mt-1 inline-block text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300"
                  >
                    Add yours → it only takes a minute
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- trending ------------------------------------------------------ */}
      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-white">Trending now</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-glow" />
              Handpicked
            </span>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 60}>
                <PortfolioCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---- gallery -------------------------------------------------------- */}
      <section id="gallery" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">Browse all portfolios</h2>
          <p className="mt-1.5 text-sm text-slate-500">Filter and sort the directory to find portfolios worth studying.</p>
        </Reveal>

        <Reveal>
          <form method="get" action="/" className="glass mb-8 grid grid-cols-1 gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5">
            <input
              type="search"
              name="search"
              defaultValue={filters.search ?? ''}
              placeholder="Search portfolios..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:bg-white/[0.06] lg:col-span-1"
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
                className="shine flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/40 active:scale-95"
              >
                Apply
              </button>
              <Link
                href="/"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
              >
                Reset
              </Link>
            </div>
          </form>
        </Reveal>

        <Reveal className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          Showing <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 font-semibold text-indigo-300">{gallery.meta.total.toLocaleString()}</span> portfolios
        </Reveal>

        {gallery.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gallery.data.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 50}>
                <PortfolioCard p={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
            <p className="text-lg font-medium text-white">No portfolios found</p>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or clearing your search.</p>
            <Link
              href="/"
              className="shine mt-6 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Clear filters
            </Link>
          </div>
        )}

        <Reveal>
          <Pagination page={gallery.meta.page} totalPages={Math.max(1, gallery.meta.totalPages)} filters={filters} />
        </Reveal>
      </section>
    </>
  )
}
