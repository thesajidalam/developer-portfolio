import { SubmitForm } from '@/components/submission/submit-form'

export default function SubmitPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Submit Your Portfolio
        </h1>
        <p className="mt-3 text-lg text-zinc-400">
          Join hundreds of developers showcasing their work
        </p>
      </div>

      <SubmitForm />
    </section>
  )
}
