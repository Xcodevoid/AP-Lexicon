/** Deletes demo accounts (User.isDemo = true) older than N hours (default 24). All their data cascades. */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const hours = Number(process.argv[2] ?? 24);
prisma.user
  .deleteMany({ where: { isDemo: true, createdAt: { lt: new Date(Date.now() - hours * 3600_000) } } })
  .then((r) => console.log(`Deleted ${r.count} demo account(s) older than ${hours}h`))
  .finally(() => prisma.$disconnect());
