import Link from 'next/link'
import { GitBranch, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SubmitPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Submit Your Portfolio
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Share your portfolio with the community
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10">
            <GitBranch className="h-7 w-7 text-amber-400" />
          </div>

          <h2 className="text-xl font-semibold text-zinc-100">
            Submit via GitHub
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            We accept portfolio submissions through GitHub Issues.
            Open an issue with your portfolio URL and we&apos;ll review it.
            Automated analysis scores your portfolio across six dimensions.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="https://github.com/thesajidalam/developer-portfolio/issues/new?template=portfolio-submission.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-amber-500 px-6 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400">
                Open Submission Issue
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/explore/">
              <Button
                variant="outline"
                className="border-zinc-700 px-6 text-sm font-semibold text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
              >
                Browse Portfolios
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="text-sm font-semibold text-zinc-200">What happens after submission?</h3>
          <ol className="mt-3 space-y-2 text-sm text-zinc-400">
            <li className="flex gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">1</span>
              <span>Your portfolio URL is validated for HTTPS, availability, and safety.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">2</span>
              <span>Automated analysis measures performance, accessibility, SEO, and best practices.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">3</span>
              <span>A maintainer reviews and approves your submission.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">4</span>
              <span>Your portfolio appears on the platform with scores and badges.</span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
