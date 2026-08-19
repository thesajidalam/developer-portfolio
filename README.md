<div align="center">

<img src="public/globe.svg" alt="Logo" width="80" />

# Developer Portfolio

### The open-source platform for discovering, evaluating, and learning from developer portfolios.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://gitdevfolio.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-16a34a?style=for-the-badge)](CONTRIBUTING.md)
[![Stars](https://img.shields.io/github/stars/thesajidalam/developer-portfolio?style=for-the-badge&color=f59e0b)](https://github.com/thesajidalam/developer-portfolio)

</div>

<br />

<div align="center">

**[Explore Portfolios](https://gitdevfolio.vercel.app/explore/)** · **[Compare](https://gitdevfolio.vercel.app/compare/)** · **[Rankings](https://gitdevfolio.vercel.app/rankings/)** · **[Submit Yours](https://gitdevfolio.vercel.app/submit/)**

</div>

---

<br />

## What is this?

Not another list of portfolio URLs.

Developer Portfolio is a **scoring and discovery platform**. Every portfolio submitted is evaluated across six dimensions — performance, accessibility, SEO, best practices, design, and content — with a transparent, versioned algorithm. You don't just see *which* portfolios are good. You see *why*.

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

**Discover & Explore**
- Search and filter by technology, category, role, score
- Trending, rising star, and hidden gem discovery engine
- 18 curated developer portfolios with real data
- Full command palette (<kbd>⌘</kbd><kbd>K</kbd>)

</td>
<td width="50%">

**Score & Compare**
- Six-dimension scoring engine with documented weights
- Side-by-side comparison of 2–4 portfolios
- Leaderboards ranked by overall score
- Historical scores preserved across algorithm versions

</td>
</tr>
<tr>
<td>

**Analyze & Monitor**
- Health checks: uptime, SSL, response time
- Live preview in responsive iframes
- Embeddable score badges for your own site
- Social card image generation per portfolio

</td>
<td>

**Admin & Submit**
- Multi-step submission form with URL validation
- Admin dashboard for portfolio management
- Full REST API for integrations
- JSON / CSV / Markdown data export

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

## Tech Stack

```
Framework    Next.js 16 (App Router)          Language     TypeScript 5.9
UI           React 19, Tailwind CSS v4        Database     Prisma 6 + SQLite / PostgreSQL
Components   Radix UI                         Validation   Zod
Icons        Lucide React                     Testing      Vitest
Deploy       Vercel                         CI/CD        GitHub Actions
```

<br />

---

## Quick Start

```bash
git clone https://github.com/thesajidalam/developer-portfolio.git
cd developer-portfolio
npm install
npx prisma generate && npx prisma db push
npx tsx scripts/seed.ts
npm run dev
```

Open **http://localhost:3000**

<br />

---

## Project Structure

```
src/
├── app/
│   ├── (main)/              Home, Explore, Rankings, Compare, Submit, About
│   ├── admin/               Admin Dashboard
│   └── api/v1/              REST API Endpoints
├── components/
│   ├── explore/             Discovery, Filters, Portfolio Grid
│   ├── portfolio/           Cards, Detail, Sharing, Embeds
│   ├── submission/          Multi-step Submit Form
│   ├── layout/              Header, Footer, Command Palette
│   └── ui/                  Reusable UI Primitives
├── lib/
│   ├── scoring.ts           Six-Dimension Scoring Engine
│   ├── discovery.ts         Trending / Rising / Hidden Gems
│   ├── badges.ts            Achievement System
│   └── security.ts          SSRF Protection, Input Sanitization
└── types/                   TypeScript Definitions

prisma/schema.prisma         12 Database Models
data/seed.ts                 18 Portfolios, 12 Technologies, 10 Categories
```

<br />

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/portfolios` | List portfolios (filtered, paginated) |
| `GET` | `/api/v1/portfolios/:id` | Single portfolio by ID or slug |
| `GET` | `/api/v1/search?q=query` | Full-text search |
| `POST` | `/api/v1/submit` | Submit a portfolio URL |
| `GET` | `/api/v1/export?format=json` | Export data (json/csv/markdown) |
| `GET` | `/api/v1/social-card/:slug` | Generate social card SVG |
| `GET` | `/api/v1/embed/:slug` | Embeddable portfolio badge |

<br />

---

## Deploy

```bash
vercel deploy
```

Set `DATABASE_URL` in your Vercel project settings. SQLite works for development. Use PostgreSQL or Turso for production.

<br />

---

## Contributing

We welcome contributions. Fix a typo, add a feature, submit a portfolio — everything helps.

```bash
git checkout -b feat/my-feature
# make changes
npm run lint && npm test
git commit -m "feat: add something great"
git push origin feat/my-feature
```

Open a Pull Request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

<br />

---

## Community

| | |
|---|---|
| **[Submit a Portfolio](https://gitdevfolio.vercel.app/submit/)** | Share your portfolio with the community |
| **[Request a Feature](https://github.com/thesajidalam/developer-portfolio/issues/new?template=feature_request.yml)** | Suggest something new |
| **[Contributing Guide](CONTRIBUTING.md)** | How to contribute code |
| **[Security Policy](SECURITY.md)** | Report vulnerabilities |
| **[Roadmap](ROADMAP.md)** | What's coming next |
| **[Changelog](CHANGELOG.md)** | Version history |

<br />

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

<br />

<div align="center">

**[gitdevfolio.vercel.app](https://gitdevfolio.vercel.app)**

*Built by [Sajid](https://github.com/thesajidalam)*

</div>
