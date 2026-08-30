import Link from 'next/link'
import { Logo } from '@/components/Logo'

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { href: '/', label: 'Gallery' },
      { href: '/rankings', label: 'Rankings' },
    ],
  },
  {
    title: 'Service',
    links: [
      { href: '/compare', label: 'Compare portfolios' },
      { href: '/submit', label: 'List your portfolio' },
      { href: '/privacy', label: 'Privacy policy' },
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
    <footer className="relative overflow-hidden border-t border-white/5 bg-[#04050d]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-96 rounded-full bg-sky-500/8 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              A curated directory of developer portfolios — transparently rated so the best work is never hard to find.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {l.label}
                      <span className="inline-block -translate-x-1 text-indigo-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-slate-500 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p>© {new Date().getFullYear()} DevFolio. Built with care, rated with transparency.</p>
            <p className="text-xs text-slate-600">
              Your data stays private and is never shared. Ratings are open and visible to everyone.
            </p>
          </div>
          <a
            href="https://github.com/thesajidalam"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-500/50 hover:text-white hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 transition-transform group-hover:scale-125" />
            <span className="text-slate-400">Made by</span>
            <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text font-semibold text-transparent">
              @thesajidalam
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
