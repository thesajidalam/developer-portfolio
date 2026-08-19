export interface Portfolio {
  id: string
  name: string
  slug: string
  username?: string
  title?: string
  avatarUrl?: string
  portfolioUrl: string
  githubUrl?: string
  socialLinks?: Record<string, string>
  description?: string
  location?: string
  experienceLevel: ExperienceLevel
  status: PortfolioStatus
  health: HealthStatus
  framework?: string
  language?: string
  hostingProvider?: string
  screenshotUrl?: string
  featured: boolean
  verified: boolean
  submittedAt: string
  updatedAt: string
  lastChecked?: string
  technologies?: Technology[]
  categories?: Category[]
  tags?: Tag[]
  score?: Score
  latestHealthCheck?: HealthCheck
}

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal'
export type PortfolioStatus = 'pending' | 'approved' | 'rejected' | 'offline'
export type HealthStatus = 'healthy' | 'needs_attention' | 'offline' | 'unknown'

export interface Technology {
  id: string
  name: string
  slug: string
  category: TechCategory
}

export type TechCategory = 'language' | 'framework' | 'tool' | 'database' | 'platform'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  sortOrder: number
  _count?: { portfolios: number }
}

export interface Tag {
  id: string
  name: string
  slug: string
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

export interface HealthCheck {
  id: string
  portfolioId: string
  checkedAt: string
  statusCode: number
  responseTime: number
  sslValid: boolean
  sslExpiry?: string
  accessible: boolean
  details?: string
}

export interface Submission {
  id: string
  portfolioUrl: string
  submitterName?: string
  submitterEmail?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: string
  createdAt: string
  processedAt?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface PortfolioFilters {
  search?: string
  technologies?: string[]
  categories?: string[]
  experienceLevel?: ExperienceLevel[]
  health?: HealthStatus[]
  featured?: boolean
  verified?: boolean
  sort?: 'newest' | 'oldest' | 'score' | 'name' | 'trending'
  page?: number
  pageSize?: number
}

export interface ComparisonData {
  portfolios: Portfolio[]
  score?: Score
}

export interface SearchResult {
  portfolios: Portfolio[]
  total: number
  query: string
}

export interface CommandAction {
  id: string
  label: string
  description?: string
  shortcut?: string[]
  action: () => void
  category: string
}
