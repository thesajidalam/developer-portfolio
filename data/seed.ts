import portfoliosRaw from "./portfolios.json"

const now = new Date().toISOString()

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const roles = [
  "Full Stack Developer", "Frontend Engineer", "Backend Engineer", "Software Engineer",
  "DevOps Engineer", "Mobile Developer", "AI/ML Engineer", "Cloud Architect",
  "UI/UX Designer", "Site Reliability Engineer", "Data Engineer", "Security Engineer",
  "Creative Developer", "Indie Hacker", "System Architect", "Platform Engineer",
  "React Developer", "Vue Developer", "Svelte Developer", "Python Developer",
  "Go Developer", "Rust Developer", "iOS Developer", "Android Developer",
  "Full Stack Developer", "Full Stack Developer", "Software Engineer", "Full Stack Developer",
]

const frameworks = ["Next.js", "React", "Vue", "SvelteKit", "Astro", "Nuxt", "Angular", "Hugo", "Gatsby", "Remix"]
const languages = ["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C#", "Ruby", "Swift", "Kotlin"]
const hostingProviders = ["Vercel", "Netlify", "Cloudflare Pages", "GitHub Pages", "AWS", "Railway", "Render"]
const experienceLevels = ["junior", "mid", "senior", "principal"]
const statuses = ["approved", "approved", "approved", "approved", "approved"]
const healthStates = ["healthy", "healthy", "healthy", "healthy", "needs_attention"]
const locations = [
  "San Francisco, CA", "New York, NY", "London, UK", "Berlin, Germany", "Tokyo, Japan",
  "Bangalore, India", "Toronto, Canada", "Paris, France", "Austin, TX", "Singapore",
  "Melbourne, Australia", "Stockholm, Sweden", "Seoul, South Korea", "Amsterdam, Netherlands",
  "Remote", "Remote", "Remote", "Remote",
]

const raw = portfoliosRaw as Array<{ name: string; url: string; role: string }>

const portfolios = raw.map((p, i) => {
  const rand = seededRandom(i + 1)
  const slug = slugify(p.name)
  const role = p.role || roles[Math.floor(rand() * roles.length)]
  const level = experienceLevels[Math.floor(rand() * experienceLevels.length)]
  const fw = frameworks[Math.floor(rand() * frameworks.length)]
  const lang = languages[Math.floor(rand() * languages.length)]
  const host = hostingProviders[Math.floor(rand() * hostingProviders.length)]
  const loc = locations[Math.floor(rand() * locations.length)]
  const status = statuses[Math.floor(rand() * statuses.length)]
  const health = healthStates[Math.floor(rand() * healthStates.length)]
  const featured = i < 50
  const verified = i < 200 || rand() > 0.7

  return {
    id: `port-${String(i + 1).padStart(4, '0')}`,
    name: p.name,
    slug: slug + (i > 0 && raw.slice(0, i).some(x => slugify(x.name) === slug) ? `-${i}` : ''),
    username: slugify(p.name).replace(/-/g, ''),
    title: role,
    portfolioUrl: p.url,
    githubUrl: null as string | null,
    socialLinks: null as string | null,
    description: null as string | null,
    location: loc,
    experienceLevel: level,
    status,
    health,
    framework: fw,
    language: lang,
    hostingProvider: host,
    screenshotUrl: null as string | null,
    featured,
    verified,
    submittedAt: now,
    updatedAt: now,
  }
})

const technologies = [
  { id: "tech-001", name: "TypeScript", slug: "typescript" },
  { id: "tech-002", name: "JavaScript", slug: "javascript" },
  { id: "tech-003", name: "Python", slug: "python" },
  { id: "tech-004", name: "Go", slug: "go" },
  { id: "tech-005", name: "Rust", slug: "rust" },
  { id: "tech-006", name: "React", slug: "react" },
  { id: "tech-007", name: "Next.js", slug: "nextjs" },
  { id: "tech-008", name: "Vue", slug: "vue" },
  { id: "tech-009", name: "SvelteKit", slug: "sveltekit" },
  { id: "tech-010", name: "Astro", slug: "astro" },
  { id: "tech-011", name: "Docker", slug: "docker" },
  { id: "tech-012", name: "Kubernetes", slug: "kubernetes" },
]

const categories = [
  { id: "cat-001", name: "Best Overall", slug: "best-overall", description: "Exceptional portfolios that excel across all dimensions.", icon: "trophy", sortOrder: 1 },
  { id: "cat-002", name: "Best Visual Design", slug: "best-visual-design", description: "Stunning visual presentation and typography.", icon: "palette", sortOrder: 2 },
  { id: "cat-003", name: "Best Performance", slug: "best-performance", description: "Lightning-fast load times and optimization.", icon: "gauge", sortOrder: 3 },
  { id: "cat-004", name: "Best Accessibility", slug: "best-accessibility", description: "Inclusive design that works for everyone.", icon: "accessibility", sortOrder: 4 },
  { id: "cat-005", name: "Best Student Portfolio", slug: "best-student", description: "Impressive work from early-career developers.", icon: "graduation-cap", sortOrder: 5 },
  { id: "cat-006", name: "Best Frontend", slug: "best-frontend", description: "Outstanding frontend engineering and interaction design.", icon: "code-2", sortOrder: 6 },
  { id: "cat-007", name: "Best Full Stack", slug: "best-full-stack", description: "Comprehensive portfolios showcasing end-to-end skills.", icon: "layers", sortOrder: 7 },
  { id: "cat-008", name: "Best Creative Developer", slug: "best-creative", description: "Pushing the boundaries of web creativity.", icon: "sparkles", sortOrder: 8 },
  { id: "cat-009", name: "Best Minimal Portfolio", slug: "best-minimal", description: "Less is more — elegant simplicity.", icon: "minus", sortOrder: 9 },
  { id: "cat-010", name: "Best Technical Portfolio", slug: "best-technical", description: "Deep technical content and architecture documentation.", icon: "terminal", sortOrder: 10 },
]

const tags = [
  { id: "tag-001", name: "Open Source", slug: "open-source" },
  { id: "tag-002", name: "Minimal", slug: "minimal" },
  { id: "tag-003", name: "Animation", slug: "animation" },
  { id: "tag-004", name: "3D", slug: "3d" },
  { id: "tag-005", name: "WebGL", slug: "webgl" },
  { id: "tag-006", name: "Creative", slug: "creative" },
  { id: "tag-007", name: "Technical", slug: "technical" },
  { id: "tag-008", name: "Responsive", slug: "responsive" },
  { id: "tag-009", name: "Dark Mode", slug: "dark-mode" },
  { id: "tag-010", name: "Blog", slug: "blog" },
]

const scores = portfolios.map((p, i) => {
  const rand = seededRandom(i + 1000)
  const base = 55 + Math.floor(rand() * 40)
  return {
    id: `score-${String(i + 1).padStart(4, '0')}`,
    portfolioId: p.id,
    version: "1.0",
    performanceScore: Math.min(100, base + Math.floor(rand() * 20)),
    accessibilityScore: Math.min(100, base + Math.floor(rand() * 20)),
    seoScore: Math.min(100, base + Math.floor(rand() * 20)),
    bestPracticesScore: Math.min(100, base + Math.floor(rand() * 20)),
    designScore: Math.min(100, base + Math.floor(rand() * 20)),
    contentScore: Math.min(100, base + Math.floor(rand() * 20)),
    overallScore: base,
    calculatedAt: now,
  }
})

const healthChecks = portfolios.map((p, i) => {
  const rand = seededRandom(i + 2000)
  const healthy = rand() > 0.1
  return {
    id: `hc-${String(i + 1).padStart(4, '0')}`,
    portfolioId: p.id,
    checkedAt: now,
    statusCode: healthy ? 200 : (rand() > 0.5 ? 301 : 503),
    responseTime: Math.floor(150 + rand() * 800),
    sslValid: rand() > 0.05,
    accessible: healthy,
  }
})

const tagIds = tags.map(t => t.id)
const catIds = categories.map(c => c.id)

const portfolioTags = portfolios.flatMap((p, i) => {
  const rand = seededRandom(i + 3000)
  const count = Math.floor(rand() * 3) + 1
  const picked = new Set<string>()
  while (picked.size < count && picked.size < tagIds.length) {
    picked.add(tagIds[Math.floor(rand() * tagIds.length)])
  }
  return Array.from(picked).map(tagId => ({ portfolioId: p.id, tagId }))
})

const portfolioCategories = portfolios.flatMap((p, i) => {
  const rand = seededRandom(i + 4000)
  const count = Math.floor(rand() * 2) + 1
  const picked = new Set<string>()
  while (picked.size < count && picked.size < catIds.length) {
    picked.add(catIds[Math.floor(rand() * catIds.length)])
  }
  return Array.from(picked).map(categoryId => ({ portfolioId: p.id, categoryId }))
})

const techIds = technologies.map(t => t.id)

const portfolioTechnologies = portfolios.map((p) => {
  const techMap: Record<string, string[]> = {
    "Next.js": ["tech-001", "tech-007", "tech-006"],
    "React": ["tech-001", "tech-006"],
    "Vue": ["tech-002", "tech-008"],
    "SvelteKit": ["tech-001", "tech-009"],
    "Astro": ["tech-001", "tech-010"],
    "Nuxt": ["tech-002", "tech-008"],
    "Angular": ["tech-002"],
    "Hugo": ["tech-004"],
    "Gatsby": ["tech-002", "tech-006"],
    "Remix": ["tech-001", "tech-006"],
  }
  return (techMap[p.framework || "React"] || ["tech-001", "tech-006"]).map(technologyId => ({
    portfolioId: p.id,
    technologyId,
  }))
}).flat()

export const seedData = {
  portfolios,
  technologies,
  categories,
  tags,
  scores,
  healthChecks,
  portfolioTechnologies,
  portfolioCategories,
  portfolioTags,
}
