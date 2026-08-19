# DevBeacon

> **Discover. Evaluate. Learn.**
> The open-source platform for exploring, evaluating, and learning from developer portfolios.

---

## What is DevBeacon?

DevBeacon is a curated discovery engine for developer portfolios. Whether you're a hiring manager evaluating talent, a developer looking for design inspiration, or a beginner studying how experienced engineers present their work — DevBeacon gives you the tools to find, compare, and learn from the best portfolios on the web.

Every portfolio in DevBeacon is scored across six dimensions — performance, accessibility, SEO, best practices, design quality, and content depth — using a transparent scoring engine. Health checks monitor uptime, SSL validity, and response times so you always know which portfolios are alive and well-maintained.

The platform is fully open-source and community-driven. Submit your own portfolio, vote on favorites, and help curate the definitive directory of developer portfolios.

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 🔍 | **Intelligent Search & Filtering** | Full-text search with filters for technology, category, experience level, and health status |
| 📊 | **Transparent Scoring Engine** | Six-dimensional scoring: performance, accessibility, SEO, best practices, design, content |
| 🏥 | **Portfolio Health Monitoring** | Automated checks for uptime, SSL certificates, and response times |
| ⚡ | **Live Portfolio Inspector** | Embedded iframe preview with quick-scan summary |
| 🔄 | **Side-by-Side Comparison** | Compare up to three portfolios across all metrics |
| 🏆 | **Categories & Rankings** | Browse by framework, language, or topic — see who leads each category |
| 🎯 | **Automated Analysis** | Deep-scan submitted portfolios for tech stack, structure, and quality signals |
| 🌓 | **Dark/Light Themes** | Full theme support with system preference detection |
| ⌨️ | **Keyboard Navigation** | Command palette (`Ctrl+K`) for power users |
| 📱 | **Fully Responsive** | Optimized for mobile, tablet, and desktop |

---

## Quick Start

```bash
git clone https://github.com/your-org/devbeacon.git
cd devbeacon
npm install
npx prisma db push
npx tsx scripts/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

DevBeacon follows the Next.js App Router convention:

```
src/
├── app/
│   ├── (main)/          # Public-facing pages
│   │   ├── page.tsx     # Landing / home
│   │   ├── explore/     # Portfolio discovery
│   │   ├── p/[slug]/    # Portfolio detail
│   │   ├── categories/  # Category browser
│   │   ├── compare/     # Side-by-side tool
│   │   ├── rankings/    # Leaderboards
│   │   ├── submit/      # Submission flow
│   │   └── about/       # About page
│   └── api/v1/          # REST API endpoints
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── layout/          # Header, footer, nav
│   ├── portfolio/       # Portfolio cards, detail, scoring
│   ├── explore/         # Filters and grid
│   ├── comparison/      # Comparison tools
│   └── submission/      # Submit form and success
├── lib/                 # Utilities, DB, scoring engine
└── types/               # Shared TypeScript types
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Database | SQLite + Prisma |
| Styling | Tailwind CSS v4 |
| UI | Radix UI + shadcn/ui |
| Icons | Lucide React |
| Validation | Zod |

---

## API

Base URL: `/api/v1`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/portfolios` | List portfolios with filters |
| `GET` | `/api/v1/portfolios/:id` | Get single portfolio |
| `GET` | `/api/v1/search` | Full-text search |
| `POST` | `/api/v1/submit` | Submit a new portfolio |
| `POST` | `/api/v1/validate-url` | Validate a portfolio URL |

### Example Request

```bash
curl "http://localhost:3000/api/v1/portfolios?technologies=react&sort=score&pageSize=5"
```

### Example Response

```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 5,
    "totalPages": 9
  }
}
```

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our development workflow, coding standards, and pull request process.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
