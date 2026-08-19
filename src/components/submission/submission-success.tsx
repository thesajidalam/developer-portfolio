'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SubmissionSuccess() {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="relative">
        <CheckCircle className="h-16 w-16 text-emerald-500 animate-in zoom-in duration-300" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-50">
          Portfolio submitted successfully!
        </h2>
        <p className="max-w-md text-zinc-400">
          We&apos;ll review and analyze your portfolio. This typically takes 24-48 hours.
          You&apos;ll be notified once it&apos;s been processed.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/explore">Browse Portfolios</Link>
      </Button>
    </div>
  )
}
