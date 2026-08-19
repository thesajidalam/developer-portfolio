import { PortfolioCard } from '@/components/portfolio/portfolio-card'

interface SimilarPortfoliosProps {
  portfolioId: string
  technologies: string[]
  categories: string[]
}

// Placeholder data — in production, fetch from API based on portfolioId/technologies/categories
const placeholderPortfolios = [
  {
    id: '1',
    name: 'Sarah Chen',
    slug: 'sarah-chen',
    title: 'Frontend Engineer',
    avatarUrl: undefined,
    portfolioUrl: 'https://example.com',
    description: 'Building elegant web experiences with a focus on performance and accessibility.',
    location: 'San Francisco, CA',
    experienceLevel: 'Senior',
    health: 'healthy' as const,
    framework: 'Next.js',
    language: 'TypeScript',
    featured: true,
    verified: true,
    technologies: [
      { id: '1', name: 'React', slug: 'react' },
      { id: '2', name: 'Next.js', slug: 'nextjs' },
      { id: '3', name: 'TypeScript', slug: 'typescript' },
      { id: '4', name: 'Tailwind', slug: 'tailwindcss' },
    ],
    score: { overallScore: 94, performanceScore: 92, accessibilityScore: 96, seoScore: 91 },
  },
  {
    id: '2',
    name: 'Alex Rivera',
    slug: 'alex-rivera',
    title: 'Full Stack Developer',
    avatarUrl: undefined,
    portfolioUrl: 'https://example.com',
    description: 'Passionate about creating end-to-end solutions with modern web technologies.',
    location: 'Austin, TX',
    experienceLevel: 'Mid-level',
    health: 'healthy' as const,
    framework: 'Remix',
    language: 'TypeScript',
    featured: false,
    verified: false,
    technologies: [
      { id: '5', name: 'Remix', slug: 'remix' },
      { id: '6', name: 'TypeScript', slug: 'typescript' },
      { id: '7', name: 'PostgreSQL', slug: 'postgresql' },
    ],
    score: { overallScore: 87, performanceScore: 85, accessibilityScore: 88, seoScore: 89 },
  },
  {
    id: '3',
    name: 'Maya Patel',
    slug: 'maya-patel',
    title: 'UI/UX Engineer',
    avatarUrl: undefined,
    portfolioUrl: 'https://example.com',
    description: 'Designing and building beautiful, user-centered digital products.',
    location: 'New York, NY',
    experienceLevel: 'Senior',
    health: 'needs_attention' as const,
    framework: 'Gatsby',
    language: 'JavaScript',
    featured: false,
    verified: true,
    technologies: [
      { id: '8', name: 'Gatsby', slug: 'gatsby' },
      { id: '9', name: 'Figma', slug: 'figma' },
      { id: '10', name: 'React', slug: 'react' },
      { id: '11', name: 'CSS', slug: 'css' },
    ],
    score: { overallScore: 82, performanceScore: 78, accessibilityScore: 85, seoScore: 84 },
  },
  {
    id: '4',
    name: 'Jordan Lee',
    slug: 'jordan-lee',
    title: 'Creative Developer',
    avatarUrl: undefined,
    portfolioUrl: 'https://example.com',
    description: 'Blending code and creativity to craft interactive web experiences.',
    location: 'Portland, OR',
    experienceLevel: 'Mid-level',
    health: 'healthy' as const,
    framework: 'Astro',
    language: 'TypeScript',
    featured: false,
    verified: false,
    technologies: [
      { id: '12', name: 'Astro', slug: 'astro' },
      { id: '13', name: 'Three.js', slug: 'threejs' },
      { id: '14', name: 'GSAP', slug: 'gsap' },
    ],
    score: { overallScore: 91, performanceScore: 93, accessibilityScore: 89, seoScore: 90 },
  },
]

export function SimilarPortfolios({
  portfolioId,
  technologies,
}: SimilarPortfoliosProps) {
  const portfolios = placeholderPortfolios.filter(p => p.id !== portfolioId)

  if (portfolios.length === 0) return null

  return (
    <section className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Similar Portfolios</h2>
        <p className="text-xs text-zinc-500">
          Based on {technologies.length > 0 ? technologies.slice(0, 3).join(', ') : 'shared interests'}
        </p>
      </div>

      <div className="scrollbar-thin -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {portfolios.map(portfolio => (
          <div
            key={portfolio.id}
            className="w-[320px] min-w-[320px] snap-start flex-shrink-0 sm:w-[340px] sm:min-w-[340px]"
          >
            <PortfolioCard portfolio={portfolio} />
          </div>
        ))}
      </div>
    </section>
  )
}
