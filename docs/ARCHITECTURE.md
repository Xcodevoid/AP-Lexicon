# Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 15 (App Router) + React 19 + TypeScript | Server components read the DB directly for pages; route handlers serve JSON APIs for interactive client components |
| Styling | Tailwind CSS 3.4 + CSS custom-property tokens | Light/dark tokens in `globals.css`; no component-library dependency |
| Motion | framer-motion 11 | Respects `prefers-reduced-motion` and a per-user setting |
| Charts | Recharts 2 | Two single-series charts; colors validated for CVD safety (`--dim-*` tokens) |
| DB | PostgreSQL + Prisma 6 | Migrations in `prisma/migrations` |
| Validation | Zod 3 | Every API body, every import row, every content record |
| Auth | Custom: scrypt hashes + opaque session tokens (SHA-256 stored server-side) in an httpOnly SameSite=Lax cookie | Runs with no third-party credentials; easy to swap for Supabase/Auth.js later (only `src/lib/auth/session.ts` changes) |
| Tests | Vitest (unit), Playwright (E2E) | |

Supabase was not used so the project runs locally with zero external accounts; the session module is the only place that would change.

## Directory map

```
content/subjects/*.lex     authoring source for all seed content (compiled by src/lib/content/bundle.ts)
content/sources/           master spreadsheet (+ JSON export) and Precalc pairs, for traceability
prisma/                    schema, migrations, seed
src/lib/engine/            PURE logic, unit-tested: fsrs, mastery, grading, gamification, achievements, questions, decoder
src/lib/services/          DB-backed services: learning (sessions, grading, recording), stats (dashboard, map, achievements), admin, pool, glossary
src/lib/content/           schema (zod), .lex parser, bundle compiler, CSV/JSON import + commit
src/lib/auth/              password, session, permissions (pure)
src/lib/api.ts             route() wrapper: origin check → rate limit → auth → permission → zod body → handler → error mapping
src/app/(app)/             authenticated pages (dashboard, subjects/[slug] map, learn/[topicId], review, challenge, lab, decoder, notebook, progress, achievements, settings, admin/*)
src/app/api/               JSON route handlers
src/components/            UI: ui/ primitives, map/, learn/ (TermCard, PracticePlayer, MatchGame, Celebration…), visuals/ (23 SVG diagrams), admin/, charts/
tests/unit, tests/e2e
```

## Data model (Prisma)

- **User** (role STUDENT/ADMIN, `isDemo`, languageMode, focus subjects, daily goal, tzOffset, leaderboard opt-in/alias), **Session**.
- **Subject → Unit → Topic** (map regions and missions). **Term** belongs to a subject and optionally a unit/topic; carries every vocabulary field (zh, definition, zhExplanation, pronunciation, audioUrl, difficulty, tags, misconceptions, apExample, realWorld, visual JSON, imageUrl, writtenPrompt, source, reviewStatus, status). **TermRelation** (`related` | `confused`).
- **Question** (type MCQ/SCENARIO/PASSAGE/GRAPH/CLOZE/WRITTEN, stage, skill, options JSON with per-option rationale and optional termId, answer, rubric, explanation EN/中文, status) ↔ **QuestionTerm**. **ConfusionPair** (dimensions, scenarios JSON).
- **UserTermState** — one row per user × term: FSRS memory (state, stability, difficulty, due, lastReview, reps, lapses) + mastery evidence (recognition/concept/application score and attempt counts, independentOk, hintsUsed) + cached `status`/`score`, bookmark, note.
- **ReviewLog** — every graded attempt (question or generated key, skill, stage, correct, FSRS rating, errorType, confusedWithId, usedHint, responseMs, answer, mode, elapsed/scheduled days).
- **XpEvent**, **UserAchievement**, **PersonalBest**, **Collection/CollectionTerm**, **StudyGoal**, **ImportJob**.

Demo data is separated by `User.isDemo`: demo users can't access admin features or the leaderboard and are purged by `npm run demo:purge`. Seeded content contains no student data.

## Request flow: answering a question

1. `PracticePlayer` posts `{ref, choice|text|selfScore, usedHint, chineseShown, responseMs, mode}` to `/api/answer`.
2. `recordAnswer` parses the ref. Authored (`q:<id>`) → loads the question and its answer. Generated (`gen:<kind>:<termId>:<optionIds>`) → rebuilds the exact item from the vocabulary pool and the option IDs in the ref. **The client never receives answers before submitting**, and the server never trusts client grading.
3. Grade → classify error (confusion if the chosen option is a `confused` relation of the correct term) → FSRS rating (hints never lower it) → update FSRS state and mastery evidence for every linked term → write ReviewLog → XP (stage-weighted, due bonus, diminishing returns) → evaluate achievements → return feedback with rationales, explanations, mastery deltas and next-review interval.

## Security

- All authorization is server-side (`route({ permission })`, `requireAdminPage`); rules live in `src/lib/auth/permissions.ts` (unit-tested). Users can only read/write their own progress, notes, collections and goals (every query is scoped by `userId`).
- Cross-origin POST/PATCH/DELETE are rejected (Origin vs Host) in addition to SameSite=Lax cookies.
- Zod validation on every body; URL fields restricted to http(s)/site paths; import size limits (5 MB, 5,000 rows).
- Rate limits on auth, demo creation, answering, import, decoder and AI routes.
- Secrets only in server env; the Anthropic key is used only in `/api/decoder/ai`.
- Security headers in `next.config.mjs`. Passwords: scrypt (N=16384, r=8, p=1) with per-user salt.

## Continuation plan (priority order)

1. **Teacher review pass** of all content (Chinese explanations especially), then mark `APPROVED` in Admin → Vocabulary (bulk action exists).
2. **More authored items** for APUSH, Psych, Stats, CSA, CSP, Physics C, Chem (target ≥ 2 Understand + 2 Apply items per mission); add pairs to the Confusion Lab.
3. **Auth hardening**: email verification + password reset (needs an email provider), or swap `session.ts` for Supabase/Auth.js; teacher/class roles with read-only class dashboards.
4. **Per-user FSRS optimisation** once ≥ ~1,000 reviews/user exist (fit weights from ReviewLog).
5. **Shared rate-limit store** (Redis/Upstash) and an object store for illustration/audio uploads.
6. Full Chinese UI toggle; recorded pronunciation audio; AI-assisted (clearly labelled, teacher-confirmed) feedback on written responses.
