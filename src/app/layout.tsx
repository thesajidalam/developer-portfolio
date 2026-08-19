import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DevBeacon — Discover. Evaluate. Learn.',
  description:
    'DevBeacon is a curated platform for discovering, evaluating, and learning from the best developer portfolios. Find inspiration, compare skills, and showcase your craft.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 font-sans text-zinc-50 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded-md focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-950 focus:outline-none"
        >
          Skip to content
        </a>
        <TooltipProvider delayDuration={200}>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  )
}
