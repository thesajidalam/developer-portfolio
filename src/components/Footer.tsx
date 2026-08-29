import Link from 'next/link'
import { Logo } from '@/components/Logo'

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { href: '/', label: 'Gallery' },
      { href: '/rankings', label: 'Rankings' },
      { href: '/compare', label: 'Compare' },
      { href: '/submit', label: 'Submit a portfolio' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/api/v1/stats', label: 'Public API' },
      { href: '/api/v1/portfolios', label: 'Portfolios API' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-slate-400">
              A curated directory of developer portfolios, transparently scored across six dimensions.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-slate-200">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-800/60 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} DevFolio. Built with care, rated with transparency.</p>
          <p>Score source: emmabostian / developer-portfolios data, curated fresh.</p>
        </div>
      </div>
    </footer>
  )
}
