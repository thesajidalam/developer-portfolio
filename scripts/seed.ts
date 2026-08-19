import { seedData } from "../data/seed";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  console.log("Inserting portfolios...");
  for (const portfolio of seedData.portfolios) {
    await db.portfolio.upsert({
      where: { id: portfolio.id },
      update: portfolio,
      create: portfolio,
    });
  }

  console.log("Inserting technologies...");
  for (const tech of seedData.technologies) {
    await db.technology.upsert({
      where: { id: tech.id },
      update: tech,
      create: tech,
    });
  }

  console.log("Inserting categories...");
  for (const cat of seedData.categories) {
    await db.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  console.log("Inserting tags...");
  for (const tag of seedData.tags) {
    await db.tag.upsert({
      where: { id: tag.id },
      update: tag,
      create: tag,
    });
  }

  console.log("Inserting scores...");
  for (const score of seedData.scores) {
    await db.score.upsert({
      where: { id: score.id },
      update: score,
      create: score,
    });
  }

  console.log("Inserting health checks...");
  for (const health of seedData.healthChecks) {
    await db.healthCheck.upsert({
      where: { id: health.id },
      update: health,
      create: health,
    });
  }

  console.log("Inserting portfolio-technology relations...");
  for (const pt of seedData.portfolioTechnologies) {
    const existing = await db.portfolioTechnology.findUnique({
      where: {
        portfolioId_technologyId: {
          portfolioId: pt.portfolioId,
          technologyId: pt.technologyId,
        },
      },
    });
    if (!existing) {
      await db.portfolioTechnology.create({ data: pt });
    }
  }

  console.log("Inserting portfolio-category relations...");
  for (const pc of seedData.portfolioCategories) {
    const existing = await db.portfolioCategory.findUnique({
      where: {
        portfolioId_categoryId: {
          portfolioId: pc.portfolioId,
          categoryId: pc.categoryId,
        },
      },
    });
    if (!existing) {
      await db.portfolioCategory.create({ data: pc });
    }
  }

  console.log("Inserting portfolio-tag relations...");
  for (const pt of seedData.portfolioTags) {
    const existing = await db.portfolioTag.findUnique({
      where: {
        portfolioId_tagId: {
          portfolioId: pt.portfolioId,
          tagId: pt.tagId,
        },
      },
    });
    if (!existing) {
      await db.portfolioTag.create({ data: pt });
    }
  }

  console.log("Seed complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
