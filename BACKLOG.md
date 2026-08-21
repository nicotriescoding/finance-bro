# Backlog

Open work and decisions, most useful first. Keep this current — it is how a new
session picks up where the last one stopped. The durable product shape and
feature status live in `SPEC.md`.

## Where things stand

97 questions, all Finance, all built from Nico's TUM course material (IVF
formula catalogue + the original app's data). The six non-Finance banks are
**intentionally empty** since 2026-08-21: their syllabus-invented seed questions
(78) were removed — per Nico, only content based on real TUM exams may ship.
Their invented topic lists went too; topics come back with the exams. Empty
subjects show a "being rebuilt from real TUM exams" state, guarded by smoke.

Formulas now render as KaTeX in lecture notation everywhere (prompts, given
table, choices, explanations) via `RichText`; `npm run verify` compiles every
`$…$` segment. The plain-text formula dumps (`C·((g/q)^N−1)/(g−q)`) are gone.

`npm run check` is green and runs in CI. **Nico has not pushed yet** — local
`main` is ahead of origin (this session's commit plus `b63216f`, `87fbeb6`,
`9fe74a0`, `9bc1525`).

## Next up

- **Ingest TUM MC past exams.** Nico has them and uploads them after the
  styling setup. Use the `add-exam-questions` skill (translates as it goes,
  KaTeX per the rules, every question gets `source`). This refills Econ 1,
  Econ 2, Financial Accounting, Cost Accounting, Entrepreneurship, Marketing —
  and can add `source` tags to Finance questions that match real exam tasks.
- **Redesign.** `DESIGN-BRIEF.md` holds a ready-to-paste prompt for five design
  directions. Binding constraint: ad + question + score on one screen; the
  phone view must place the ad without interfering with answering. Nothing has
  been designed yet — the brief is the whole state.
- **Update the Cowork project instructions.** Nico's Claude project settings
  still carry the old German paste; the current English text lives in
  `.claude/cowork-project-instructions.md` and should replace it.

## Open decisions

- **German edition.** Planned as a **second locale**, not a revert. Display
  formatting is one constant (`LOCALE` in `_helpers.ts`); the real work is the
  question text (parallel bank vs. translation layer) plus routing (`/de/…` vs.
  subdomain) and `hreflang`.
- **SEO after the language switch.** finance-bro.de serves English metadata to
  an audience that searches in German. Watch Search Console; the German locale
  above is the fix, not reverting.
- **Where highscores live.** `localStorage` only; leaderboard and multiplayer
  pages are stubs. Any backend must stay off the read path (CLAUDE.md rule 1).

## Known gaps

- KaTeX rendering has not been **seen** yet — the sandbox cannot screenshot.
  First `npm run dev` on Nico's machine: check a Finance explanation and the
  given-table symbols on `/quiz?subject=finance`, in dark mode.
- `/multiplayer` and `/language` are placeholder joke pages from the original
  build. `/products` still has `via.placeholder.com` images and dead affiliate
  links (SPEC #16).
- `AdSlot` renders a grey box; no ad integration. The redesign decides what
  goes in it before wiring a network.
- `fin-bond-modified-duration` asks for a signed percentage price change, so a
  student typing `7.19` instead of `-7.19` fails. Either reword to "by how much
  does it fall" or say "state the sign".
- No automated visual regression test. A Cowork session **cannot** take the
  screenshot itself (aarch64 sandbox, no Chrome, dev server not reachable from
  Nico's browser). Visual checks happen on Nico's machine.
- The sandbox cannot delete files under the mount; if git refuses to run:
  `rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock`.

## Done

- **TUM-only content policy enforced** (2026-08-21): 78 syllabus-invented
  questions across 6 subjects removed, banks stubbed with provenance comments,
  invented topics stripped, empty-state UI added, policy written into
  CLAUDE.md hard rule 2 and `.claude/rules/questions.md`.
- **KaTeX everywhere** (2026-08-21): `RichText` renders `$…$` + `**bold**`;
  all 97 Finance explanations rewritten to symbolic lecture formula →
  substituted values → result; symbol tokens in prompts/given wrapped as math;
  `verify` compiles every segment and strips math before the placeholder check.
- **Harness alignment** (2026-08-21): `SPEC.md` added as the session-handoff
  artifact (product, loop, feature table); `question-reviewer` sharpened into
  a skeptical PASS/FAIL evaluator; loop documented in CLAUDE.md.
- **Site is English end to end** — UI, questions, subject names, metadata,
  docs, agent context; jokes carried over by meaning (rank ladder, placeholder
  pages). Only glossed statutory terms and `source` values stay German.
  `npm run smoke` fails the build on stray German.
- **Number parsing** accepts both conventions and U+2212; `npm run verify`
  round-trips every displayed answer through the grader.
- **Formula-sheet ingest**: 54 questions seeded from the TUM IVF formula
  catalogue (`ivfall_rows.csv`), including the corrected
  `geom_growing_PV_immediate_neq` row (the sheet's trailing `· q` belongs to
  the annuity-due variant; verified against a brute-force cash-flow sum).
- **CI** runs `npm run check` on every push and PR to `main`.
- Question bank moved off Supabase into typed TypeScript; seeded engine;
  tolerance grading with units; taxonomy with per-topic filters; rebrand plus
  search/social metadata; dark-mode contrast bug fixed with a smoke guard.
