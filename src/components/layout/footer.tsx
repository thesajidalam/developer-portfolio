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
                <rect x="13" y="6" width="6" height="20" rx="1.5" fill="currentColor" opacity="0.9" />
                <circle cx="16" cy="9" r="3.5" fill="currentColor" />
                <path d="M8 4C8 4 10 9 16 9C22 9 24 4 24 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                <rect x="11" y="26" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
              </svg>
              <span className="text-base font-semibold text-zinc-50">DevBeacon</span>
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
            &copy; {new Date().getFullYear()} DevBeacon. Built with care for the developer community.
          </p>
          <p className="text-xs text-zinc-600">
            Crafted for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  )
}
