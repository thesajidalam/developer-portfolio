import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { PortfolioCard } from '@/components/portfolio/portfolio-card'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await db.category.findUnique({ where: { slug } })
  return {
    title: category ? `${category.name} — DevBeacon` : 'Category — DevBeacon',
  }
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      portfolios: {
        include: {
          portfolio: {
            include: {
              technologies: { include: { technology: true } },
              score: true,
            },
          },
        },
        orderBy: { portfolio: { submittedAt: 'desc' } },
      },
    },
  })

  if (!category) {
    notFound()
  }

  const portfolios = category.portfolios.map(pc => ({
    ...pc.portfolio,
    technologies: pc.portfolio.technologies.map(pt => pt.technology),
    score: pc.portfolio.score || null,
  }))

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <a href="/categories" className="hover:text-zinc-300 transition-colors">Categories</a>
            <span>/</span>
            <span className="text-zinc-300">{category.name}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
              {category.description}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-600">
            {portfolios.length} {portfolios.length === 1 ? 'portfolio' : 'portfolios'}
          </p>
        </div>

        {portfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
            <p className="text-sm font-medium text-zinc-400">No portfolios in this category yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map(p => (
              <PortfolioCard key={p.id} portfolio={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
