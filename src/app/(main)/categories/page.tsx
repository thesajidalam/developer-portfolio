import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Grid3X3, Code, Smartphone, Globe, Database, Layers, Palette, BookOpen, Rocket, Shield, Users, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Categories — DevBeacon',
}

const iconMap: Record<string, React.ReactNode> = {
  'frontend': <Code className="h-6 w-6" />,
  'mobile': <Smartphone className="h-6 w-6" />,
  'fullstack': <Globe className="h-6 w-6" />,
  'backend': <Database className="h-6 w-6" />,
  'creative': <Palette className="h-6 w-6" />,
  'blog': <BookOpen className="h-6 w-6" />,
  'startup': <Rocket className="h-6 w-6" />,
  'enterprise': <Briefcase className="h-6 w-6" />,
  'open-source': <Shield className="h-6 w-6" />,
  'design': <Layers className="h-6 w-6" />,
  'agency': <Users className="h-6 w-6" />,
}

function getCategoryIcon(slug: string) {
  return iconMap[slug] || <Grid3X3 className="h-6 w-6" />
}

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { portfolios: true } },
    },
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            Categories
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Browse portfolios by category
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
            <Grid3X3 className="mb-4 h-10 w-10 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">No categories found</p>
            <p className="mt-1 text-xs text-zinc-600">Categories will appear as portfolios are submitted</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:border-amber-500/30 hover:-translate-y-0.5 hover:bg-zinc-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 transition-colors group-hover:bg-amber-500/10 group-hover:text-amber-400">
                  {getCategoryIcon(cat.slug)}
                </div>
                <h3 className="text-base font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-500 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-300">{cat._count.portfolios}</span>
                  <span className="text-xs text-zinc-600">
                    {cat._count.portfolios === 1 ? 'portfolio' : 'portfolios'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
