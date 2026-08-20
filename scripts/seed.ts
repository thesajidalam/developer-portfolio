import { seedData } from "../data/seed";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  console.log("Clearing existing data...");
  await db.portfolioTag.deleteMany();
  await db.portfolioCategory.deleteMany();
  await db.portfolioTechnology.deleteMany();
  await db.healthCheck.deleteMany();
  await db.score.deleteMany();
  await db.portfolio.deleteMany();
  await db.tag.deleteMany();
  await db.category.deleteMany();
  await db.technology.deleteMany();

  console.log(`Inserting ${seedData.portfolios.length} portfolios...`);
  await db.portfolio.createMany({ data: seedData.portfolios });

  console.log("Inserting technologies...");
  await db.technology.createMany({ data: seedData.technologies });

  console.log("Inserting categories...");
  await db.category.createMany({ data: seedData.categories });

  console.log("Inserting tags...");
  await db.tag.createMany({ data: seedData.tags });

  console.log(`Inserting ${seedData.scores.length} scores...`);
  await db.score.createMany({ data: seedData.scores });

  console.log(`Inserting ${seedData.healthChecks.length} health checks...`);
  await db.healthCheck.createMany({ data: seedData.healthChecks });

  console.log(`Inserting ${seedData.portfolioTechnologies.length} portfolio-technology relations...`);
  await db.portfolioTechnology.createMany({ data: seedData.portfolioTechnologies });

  console.log(`Inserting ${seedData.portfolioCategories.length} portfolio-category relations...`);
  await db.portfolioCategory.createMany({ data: seedData.portfolioCategories });

  console.log(`Inserting ${seedData.portfolioTags.length} portfolio-tag relations...`);
  await db.portfolioTag.createMany({ data: seedData.portfolioTags });

  console.log("Seed complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
