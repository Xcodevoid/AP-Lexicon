/** Regression check: builds every mission × stage session and reports repeated questions or words (all should be 0). */
import { prisma } from "../src/lib/db";
import { buildLearnSession } from "../src/lib/services/learning";

(async () => {
  const user = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const topics = await prisma.topic.findMany({ where: { terms: { some: { status: "PUBLISHED" } } }, select: { id: true, title: true } });
  let sessions = 0, sameRef = 0, sameText = 0, sameWord = 0;
  const examples: string[] = [];
  for (const t of topics) for (const stage of ["RECOGNIZE", "UNDERSTAND", "APPLY", "MASTER"] as const) {
    const { questions } = await buildLearnSession(user, t.id, stage);
    sessions++;
    const refs = questions.map((q) => q.ref), texts = questions.map((q) => q.prompt);
    if (new Set(refs).size < refs.length) sameRef++;
    if (new Set(texts).size < texts.length) { sameText++; if (examples.length < 4) examples.push(`${t.title} ${stage}: ${texts.find((x, i) => texts.indexOf(x) !== i)?.slice(0, 80)}`); }
    const words = questions.map((q) => q.primaryTermId);
    if (new Set(words).size < words.length) sameWord++;
  }
  console.log({ sessions, sessionsWithIdenticalQuestion: sameRef, sessionsWithIdenticalPromptText: sameText, sessionsWhereAWordAppearsTwice: sameWord });
  console.log(examples.join("\n"));
  await prisma.$disconnect();
})();
