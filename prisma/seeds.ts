import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Coding",
  "Learning",
  "Game Dev",
  "Building",
  "Job Apps",
];

async function main() {
  await prisma.category.createMany({
    data: categories.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const created = await prisma.category.findMany({ select: { name: true } });
  console.log("Categories in DB:", created.map((c) => c.name).join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
