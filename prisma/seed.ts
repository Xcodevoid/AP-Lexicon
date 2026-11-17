/**
 * Seed: compiles content/subjects/*.lex, imports everything as PUBLISHED sample content,
 * and creates/updates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
 * No student progress is seeded — every dashboard number comes from real activity.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { compileLexSources } from "../src/lib/content/bundle";
import { importBundle } from "../src/lib/content/import";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const dir = process.env.CONTENT_DIR ?? path.resolve(__dirname, "../content/subjects");
  const sources = readdirSync(dir).filter((f) => f.endsWith(".lex")).sort().map((f) => ({ name: f, text: readFileSync(path.join(dir, f), "utf8") }));
  const { bundle, issues } = compileLexSources(sources);
  const errors = issues.filter((i) => i.level === "error");
  if (errors.length) {
    errors.forEach((e) => console.error(`ERROR ${e.where}: ${e.message}`));
    throw new Error("Content has errors — run `npm run content:check`.");
  }
  console.log(`Importing ${bundle.subjects.length} subjects / ${bundle.terms.length} terms…`);
  await importBundle(prisma, bundle, console.log);

  // publish terms from the seed bundle (they are labelled sample content pending teacher review)
  await prisma.subject.updateMany({ data: { status: "PUBLISHED" } });

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
    const passwordHash = await hashPassword(password);
    await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", passwordHash },
      create: { email, name: "Content Admin", role: "ADMIN", passwordHash, onboardedAt: new Date() },
    });
    console.log(`Admin account ready: ${email}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
