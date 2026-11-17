# Content guide

Two ways to add content:

1. **Admin UI** (Content admin → Vocabulary / Questions / Subjects / Import) — edits the database directly.
2. **`.lex` files** in `content/subjects/` — the source for seed content; `npm run db:seed` upserts them (by ID), never touching student progress.

## CSV / JSON import (Admin → Import)

Download the template from Admin → Import or use `content/templates/vocabulary-import-template.csv`. Files are always validated first (dry run) and nothing is written until you confirm.

| Column | Required | Notes |
|---|---|---|
| subject | ✓ | slug (`ap-biology`), full name (`AP Biology`) or short name; `ALL AP COURSES` → AP Exam Language |
| term, zh, definition | ✓ | English term, Simplified Chinese translation, English definition |
| unit | | number; 0 or empty = not on the map. Units are created if missing (title from `unitTitle`) |
| topic, topicTitle | | mission code like `2.1`; created if missing. Empty → `<unit>.1` |
| zhExplanation, apExample, realWorld, writtenPrompt | | free text |
| difficulty | | 1–3 or Foundation / Intermediate / Advanced (default 2) |
| tags, related, confusedWith | | separated by `;` (related/confused are English terms in the same subject) |
| misconceptions | | separated by `;` or `\|\|` |
| visual | | diagram kind (below) or JSON `{"kind":"supply-demand","variant":"ceiling"}` |
| imageUrl, audioUrl | | http(s) URLs only |
| pronunciation, category, priority, source | | |
| reviewStatus | | draft / teacher review (default) / approved / needs fix |
| status | | draft (default) / published |
| id | | stable external ID. A row whose id already exists updates that term |

Column headers from the master spreadsheet (`English Term`, `中文翻译`, `English Definition`, `中文概念解释`, `Course`, `ID`, `Original Practice Prompt`, …) are recognised automatically. JSON: an array of objects with the same keys, or `{ "terms": [...] }`.

**Duplicates**: same subject + same English term (case/punctuation-insensitive). Duplicates inside a file are ignored after the first; duplicates of existing terms are skipped or updated per your choice.

## `.lex` authoring format

```
@subject ap-biology | AP Biology | AP 生物 | Bio | green | 2      # slug | name | 中文 | short | theme | order
@desc One-line description
@framework Note about framework alignment
@unit 2 | Cell Structure and Function | 细胞结构与功能
@topic 2.2 | Membranes and Transport | 细胞膜与物质运输 | Objective one; Objective two
- osmosis | 渗透作用 | Definition | 中文解释 | AP example | 2 | #03-008      # term | zh | definition | zhExplanation | example | difficulty | #id
  mis: A misconception (repeatable)
  real: Real-world application
  rel: diffusion; tonicity
  vs: diffusion                  # easily confused with
  vis: membrane osmosis          # diagram kind + optional variant
  ipa: /ɒzˈməʊsɪs/
  tags: cells; water
  wp: Written-response prompt
  cat: Category
```

Fields are separated by ` | ` (space-pipe-space), so `|x|` in math is safe; use `∣` inside set-builder notation.

Questions (all are original practice items):

```
@q bio-u2-001 | APPLY | APPLICATION | SCENARIO | 2 | 2 | osmosis; tonicity   # id | stage | skill | type | unit | difficulty | terms
> Optional passage
? Prompt
?zh Optional Chinese support (must not reveal the answer)
= Wrong option :: why it is wrong
=* Correct option :: why it is right
! English explanation
!zh 中文解析
vis: membrane osmosis
r: rubric criterion (WRITTEN)      a: accepted|answers (CLOZE)
```

Confusion pairs:

```
@pair osmosis-vs-diffusion | osmosis | diffusion
! Key difference      !zh 中文
d: Aspect :: A text :: B text
s: A :: Scenario text :: why
```

Run `npm run content:check` (add `--verbose` for warnings) before seeding.

## Diagram kinds

`supply-demand` (variants: `demand-right`, `supply-right`, `ceiling`, `floor`, `surplus`, `ad-as`), `ppc`, `cost-curves`, `mr-mc`, `monopoly`, `externality`, `elasticity`, `membrane` (`diffusion`, `osmosis`, `active`), `enzyme`, `central-dogma` (`transcription`, `translation`), `cell-division` (`mitosis`, `meiosis`), `feedback` (`negative`, `positive`), `logistic`, `trophic`, `vector`, `free-body`, `motion-graph` (`xt`, `vt`), `spring`, `pendulum`, `curve` (`limit`, `tangent`, `area`, `concavity`, `secant`, `sine`), `riemann`, `normal`, `scatter`.

## Editorial notes on the source files

- **Master spreadsheet**: all 385 IDs are preserved. Its `中文概念解释` column was template text ("核心中文释义：…建议结合课程实例学习"); every term now has a written explanation. Its Difficulty/Priority columns followed a repeating pattern rather than term difficulty, so difficulty was reassigned. Its generic "Core Concepts · Map Starter" topic was replaced by real unit/mission placement.
- **Translation corrections**: `marginal benefit` 边际收益 → **边际效益** (边际收益 is kept for `marginal revenue`, avoiding a clash); `normal force` 支持力 → **法向力（支持力）**.
- **Physics 1 notes**: some term names were stored as styled runs and didn't extract (e.g. "Scalars vs. ___"); they were reconstructed from context (vectors, free fall, inertia, free-body diagram, uniform circular motion, work, kinetic energy, momentum, conservation of momentum, torque, static equilibrium, rotational kinematics, angular momentum, SHM, Bernoulli's principle). Definitions were condensed and paraphrased.
- **Precalc sheet**: Chinese kept exactly as supplied; English definitions added. "point of inflection" had no Chinese pair in the sheet and is covered by "inflection point". Note the sheet's 自然数（含0）: US textbooks often exclude 0 — flagged as a misconception on that card. Concave up/down Chinese terminology varies by textbook — also flagged.
- The BC notes asked for "words for math terms in Precalculus, Geometry and algebra like perpendicular, bisector, connection words like derive": added as AP Precalculus Unit 4 *Geometry and Algebra Language*.
- Unit titles reference public AP course frameworks; placement of individual terms is editorial and should be checked against current CEDs.
