import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, Eye, SearchCode, CheckCircle, Activity, Heart, Shield, Code2, ArrowRight, ExternalLink, GitBranch } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — Developer Portfolio',
}

const scoringDimensions = [
  {
    icon: <Zap className="h-5 w-5" />,
    name: 'Performance',
    description: 'Core Web Vitals, page load speed, time to interactive, and bundle efficiency.',
  },
  {
    icon: <Eye className="h-5 w-5" />,
    name: 'Accessibility',
    description: 'WCAG compliance, semantic HTML, keyboard navigation, and screen reader support.',
  },
  {
    icon: <SearchCode className="h-5 w-5" />,
    name: 'SEO',
    description: 'Meta tags, structured data, crawlability, mobile-friendliness, and content quality.',
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    name: 'Best Practices',
    description: 'Security headers, HTTPS, modern APIs, error handling, and code quality.',
  },
]

const healthChecks = [
  {
    icon: <Activity className="h-5 w-5" />,
    name: 'Uptime Monitoring',
    description: 'Regular checks ensure portfolios are accessible and serving content correctly.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    name: 'SSL Verification',
    description: 'Certificate validity, expiry tracking, and HTTPS enforcement.',
  },
  {
    icon: <Heart className="h-5 w-5" />,
    name: 'Response Health',
    description: 'Status codes, response times, and content integrity validation.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-xs font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Open Source
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
            About Developer Portfolio
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            The open-source platform for discovering, evaluating, and learning from developer portfolios.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">Our Mission</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Developer Portfolio exists to help developers build better portfolios by providing transparent,
              data-driven evaluations. We believe every developer deserves to showcase their work
              effectively, and every visitor deserves to find inspiration easily. By open-sourcing
              our scoring methodology and health monitoring, we empower the community to learn,
              contribute, and improve together.
            </p>
          </div>
        </section>

        {/* Scoring */}
        <section className="mb-16">
          <h2 className="mb-2 text-2xl font-bold text-zinc-50">How Scoring Works</h2>
          <p className="mb-8 text-sm text-zinc-400">
            Our scoring methodology is transparent and reproducible. Each portfolio is evaluated
            across six key dimensions, producing an overall score from 0–100.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {scoringDimensions.map(dim => (
              <div
                key={dim.name}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  {dim.icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">{dim.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                  {dim.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h3 className="mb-2 text-sm font-semibold text-zinc-200">Score Formula</h3>
            <p className="text-xs leading-relaxed text-zinc-500">
              The overall score is a weighted average of the six dimensions. Performance and
              accessibility carry higher weights as they directly impact user experience. Design
              and content scores are evaluated using a combination of automated analysis and
              heuristic review. All scores are versioned and reproducible.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Performance 25%', 'Accessibility 20%', 'SEO 15%', 'Best Practices 15%', 'Design 15%', 'Content 10%'].map(label => (
                <span
                  key={label}
                  className="rounded-md bg-zinc-800/80 px-2.5 py-1 text-[10px] font-medium text-zinc-400 border border-zinc-700/50"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Health Monitoring */}
        <section className="mb-16">
          <h2 className="mb-2 text-2xl font-bold text-zinc-50">Health Monitoring</h2>
          <p className="mb-8 text-sm text-zinc-400">
            We continuously monitor portfolio health to ensure the data stays current and reliable.
          </p>

          <div className="space-y-3">
            {healthChecks.map(check => (
              <div
                key={check.name}
                className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  {check.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{check.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    {check.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h3 className="mb-2 text-sm font-semibold text-zinc-200">Health Statuses</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-400">Healthy — Portfolio is accessible and responding normally</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="text-xs text-zinc-400">Needs Attention — Issues detected (slow response, expired SSL, etc.)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-zinc-400">Offline — Portfolio is unreachable</span>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="mb-16">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Code2 className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="mb-3 text-xl font-semibold text-zinc-100">Open Source Commitment</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Developer Portfolio is built in the open. Our scoring algorithms, health monitoring pipeline,
              and platform code are all publicly available. We believe transparency builds trust,
              and trust builds community. Every evaluation can be reproduced, every algorithm can
              be audited, and every improvement can be contributed.
            </p>
          </div>
        </section>

        {/* Contributing CTA */}
        <section className="text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h2 className="mb-3 text-xl font-semibold text-zinc-100">Get Involved</h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-zinc-400">
              Have ideas for improving Developer Portfolio? Found a bug? Want to add a feature?
              We welcome contributions from the community.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
              >
                <GitBranch className="h-4 w-4" />
                View on GitHub
                <ExternalLink className="h-3 w-3 text-zinc-500" />
              </a>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
              >
                Submit a Portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
