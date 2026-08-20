# Backlog

Open work and decisions, most useful first. Keep this current — it is how a new
session picks up where the last one stopped.

## Next up

- **The `ivfall` CSV.** Nico supplied `ivfall_rows.csv` — the old Supabase export,
  92 rows, already English, in the legacy `{placeholder}` + formula-string shape.
  Not yet ingested. Decide first whether it actually adds anything: the 43 Finance
  questions were derived from it, so much of it is likely already in the bank.
  Diff it against `finance.ts` before writing any code. Anything ingested must be
  converted to a seeded `build` function — the CSV's split of template and formula
  is exactly the architecture that produced wrong answers (CLAUDE.md rule 2).
- **Ingest past exams.** Nico supplies Altklausuren for Econ 1, Econ 2, Financial
  Accounting, Cost Accounting, Entrepreneurship and Marketing. Use the
  `add-exam-questions` skill, which now translates as it goes. The current banks
  for those six subjects are seed content written from the syllabus, not from real
  exams — expect to replace rather than extend them.

## Open decisions

- **Which harness pieces to add.** Nico has the write-up; nothing is built yet,
  and for a project driven session by session most of it is overkill. The one
  with a live failure mode is a CI gate: `npm run check` on push, so a red commit
  cannot reach Vercel. The rest (`init.sh` + session ritual, `verify-ui`,
  `features.json`) pays off only for long unattended runs.
- **German edition.** Planned as a **second locale**, not a revert. The display
  locale is one constant (`LOCALE` in `_helpers.ts`) and every number on screen
  goes through the helpers, so formatting is already a one-line switch. The
  question text is the real work: it needs a parallel bank or a translation layer,
  plus a routing decision (`/de/…` vs. subdomain) and `hreflang`.
- **SEO after the switch.** finance-bro.de now serves English metadata, keywords
  and `lang="en"` to an audience that searches in German. Expect German impressions
  to fall. Watch Search Console; the German locale above is the fix, not reverting.

- **Multiple-choice variants for Finance.** The 43 Finance questions are
  free-text numeric. TUM exams are multiple choice. Options: generate distractors
  from the classic traps (wrong formula, inverted sign, percent-vs-decimal,
  ordinary-annuity-vs-annuity-due) and offer both modes, or leave calculations as
  free text. Not decided.
- **Where highscores live.** Currently `localStorage` only, so scores are
  per-browser and the leaderboard and multiplayer pages are stubs. Any backend
  here must not sit on the read path (see CLAUDE.md rule 1).

## Known gaps

- `/multiplayer` and `/language` are placeholder pages from the original build.
- `/products` still has `via.placeholder.com` images and dead affiliate links.
- `AdSlot` renders a grey box; no ad integration.
- No automated visual regression test — visual checks are manual via Chrome, and
  a Cowork session cannot take the screenshot itself (its Linux sandbox is
  aarch64 with no Chrome build, and its dev server is not reachable from the
  browser on Nico's machine). Any `verify-ui` skill has to run on Nico's machine.
- Coverage is thin outside Finance: roughly one question per topic for the other
  six subjects.

## Done

- **Site is English end to end** — UI, all 121 questions, subject and topic names,
  metadata, `lang="en"`, docs and agent context. Numbers are en-US behind one
  constant. `npm run smoke` fails on leftover German.
- Number parsing fixed for the new display locale: a student retyping a displayed
  answer such as `2,842` used to be read as 2.842 and marked wrong. The parser now
  takes both conventions, and `npm run verify` round-trips every numeric question's
  displayed answer back through the grader so this cannot regress.

- Question bank moved off Supabase into typed TypeScript; the site can no longer
  be taken down by a paused database.
- Seeded question engine — prompt and answer always come from the same draw.
- Tolerance-based grading with units; both en-US and German number input parse.
- Subject and topic taxonomy with per-topic filters.
- Rebrand to finance-bro plus search and social metadata.
- Dark-mode contrast bug fixed, with a smoke-test guard.
