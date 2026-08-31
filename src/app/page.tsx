import Link from 'next/link'
import type { Metadata } from 'next'
import { PortfolioCard } from '@/components/PortfolioCard'
import { ScoreBadge } from '@/components/ScoreBadge'
import { Reveal } from '@/components/Reveal'
import { LoadMore } from '@/components/LoadMore'
import { listPortfolios, portfolioOfDay, topByField } from '@/lib/repository'
import { getTrendingPortfolios, getTotalCount } from '@/lib/discovery'
import { PortfolioFiltersSchema } from '@/lib/validations'
import type { PortfolioFilters } from '@/lib/types'
import { cn, absoluteUrl, hostnameOf } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Discover Developer Portfolios',
  description:
    'Explore DevFolio\u2019s gallery of curated developer portfolios, filtered by technology, category and experience, and ranked by a transparent six-dimension score.',
}

const POPULAR_TECHS = ['React', 'Next.js', 'Vue', 'TypeScript', 'Tailwind CSS', 'Python', 'Node.js', 'Laravel', 'Flutter', 'Django']

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

const SELECT_CLASS =
  'h-11 w-full rounded-xl border border-white/10 bg-[#0a1120]/80 px-3.5 text-sm text-slate-200 outline-none transition-all focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 sm:w-auto [&>option]:bg-[#0a1120]'

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

  const [total, trending, topCandidates, gallery, potd, topReact, topNext] = await Promise.all([
    getTotalCount(),
    getTrendingPortfolios(8),
    listPortfolios({ sort: 'score', page: 1, pageSize: 24 }),
    listPortfolios({
      search: filters.search,
      tech: filters.tech,
      category: filters.category,
      experience: filters.experience,
      sort: filters.sort,
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    portfolioOfDay(),
    topByField('technologies', 'React', 5),
    topByField('technologies', 'Next.js', 5),
  ])

  // Never spotlight a degenerate entry (0 score / unknown health / no name).
  // Pick the highest-scored portfolio that actually looks real.
  const topPortfolio =
    topCandidates.data.find(
      (p) =>
        (p.score?.overallScore ?? 0) > 0 &&
        p.health !== 'unknown' &&
        p.health !== 'down' &&
        Boolean(p.name),
    ) ?? topCandidates.data[0] ?? null

  const galleryFilters = {
    search: filters.search,
    tech: filters.tech,
    category: filters.category,
    experience: filters.experience,
    sort: filters.sort,
  }

  return (
    <>
      {/* ---- cinematic hero ------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="bg-aurora absolute inset-0" />
        <div className="bg-grid absolute inset-0" />

        {/* drifting orbs */}
        <div className="pointer-events-none absolute -top-24 right-[-6rem] h-80 w-80 rounded-full bg-violet-500/25 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute top-32 left-[-5rem] h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl animate-float-slow [animation-delay:3s]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            {/* copy */}
            <div className="flex-1">
              <p className="animate-hero mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wide text-violet-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
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
                  className="shine rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/50 active:scale-95"
                >
                  Browse the gallery
                </Link>
                <Link
                  href="/rankings"
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-violet-500/50 hover:bg-white/[0.06] hover:text-white"
                >
                  View rankings
                  <span className="inline-block transition-transform group-hover:translate-x-1">â†’</span>
                </Link>
              </div>

              <p className="animate-hero delay-4 mt-6 inline-flex items-center gap-2 text-xs text-slate-500">
                <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">/</kbd>
                Press <span className="font-semibold text-slate-300">/</span> to search
              </p>

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
                    <span className="text-gradient">âˆž</span>
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">Inspiration</div>
                </div>
              </div>
            </div>

            {/* floating top-portfolio card */}
            <div className="hidden flex-1 justify-center lg:flex">
              <div className="reveal reveal-visible relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Top portfolio</span>
                  <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-300">â˜…â˜…â˜…â˜…â˜…</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-400 text-xl font-bold text-white shadow-lg shadow-violet-500/30">
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
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
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
                    className="group mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm transition-all hover:border-violet-500/50 hover:bg-white/[0.06]"
                  >
                    <span className="text-slate-300">
                      See why <span className="font-semibold text-white">{topPortfolio.name}</span> ranks here
                    </span>
                    <span className="inline-block text-violet-400 transition-transform group-hover:translate-x-1">â†’</span>
                  </Link>
                )}
                <div className="mt-4 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 p-3.5 text-center">
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-violet-300">Your portfolio could be the next pick.</span>
                  </p>
                  <Link
                    href="/submit"
                    className="mt-1 inline-block text-xs font-semibold text-lime-300 transition-colors hover:text-lime-200"
                  >
                    Add yours â†’ it only takes a minute
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- portfolio of the day ------------------------------------------- */}
      {potd && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#150f04]/40 via-[#0b1020]/60 to-[#0b1020]/60 p-6 shadow-2xl shadow-amber-500/5 sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-glow" />
                    Portfolio of the Day
                  </span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">{potd.name}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                    {potd.description || potd.title || 'A standout developer portfolio worth studying.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(potd.technologies ?? []).slice(0, 6).map((t) => (
                      <span key={t} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/p/${potd.slug}`}
                    className="group mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-200 transition-all hover:border-amber-400/60 hover:bg-amber-500/20"
                  >
                    View <span className="inline-block transition-transform group-hover:translate-x-1">â†’</span>
                  </Link>
                </div>
                <div className="flex items-center sm:flex-col sm:items-end sm:justify-center">
                  {potd.score ? <ScoreBadge score={potd.score.overallScore} className="h-16 w-16 text-xl ring-1 ring-amber-500/30" /> : <ScoreBadge score={0} className="h-16 w-16 text-xl ring-1 ring-amber-500/30" />}
                  <span className="mt-2 text-xs uppercase tracking-widest text-slate-500">Score</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

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

      {/* ---- leaderboards ---------------------------------------------- */}
      {(topReact.length > 0 || topNext.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <Reveal className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-white">Top ranked by stack</h2>
            <Link href="/rankings" className="text-sm font-semibold text-lime-300 transition-colors hover:text-lime-200">
              Full rankings â†’
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[
              { title: 'React portfolios', tech: 'React', items: topReact },
              { title: 'Next.js portfolios', tech: 'Next.js', items: topNext },
            ].map((board) => (
              <Reveal key={board.title}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{board.title}</h3>
                    <Link
                      href={`/?tech=${encodeURIComponent(board.tech)}`}
                      className="text-xs font-semibold text-slate-400 transition-colors hover:text-lime-300"
                    >
                      See all â†’
                    </Link>
                  </div>
                  <ol className="space-y-1">
                    {board.items.map((p, i) => (
                      <li key={p.id}>
                        <Link
                          href={`/p/${p.slug}`}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
                        >
                          <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold', i === 0 ? 'bg-amber-500/20 text-amber-300' : i === 1 ? 'bg-slate-400/15 text-slate-200' : i === 2 ? 'bg-orange-500/15 text-orange-300' : 'bg-white/[0.04] text-slate-500')}>
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-slate-200 group-hover:text-white">{p.name}</span>
                            <span className="block truncate text-xs text-slate-500">{p.title || hostnameOf(p.portfolioUrl)}</span>
                          </div>
                          {p.score && (
                            <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                              {Math.round(p.score.overallScore)}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
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

        {/* quick tech filter chips */}
        <Reveal className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {POPULAR_TECHS.map((t) => {
              const active = filters.tech?.toLowerCase() === t.toLowerCase()
              return (
                <Link
                  key={t}
                  href={`/?tech=${encodeURIComponent(t)}`}
                  className={cn(
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                    active
                      ? 'border-violet-500/60 bg-violet-500/15 text-violet-200 shadow-lg shadow-violet-500/10'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-violet-500/40 hover:bg-white/[0.06] hover:text-white hover:shadow-lg hover:shadow-violet-500/10',
                  )}
                >
                  {t}
                </Link>
              )
            })}
          </div>
        </Reveal>

        <Reveal>
          <form method="get" action="/" className="glass relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-violet-500/5 backdrop-blur-xl">
            <div className="pointer-events-none absolute -top-24 right-0 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

            {/* primary search â€” the hero of the filter bar */}
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="search"
                name="search"
                defaultValue={filters.search ?? ''}
                placeholder="Search portfolios by name, role, or URLâ€¦"
                aria-label="Search portfolios by name, role, or URL"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#0a1120]/80 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* refinement controls */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tech</span>
                <input
                  type="text"
                  name="tech"
                  defaultValue={filters.tech ?? ''}
                  placeholder="e.g. React"
                  aria-label="Filter by technology"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#0a1120]/80 pl-16 pr-3.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
                <input
                  type="text"
                  name="category"
                  defaultValue={filters.category ?? ''}
                  placeholder="e.g. Design"
                  aria-label="Filter by category"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#0a1120]/80 pl-20 pr-3.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <select name="experience" defaultValue={filters.experience ?? ''} aria-label="Filter by experience level" className={SELECT_CLASS}>
                <option value="">Any experience</option>
                <option value="beginner">Beginner</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
              </select>
              <select name="sort" defaultValue={filters.sort ?? 'newest'} aria-label="Sort portfolios" className={SELECT_CLASS}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="score">Top score</option>
                <option value="name">Name</option>
                <option value="trending">Trending</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="shine h-11 flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/40 active:scale-95"
                >
                  Apply
                </button>
                <Link
                  href="/"
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-violet-500/50 hover:text-white"
                >
                  Reset
                </Link>
              </div>
            </div>
          </form>
        </Reveal>

        <Reveal className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          Showing <span className="rounded-lg bg-violet-500/10 px-2 py-0.5 font-semibold text-violet-300">{gallery.meta.total.toLocaleString()}</span> portfolios
        </Reveal>

        <LoadMore
          initial={gallery.data}
          total={gallery.meta.total}
          initialPage={filters.page ?? 1}
          pageSize={filters.pageSize ?? 12}
          filters={galleryFilters}
        />
      </section>
    </>
  )
}
