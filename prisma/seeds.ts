import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

// Use CA certificate so the client trusts Supabase’s server (e.g. downloaded from Project → Settings → Database → SSL)
const caPath =
  process.env.SSL_CA_PATH ||
  path.join(process.cwd(), "certs", "ca.crt");
const ssl =
  fs.existsSync(caPath) ?
    { rejectUnauthorized: true, ca: fs.readFileSync(caPath).toString() }
  : undefined;

const adapter = new PrismaPg({
  connectionString,
  ...(ssl && { ssl }),
});
const prisma = new PrismaClient({ adapter });

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
