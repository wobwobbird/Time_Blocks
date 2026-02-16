import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let connectionString = process.env.DATABASE_URL!;

// Use CA certificate so the client trusts Supabase’s server (e.g. downloaded from Project → Settings → Database → SSL)
const caPath =
  process.env.SSL_CA_PATH ||
  path.join(process.cwd(), "certs", "ca.crt");
const hasCert = fs.existsSync(caPath);
const ssl = hasCert
  ? { rejectUnauthorized: true, ca: fs.readFileSync(caPath).toString() }
  : undefined;

// When we pass our own ssl config, strip SSL params from the URL so pg uses our CA (URL ssl params can override and drop the CA)
if (ssl && connectionString.includes("?")) {
  const url = new URL(connectionString.replace(/^postgresql:/, "https:"));
  const strip = (k: string) => k.toLowerCase().startsWith("ssl");
  const kept = [...url.searchParams.entries()].filter(([k]) => !strip(k));
  url.search = kept.length ? "?" + kept.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&") : "";
  connectionString = url.toString().replace(/^https:/, "postgresql:");
}

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
