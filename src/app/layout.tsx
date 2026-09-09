import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Inter, JetBrains_Mono, Sora } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { SearchShortcut } from '@/components/SearchShortcut'
import { SearchScrollRestore } from '@/components/SearchScrollRestore'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'DevFolio — Discover Developer Portfolios',
    template: '%s · DevFolio',
  },
  description:
    'DevFolio is a curated directory of 1,900+ developer portfolios, scored across performance, accessibility, SEO, design and content.',
  keywords: ['developer portfolio', 'directory', 'web development', 'frontend', 'portfolios', 'DevFolio'],
  openGraph: {
    type: 'website',
    siteName: 'DevFolio',
    title: 'DevFolio — Discover Developer Portfolios',
    description:
      'Explore and compare 1,900+ curated developer portfolios, ranked by a transparent six-dimension scoring model.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevFolio — Discover Developer Portfolios',
    description:
      'Explore and compare 1,900+ curated developer portfolios, ranked by a transparent six-dimension scoring model.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#09030f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, sora.variable, jetbrains.variable)}>
      <body className="min-h-screen bg-[#09030f] text-[#ede4f0] antialiased">
        <SearchShortcut />
        <Suspense fallback={null}>
          <SearchScrollRestore />
        </Suspense>
        <Navbar />
        <main className="flex min-h-[calc(100vh-10rem)] flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
