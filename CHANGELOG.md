# Changelog

All notable changes to Developer Portfolio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2026-08-19

### Added

- **Portfolio Directory** — browsable, filterable collection of developer portfolios
- **Scoring Engine** — six-dimensional scoring: performance, accessibility, SEO, best practices, design, content
- **Health Monitoring** — automated uptime, SSL, and response time checks
- **Portfolio Inspector** — embedded iframe preview with quick-scan summary
- **Side-by-Side Comparison** — compare up to three portfolios across all metrics
- **Categories & Rankings** — browse by framework, language, or topic
- **Submission Flow** — submit portfolios via web form with URL validation
- **SSRF Protection** — internal IP blocking, protocol restriction, DNS rebinding protection
- **Search** — full-text search with technology, category, and experience level filters
- **Command Palette** — keyboard-driven navigation (`Ctrl+K`)
- **Dark/Light Themes** — system preference detection with manual toggle
- **Responsive Design** — mobile, tablet, and desktop optimized
- **REST API** — `/api/v1` endpoints for portfolios, search, submission, and URL validation
- **SQLite Database** — local-first storage with Prisma ORM
- **Seed Data** — curated initial dataset of developer portfolios

### Security

- Rate limiting on all API endpoints
- Input validation with Zod schemas
- SSRF protections for submitted portfolio URLs
