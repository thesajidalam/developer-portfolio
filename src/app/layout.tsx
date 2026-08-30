import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

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
  themeColor: '#06070f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#06070f] text-slate-100 antialiased">
        <Navbar />
        <main className="flex min-h-[calc(100vh-10rem)] flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
