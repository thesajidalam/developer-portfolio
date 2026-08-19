<div align="center">

# Developer Portfolio

### Discover what great developers build

[![GitHub Pages](https://img.shields.io/badge/Live-Demo-0ea5e9?style=for-the-badge&logo=vercel&logoColor=white)](https://thesajidalam.github.io/developer-portfolio/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-16a34a?style=for-the-badge)](CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/thesajidalam/developer-portfolio?style=for-the-badge&color=f59e0b)](https://github.com/thesajidalam/developer-portfolio)

</div>

---

## What is this?

A platform that goes beyond listing developer portfolios. It **scores**, **ranks**, and **explains** what makes each portfolio stand out — so you can learn from the best, not just browse them.

Every portfolio is evaluated across six dimensions with a transparent, versioned algorithm. No black boxes.

---

## Live Demo

**[https://thesajidalam.github.io/developer-portfolio/](https://thesajidalam.github.io/developer-portfolio/)**

---

## Features

- **Explore** — Browse 18 curated portfolios with real-time filtering by technology, category, and score
- **Six-Dimension Scoring** — Performance, Accessibility, SEO, Best Practices, Design, Content
- **Side-by-Side Comparison** — Compare 2-4 portfolios across every metric
- **Health Monitoring** — Uptime, SSL, and response time tracking
- **Live Preview** — View portfolios in responsive iframes at desktop, tablet, and mobile sizes
- **Categories** — Best Overall, Best Design, Best Performance, Best Accessibility, and more
- **Discovery Engine** — Trending, rising star, and hidden gem portfolios surfaced automatically
- **Rankings** — Leaderboards sorted by overall score
- **Command Palette** — Press `⌘K` / `Ctrl+K` to search, navigate, and discover instantly
- **Keyboard Navigation** — Full keyboard support throughout the entire application
- **Embeddable Badges** — Generate iframe badges to display portfolio scores on your own site

---

## Scoring Methodology

Every portfolio is scored across six dimensions. The algorithm is versioned and fully documented.

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Performance | 25% | Load speed, Core Web Vitals, bundle size |
| Accessibility | 20% | WCAG compliance, keyboard navigation, screen reader support |
| SEO | 15% | Meta tags, structured data, crawlability |
| Best Practices | 15% | Security headers, HTTPS, modern APIs |
| Design | 15% | Visual hierarchy, typography, layout, consistency |
| Content | 10% | Copy quality, project presentation, clarity |

Historical scores are preserved. When we update the algorithm, every portfolio is re-scored and the previous scores remain available.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Radix UI |
| Language | TypeScript 5.9 |
| Database | Prisma 6, SQLite (local) / PostgreSQL (production) |
| Validation | Zod |
| Icons | Lucide React |
| Testing | Vitest |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/thesajidalam/developer-portfolio.git
cd developer-portfolio

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Seed sample data (18 portfolios, 12 technologies, 10 categories)
npx tsx scripts/seed.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### GitHub Pages (Static)

The application builds as a fully static site. All portfolio data is pre-rendered at build time.

The GitHub Actions workflow handles the entire process automatically:

1. Installs dependencies
2. Sets up and seeds the SQLite database
3. Builds the static export into `/out`
4. Deploys to GitHub Pages

Push to `main` and it deploys. No configuration needed.

**Live URL:** [https://thesajidalam.github.io/developer-portfolio/](https://thesajidalam.github.io/developer-portfolio/)

### Vercel (Full Features)

For dynamic features like the submit form, real-time health monitoring, and admin dashboard:

```bash
vercel deploy
```

Set these environment variables in your Vercel project:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

Vercel will use SQLite by default. For production, connect a PostgreSQL or Turso database.

---

## Project Structure

```
src/
  app/                    Routes and pages
    (main)/               Public pages (home, explore, rankings, etc.)
    admin/                Admin dashboard
    api/                  API endpoints
  components/
    explore/              Discovery, filtering, and portfolio grid
    layout/               Header, footer, command palette
    portfolio/            Portfolio cards, detail view, sharing
    submission/           Portfolio submission form
    ui/                   Reusable UI components (badge, button, card, etc.)
  lib/
    scoring.ts            Six-dimension scoring engine
    discovery.ts          Trending, rising, and hidden gem algorithms
    badges.ts             Achievement badge system
    security.ts           SSRF protection and input sanitization
    analytics.ts          Usage tracking
  types/                  TypeScript type definitions

prisma/
  schema.prisma           12 database models

data/
  seed.ts                 Sample data (18 portfolios, technologies, categories)

tests/                    Test files
```

---

## Contributing

We welcome contributions of all kinds. Fix a typo, add a feature, submit your own portfolio — everything helps.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `npm run lint` and `npm test`
5. Commit with a clear message
6. Open a Pull Request

Read the full guide: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Community

| Resource | Description |
|----------|-------------|
| [Submit a Portfolio](https://github.com/thesajidalam/developer-portfolio/issues/new?template=portfolio-submission.yml) | Submit your own or someone else's portfolio |
| [Request a Feature](https://github.com/thesajidalam/developer-portfolio/issues/new?template=feature_request.yml) | Suggest something new |
| [Contributing Guide](CONTRIBUTING.md) | How to contribute code |
| [Security Policy](SECURITY.md) | Report vulnerabilities |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Changelog](CHANGELOG.md) | Version history |
| [Roadmap](ROADMAP.md) | What's coming next |

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

<div align="center">

**[Explore Portfolios](https://thesajidalam.github.io/developer-portfolio/explore/)** · **[Submit Yours](https://thesajidalam.github.io/developer-portfolio/submit/)** · **[Compare](https://thesajidalam.github.io/developer-portfolio/compare/)** · **[Rankings](https://thesajidalam.github.io/developer-portfolio/rankings/)**

</div>
