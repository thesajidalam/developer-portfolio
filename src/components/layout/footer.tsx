import Link from 'next/link'
import { cn } from '@/lib/utils'

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Explore', href: '/explore' },
      { label: 'Submit', href: '/submit' },
      { label: 'Compare', href: '/compare' },
      { label: 'API', href: '/api' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: 'https://github.com', external: true },
      { label: 'Contributing', href: '/contributing' },
      { label: 'Code of Conduct', href: '/conduct' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="h-7 w-7 text-amber-500"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
                <polygon points="16,4 17.5,14.5 16,12 14.5,14.5" fill="currentColor" opacity="0.9" />
                <polygon points="16,28 14.5,17.5 16,20 17.5,17.5" fill="currentColor" opacity="0.4" />
                <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.9" />
              </svg>
              <span className="text-base font-semibold text-zinc-50">Developer Portfolio</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Where developer craft meets discovery. Find, evaluate, and learn from the best developer portfolios.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...(('external' in link && link.external) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={cn(
                        'text-sm text-zinc-400 transition-colors hover:text-zinc-100'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800/60 py-6 sm:flex-row">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Developer Portfolio. Built with care for the developer community.
          </p>
          <p className="text-xs text-zinc-600">
            Crafted for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  )
}
