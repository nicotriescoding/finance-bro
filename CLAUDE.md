# finance-bro

Business-administration exam trainer for TUM students, live at finance-bro.de. Next.js 16 (App
Router) · React 19 · Tailwind 4 · TypeScript · KaTeX, deployed on Vercel from
`main`. Optional extras (multiplayer, semester leaderboard) run on a Cloudflare
Worker in `worker/` - never on the read path.

**Session start:** read `SPEC.md` (product shape, feature status, the working
loop) and `BACKLOG.md` (open items, owed checks, handoff state). Keep both
current - they are how the next session starts warm. `BACKLOG.md` is a
handoff file, not a changelog: the session log lives in `git log`.

## Language

**Everything is English** - UI, question prompts, `given` labels, explanations,
subject and topic names, metadata, `lang="en"`, code, comments, commits, docs and
replies to Nico. Jokes are translated by meaning, not word-for-word. Numbers are
en-US (`1,234.56`); the question formatters share one constant, `LOCALE` in
`src/content/questions/_helpers.ts` (a few UI formatters still hardcode en-US -
see `BACKLOG.md`).

Stray German is a regression. `npm run smoke` catches a handful of German words
on `/`; everything else is on you and the reviewers. The two deliberate
exceptions are German statutory terms a question actually tests (`HGB`,
`§ 253 HGB`, `GmbH`, `beizulegender Wert`), which stay verbatim with an English
gloss in parentheses, and `source` values naming a real exam.

A German edition is planned **later, as a second locale** - not by translating
these files back. Until then keep every user-facing string going through the
helpers so the locale swap stays a small change.

No em dashes in shipped text - write `-`. Brand is spelled `FinanceBro`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on :3000 |
| `npm run check` | **the gate** - typecheck, question verification, build (with a dummy worker URL so the leaderboard's enabled branch is smoked), route smoke test |
| `npm run verify` | builds every question against 200 seeds; fails on NaN, Infinity, unfilled placeholders, unknown topics, duplicate ids, invalid KaTeX, hint leaks, coaching phrases in prompts (definitions/rules belong in `hint`), grading round-trip errors |
| `npm run smoke` | boots the production build and asserts the routes and copy that once broke (needs `build` first) |
| `npm run lint` | eslint (not part of the gate) |

`npm run check` must pass before you commit. Paste its output rather than
asserting that it passed.

## The loop (generator → gate → evaluators)

Per the harness-design pattern, the agent that builds never grades its own
work:

1. Build the change (for exams: the `add-exam-questions` skill).
2. Run the gate: `npm run check`.
3. Run the evaluator subagents that apply, over the diff. Each is
   deliberately skeptical and verdicts PASS/FAIL. Fix findings, re-run the
   gate, only then report done.
   - **`question-reviewer`** - any diff under `src/content/questions/`:
     recomputes answers, checks exam fidelity, units, TeX, language.
   - **`functionality-reviewer`** - any other code diff: hard rules, state
     and persistence, SSR/CSR seam, edge inputs, worker contract, smoke
     coverage, docs in sync.
   - **`design-reviewer`** - anything visible: layout, phone, dark mode,
     tokens, accessibility, states, copy tone, consistency with the 3a
     design language. Wants rendered screenshots, not JSX.
4. Commit, update `SPEC.md` status + `BACKLOG.md`. Nico pushes.

Anything visual additionally needs a human-visible check: `npm run dev`, open
the page in Chrome, **take a screenshot and look at it**. Never report a UI
change as done without having seen it. Check `/`, `/career`, `/leaderboard`
and a running quiz (`/career` → start → `/quiz`) at minimum, with the OS in
dark mode (Nico's machine) - that is where the last visual bug hid. A cloud
sandbox can take headless Chromium screenshots (`/opt/pw-browsers/chromium`,
Playwright, `colorScheme: "dark"`); it cannot see Nico's fonts or his real
Chrome, so list the real-Chrome look as owed in `BACKLOG.md` instead of
skipping it silently.

## Architecture

- `src/content/subjects.ts` - the 7 subjects and their topics. The topic
  ticks on `/career` are generated from this file.
- `src/content/questions/<subject>.ts` - one bank per subject, numeric-only
  (decision 2026-08-28). `_helpers.ts` has en-US formatting and the finance
  math (normal CDF, NPV, IRR, Macaulay duration). Finance, Econ 1, Econ 2 and
  Cost Accounting are ingested; Financial Accounting, Entrepreneurship and
  Marketing stay empty until their TUM past exams arrive.
- `src/lib/questions/` - `types.ts`, `rng.ts` (seeded), `engine.ts` (seed →
  concrete question), `grading.ts` (tolerance + locale-agnostic number parsing).
- `src/lib/session.ts` - the unlimited Semester-Marathon run (whole selected
  pool dealt once, write-offs re-queued with fresh seeds), persisted in
  localStorage. `src/lib/scoring.ts` - payout per posting; `src/lib/rankings.ts`
  - the 21-rank ladder, `LEVEL_COSTS`, endgame titles from the leaderboard.
- `src/components/career/CareerSetup.tsx` - subject + topic setup (`/career`).
  `src/components/quiz/` - `QuizClient` (runner + empty-bank state; redirects
  to `/career` when no run is stored), `QuestionCard`, `ProgressSegments`,
  `RichText` (renders `$…$` KaTeX in all question text; it still understands `**bold**`, but question strings carry no bold - the exam sheet has none, decision 2026-09-11).
- `src/components/account/` - balance pill/card, career track, activity
  ledger, PROMOTED overlay. `src/components/landing/AccountStatement.tsx` -
  the bank statement on `/`.
- `src/components/scoreboard/` + `src/lib/scoreboard/` - the semester
  leaderboard (`/leaderboard`); `shared.ts` is imported by the worker too.
- `src/components/multiplayer/` + `src/lib/multiplayer/` - the duels desk.
- `worker/` - Cloudflare Worker: Durable Object lobbies, D1 leaderboard, own
  README, `npm run typecheck` and `test/e2e.ts` there.
- `src/lib/ads.ts`, `analytics.ts`, `affiliate.ts`, `components/consent/` -
  AdSense units (paused + Consent Mode denied until a decision), PostHog
  (consent-gated), Amazon links, cookie banner (ads + analytics switches).
  `src/lib/legal.ts` + `src/app/terms` - DSA terms, name rules, report link.
  `docs/gdpr-records.md` - Art. 30 record + DPA checklist.

Rules for authoring questions live in `.claude/rules/questions.md` and load
automatically when you open a bank. The workflow for turning a past exam into
questions is the `add-exam-questions` skill.

## Hard rules

1. **No database on the read path.** Questions ship as TypeScript. A paused
   Supabase project used to leave the site stuck on "Loading..." forever.
   Leaderboard and multiplayer are optional extras with a real error state -
   never a precondition for the page rendering.
2. **Only TUM-derived content.** Every question traces to real TUM course
   material; exam questions carry `source` (internal, never rendered, and
  stripped from every site bundle by the loader in `next.config.ts`; the worker bundle keeps it server-side). Never
   invent questions from a syllabus - the invented seed banks were removed on
   2026-08-21 for good. The exam's own numbers and wording never enter the
   repo, not even as guards or comments.
3. **Prompt and answer come from one seed.** Generating them separately is
   exactly what produced wrong answers in the old version.
4. **Grade with `isWithinTolerance`**, never a `toFixed()` string comparison.
5. **Every numeric question declares a `unit`.** Percentages are percent
   numbers (8.24), not decimals (0.0824).
6. **Formulas are KaTeX in lecture notation.** `$…$` segments, `String.raw` for
   backslashes, currency outside math mode. No plain-text formula dumps.
7. **No unlayered colour or background rules in `globals.css`**, and no
   `prefers-color-scheme` override. A bare `body { background }` rule beats
   Tailwind's layered utilities and caused the dark-mode contrast bug. The
   one allowed bare rule is `:root { color-scheme: light }`. `npm run smoke`
   guards the media query.

## Git

This cloud environment has no GitHub credentials - **Nico pushes**. Commit with
a descriptive message and tell him. On Nico's Mac the remote is SSH; the HTTPS
remote resolves to the wrong GitHub account there and 403s. (A fresh cloud
clone over HTTPS is fine for reading and running the gate.)

## Gotchas

- Vercel still has `NEXT_PUBLIC_SUPABASE_*` env vars set. Nothing reads them.
- `src/app/tasks` is a legacy route that redirects to `/quiz?subject=finance`.
- `/quiz?subject=x` without a stored run client-redirects to `/career`; the
  server still renders the subject intro for crawlers.
- The Cowork sandbox cannot delete files under the mount and may leave stale
  `.git/*.lock` files. If git refuses to run:
  `rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock`.
  Files it cannot unlink go to `_to_delete/` (gitignored) - tell Nico.
- **Never run `npm install`, `npm ci` or `npm run check` from the Cowork
  sandbox against the mounted folder.** The sandbox is Linux; it swaps
  `node_modules/esbuild` for the Linux binary (Nico's Mac then fails with
  "installed esbuild for another platform") and `next build` cannot clear
  `.next/` there. Instead: run typecheck/verify/build/smoke in the cloud
  container on a fresh `git clone` (`npm ci` there), and only edit files and
  `git commit` through the mount (or `git am` a patch from the clone).
  Nico's part is `git push` - nothing else.
  If `node_modules` ever got clobbered: `rm -rf node_modules .next && npm ci`.
