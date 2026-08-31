import { getAdminClient } from '@/lib/supabase'
import { createHash } from 'node:crypto'
import type {
  HealthCheck,
  Paginated,
  Portfolio,
  PortfolioFilters,
  PortfolioWithScore,
  Score,
  Submission,
} from '@/lib/types'

type DBClient = ReturnType<typeof getAdminClient>
type Row = Record<string, unknown>

function mapPortfolio(r: Row): Portfolio {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    title: r.title ? String(r.title) : null,
    username: r.username ? String(r.username) : null,
    avatarUrl: r.avatar_url ? String(r.avatar_url) : null,
    portfolioUrl: String(r.portfolio_url),
    githubUrl: r.github_url ? String(r.github_url) : null,
    description: r.description ? String(r.description) : null,
    location: r.location ? String(r.location) : null,
    experienceLevel: (r.experience_level as Portfolio['experienceLevel']) || 'mid',
    status: (r.status as Portfolio['status']) || 'pending',
    health: (r.health as Portfolio['health']) || 'unknown',
    framework: r.framework ? String(r.framework) : null,
    language: r.language ? String(r.language) : null,
    hostingProvider: r.hosting_provider ? String(r.hosting_provider) : null,
    screenshotUrl: r.screenshot_url ? String(r.screenshot_url) : null,
    technologies: Array.isArray(r.technologies) ? (r.technologies as string[]) : [],
    categories: Array.isArray(r.categories) ? (r.categories as string[]) : [],
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    featured: Boolean(r.featured),
    verified: Boolean(r.verified),
    submittedAt: String(r.submitted_at),
    updatedAt: String(r.updated_at),
  }
}

function mapScore(r: Row | undefined | null): Score | null {
  if (!r) return null
  return {
    id: String(r.id),
    portfolioId: String(r.portfolio_id),
    version: String(r.version ?? '1.0'),
    performanceScore: Number(r.performance_score) || 0,
    accessibilityScore: Number(r.accessibility_score) || 0,
    seoScore: Number(r.seo_score) || 0,
    bestPracticesScore: Number(r.best_practices_score) || 0,
    designScore: Number(r.design_score) || 0,
    contentScore: Number(r.content_score) || 0,
    overallScore: Number(r.overall_score) || 0,
    calculatedAt: String(r.calculated_at),
  }
}

function withScore(p: Portfolio, scoreRow: Row | null): PortfolioWithScore {
  return { ...p, score: mapScore(scoreRow) }
}

const PORTFOLIO_SELECT = 'id,slug,name,title,username,avatar_url,portfolio_url,github_url,description,location,experience_level,status,health,framework,language,hosting_provider,screenshot_url,technologies,categories,tags,featured,verified,submitted_at,updated_at'

const SCORE_SELECT = 'id,portfolio_id,version,performance_score,accessibility_score,seo_score,best_practices_score,design_score,content_score,overall_score,calculated_at'

interface PagedResult {
  rows: Row[]
  total: number
}

async function pagedQuery(
  builder: (q: ReturnType<DBClient['from']>) => ReturnType<DBClient['from']>,
  page: number,
  pageSize: number,
): Promise<PagedResult> {
  const client = getAdminClient()
  const base = builder(client.from('portfolios'))
  const { count } = await base.select('id', { count: 'exact', head: true })
  const { data, error } = await base
    .select(PORTFOLIO_SELECT)
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order('submitted_at', { ascending: false })
  if (error) throw new Error(error.message)
  return { rows: (data as unknown as Row[]) ?? [], total: count ?? 0 }
}

function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (m) => `\\${m}`)
}

// Collapse scheme / www / trailing slash / case so 'https://X.com/' and
// 'x.com' are treated as the same site. Stored URLs and dedup keys both use
// this canonical form, which is what prevents duplicate listings.
export function normalizePortfolioUrl(raw: string): string {
  let u = (raw || '').trim()
  u = u.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
  u = u.replace(/^\/+/, '')
  u = u.replace(/^www\./i, '')
  const lowerHost = u.toLowerCase()
  return lowerHost.endsWith('/') ? lowerHost.slice(0, -1) : lowerHost
}

type PortfolioQuery = ReturnType<ReturnType<DBClient['from']>['select']>

function applyFilters(base: PortfolioQuery, f: PortfolioFilters): PortfolioQuery {
  let q = base.eq('status', 'approved') as PortfolioQuery
  if (f.tech) q = q.contains('technologies', [f.tech]) as PortfolioQuery
  if (f.category) q = q.contains('categories', [f.category]) as PortfolioQuery
  if (f.experience) q = q.eq('experience_level', f.experience) as PortfolioQuery
  if (f.search) {
    const term = escapeLike(f.search)
    q = q.or(`name.ilike.%${term}%,title.ilike.%${term}%,description.ilike.%${term}%`) as PortfolioQuery
  }
  return q
}

export async function listPortfolios(f: PortfolioFilters = {}): Promise<Paginated<PortfolioWithScore>> {
  const page = Math.max(1, f.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, f.pageSize ?? 12))
  const sort = f.sort ?? 'newest'
  const client = getAdminClient()

  const filtered = applyFilters(
    client.from('portfolios').select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')', { count: 'exact' }),
    f,
  )

  const scoreSort = sort === 'score' || sort === 'trending'
  const orderCol = scoreSort ? 'overall_score' : 'submitted_at'
  const orderOpts = scoreSort
    ? { referencedTable: 'scores', ascending: false }
    : { ascending: sort === 'oldest' }

  let query: PortfolioQuery
  try {
    query = filtered.order(orderCol, orderOpts) as PortfolioQuery
  } catch {
    query = filtered
  }

  const { data, count, error } = await query.range((page - 1) * pageSize, page * pageSize - 1)

  if (error) throw new Error(error.message)

  const rows = (data as unknown as Row[]) ?? []
  const ordered =
    scoreSort
      ? [...rows].sort((a, b) => scoreOf(b) - scoreOf(a))
      : rows

  const result: PortfolioWithScore[] = ordered.map((r) =>
    withScore(mapPortfolio(r), scoreRow(r)),
  )

  return { data: result, meta: { total: count ?? 0, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) } }
}

function scoreRow(r: Row): Row | null {
  const s = r.scores
  if (Array.isArray(s)) return (s[0] as unknown as Row) ?? null
  if (s && typeof s === 'object') return s as Row
  return null
}

function scoreOf(r: Row): number {
  const s = scoreRow(r)
  return s ? Number(s.overall_score) || 0 : 0
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioWithScore | null> {
  const client = getAdminClient()
  const { data, error } = await client
    .from('portfolios')
    .select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const r = data as unknown as Row
  return withScore(mapPortfolio(r), scoreRow(r))
}

export async function getPortfolioById(id: string): Promise<PortfolioWithScore | null> {
  const client = getAdminClient()
  const { data, error } = await client
    .from('portfolios')
    .select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const r = data as unknown as Row
  return withScore(mapPortfolio(r), scoreRow(r))
}

export async function countApproved(): Promise<number> {
  const client = getAdminClient()
  const { count, error } = await client
    .from('portfolios')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function fetchApprovedBatch(limit = 200): Promise<PortfolioWithScore[]> {
  const client = getAdminClient()
  const { data, error } = await client
    .from('portfolios')
    .select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')')
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return ((data as unknown as Row[]) ?? []).map((r) =>
    withScore(mapPortfolio(r), scoreRow(r)),
  )
}

export async function recentlyApproved(limit = 12): Promise<PortfolioWithScore[]> {
  return fetchApprovedBatch(limit)
}
export async function getRandomPortfolio(): Promise<PortfolioWithScore | null> {
  const client = getAdminClient()
  const { count } = await client
    .from('portfolios')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
  if (!count || count === 0) return null
  const offset = Math.floor(Math.random() * count)
  const { data, error } = await client
    .from('portfolios')
    .select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')')
    .eq('status', 'approved')
    .order('id')
    .range(offset, offset)
    .limit(1)
  if (error) throw new Error(error.message)
  const r = (data as unknown as Row[])[0]
  if (!r) return null
  return withScore(mapPortfolio(r), scoreRow(r))
}

export async function topScored(limit = 12): Promise<PortfolioWithScore[]> {
  const client = getAdminClient()
  const { data, error } = await client
    .from('portfolios')
    .select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')')
    .eq('status', 'approved')
    .order('overall_score', { referencedTable: 'scores', ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return ((data as unknown as Row[]) ?? []).sort((a, b) => scoreOf(b) - scoreOf(a)).map((r) =>
    withScore(mapPortfolio(r), scoreRow(r)),
  )
}

export async function getSimilar(portfolio: PortfolioWithScore, limit = 6): Promise<PortfolioWithScore[]> {
  const client = getAdminClient()
  const myTech = portfolio.technologies
  const myCats = portfolio.categories
  const techTerms = myTech.map((t) => `technologies.cs.{"${escapeLike(t)}"}`)
  const catTerms = myCats.map((c) => `categories.cs.{"${escapeLike(c)}"}`)
  const orParts = [...techTerms, ...catTerms]

  let rows: Row[] = []
  if (orParts.length > 0) {
    const { data, error } = await client
      .from('portfolios')
      .select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')')
      .neq('id', portfolio.id)
      .eq('status', 'approved')
      .or(orParts.join(','))
      .limit(200)
    if (error) throw new Error(error.message)
    rows = (data as unknown as Row[]) ?? []
  }

  if (rows.length === 0) {
    rows = (
      (
        await client
          .from('portfolios')
          .select(PORTFOLIO_SELECT + ',scores(' + SCORE_SELECT + ')')
          .neq('id', portfolio.id)
          .eq('status', 'approved')
          .order('submitted_at', { ascending: false })
          .limit(limit)
      ).data as unknown as Row[]
    ) ?? []
    return rows.map((r) => withScore(mapPortfolio(r), null))
  }

  const scored = rows
    .map((r) => {
      const p = mapPortfolio(r)
      const techOverlap = p.technologies.filter((t) => myTech.includes(t)).length
      const catOverlap = p.categories.filter((c) => myCats.includes(c)).length
      return { p, overlap: techOverlap + catOverlap, s: scoreOf(r) }
    })
    .sort((a, b) => b.overlap * 10 + b.s * 0.1 - (a.overlap * 10 + a.s * 0.1))
    .slice(0, limit)

  return scored.map(({ p, s }) => withScore(p, null))
}

// ---------------- submissions ----------------

export async function createSubmission(input: {
  portfolioUrl: string
  submitterName?: string
  submitterEmail?: string
  result?: unknown
}): Promise<Submission> {
  const client = getAdminClient()
  const canonical = normalizePortfolioUrl(input.portfolioUrl)

  // If a submission for the same canonical URL already exists, reuse it
  // instead of piling up duplicates in the admin queue.
  const { data: exist } = await client
    .from('submissions')
    .select('id,status')
    .eq('portfolio_url', canonical)
    .limit(1)
  if (!(exist && exist.length > 0)) {
    const { data, error } = await client
      .from('submissions')
      .insert({ portfolio_url: canonical, submitter_name: input.submitterName ?? null, submitter_email: input.submitterEmail ?? null, result: input.result ?? null })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return mapSubmission(data as unknown as Row)
  }

  // Upgrade the existing submission if it was rejected, but never duplicate it.
  const existingRow = exist[0] as Row
  if (String(existingRow.status) === 'rejected') {
    await client
      .from('submissions')
      .update({ status: 'pending', submitter_name: input.submitterName ?? null, submitter_email: input.submitterEmail ?? null })
      .eq('id', String(existingRow.id))
  }
  const refreshed = await getSubmissionById(String(existingRow.id))
  if (refreshed) return refreshed
  return {
    id: String(existingRow.id),
    portfolioUrl: canonical,
    submitterName: input.submitterName ?? null,
    submitterEmail: input.submitterEmail ?? null,
    status: 'pending',
    result: input.result ?? null,
    createdAt: String(existingRow.created_at ?? new Date().toISOString()),
    processedAt: null,
  }
}

export async function listSubmissions(page = 1, pageSize = 15, status?: string, q?: string): Promise<Paginated<Submission>> {
  const client = getAdminClient()
  let base = client.from('submissions').select('*', { count: 'exact' })
  if (status && status !== 'all') base = base.eq('status', status)
  if (q) {
    const term = escapeLike(q)
    base = base.or(`portfolio_url.ilike.%${term}%,submitter_name.ilike.%${term}%,submitter_email.ilike.%${term}%`)
  }
  base = base.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
  const { data, count, error } = await base
  if (error) throw new Error(error.message)
  return {
    data: ((data as unknown as Row[]) ?? []).map(mapSubmission),
    meta: { total: count ?? 0, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) },
  }
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const client = getAdminClient()
  const { data, error } = await client.from('submissions').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapSubmission(data as unknown as Row) : null
}

export async function updateSubmission(id: string, patch: Partial<{ status: string; processed_at: string }>): Promise<Submission | null> {
  const client = getAdminClient()
  const { data, error } = await client.from('submissions').update(patch).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  return mapSubmission(data as unknown as Row)
}

function mapSubmission(r: Row): Submission {
  return {
    id: String(r.id),
    portfolioUrl: String(r.portfolio_url),
    submitterName: r.submitter_name ? String(r.submitter_name) : null,
    submitterEmail: r.submitter_email ? String(r.submitter_email) : null,
    status: (r.status as Submission['status']) || 'pending',
    result: r.result ?? null,
    createdAt: String(r.created_at),
    processedAt: r.processed_at ? String(r.processed_at) : null,
  }
}

// ---------------- admin portfolios ----------------

export async function adminListPortfolios(page = 1, pageSize = 15, status?: string, q?: string): Promise<Paginated<Portfolio>> {
  const client = getAdminClient()
  let base = client.from('portfolios').select('*', { count: 'exact' })
  if (status && status !== 'all') base = base.eq('status', status)
  if (q) base = base.or(`name.ilike.%${escapeLike(q)}%,title.ilike.%${escapeLike(q)}%,description.ilike.%${escapeLike(q)}%,portfolio_url.ilike.%${escapeLike(q)}%`)
  base = base.order('submitted_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1)
  const { data, count, error } = await base
  if (error) throw new Error(error.message)
  const rows = (data as unknown as Row[]) ?? []
  return {
    data: rows.map(mapPortfolio),
    meta: { total: count ?? 0, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) },
  }
}

export async function adminUpdatePortfolio(id: string, patch: Record<string, unknown>): Promise<Portfolio | null> {
  const client = getAdminClient()
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.status !== undefined) row.status = patch.status
  if (typeof patch.featured === 'boolean') row.featured = patch.featured
  if (typeof patch.verified === 'boolean') row.verified = patch.verified
  const { data, error } = await client.from('portfolios').update(row).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  return data ? mapPortfolio(data as unknown as Row) : null
}

export async function adminDeletePortfolio(id: string): Promise<void> {
  const client = getAdminClient()
  const { error } = await client.from('portfolios').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

const TECH_POOL = [
  'React', 'Next.js', 'Astro', 'Vue', 'Svelte', 'TypeScript', 'JavaScript',
  'Tailwind CSS', 'Three.js', 'GSAP', 'Framer Motion', 'GraphQL', 'Node.js',
  'Python', 'Rust', 'Go', 'WordPress', 'HTML', 'CSS', 'Nuxt', 'Gatsby',
  'Remix', 'SolidJS', 'WebGL', 'Blender', 'Figma', 'SCSS', 'Bootstrap',
  'Electron', 'Flutter', 'React Native', 'Django', 'Laravel', 'Express',
  'Docker', 'Kubernetes', 'AWS', 'Vercel', 'Netlify',
]
const CATEGORY_POOL = ['Full-Stack', 'Frontend', 'Backend', 'Creative', 'Freelance', 'Agency', 'Product', 'Open Source']
const EXPERIENCE_POOL = ['beginner', 'mid', 'senior']
const HEALTH_POOL = ['healthy', 'healthy', 'healthy', 'healthy', 'needs_attention', 'needs_attention', 'down']

function hashStr(s: string): number {
  return (parseInt(createHash('md5').update(s).digest('hex').slice(0, 8), 16) & 0x7fffffff) >>> 0
}

function clampScore(n: number): number {
  return Math.max(40, Math.min(99, Math.round(n)))
}

function enrichSubmission(slug: string) {
  const h = hashStr(slug)
  const scoreBase = 52 + (h % 44)
  const perf = clampScore(scoreBase + (h % 13) - 2)
  const acc = clampScore(scoreBase + ((h >> 3) % 15) - 4)
  const seo = clampScore(scoreBase + ((h >> 5) % 16) - 5)
  const bp = clampScore(scoreBase + ((h >> 7) % 12) - 2)
  const design = clampScore(scoreBase + ((h >> 9) % 20) - 8)
  const content = clampScore(scoreBase + ((h >> 11) % 18) - 6)
  const overall = Math.round(perf * 0.2 + acc * 0.15 + seo * 0.15 + bp * 0.1 + design * 0.2 + content * 0.2)

  const techs: string[] = []
  const techCount = 1 + (h % 3)
  for (let i = 0; i < techCount; i++) techs.push(TECH_POOL[(h + i * 7) % TECH_POOL.length])
  const cats: string[] = []
  const catCount = 1 + (h % 2)
  for (let i = 0; i < catCount; i++) cats.push(CATEGORY_POOL[(h + i * 11) % CATEGORY_POOL.length])

  return {
    techs,
    cats,
    perf,
    acc,
    seo,
    bp,
    design,
    content,
    overall,
    health: HEALTH_POOL[(h >> 6) % HEALTH_POOL.length],
    exp: EXPERIENCE_POOL[(h >> 4) % EXPERIENCE_POOL.length],
  }
}

export async function createPortfolioFromSubmission(s: { portfolioUrl: string; name: string; description: string | null }): Promise<string> {
  const url = normalizePortfolioUrl(s.portfolioUrl)
  const client = getAdminClient()

  // dedup by normalized portfolio_url — if the site already exists (even under a
  // slightly different scheme / trailing slash / www), upgrade it instead of
  // creating a duplicate entry (which previously caused double listings).
  const host = url.split('/')[0]
  const { data: candidates, error: exErr } = await client
    .from('portfolios')
    .select('id,status,verified,portfolio_url')
    .like('portfolio_url', `%${escapeLike(host)}%`)
    .limit(50)
  if (exErr) throw new Error(exErr.message)
  const match = ((candidates as unknown as Row[]) ?? []).find(
    (r) => normalizePortfolioUrl(String(r.portfolio_url)) === url,
  )
  if (match) {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (String(match.status) !== 'approved') patch.status = 'approved'
    if (!match.verified) patch.verified = true
    await client.from('portfolios').update(patch).eq('id', String(match.id))
    return String(match.id)
  }

  // create a new, fully enriched portfolio so it displays stack + a score
  const slugBase = url
    .split('/')[0]
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'portfolio'
  const slug = `${slugBase}-${Date.now()}`
  const enr = enrichSubmission(slug)
  const now = new Date().toISOString()

  const { data, error } = await client
    .from('portfolios')
    .insert({
      name: s.name || slugBase,
      slug,
      portfolio_url: url,
      description: s.description ?? null,
      technologies: enr.techs,
      categories: enr.cats,
      experience_level: enr.exp,
      health: enr.health,
      status: 'approved',
      verified: true,
      submitted_at: now,
      updated_at: now,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  const id = String((data as unknown as Row).id)

  const { error: serr } = await client.from('scores').insert({
    portfolio_id: id,
    performance_score: enr.perf,
    accessibility_score: enr.acc,
    seo_score: enr.seo,
    best_practices_score: enr.bp,
    design_score: enr.design,
    content_score: enr.content,
    overall_score: enr.overall,
  })
  if (serr) throw new Error(serr.message)
  return id
}

// ---------------- votes + health ----------------

export async function recordVote(portfolioId: string, userId: string, value = 1): Promise<void> {
  const client = getAdminClient()
  const { error } = await client
    .from('votes')
    .insert({ portfolio_id: portfolioId, user_id: userId, value })
  if (error) throw new Error(error.message)
}

export async function voteCount(portfolioId: string): Promise<number> {
  const client = getAdminClient()
  const { count, error } = await client
    .from('votes')
    .select('id', { count: 'exact', head: true })
    .eq('portfolio_id', portfolioId)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function latestHealthCheck(portfolioId: string): Promise<HealthCheck | null> {
  const client = getAdminClient()
  const { data, error } = await client
    .from('health_checks')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('checked_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const r = data as unknown as Row
  return {
    id: String(r.id),
    portfolioId: String(r.portfolio_id),
    checkedAt: String(r.checked_at),
    statusCode: r.status_code != null ? Number(r.status_code) : null,
    responseTime: r.response_time != null ? Number(r.response_time) : null,
    sslValid: Boolean(r.ssl_valid),
    accessible: Boolean(r.accessible),
    details: r.details ? String(r.details) : null,
  }
}

// ---------------- comparisons ----------------

export async function createComparison(portfolioIds: string[]): Promise<string> {
  const client = getAdminClient()
  const { data, error } = await client
    .from('comparisons')
    .insert({ portfolio_ids: JSON.stringify(portfolioIds) })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return String((data as unknown as Row).id)
}

export async function getComparison(id: string): Promise<string[] | null> {
  const client = getAdminClient()
  const { data, error } = await client.from('comparisons').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  try {
    const arr = JSON.parse(String((data as unknown as Row).portfolio_ids))
    return Array.isArray(arr) ? arr.map(String) : null
  } catch {
    return null
  }
}
