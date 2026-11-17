# Review scheduling, mastery and rewards

Source: `src/lib/engine/` (pure functions, unit-tested in `tests/unit`).

## FSRS-4.5 (`fsrs.ts`)

One memory card per **user × term**. Every graded attempt on any question linked to the term updates it.

- Retrievability `R(t,S) = (1 + 19/81 · t/S)^-0.5`; `R(S,S) = 0.9`.
- Interval for desired retention r: `I = S/(19/81) · (r^(1/-0.5) − 1)`, clamped to [1, 365] days. Default r = 0.9, so `I ≈ S`.
- Initial stability `S0 = w[G−1]`, initial difficulty `D0 = w4 − (G−3)·w5`, difficulty update with mean reversion `w7`, success/lapse stability formulas `w8…w16` — exactly as published by the open-spaced-repetition project.
- Weights: FSRS-4.5 defaults `[0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755]`.
- **AP Lexicon additions** (not part of FSRS): a 10-minute learning step after *Again* (and 15 min after *Hard* while learning) so mistakes return within the same session; same-day re-study multiplies stability by 1 / 1 / 1.2 / 1.5 for ratings 1–4 instead of using the day-scale formula.

**Validity:** the default weights were fitted on large general flashcard datasets. They are *not* validated for AP vocabulary or for this student population, and nothing in the app claims they are. Every review is logged (`ReviewLog`: rating, elapsed days, scheduled days, stability after) so weights can be fitted later.

### Rating from an answer (`grading.ts`)

| Outcome | Rating |
|---|---|
| Wrong | 1 Again |
| Correct but > 2× expected time | 2 Hard |
| Correct | 3 Good |
| Correct in < 35% of expected time | 4 Easy |
| Written self-assessment < 50% / < 75% / ≥ 75% of rubric | 1 / 2 / 3 |

Using a Chinese hint **does not** change the rating.

## Three-dimensional mastery (`mastery.ts`)

Skill → dimension: TRANSLATION → recognition, CONCEPT → concept, APPLICATION → application. Each dimension is an exponentially weighted average of outcomes (running mean for the first three attempts, then α = 0.35).

| Status | Rule |
|---|---|
| Not started | no attempts and not studied |
| Learning | studied in Discover, or attempted |
| Practicing | ≥ 2 attempts and recognition ≥ 0.6 |
| Mastered | all three dimensions ≥ 0.8 **and** ≥ 2 attempts each **and** ≥ 1 correct application answer given English-only without hints (self-assessed written answers don't count) |

Mastery score (0–100) = 25% recognition + 35% concept + 40% application, each discounted until it has 2 attempts. These thresholds are product decisions, not validated cut scores.

Which items count as which skill: EN↔中文 MCQ and timed match → TRANSLATION; definition↔term and Confusion Lab scenarios → CONCEPT; AP-context cloze, authored Apply/Master items, unit challenges, written responses → APPLICATION (authored items carry their own skill).

## Error categories

Wrong answers are classified as **CONFUSION** when the chosen option is a term listed as `confused` with the correct term; otherwise the error type is the question's skill (translation / concept / application). Confusion errors drive Confusion Lab recommendations.

## Daily review queue (`services/learning.ts → reviewQueue`)

1. Cards with `due ≤ now` (and at least one review), priority = elapsed/stability + 0.5·(1 − score/100) + 0.5 if the subject has an active study goal.
2. If fewer than 8 are due, fill with the weakest Learning/Practicing terms (lowest score, oldest review).
3. Each item is presented at the stage of its weakest dimension (Recognize / Understand / Apply; Master for already-mastered terms), preferring authored items for concept/application.

## Map unlocks

The first mission of each region is always open. A later mission unlocks when the previous one reaches **Practicing** (≥ 60% of its terms Practicing or Mastered). The unit challenge unlocks when every mission in the region is Practicing or better.

## XP, streaks, achievements (`gamification.ts`, `achievements.ts`)

- XP per correct answer: Recognize 4, Understand 7, Apply 10, Master 14; ×1.5 if the card was due; 100% / 50% / 25% / 0% for the 1st–4th correct answer on the same term that day; +25 when a term becomes Mastered; wrong answers earn 1 (effort). Match rounds: 2/match (max 30). Lab drill: 6–16.
- Level L requires `120·(L−1)^1.6` total XP.
- A day counts toward the streak with ≥ 5 graded answers. Every 7 consecutive days banks a rest day (max 2) that covers a missed day automatically. Today never breaks a streak until it is over.
- Achievements and the weekly challenge are evaluated from stored data only.
