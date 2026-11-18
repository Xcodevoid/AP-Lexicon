# AP Lexicon

**Understand the concept. Master the language. Conquer the AP exam.**

A bilingual (English · 简体中文) AP vocabulary mastery platform for Chinese-speaking high school students. Students move through an interactive **Mastery Map** per AP subject; each mission takes a set of terms through five stages (Discover → Recognize → Understand → Apply → Master), and mastery is tracked separately for **translation recognition**, **English concept understanding** and **AP application**.

> AP® is a trademark of the College Board, which is not affiliated with and does not endorse this product. All definitions, examples and practice questions are original sample content pending teacher review. No official College Board questions are included or imitated.

---

## Mac desktop app

A double-click macOS app (Electron + built-in PostgreSQL, works offline) can be built with `scripts/build-desktop.sh arm64` (Apple Silicon) or `x64` (Intel). See [`desktop/README.md`](desktop/README.md) for installing and building.

## Quick start (local)

Requirements: Node 20+ (tested on 22), PostgreSQL 14+ (tested on 16).

```bash
npm install
```

```bash
cp .env.example .env    # then edit DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
```

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed         # compiles content/subjects/*.lex and imports it; creates the admin account
```

```bash
npm run dev             # http://localhost:3000
```

On the landing page choose **Try the demo** (isolated demo student, no password) or **Create account**. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` to reach **Content admin**.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` / `npm run build && npm start` | Dev server / production server |
| `npm test` | 40 unit tests: FSRS scheduler, mastery scoring, grading, gamification, import validation, authorization, question generation, decoder |
| `npm run test:e2e` | 7 Playwright journeys (including all five games) against a production build (needs a seeded DB and `.env` loaded; see below) |
| `npm run typecheck` | TypeScript check |
| `npm run content:check` | Validate all `.lex` content files (errors fail; `--verbose` lists warnings) |
| `npm run content:build` | Write `content/build/bundle.json` |
| `npm run content:check-repeats` | Build every mission × stage session and confirm no question or word repeats |
| `npm run db:seed` | Re-import content (idempotent upsert; never touches student progress) |
| `npm run demo:purge [hours]` | Delete demo accounts older than N hours (default 24) |

Running E2E: `npm run build`, then `set -a; . ./.env; set +a; npm run test:e2e`. The admin-import test signs in with `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Playwright uses the pre-installed Chromium (the mobile project emulates an iPhone 13 in Chromium).

---

## What is implemented

**Core loop (complete):** Mastery Map → select mission → bilingual cards → practice → server-graded feedback → FSRS + 3-D mastery update → map node status and unlocks update → return to map.

- **Mastery Maps** for 17 subjects (16 AP courses + Math & Science Foundations). Each unit is a region with connected mission nodes, a progress path, unlock rules and a unit-challenge citadel. Nodes show *mastery* (ring = share of terms Practicing/Mastered; gold = all Mastered), not completion. First mission of every region is open (classes move in different orders); later missions unlock when the previous one reaches Practicing (≥60% of terms Practicing or better). Unlock and mastery celebrations.
- **Bilingual term cards**: English term, Chinese, English definition and 中文概念解释 side by side, AP example, real-world use, misconceptions, related / easily-confused terms, diagram, pronunciation (recorded audio URL if provided, otherwise browser speech synthesis), bookmark, flip-to-self-test.
- **Five stages**: Discover; Recognize (EN↔中文 MCQs + 60-second timed match with personal bests); Understand (definition↔term, authored scenarios); Apply (AP-context cloze, authored graph/passage/MCQ items); Master (English-only typed cloze + written response with rubric self-assessment). Immediate feedback with per-option rationales and 中文解析; **unit challenges** use delayed (assessment-style) feedback, 8-minute timer, English only.
- **Adaptive engine**: FSRS-4.5 scheduler with persistent review logs; daily review queue (overdue first, then weak concepts, goal-subject boost); each review targets the student's weakest dimension. Errors classified as translation / concept / application / confusion-with-related-term.
- **Three-dimensional mastery** computed only from graded answers (viewing a card is never evidence). Mastered requires all three dimensions ≥ 0.8 with ≥ 2 attempts each and ≥ 1 correct English-only, no-hint application answer — so repeatedly choosing the right translation cannot reach Mastered (unit-tested).
- **Games** (Games menu, or "Play games" on any map; work for every course): **Lightning Round** (60 s definition → word, streak multipliers), **Connections** (find 4 hidden groups of 4; XP only), **Sort It** (sort scenarios between look-alike concepts), **Spell It** (definition → type the English word), **Boss Battle** (AP-style questions, 3 hearts). Answers are graded on the server and count toward mastery (except Connections); personal bests are capped by answers actually recorded.
- **No repeats**: each practice session, review and Boss Battle asks a word at most once, replays get a fresh mix, and words sharing a Chinese translation are never asked Chinese → English.
- **Bilingual Bridge**: Full / Balanced / Exam modes (switchable in the top bar). Hint use is logged per answer and shown as a weekly trend; it never lowers scores or ratings.
- **Confusion Lab**: 40 comparison pairs with key difference (EN/中文), comparison table, diagram and a server-graded scenario-sorting drill. Pairs are recommended from the student's own confusion errors.
- **Question Decoder**: deterministic highlighting of academic terms, command verbs, connectors and wording traps; skill detection; guided plan; optional attempt of a practice item (answer revealed only after submitting). Optional server-side AI explanation (see below).
- **Notebook**: studied / bookmarked / mistakes / notes tabs, personal collections, search (own terms or all vocabulary), filters (subject, mastery, difficulty), editable notes, CSV/JSON export.
- **Dashboard & analytics**: today's mission (recommended from real state), due count, mastery status counts, weekly challenge, 7-day activity, recognition vs application, subject progress, weakest concepts, study goals; Progress page with 12-week heatmap, hint trend, error breakdown, per-subject dimensions, personal bests. **No fabricated numbers** — every value is computed from stored activity.
- **Gamification**: XP weighted by stage and due-ness with diminishing returns for grinding; levels; subject ranks; streaks with earned rest days (non-punitive); 16 achievements evaluated from real stats with original badge art; deterministic weekly challenges; opt-in, alias-only weekly leaderboard (demo accounts excluded).
- **Content management**: subjects/units/missions, term editor (all fields, diagram picker, image URL, relations), bulk publish/unpublish and review status, question editor (options + distractor rationales, cloze, written rubric, linked terms), CSV/JSON import with dry run, row-level errors, duplicate detection (in file and against the DB) and skip/update policy, import history. Draft vs published content.
- **Platform**: email/password auth (scrypt, httpOnly session cookie, server-side sessions), demo mode, server-side authorization on every API route, origin checks on mutations, Zod input validation, in-memory rate limiting, security headers, light/dark mode, reduced-motion support, keyboard shortcuts, visible focus, screen-reader labels, responsive layouts (verified without horizontal overflow at iPhone width).

## Content

| Subject | Units | Terms | Original questions | Confusion pairs |
|---|---|---|---|---|
| AP Exam Language (command verbs, connectors, reasoning) | 3 | 97 | 3 | 4 |
| AP Microeconomics | 6 | 80 | 17 | 4 |
| AP Macroeconomics | 6 | 42 | 3 | 2 |
| AP Biology | 8 | 81 | 14 | 4 |
| AP Chemistry | 9 | 52 | 3 | 2 |
| AP Physics 1 | 8 | 70 | 11 | 3 |
| AP Physics C (Mech + E&M) | 13 | 40 | 2 | 1 |
| AP Calculus AB | 8 | 43 | 4 | 2 |
| AP Calculus BC | 10 | 44 | 3 | 2 |
| AP Precalculus | 5 | 192 | 4 | 3 |
| AP World History: Modern | 10 | 59 | 10 | 3 |
| AP U.S. History | 9 | 39 | 2 | 1 |
| AP Psychology | 6 | 37 | 2 | 2 |
| AP Statistics | 9 | 46 | 2 | 3 |
| AP Computer Science A | 4 | 42 | 2 | 2 |
| AP Computer Science Principles | 5 | 37 | 2 | 2 |
| Math & Science Foundations (everyday words used across AP math/science) | 6 | 155 | 4 | 4 |
| **Total** | | **1,157** | **88** | **44** |

Sources: all 385 IDs from `AP_Lexicon_Bilingual_Vocabulary_Master.xlsx` are mapped (checked by `npm run content:check` and a unit test); AP Physics 1 is organised from the uploaded Physics 1 notes; Calculus BC from the BC notes; AP Precalculus includes all 160 EN/中文 pairs from the Precalc Numbers sheet (Chinese kept as supplied, definitions added); the rest is AP Lexicon research expansion. Every term also gets auto-generated recognition/concept/cloze practice, so every mission is playable even where few authored questions exist. See [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) for editorial notes and corrections made to the master sheet.

## What requires credentials

| Feature | Needs | Without it |
|---|---|---|
| Everything core | PostgreSQL + `SESSION_SECRET` | — |
| Admin access | `ADMIN_EMAIL`, `ADMIN_PASSWORD` at seed time | No admin account |
| AI wording explanation in the Decoder | `ANTHROPIC_API_KEY` (server-side only; model from `ANTHROPIC_MODEL`, default `claude-opus-5-5`, with server-side refusal fallback enabled) | Button shows "Not configured"; deterministic decoder works fully |

## What remains incomplete / known limitations

- **Content review**: all content is labelled *pending teacher review*. Chinese explanations were written by AP Lexicon and need a bilingual teacher pass; some subjects (APUSH, Psych, CSA, CSP, Stats, Physics C) have only 2–4 authored questions — practice there relies more on auto-generated items. 118 "related term" links point to terms not yet in the database and are skipped (`npm run content:check --verbose` lists them).
- **Written responses** are self-assessed against a rubric. There is no automatic grading, and the app does not claim AP-level scoring.
- **Scheduler parameters** are FSRS-4.5 defaults, not fitted to this population (see `docs/SCHEDULER.md`). Per-user parameter optimisation is not implemented.
- **Auth**: no email verification, password reset, OAuth/SSO, or teacher/class roles yet.
- **Rate limiting** is in-memory (single instance). Use a shared store for multi-instance deployments.
- **Uploads**: illustrations are attached by URL; there is no file-upload storage.
- **Audio** uses browser speech synthesis unless an `audioUrl` is provided; no recorded audio ships.
- **i18n**: interface chrome is English with Chinese labels; there is no full Chinese UI toggle.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the continuation plan.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack, data model, request flow, security, continuation plan
- [`docs/SCHEDULER.md`](docs/SCHEDULER.md) — FSRS parameters, mastery rules, review-queue logic, XP rules
- [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) — `.lex` authoring format, CSV/JSON import fields, diagrams, editorial notes
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — production deployment
- [`content/templates/vocabulary-import-template.csv`](content/templates/vocabulary-import-template.csv) — import template
