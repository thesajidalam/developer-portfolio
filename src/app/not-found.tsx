import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-8xl font-black text-[#7dd3fc]">404</p>
      <h1 className="mt-6 text-2xl font-bold text-[#f8fafc]">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-400">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="shine mt-8 inline-block rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-[#60a5fa]"
      >
        Back to gallery
      </Link>
    </div>
  )
}