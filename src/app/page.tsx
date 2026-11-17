import Link from "next/link";
import { ArrowRight, Brain, FlaskConical, Languages, ScanText, Sparkles, Target } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { DemoButton } from "@/components/DemoButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function Landing() {
  const user = await getCurrentUser();
  const [subjects, termCount] = await Promise.all([
    prisma.subject.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { slug: true, name: true, nameZh: true, _count: { select: { terms: { where: { status: "PUBLISHED" } } } } } }),
    prisma.term.count({ where: { status: "PUBLISHED" } }),
  ]);
  const demo = process.env.DEMO_MODE === "true";

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <ButtonLink href="/dashboard" size="sm">Open app <ArrowRight size={16} /></ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">Sign in</ButtonLink>
              <ButtonLink href="/register" size="sm" className="hidden sm:inline-flex">Create account</ButtonLink>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="grain pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 md:grid-cols-[1.1fr_1fr] md:px-8 md:pt-16">
          <div>
            <p className="eyebrow mb-5 text-brand-500">For Chinese-speaking AP students · 为中文母语的 AP 学生打造</p>
            <h1 className="display text-[44px] font-semibold leading-[1.02] md:text-[64px]">
              Know the word.<br />
              <span className="bg-gradient-to-r from-brand-500 to-teal-500 bg-clip-text text-transparent">Own the concept.</span><br />
              Use it on the exam.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Memorising <span className="font-semibold text-[rgb(var(--fg))]">opportunity cost = 机会成本</span> is not the same as recognising it when an AP question describes a student choosing study over a paid shift. AP Lexicon trains all three: translation, English understanding, and AP application.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <ButtonLink href="/dashboard" size="lg" variant="accent">Continue learning <ArrowRight size={18} /></ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/register" size="lg" variant="accent">Start free <ArrowRight size={18} /></ButtonLink>
                  {demo && <DemoButton />}
                </>
              )}
            </div>
            <p className="mt-5 text-sm text-subtle">{termCount.toLocaleString()} bilingual terms · {subjects.length} subject maps · all practice items are original, not official College Board questions.</p>
          </div>

          {/* Product glimpse: a real bilingual card layout */}
          <div className="relative" aria-label="Example bilingual term card">
            <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-brand-500/15 via-teal-500/10 to-gold-400/15 blur-2xl" aria-hidden />
            <div className="surface relative rounded-3xl p-6 shadow-lift md:p-8">
              <div className="flex items-center justify-between">
                <span className="eyebrow">AP Microeconomics · Unit 1</span>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-200">Practicing</span>
              </div>
              <div className="mt-6 display text-4xl font-semibold">opportunity cost</div>
              <div className="zh mt-1 text-2xl font-medium text-brand-500">机会成本</div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl sunken p-4">
                  <div className="eyebrow mb-1">Definition</div>
                  <p className="text-[15px] leading-snug">The value of the next-best alternative given up when a choice is made.</p>
                </div>
                <div className="rounded-2xl sunken p-4">
                  <div className="eyebrow mb-1">中文概念</div>
                  <p className="zh text-[15px] leading-snug">做出选择时所放弃的“次优选择”的价值——只算最好的那一个。</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-dashed hairline p-4 text-[15px]">
                <span className="eyebrow mr-2">AP context</span>A student chooses to study economics instead of working a paid shift; the forgone wages are the opportunity cost.
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                {[["Recognition", "识别", 0.9, "bg-brand-500"], ["Concept", "理解", 0.7, "bg-teal-500"], ["Application", "应用", 0.4, "bg-gold-400"]].map(([l, z, v, c]) => (
                  <div key={l as string}>
                    <div className="h-1.5 overflow-hidden rounded-full sunken"><div className={`h-full ${c}`} style={{ width: `${(v as number) * 100}%` }} /></div>
                    <div className="mt-1.5 text-muted">{l} <span className="zh font-normal">{z}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five stages */}
      <section className="border-y hairline bg-[rgb(var(--bg-elev))]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <h2 className="display text-3xl font-semibold md:text-4xl">Five stages from 中文 to independent English</h2>
          <p className="mt-3 max-w-2xl text-muted">Each map mission moves through the same journey. Mastery is only awarded when you can apply a term in English, without translation.</p>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {[
              ["Discover", "认识", "Bilingual cards with diagrams, misconceptions and AP examples."],
              ["Recognize", "识别", "EN↔中文 matching and timed recall with meaningful distractors."],
              ["Understand", "理解", "Short scenarios: name the concept from what is happening."],
              ["Apply", "应用", "AP-style items with graphs, passages and data, with full feedback."],
              ["Master", "精通", "English-only explanations, cloze and timed unit challenges."],
            ].map(([t, z, d], i) => (
              <li key={t} className="rounded-2xl sunken p-5">
                <div className="font-mono text-xs text-subtle">0{i + 1}</div>
                <div className="mt-2 text-lg font-semibold">{t} <span className="zh text-sm font-normal text-subtle">{z}</span></div>
                <p className="mt-2 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Languages, t: "Bilingual Bridge", z: "双语桥梁", d: "Full, Balanced and Exam modes. We track how often you open Chinese support — as a signal of growing independence, never as a penalty." },
            { icon: FlaskConical, t: "Confusion Lab", z: "易混辨析", d: "Side-by-side comparisons and sorting drills for terms you actually mix up, recommended from your own mistakes." },
            { icon: ScanText, t: "Question Decoder", z: "题目解码", d: "Paste an AP-style question to highlight key terms, command verbs and wording traps — without giving away the answer." },
            { icon: Brain, t: "Real spaced repetition", z: "间隔重复", d: "An open FSRS scheduler with persistent review history. Mistakes come back sooner; strong memories wait longer." },
            { icon: Target, t: "Three-dimensional mastery", z: "三维掌握", d: "Recognition, concept and application are measured separately from your answers. Viewing a card is never counted." },
            { icon: Sparkles, t: "Mastery maps", z: "掌握地图", d: "Every AP unit is a region with missions and a unit challenge. Nodes show mastery, not just completion." },
          ].map((f) => (
            <div key={f.t} className="surface rounded-2xl p-6">
              <f.icon className="text-brand-500" size={22} aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{f.t} <span className="zh text-sm font-normal text-subtle">{f.z}</span></h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <h2 className="display text-3xl font-semibold">Subject maps</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((s) => (
            <li key={s.slug} className="surface flex items-center justify-between rounded-xl px-4 py-3">
              <span><span className="block text-sm font-semibold">{s.name}</span><span className="zh text-xs text-subtle">{s.nameZh}</span></span>
              <span className="font-mono text-xs text-subtle">{s._count.terms}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-subtle">
          AP® is a trademark registered by the College Board, which is not affiliated with and does not endorse AP Lexicon. Unit titles reference publicly available course frameworks; vocabulary, definitions and practice questions are original sample content pending teacher review.
        </p>
      </section>
      <footer className="border-t hairline py-8 text-center text-xs text-subtle">
        <Link href="/login" className="underline-offset-4 hover:underline">Sign in</Link> · Understand the concept. Master the language. Conquer the AP exam.
      </footer>
    </div>
  );
}
