# Backlog

Open work and decisions, most useful first. Keep this current — it is how a new
session picks up where the last one stopped.

## Next up

- **Ingest past exams.** Nico supplies Altklausuren for Econ 1, Econ 2, Financial
  Accounting, Cost Accounting, Entrepreneurship and Marketing. Use the
  `add-exam-questions` skill. The current banks for those six subjects are seed
  content written from the syllabus, not from real exams — expect to replace
  rather than extend them.

## Open decisions

- **Which harness pieces to add.** Nico has the write-up; nothing is built yet.
  Candidates, in the order they pay off: a `verify-ui` skill that drives a real
  browser and screenshots `/` and `/quiz` (closes the loop on the bug class that
  has bitten twice); an `init.sh` plus a session-start ritual (read BACKLOG +
  git log, smoke the app, write back what changed); a `features.json` spec file
  so an agent cannot declare the project done; GitHub Actions running
  `npm run check` on push so a red commit cannot reach Vercel.
- **Hero copy and `lang="de"`.** The home page hero is now English while the
  meta description, keywords, OG image and `<html lang="de">` stay German. That
  is deliberate but untested against search traffic — worth a look in Search
  Console in a few weeks.

- **Multiple-choice variants for Finance.** The 43 Finance questions are
  free-text numeric. TUM exams are multiple choice. Options: generate distractors
  from the classic traps (wrong formula, inverted sign, percent-vs-decimal,
  vorschüssig-vs-nachschüssig) and offer both modes, or leave calculations as
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

- Language split settled and enforced: UI chrome English, question content and
  SEO metadata German. `npm run smoke` asserts both halves.

- Question bank moved off Supabase into typed TypeScript; the site can no longer
  be taken down by a paused database.
- Seeded question engine — prompt and answer always come from the same draw.
- Tolerance-based grading with units; German number input parses correctly.
- Subject and topic taxonomy with per-topic filters.
- Rebrand to finance-bro plus search and social metadata.
- Dark-mode contrast bug fixed, with a smoke-test guard.
