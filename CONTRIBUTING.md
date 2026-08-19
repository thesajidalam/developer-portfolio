# Contributing to DevBeacon

Thank you for your interest in contributing! This guide will help you get up and running.

---

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Getting Started

```bash
git clone https://github.com/your-org/devbeacon.git
cd devbeacon
npm install
cp .env.example .env
npx prisma db push
npx tsx scripts/seed.ts
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

---

## Code Style

- **TypeScript** — strict mode enabled, no `any` unless absolutely necessary.
- **ESLint** — run `npm run lint` before committing.
- **Components** — functional components with hooks. Use shadcn/ui primitives from `src/components/ui/`.
- **Styling** — Tailwind CSS utility classes only. Use `cn()` from `src/lib/utils.ts` for conditional classes.
- **Naming** — `kebab-case` for files, `PascalCase` for components, `camelCase` for functions and variables.

---

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/components/` | React components grouped by feature |
| `src/lib/` | Shared utilities, DB client, scoring engine |
| `src/types/` | TypeScript type definitions |
| `prisma/` | Database schema and migrations |
| `scripts/` | Seed and maintenance scripts |
| `data/` | Export utilities and seed data |

---

## Pull Request Process

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** following the code style guidelines.

3. **Run checks** before submitting:
   ```bash
   npm run lint
   npm run build
   ```

4. **Write a clear PR description** explaining what changed and why.

5. **Open a PR** against `main`. A maintainer will review within 48 hours.

### PR Checklist

- [ ] Code compiles without errors
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] New features include relevant types
- [ ] API changes include updated documentation

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, CI, tooling |

### Examples

```
feat(explore): add technology filter chips
fix(portfolio): handle missing avatar URL
docs(api): add search endpoint examples
chore(ci): add type-check step
```

---

## Issue Templates

We provide structured issue forms for:

- **Portfolio Submission** — submit a new portfolio to the directory
- **Bug Report** — report a bug or unexpected behavior
- **Feature Request** — suggest a new feature or improvement

Please use the appropriate template when creating issues.

---

## Areas for Contribution

- **Frontend** — new UI components, accessibility improvements, responsive design fixes
- **Scoring Engine** — new scoring dimensions, algorithm improvements
- **API** — new endpoints, pagination improvements, filtering
- **Documentation** — guides, examples, API reference
- **Testing** — unit tests, integration tests
- **Infrastructure** — CI/CD, performance monitoring

---

## Questions?

Open a [discussion](https://github.com/your-org/devbeacon/discussions) or reach out to the maintainers.
