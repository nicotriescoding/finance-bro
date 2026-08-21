# Backlog

Open work and decisions, most useful first. Keep this current — it is how a new
session picks up where the last one stopped.

## Where things stand

175 questions across 7 subjects (Finance 97, Econ 1 12, Econ 2 12, Financial
Accounting 13, Cost Accounting 12, Entrepreneurship 14, Marketing 15). The site is
English end to end. `npm run check` is green and now also runs in CI on every push
to `main`. Last three commits: English UI chrome → full English translation →
formula-sheet ingest plus CI.

**Nico has not pushed yet.** Three commits sit on local `main`: `b63216f`,
`87fbeb6`, `9fe74a0`.

## Next up

- **Redesign.** `DESIGN-BRIEF.md` holds a ready-to-paste prompt for Claude asking
  for five different design directions. The binding constraint: on a question page
  the ad, the question and the score must all be present, and the phone view must
  place the ad without it interfering with answering. The level/rank may be dropped
  on mobile. Nothing has been designed yet — the brief is the whole state.
- **Ingest past exams.** Nico supplies Altklausuren for the six non-Finance
  subjects. Use the `add-exam-questions` skill, which translates as it goes. Those
  six banks are seed content written from the syllabus, not from real exams —
  expect to replace rather than extend. Finance is now well covered and does not
  need this.
- **Coverage is lopsided.** Finance has 97 questions, every other subject has 12–15.
  That is the biggest content gap.

## Open decisions

- **German edition.** Planned as a **second locale**, not a revert. Display
  formatting is already one constant (`LOCALE` in `_helpers.ts`) and every number on
  screen goes through the helpers, so number formatting is a one-line switch. The
  question text is the real work: a parallel bank or a translation layer, plus a
  routing decision (`/de/…` vs. subdomain) and `hreflang`.
- **SEO after the switch.** finance-bro.de now serves English metadata, keywords and
  `lang="en"` to an audience that searches in German. Expect German impressions to
  fall. Watch Search Console. The German locale above is the fix, not reverting.
- **Multiple-choice mode for Finance.** All 97 Finance questions are free-text
  numeric; TUM exams are multiple choice. Either generate distractors from the
  classic traps (wrong formula, inverted sign, percent-vs-decimal, ordinary-annuity
  vs annuity-due) and offer both modes, or leave calculations as free text. Not
  decided.
- **Where highscores live.** `localStorage` only, so scores are per-browser and the
  leaderboard and multiplayer pages are stubs. Any backend must not sit on the read
  path (CLAUDE.md rule 1).
- **Rest of the agent harness.** Considered and deliberately skipped: `init.sh` plus
  a session-start ritual, a `features.json` spec file, a `verify-ui` skill. They pay
  off for long unattended runs, which is not how this project is being built. CI was
  the one piece with a live failure mode and it is now in. Revisit only if sessions
  start running unattended.

## Known gaps

- `/multiplayer` and `/language` are placeholder pages from the original build.
- `/products` still has `via.placeholder.com` images and dead affiliate links.
- `AdSlot` renders a grey box; no ad integration. The redesign should decide what
  actually goes in it before wiring a network.
- `mk-research-primary` asks about *secondary* research and `mk-pricing-breakeven`
  is a cost-plus question, not break-even. Ids only — invisible to students, but
  they will mislead a future editor.
- `fin-bond-modified-duration` asks for a signed percentage price change, so a
  student typing `7.19` instead of `-7.19` fails. Pre-existing, inherited from the
  German original. Either reword to "by how much does it fall" or say "state the
  sign".
- No automated visual regression test. A Cowork session **cannot** take the
  screenshot itself: its Linux sandbox is aarch64 with no Chrome build, and its dev
  server is not reachable from the browser on Nico's machine. Visual checks have to
  happen on Nico's machine.
- The sandbox also cannot delete files under the mount, so a Cowork session may
  leave `.next/` and stale `.git/*.lock` files behind. If git refuses to run:
  `rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock`.

## Done

- **Site is English end to end** — UI, all 175 questions, subject and topic names,
  metadata, `lang="en"`, docs and agent context. Numbers are en-US behind one
  constant. `npm run smoke` fails the build on leftover German. The only German kept
  is statutory terms a question actually tests (`HGB`, `§ 253 HGB`, `GmbH`,
  `Herstellkosten`, `beizulegender Wert`), always glossed, plus `source` values.
- **Number parsing fixed** for the new display locale. A student retyping a
  displayed answer such as `2,842` used to be read as 2.842 and marked wrong. The
  parser now takes both conventions and accepts U+2212 as a minus. `npm run verify`
  round-trips every numeric question's displayed answer back through the grader, so
  it cannot regress.
- **Formula-sheet ingest.** The old Supabase export (`ivfall_rows.csv`) turned out
  to be a complete formula catalogue for the TUM IVF course. 54 of its 93 rows had
  no equivalent in the bank and are now seeded `build` functions: growing annuities
  in all four timing variants, replacement annuities, the ratio catalogue, dilution
  factors, DuPont and book leverage, FCF/FCFE, unlevered and equity beta, WACC at
  target leverage, levered firm value, the equity/entity/APV valuation methods, the
  binomial put, price-to-book, profitability index, modified duration and two more
  capital-increase variants. One row in the sheet is wrong — the
  `geom_growing_PV_immediate_neq` formula carries a trailing `· q` that belongs to
  the annuity-due variant; the bank ships the corrected form, verified against a
  brute-force cash-flow sum.
- **CI.** `.github/workflows/check.yml` runs `npm run check` on every push and PR to
  `main`.
- Question bank moved off Supabase into typed TypeScript; the site can no longer be
  taken down by a paused database.
- Seeded question engine — prompt and answer always come from the same draw.
- Tolerance-based grading with units; both en-US and German number input parse.
- Subject and topic taxonomy with per-topic filters.
- Rebrand to finance-bro plus search and social metadata.
- Dark-mode contrast bug fixed, with a smoke-test guard.
