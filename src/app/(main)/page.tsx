import Link from 'next/link'
import {
  ArrowRight,
  Upload,
  Search,
  BarChart3,
  Trophy,
  Palette,
  Gauge,
  Accessibility,
  Code2,
  Layers,
  Sparkles,
} from 'lucide-react'
import { db } from '@/lib/db'
import { PortfolioCard } from '@/components/portfolio/portfolio-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'DevBeacon — Discover what great developers build',
  description:
    'The open-source platform for exploring, evaluating, and learning from developer portfolios. Not another list — an intelligence layer.',
}

const stats = [
  { value: '500+', label: 'Portfolios' },
  { value: '50+', label: 'Technologies' },
  { value: '10+', label: 'Categories' },
  { value: '100%', label: 'Open Source' },
]

const steps = [
  {
    icon: Upload,
    title: 'Submit',
    description:
      'Submit your portfolio URL. Automated analysis validates, scores, and profiles it.',
  },
  {
    icon: Search,
    title: 'Discover',
    description:
      'Search by technology, role, performance, or style. Find portfolios that match what you\'re looking for.',
  },
  {
    icon: BarChart3,
    title: 'Learn',
    description:
      'Understand what makes great portfolios stand out. Transparent scoring, real metrics.',
  },
]

const categories = [
  { name: 'Best Overall', icon: Trophy, slug: 'best-overall' },
  { name: 'Best Visual Design', icon: Palette, slug: 'best-visual-design' },
  { name: 'Best Performance', icon: Gauge, slug: 'best-performance' },
  { name: 'Best Accessibility', icon: Accessibility, slug: 'best-accessibility' },
  { name: 'Best Frontend', icon: Code2, slug: 'best-frontend' },
  { name: 'Best Full Stack', icon: Layers, slug: 'best-full-stack' },
  { name: 'Most Creative', icon: Sparkles, slug: 'most-creative' },
]

export default async function HomePage() {
  let rawPortfolios: Awaited<ReturnType<typeof getFeaturedPortfolios>> = []

  try {
    rawPortfolios = await getFeaturedPortfolios()
  } catch {
    rawPortfolios = []
  }

  const featuredPortfolios = rawPortfolios.map(p => ({
    ...p,
    technologies: p.technologies.map(pt => pt.technology),
    score: p.score ?? undefined,
  }))

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.08),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              Open source &amp; community driven
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
              Discover what great developers{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                build
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              The open-source platform for exploring, evaluating, and learning
              from developer portfolios. Not another list — an intelligence
              layer.
            </p>

            <div className="mt-10 flex items-center justify-center gap-3">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="bg-amber-500 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
                >
                  Explore Portfolios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/submit">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 px-6 text-sm font-semibold text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
                >
                  Submit Yours
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-px rounded-xl border border-zinc-800 bg-zinc-800/50 sm:grid-cols-4">
            {stats.map(stat => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 bg-zinc-900/80 px-4 py-5"
              >
                <span className="text-2xl font-bold tabular-nums text-zinc-50">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Portfolios */}
      <section className="relative border-t border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
                Featured Portfolios
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Hand-picked portfolios that stand out in craft, performance,
                and design.
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden text-sm font-medium text-amber-400 transition-colors hover:text-amber-300 sm:inline-flex sm:items-center sm:gap-1"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {featuredPortfolios.length > 0 ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredPortfolios.map(portfolio => (
                <PortfolioCard key={portfolio.id} portfolio={portfolio} />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30"
                >
                  <p className="text-xs text-zinc-600">
                    Featured portfolios will appear here
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/explore"
              className="text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              View all portfolios →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative border-t border-zinc-800/60 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              How DevBeacon works
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Three steps from submission to discovery.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden rounded-xl border border-zinc-800 sm:grid-cols-3">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="relative flex flex-col bg-zinc-900 p-8"
              >
                <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-amber-400 ring-1 ring-zinc-700/50">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  {idx + 1}
                </span>
                <h3 className="text-base font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative border-t border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
                Browse by category
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Curated categories highlighting different aspects of developer
                craft.
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden text-sm font-medium text-amber-400 transition-colors hover:text-amber-300 sm:inline-flex sm:items-center sm:gap-1"
            >
              All categories
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 flex gap-3 overflow-x-auto pb-4 scrollbar-none sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:overflow-visible sm:pb-0">
            {categories.map(category => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group flex min-w-[140px] flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center transition-all hover:border-zinc-700 hover:bg-zinc-900 sm:min-w-0"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/50 transition-colors group-hover:text-amber-400 group-hover:ring-amber-500/30">
                  <category.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/categories"
              className="text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              View all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-zinc-800/60">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(245,158,11,0.06),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              Ready to showcase your work?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-zinc-400">
              Submit your portfolio for free. Get scored, ranked, and discovered.
            </p>
            <div className="mt-8">
              <Link href="/submit">
                <Button
                  size="lg"
                  className="bg-amber-500 px-8 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
                >
                  Submit Portfolio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-zinc-600">
              Free forever. No account required to browse.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

async function getFeaturedPortfolios() {
  return db.portfolio.findMany({
    where: { featured: true, status: 'approved' },
    include: {
      technologies: { include: { technology: true } },
      score: true,
    },
    take: 4,
    orderBy: { updatedAt: 'desc' },
  })
}
