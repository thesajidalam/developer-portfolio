import type { Metadata } from 'next'
import { SubmitForm } from '@/components/submission/submit-form'

export const metadata: Metadata = {
  title: 'Submit Portfolio — Developer Portfolio',
}

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

      <SubmitForm />
    </section>
  )
}
