import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How DevFolio handles your data — private by default, transparent by design.',
}

const sections = [
  {
    title: 'What we store',
    body: 'When you submit a portfolio, we store the details you provide — your name, the URL of your portfolio, and any optional contact details — so that your listing can be created and kept up to date. We store the minimum needed to run the directory, and nothing more.',
  },
  {
    title: 'Ratings are public — your details are not',
    body: 'Scores, ranks and computed metrics are shown openly on DevFolio because transparency is the heart of the service — anyone can see how a rating was reached. Your private details, however, are never published and are only ever used to manage your listing.',
  },
  {
    title: 'Your data is never sold',
    body: 'We do not sell, rent, or trade your personal information with anyone. Full stop. DevFolio has no advertising platform and no data brokers, and we keep it that way by design.',
  },
  {
    title: 'Security & storage',
    body: 'Your information is stored securely with industry-standard access controls and encrypted in transit. Access is limited to the minimum required to operate the service.',
  },
  {
    title: 'Your control',
    body: 'You can update a submitted listing at any time, and you may request that your portfolio and its associated data be removed from the directory whenever you wish.',
  },
  {
    title: 'Contact',
    body: 'If you have any questions about how DevFolio protects your data, reach out through the GitHub profile linked in the footer — we respond promptly.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <section className="relative overflow-hidden bg-aurora">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="animate-hero mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
          Privacy policy
        </p>
        <h1 className="animate-hero delay-1 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Private by default.
          <br />
          <span className="text-gradient">Transparent by design.</span>
        </h1>
        <p className="animate-hero delay-2 mt-5 max-w-xl text-base leading-relaxed text-slate-400">
          DevFolio is built on a simple promise: your information stays safe and
          never leaves the service. Our ratings are open to everyone, but your
          personal details are always yours.
        </p>

        <div className="animate-hero delay-3 mt-12 space-y-5">
          {sections.map((s, i) => (
            <div
              key={s.title}
              className="glass rounded-2xl p-6 transition-colors hover:border-indigo-500/30 sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">{s.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-hero delay-4 mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/submit"
            className="shine rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:shadow-xl active:scale-95"
          >
            Add your portfolio
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
          >
            ← Back to gallery
          </Link>
        </div>
      </div>
    </section>
  )
}
