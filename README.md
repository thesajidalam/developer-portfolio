<div align="center">

<img src="public/globe.svg" alt="DevFolio" width="90" />

# DevFolio

### The open-source platform for discovering, evaluating, and learning from developer portfolios.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://gitdevfolio.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-16a34a?style=for-the-badge)](CONTRIBUTING.md)
[![Stars](https://img.shields.io/github/stars/thesajidalam/developer-portfolio?style=for-the-badge&color=f59e0b)](https://github.com/thesajidalam/developer-portfolio)

</div>

<br />

<div align="center">

**[Explore Portfolios](https://gitdevfolio.vercel.app/)** · **[Compare](https://gitdevfolio.vercel.app/compare)** · **[Rankings](https://gitdevfolio.vercel.app/rankings)** · **[Submit Yours](https://gitdevfolio.vercel.app/submit)**

</div>

---

<br />

## What is DevFolio?

Not another list of portfolio URLs.

DevFolio is a **scoring and discovery platform** for developer portfolios. Every portfolio submitted is automatically evaluated across six dimensions — performance, accessibility, SEO, best practices, design, and content — with a transparent, versioned algorithm. You don't just see *which* portfolios are good. You see *why*.

Browse **1,900+ curated developer portfolios**, filter by technology or category, compare side-by-side with winner verdicts, check real-time health status, and even grab an embeddable score badge for your own site.

Built for developers who want to learn from the best, hiring managers who want to evaluate candidates fairly, and portfolio owners who want honest, actionable feedback.

<br />

---

## Live

| Platform | URL | Status |
|----------|-----|--------|
| **Vercel** | [gitdevfolio.vercel.app](https://gitdevfolio.vercel.app) | Active — full features |

<br />

---

## Features

<table>
<tr>
<td width="50%">

### Discover & Explore
- **Portfolio of the Day** — a daily spotlight highlighting one exceptional portfolio
- **Quick tech filter chips** — one-click filters for React, Next.js, Vue, TypeScript, Python, and more
- **Smart search** — real-time search across names, titles, descriptions, and technologies
- **Infinite grid** — smooth load-more browsing with no page jumps
- **Trending, rising stars, and hidden gems** — discovery engine surfaces the best portfolios
- **Keyboard shortcut** — press <kbd>/</kbd> from anywhere to focus search
- **Save/bookmark** — heart any portfolio, persisted in your browser

</td>
<td width="50%">

### Score & Compare
- **Six-dimension scoring engine** — transparent algorithm with documented weights
- **Side-by-side comparison** — compare 2–5 portfolios with a clear winner verdict
- **Score audit** — full breakdown of every scoring dimension on portfolio detail pages
- **Rankings with sort** — sort by Score, Likes, or Newest with medal cards for the top 3
- **Editor's Picks** — curated portfolios highlighted across the platform
- **Historical scores** — preserved across algorithm versions

</td>
</tr>
<tr>
<td>

### Analyze & Monitor
- **Health checks** — real-time monitoring for uptime, SSL, and response time
- **Tech & category analytics** — visual distribution charts in the admin dashboard
- **Community reports** — users can flag broken links, reviewed in the admin panel
- **Embeddable score badge** — drop a scored badge on your own site via iframe

</td>
<td>

### Admin & Submit
- **Modern submission form** — 3-step flow with inline validation and success animation
- **6-tab admin dashboard** — Portfolios, Submissions, Reports, Newsletter, Analytics, Settings
- **Newsletter management** — view and export all submitter emails
- **CSV export** — download your entire portfolio database
- **Full REST API** — every feature accessible via clean API endpoints
- **Social card generation** — auto-generated OG images per portfolio

</td>
</tr>
</table>

<br />

---

## Scoring

Every portfolio is scored across six dimensions. The algorithm is **versioned** (`v1.0`) and the methodology is fully documented.

```
┌─────────────────────┬────────┬──────────────────────────────────────────┐
│ Dimension           │ Weight │ What it measures                         │
├─────────────────────┼────────┼──────────────────────────────────────────┤
│ Performance         │  25%   │ Load speed, Core Web Vitals, bundle size │
│ Accessibility       │  20%   │ WCAG compliance, keyboard nav, a11y     │
│ SEO                 │  15%   │ Meta tags, structured data, indexing    │
│ Best Practices      │  15%   │ Security headers, HTTPS, modern APIs    │
│ Design              │  15%   │ Visual hierarchy, typography, layout    │
│ Content             │  10%   │ Copy clarity, project presentation     │
└─────────────────────┴────────┴──────────────────────────────────────────┘
```

<br />

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Portfolio of the Day, trending, search, tech chips, infinite gallery |
| `/rankings` | Ranked leaderboards with sort by Score, Likes, or Newest |
| `/compare` | Portfolio comparison picker — search, quick picks, 2–5 side-by-side |
| `/compare/:id` | Comparison result with winner verdict and dimension-by-dimension breakdown |
| `/submit` | Submit your portfolio — 3-step form with validation |
| `/p/:slug` | Portfolio detail — score breakdown, health, technologies, embed, share |
| `/report` | Report a broken or down link |
| `/admin` | Admin dashboard — 6 tabs for full platform management |
| `/privacy` | Privacy policy |

<br />

---

## Tech Stack

```
Framework     Next.js 15 (App Router)        Language      TypeScript 5.7
UI            React 19, Tailwind CSS 3       Database      Supabase (PostgreSQL)
Validation    Zod                             Auth          Bearer token (admin)
Deploy        Vercel                          CI/CD         GitHub Actions
Runtime       Node.js 18+                     Package       npm
```

<br />

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/thesajidalam/developer-portfolio.git
cd developer-portfolio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

Open **http://localhost:3000**

<br />

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
ADMIN_KEY=your-admin-key
```

<br />

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    Home — Portfolio of Day, trending, search, gallery
│   ├── layout.tsx                  Root layout with keyboard shortcut
│   ├── globals.css                 Global styles, accessibility, dark theme
│   ├── admin/page.tsx              6-tab admin dashboard
│   ├── rankings/page.tsx           Sortable rankings with medals
│   ├── compare/
│   │   ├── page.tsx                Comparison picker with search
│   │   └── [id]/page.tsx           Side-by-side result with winner verdict
│   ├── submit/page.tsx             3-step submission form
│   ├── report/page.tsx             Broken link report form
│   ├── p/[slug]/page.tsx           Portfolio detail with score audit
│   ├── privacy/                    Privacy policy
│   └── api/v1/
│       ├── portfolios/             List & filter portfolios
│       ├── portfolios/[slug]/      Single portfolio
│       ├── search/                 Full-text search
│       ├── submit/                 Portfolio submission
│       ├── compare/                Create comparison
│       ├── compare/[id]/           Get comparison
│       ├── vote/                   Like/unlike a portfolio
│       ├── report/                 Report broken link
│       ├── embeds/[slug]/          Embeddable score badge
│       ├── social-card/[slug]/     OG image generation
│       ├── featured/               Featured portfolios
│       ├── stats/                  Site statistics
│       └── admin/
│           ├── portfolios/         Portfolio CRUD
│           ├── submissions/        Submission management
│           ├── reports/            Broken link reports
│           ├── newsletter/         Submitter email list
│           └── analytics/          Site analytics & distributions
├── components/
│   ├── Navbar.tsx                  Navigation with segmented pill active state
│   ├── Footer.tsx                  Site footer
│   ├── Logo.tsx                    Animated logo
│   ├── PortfolioCard.tsx           Portfolio card with share, bookmark, like
│   ├── ScoreRing.tsx               Circular score visualization
│   ├── ScoreBadge.tsx              Compact score badge
│   ├── Reveal.tsx                  Scroll-reveal animation
│   ├── LoadMore.tsx                Infinite scroll grid
│   └── SearchShortcut.tsx          / keyboard shortcut
└── lib/
    ├── repository.ts               Database queries & mutations
    ├── scoring.ts                  Six-dimension scoring engine
    ├── discovery.ts                Trending / rising / hidden gems
    ├── types.ts                    TypeScript type definitions
    ├── utils.ts                    Helpers (absoluteUrl, formatDate, etc.)
    ├── supabase.ts                 Supabase client setup
    ├── admin-auth.ts               Admin key authentication
    ├── security.ts                 SSRF protection & sanitization
    ├── ssrf-protection.ts          URL validation
    └── validations.ts              Zod schemas
```

<br />

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/portfolios` | List portfolios with filters, search, sort, pagination |
| `GET` | `/api/v1/portfolios/:slug` | Get single portfolio by slug |
| `GET` | `/api/v1/search?q=query` | Full-text search across portfolios |
| `POST` | `/api/v1/submit` | Submit a portfolio URL |
| `POST` | `/api/v1/vote` | Like or unlike a portfolio |
| `POST` | `/api/v1/compare` | Create a comparison (returns ID) |
| `GET` | `/api/v1/compare/:id` | Get a saved comparison |
| `POST` | `/api/v1/report` | Report a broken link |
| `GET` | `/api/v1/featured` | Get featured/editor's pick portfolios |
| `GET` | `/api/v1/stats` | Site-wide statistics |
| `GET` | `/api/v1/embeds/:slug` | Embeddable score badge (HTML) |
| `GET` | `/api/v1/social-card/:slug` | Auto-generated OG image (SVG) |

### Admin Endpoints

All admin endpoints require the `Authorization: Bearer <ADMIN_KEY>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/portfolios` | List all portfolios with status filters |
| `PATCH` | `/api/v1/admin/portfolios` | Update portfolio (status, featured, score, etc.) |
| `DELETE` | `/api/v1/admin/portfolios` | Delete a portfolio |
| `GET` | `/api/v1/admin/submissions` | List submissions with search and status filters |
| `PATCH` | `/api/v1/admin/submissions` | Approve or reject a submission |
| `GET` | `/api/v1/admin/reports` | List broken link reports |
| `DELETE` | `/api/v1/admin/reports` | Dismiss a report |
| `GET` | `/api/v1/admin/newsletter` | List all unique submitter emails |
| `GET` | `/api/v1/admin/analytics` | Full analytics (tech distribution, categories, health) |

<br />

---

## Deploy

```bash
# One-command deploy
vercel --prod
```

Set the following environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `ADMIN_KEY`

<br />

---

## Contributing

We welcome contributions of all kinds. Fix a typo, add a feature, submit a portfolio — everything helps.

```bash
git checkout -b feat/my-feature
# make changes
npm run build -- --no-lint
git commit -m "feat: add something great"
git push origin feat/my-feature
```

Open a Pull Request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

<br />

---

## Community

| | |
|---|---|
| **[Submit a Portfolio](https://gitdevfolio.vercel.app/submit)** | Share your portfolio with the community |
| **[Report a Broken Link](https://gitdevfolio.vercel.app/report)** | Help us keep the directory accurate |
| **[Request a Feature](https://github.com/thesajidalam/developer-portfolio/issues/new)** | Suggest something new |
| **[Contributing Guide](CONTRIBUTING.md)** | How to contribute code |
| **[Security Policy](SECURITY.md)** | Report vulnerabilities |

<br />

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

<br />

<div align="center">

**[gitdevfolio.vercel.app](https://gitdevfolio.vercel.app)**

*Built by [Sajid](https://github.com/thesajidalam)*

</div>
