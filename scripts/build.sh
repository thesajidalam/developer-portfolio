#!/bin/bash
set -e

export DATABASE_URL="${DATABASE_URL:-file:./developer-portfolio.db}"

npx prisma generate
npx prisma db push --skip-generate
npx tsx scripts/seed.ts
npm run build
