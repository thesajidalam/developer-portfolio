export type ExperienceLevel = 'beginner' | 'mid' | 'senior'
export type PortfolioStatus = 'pending' | 'approved' | 'rejected'
export type HealthStatus = 'healthy' | 'needs_attention' | 'down' | 'unknown'
export type SubmissionStatus = 'pending' | 'completed' | 'rejected'

export interface Portfolio {
  id: string
  slug: string
  name: string
  title: string | null
  username: string | null
  avatarUrl: string | null
  portfolioUrl: string
  githubUrl: string | null
  description: string | null
  location: string | null
  experienceLevel: ExperienceLevel
  status: PortfolioStatus
  health: HealthStatus
  framework: string | null
  language: string | null
  hostingProvider: string | null
  screenshotUrl: string | null
  technologies: string[]
  categories: string[]
  tags: string[]
  featured: boolean
  verified: boolean
  submittedAt: string
  updatedAt: string
}

export interface Score {
  id: string
  portfolioId: string
  version: string
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
  designScore: number
  contentScore: number
  overallScore: number
  calculatedAt: string
}

export interface PortfolioWithScore extends Portfolio {
  score: Score | null
}

export interface PortfolioWithScoreAndVotes extends PortfolioWithScore {
  likeCount: number
}

export interface Submission {
  id: string
  portfolioUrl: string
  submitterName: string | null
  submitterEmail: string | null
  status: SubmissionStatus
  result: unknown
  createdAt: string
  processedAt: string | null
}

export interface HealthCheck {
  id: string
  portfolioId: string
  checkedAt: string
  statusCode: number | null
  responseTime: number | null
  sslValid: boolean
  accessible: boolean
  details: string | null
}

export interface LinkReport {
  id: string
  portfolioUrl: string
  portfolioName: string | null
  reporterName: string | null
  reporterEmail: string | null
  reason: string | null
  status: string
  createdAt: string
}

export interface SiteAnalytics {
  totalPortfolios: number
  totalApproved: number
  totalPending: number
  totalRejected: number
  totalSubmissions: number
  totalVotes: number
  totalReports: number
  totalEmails: number
  avgScore: number
  techDistribution: { tech: string; count: number }[]
  categoryDistribution: { category: string; count: number }[]
  healthDistribution: { health: string; count: number }[]
  recentPortfolios: { date: string; count: number }[]
}

export interface Paginated<T> {
  data: T[]
  meta: { total: number; page: number; pageSize: number; totalPages: number }
}

export interface PortfolioFilters {
  search?: string
  tech?: string
  category?: string
  experience?: string
  sort?: 'newest' | 'oldest' | 'score' | 'name' | 'trending' | 'likes'
  page?: number
  pageSize?: number
}
