# finance-bro

BWL-Klausurtrainer, live at finance-bro.de. Next.js 16 (App Router) · React 19 ·
Tailwind 4 · TypeScript, deployed on Vercel from `main`.

UI text and all question content is **German**. Code, comments, commit messages
and anything you write to Nico are English.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on :3000 |
| `npm run check` | **the gate** — typecheck, question verification, build, route smoke test |
| `npm run verify` | builds every question against 200 seeds; fails on NaN, Infinity, unfilled placeholders, unknown topics, duplicate ids |
| `npm run smoke` | boots the production build and asserts every route (needs `build` first) |

`npm run check` must pass before you commit. Paste its output rather than
asserting that it passed.

## Verify before claiming done

Logic or content change → `npm run check`.

Anything visual → `npm run dev`, open the page in Chrome, **take a screenshot and
look at it**. Never report a UI change as done without having seen it. Check `/`
and `/quiz?subject=finance` at minimum. Nico's machine is in dark mode, so
confirm contrast there specifically — that is where the last visual bug hid.

After adding or editing questions, run the `question-reviewer` subagent over the
diff and fix what it flags before reporting done.

## Architecture

- `src/content/subjects.ts` — the 7 subjects and their topics. The topic
  checkboxes in the quiz are generated from this file.
- `src/content/questions/<subject>.ts` — one bank per subject. `_helpers.ts` has
  de-DE formatting and the finance math (normal CDF, NPV, IRR, Macaulay duration).
- `src/lib/questions/` — `types.ts`, `rng.ts` (seeded), `engine.ts` (seed →
  concrete question), `grading.ts` (tolerance + German number parsing).
- `src/components/quiz/` — `QuizClient` (setup + runner), `TopicSelector`,
  `QuestionCard`.

Rules for authoring questions live in `.claude/rules/questions.md` and load
automatically when you open a bank. The workflow for turning a past exam into
questions is the `add-exam-questions` skill.

## Hard rules

1. **No database on the read path.** Questions ship as TypeScript. A paused
   Supabase project used to leave the site stuck on "Loading..." forever.
   Highscores or multiplayer may only be added as optional extras with a real
   error state — never as a precondition for the page rendering.
2. **Prompt and answer come from one seed.** Generating them separately is
   exactly what produced wrong answers in the old version.
3. **Grade with `isWithinTolerance`**, never a `toFixed()` string comparison.
4. **Every numeric question declares a `unit`.** Percentages are percent numbers
   (8.24), not decimals (0.0824).
5. **No unlayered CSS in `globals.css`.** A bare `body { background }` rule beats
   Tailwind's layered utilities and caused the dark-mode contrast bug. `npm run
   smoke` guards this.

## Git

This environment has no GitHub credentials — **Nico pushes**. Commit with a
descriptive message and tell him. The remote is SSH; the HTTPS remote resolves to
the wrong GitHub account and 403s.

## Gotchas

- Vercel still has `NEXT_PUBLIC_SUPABASE_*` env vars set. Nothing reads them.
- `src/app/tasks` is a legacy route that redirects to `/quiz?subject=finance`.
- The non-Finance banks are seed content, to be replaced by questions from Nico's
  past exams. Exam-derived questions carry a `source` field.
