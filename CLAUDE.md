# finance-bro

Business-administration exam trainer for TUM students, live at finance-bro.de. Next.js 16 (App
Router) · React 19 · Tailwind 4 · TypeScript · KaTeX, deployed on Vercel from
`main`.

**Session start:** read `SPEC.md` (product shape, feature status, the working
loop) and `BACKLOG.md` (open decisions, handoff state). Keep both current — they
are how the next session starts warm.

## Language

**Everything is English** — UI, question prompts, `given` labels, explanations,
subject and topic names, metadata, `lang="en"`, code, comments, commits, docs and
replies to Nico. Jokes are translated by meaning, not word-for-word. Numbers are
en-US (`1,234.56`); the locale lives in one constant, `LOCALE` in
`src/content/questions/_helpers.ts`.

Stray German is a regression — `npm run smoke` fails the build on it. The two
deliberate exceptions are German statutory terms a question actually tests (`HGB`,
`§ 253 HGB`, `GmbH`, `beizulegender Wert`), which stay verbatim with an English
gloss in parentheses, and `source` values naming a real exam.

A German edition is planned **later, as a second locale** — not by translating
these files back. Until then keep every user-facing string going through the
helpers so the locale swap stays a one-line change.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on :3000 |
| `npm run check` | **the gate** — typecheck, question verification, build, route smoke test |
| `npm run verify` | builds every question against 200 seeds; fails on NaN, Infinity, unfilled placeholders, unknown topics, duplicate ids, invalid KaTeX, grading round-trip errors |
| `npm run smoke` | boots the production build and asserts every route (needs `build` first) |

`npm run check` must pass before you commit. Paste its output rather than
asserting that it passed.

## The loop (generator → gate → evaluator)

Per the harness-design pattern, the agent that writes questions never grades its
own work:

1. Build the change (for exams: the `add-exam-questions` skill).
2. Run the gate: `npm run check`.
3. Run the **`question-reviewer` subagent** over the question diff — it is
   deliberately skeptical and verdicts PASS/FAIL per question. Fix findings,
   re-run the gate, only then report done.
4. Commit, update `SPEC.md` status + `BACKLOG.md`. Nico pushes.

Anything visual additionally needs a human-visible check: `npm run dev`, open
the page in Chrome, **take a screenshot and look at it**. Never report a UI
change as done without having seen it. Check `/` and `/quiz?subject=finance` at
minimum, in dark mode (Nico's machine) — that is where the last visual bug hid.
A Cowork sandbox cannot take this screenshot; say so and hand the check to Nico
instead of skipping it silently.

## Architecture

- `src/content/subjects.ts` — the 7 subjects and their topics. The topic
  checkboxes in the quiz are generated from this file.
- `src/content/questions/<subject>.ts` — one bank per subject. `_helpers.ts` has
  en-US formatting and the finance math (normal CDF, NPV, IRR, Macaulay
  duration). The six non-Finance banks are intentionally empty until their TUM
  past exams are ingested.
- `src/lib/questions/` — `types.ts`, `rng.ts` (seeded), `engine.ts` (seed →
  concrete question), `grading.ts` (tolerance + locale-agnostic number parsing).
- `src/components/quiz/` — `QuizClient` (setup + runner + empty-bank state),
  `TopicSelector`, `QuestionCard`, `RichText` (renders `$…$` KaTeX and
  `**bold**` in all question text).

Rules for authoring questions live in `.claude/rules/questions.md` and load
automatically when you open a bank. The workflow for turning a past exam into
questions is the `add-exam-questions` skill.

## Hard rules

1. **No database on the read path.** Questions ship as TypeScript. A paused
   Supabase project used to leave the site stuck on "Loading..." forever.
   Highscores or multiplayer may only be added as optional extras with a real
   error state — never as a precondition for the page rendering.
2. **Only TUM-derived content.** Every question traces to real TUM course
   material; exam questions carry `source`. Never invent questions from a
   syllabus — the invented seed banks were removed on 2026-08-21 for good.
3. **Prompt and answer come from one seed.** Generating them separately is
   exactly what produced wrong answers in the old version.
4. **Grade with `isWithinTolerance`**, never a `toFixed()` string comparison.
5. **Every numeric question declares a `unit`.** Percentages are percent numbers
   (8.24), not decimals (0.0824).
6. **Formulas are KaTeX in lecture notation.** `$…$` segments, `String.raw` for
   backslashes, currency outside math mode. No plain-text formula dumps.
7. **No unlayered CSS in `globals.css`.** A bare `body { background }` rule beats
   Tailwind's layered utilities and caused the dark-mode contrast bug. `npm run
   smoke` guards this.

## Git

This environment has no GitHub credentials — **Nico pushes**. Commit with a
descriptive message and tell him. The remote is SSH; the HTTPS remote resolves to
the wrong GitHub account and 403s.

## Gotchas

- Vercel still has `NEXT_PUBLIC_SUPABASE_*` env vars set. Nothing reads them.
- `src/app/tasks` is a legacy route that redirects to `/quiz?subject=finance`.
- The Cowork sandbox cannot delete files under the mount and may leave stale
  `.git/*.lock` files. If git refuses to run:
  `rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock`.
