import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Star } from 'lucide-react'
import { PortfolioCard } from '@/components/PortfolioCard'
import { ScoreRing } from '@/components/ScoreRing'
import { Reveal } from '@/components/Reveal'
import { LoadMore } from '@/components/LoadMore'
import { SearchAutoFocus } from '@/components/SearchAutoFocus'
import { listPortfolios, portfolioOfDay, topByField } from '@/lib/repository'
import { getTrendingPortfolios, getTotalCount } from '@/lib/discovery'
import { PortfolioFiltersSchema } from '@/lib/validations'
import type { PortfolioFilters } from '@/lib/types'
import { cn, hostnameOf } from '@/lib/utils'

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
  'h-11 w-full rounded-xl border border-white/10 bg-[#180921]/90 px-3.5 text-sm text-slate-200 outline-none transition-all focus:border-[#7B337E]/70 focus:ring-2 focus:ring-[#7B337E]/25 sm:w-auto [&>option]:bg-[#180921]'

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
      {/* ---- moonlit hero --------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="bg-aurora absolute inset-0" />
        <div className="bg-grid absolute inset-0" />
        <div className="animate-hero pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7B337E]/70 to-transparent" />
        <div className="pointer-events-none absolute -top-24 right-[-7rem] h-96 w-96 rounded-full bg-[#7B337E]/12 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            {/* copy */}
            <div className="flex-1">
              <p className="animate-hero mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#cbb8cf]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00C4FF]/80" />
                A living directory of standout portfolios
              </p>

              <h1 className="animate-hero delay-1 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-[#ede4f0] sm:text-6xl">
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
                  className="shine rounded-xl bg-[#7B337E] px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-[#8a3d8d]"
                >
                  Browse the gallery
                </Link>
                <Link
                  href="/rankings"
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-[#7B337E]/50 hover:bg-white/[0.06] hover:text-white"
                >
                  View rankings
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>

              <p className="animate-hero delay-4 mt-6 inline-flex items-center gap-2 text-xs text-slate-500">
                <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">/</kbd>
                Press <span className="font-semibold text-slate-300">/</span> to search
              </p>

              {/* stat strip */}
              <div className="animate-hero delay-4 mt-12 flex flex-wrap gap-8 border-t border-white/[0.08] pt-8">
                <div>
                  <div className="font-display text-3xl font-bold text-[#ede4f0]">{total.toLocaleString()}+</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">Portfolios</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-[#ede4f0]">6</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">Score dimensions</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-[#b98cc5]">∞</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">Inspiration</div>
                </div>
              </div>
            </div>

            {/* floating top-portfolio card */}
            <div className="hidden flex-1 justify-center lg:flex">
              <div className="reveal reveal-visible relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#180921]/80 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Top portfolio</span>
                  <span className="inline-flex items-center gap-0.5 text-[#F2B84B]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
                    ))}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B337E]/20 text-xl font-bold text-[#e9d7ec] ring-1 ring-[#7B337E]/30">
                    {topPortfolio?.name?.charAt(0) ?? 'D'}
                  </div>
                  <div>
                    <div className="font-semibold text-[#ede4f0]">{topPortfolio?.name ?? 'Discover something new'}</div>
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
                          <span className="font-semibold text-slate-200">{value}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-[#b98cc5] transition-[width] duration-500"
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
                    className="group mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm transition-colors hover:border-[#7B337E]/50 hover:bg-white/[0.06]"
                  >
                    <span className="text-slate-300">
                      See why <span className="font-semibold text-white">{topPortfolio.name}</span> ranks here
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#b98cc5] transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                )}
                <div className="mt-4 rounded-xl border border-dashed border-[#7B337E]/30 bg-[#7B337E]/5 p-3.5 text-center">
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-[#e9d7ec]">Your portfolio could be the next pick.</span>
                  </p>
                  <Link
                    href="/submit"
                    className="mt-1 inline-block text-xs font-semibold text-[#b98cc5] transition-colors hover:text-[#d5b2dc]"
                  >
                    Add yours — it only takes a minute
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
            <div className="relative overflow-hidden rounded-3xl border border-[#7B337E]/25 bg-gradient-to-b from-[#1c0b24]/70 to-[#180921]/60 p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#7B337E]/12 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#6667AB]/8 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7B337E]/40 bg-[#7B337E]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#e9d7ec]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C4FF]/90 animate-pulse-glow" />
                    Portfolio of the Day
                  </span>
                  <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#ede4f0] sm:text-3xl">{potd.name}</h2>
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
                    className="group mt-6 inline-flex items-center gap-2 rounded-xl border border-[#7B337E]/40 bg-[#7B337E]/10 px-5 py-2.5 text-sm font-semibold text-[#e9d7ec] transition-colors hover:border-[#7B337E]/70 hover:bg-[#7B337E]/20"
                  >
                    View the report
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
                <div className="flex items-center sm:flex-col sm:items-end sm:justify-center">
                  <ScoreRing score={potd.score?.overallScore ?? 0} size={76} label="score" />
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
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#ede4f0]">Trending now</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00C4FF]/70" />
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
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#ede4f0]">Top ranked by stack</h2>
            <Link href="/rankings" className="text-sm font-semibold text-[#b98cc5] transition-colors hover:text-[#d5b2dc]">
              Full rankings →
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[
              { title: 'React portfolios', tech: 'React', items: topReact },
              { title: 'Next.js portfolios', tech: 'Next.js', items: topNext },
            ].map((board) => (
              <Reveal key={board.title}>
                <div className="rounded-2xl border border-white/[0.07] bg-[#180921]/70 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ede4f0]">{board.title}</h3>
                    <Link
                      href={`/?tech=${encodeURIComponent(board.tech)}`}
                      className="text-xs font-medium text-slate-400 transition-colors hover:text-[#b98cc5]"
                    >
                      See all →
                    </Link>
                  </div>
                  <ol className="space-y-1">
                    {board.items.map((p, i) => (
                      <li key={p.id}>
                        <Link
                          href={`/p/${p.slug}`}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
                        >
                          <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold', i === 0 ? 'bg-[#F2B84B]/20 text-[#F2B84B]' : i === 1 ? 'bg-slate-400/15 text-slate-200' : i === 2 ? 'bg-[#FF7A52]/15 text-[#FF7A52]' : 'bg-white/[0.04] text-slate-500')}>
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-slate-200 group-hover:text-white">{p.name}</span>
                            <span className="block truncate text-xs text-slate-500">{p.title || hostnameOf(p.portfolioUrl)}</span>
                          </div>
                          {p.score && (
                            <span className="shrink-0 rounded-md bg-[#35D07F]/10 px-2 py-0.5 text-xs font-bold text-[#4fe29b]">
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
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#ede4f0]">Browse all portfolios</h2>
          <p className="mt-1.5 text-sm text-slate-500">Filter and sort the directory to find portfolios worth studying.</p>
        </Reveal>

        {/* quick tech filter chips */}
        <Reveal className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {POPULAR_TECHS.map((t) => {
              const active = filters.tech?.toLowerCase() === t.toLowerCase()
              return (
                <Link
                  key={t}
                  href={`/?tech=${encodeURIComponent(t)}`}
                  className={cn(
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'border-[#7B337E]/60 bg-[#7B337E]/20 text-[#e9d7ec]'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-[#7B337E]/40 hover:bg-white/[0.06] hover:text-white',
                  )}
                >
                  {t}
                </Link>
              )
            })}
          </div>
        </Reveal>

        <Reveal>
          <form method="get" action="/" className="glass relative overflow-hidden rounded-2xl p-5">
            {/* primary search — the hero of the filter bar */}
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                id="df-search-input"
                type="search"
                name="search"
                defaultValue={filters.search ?? ''}
                placeholder="Search portfolios by name, role, or URL…"
                aria-label="Search portfolios by name, role, or URL"
                className="h-12 w-full rounded-xl border border-white/10 bg-[#12051A]/80 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-[#7B337E]/70 focus:ring-2 focus:ring-[#7B337E]/25"
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
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#12051A]/80 pl-16 pr-3.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-[#7B337E]/70 focus:ring-2 focus:ring-[#7B337E]/25"
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
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#12051A]/80 pl-20 pr-3.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-[#7B337E]/70 focus:ring-2 focus:ring-[#7B337E]/25"
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
                  className="shine h-11 flex-1 rounded-xl bg-[#7B337E] px-4 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-[#8a3d8d]"
                >
                  Apply
                </button>
                <Link
                  href="/"
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-[#7B337E]/50 hover:text-white"
                >
                  Reset
                </Link>
              </div>
            </div>
            <SearchAutoFocus />
          </form>
        </Reveal>

        <Reveal className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          Showing <span className="rounded-lg bg-[#7B337E]/15 px-2 py-0.5 font-semibold text-[#e9d7ec]">{gallery.meta.total.toLocaleString()}</span> portfolios
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