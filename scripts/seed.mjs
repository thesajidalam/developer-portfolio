import { readFileSync } from 'node:fs'
import { createHash, randomInt } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env / .env.local into process.env (only for unset vars) so the seed
// can be run straight from a terminal: `node scripts/seed.mjs`
for (const file of ['.env.local', '.env']) {
  try {
    const text = readFileSync(join(__dirname, '..', file), 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    /* ignore missing env files */
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment (or .env.local).')
  process.exit(1)
}

function hashStr(s) {
  // Mask to 31 bits (positive) so downstream `>> k` shifts never go negative.
  return (parseInt(createHash('md5').update(s).digest('hex').slice(0, 8), 16) & 0x7fffffff) >>> 0
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
const EXPERIENCE = ['beginner', 'mid', 'senior']
const HEALTH = ['healthy', 'healthy', 'healthy', 'healthy', 'needs_attention', 'needs_attention', 'down']

function enrich(rec, index) {
  const h = hashStr(rec.slug)
  const scoreBase = 52 + (h % 44) // 52..95
  const perf = clamp(scoreBase + (h % 13) - 2)
  const acc = clamp(scoreBase + ((h >> 3) % 15) - 4)
  const seo = clamp(scoreBase + ((h >> 5) % 16) - 5)
  const bp = clamp(scoreBase + ((h >> 7) % 12) - 2)
  const design = clamp(scoreBase + ((h >> 9) % 20) - 8)
  const content = clamp(scoreBase + ((h >> 11) % 18) - 6)
  const overall = Math.round(perf * 0.2 + acc * 0.15 + seo * 0.15 + bp * 0.1 + design * 0.2 + content * 0.2)

  const techCount = 1 + (h % 3)
  const techs = []
  for (let i = 0; i < techCount; i++) {
    techs.push(TECH_POOL[(h + i * 7) % TECH_POOL.length])
  }
  const catCount = 1 + (h % 2)
  const cats = []
  for (let i = 0; i < catCount; i++) {
    cats.push(CATEGORY_POOL[(h + i * 11) % CATEGORY_POOL.length])
  }

  const exp = EXPERIENCE[(h >> 4) % EXPERIENCE.length]
  const health = HEALTH[(h >> 6) % HEALTH.length]
  const featured = overall >= 88
  const verified = (h % 10) === 0

  return {
    name: rec.name,
    slug: rec.slug,
    title: rec.tagline || null,
    portfolio_url: rec.url,
    technologies: techs,
    categories: cats,
    experience_level: exp,
    health,
    featured,
    verified,
    score: { perf, acc, seo, bp, design, content, overall },
  }
}

function clamp(n) {
  return Math.max(40, Math.min(99, Math.round(n)))
}

async function post(path, body, conflictCol) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: `return=representation${conflictCol ? ',resolution=merge-duplicates' : ''}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('json') ? res.json() : null
}

async function main() {
  const raw = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'portfolios.json'), 'utf8'))
  console.log(`Seeding ${raw.length} portfolios to ${SUPABASE_URL}`)

  const enriched = raw.map(enrich)
  const BATCH = 200
  let inserted = 0
  let scoresInserted = 0

  for (let i = 0; i < enriched.length; i += BATCH) {
    const chunk = enriched.slice(i, i + BATCH)
    const rows = chunk.map((c) => ({
      name: c.name,
      slug: c.slug,
      title: c.title,
      portfolio_url: c.portfolio_url,
      technologies: c.technologies,
      categories: c.categories,
      experience_level: c.experience_level,
      health: c.health,
      featured: c.featured,
      verified: c.verified,
      status: 'approved',
    }))
    const created = await post('/rest/v1/portfolios?select=id,slug&on_conflict=slug', rows, 'slug')
    const bySlug = new Map((created || []).map((r) => [r.slug, r.id]))
    inserted += created ? created.length : 0

    const scoreRows = chunk
      .map((c) => {
        const id = bySlug.get(c.slug)
        if (!id) return null
        return {
          portfolio_id: id,
          performance_score: c.score.perf,
          accessibility_score: c.score.acc,
          seo_score: c.score.seo,
          best_practices_score: c.score.bp,
          design_score: c.score.design,
          content_score: c.score.content,
          overall_score: c.score.overall,
        }
      })
      .filter(Boolean)
    if (scoreRows.length) {
      await post('/rest/v1/scores?on_conflict=portfolio_id', scoreRows, 'portfolio_id')
      scoresInserted += scoreRows.length
    }

    console.log(`  batch ${i / BATCH + 1}: ${chunk.length} portfolios, ${scoreRows.length} scores`)
  }

  console.log(`\nDone. Portfolios: ${inserted}, Scores: ${scoresInserted}. Total attempted: ${enriched.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
