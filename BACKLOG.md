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
- No automated visual regression test — visual checks are manual via Chrome.
- Coverage is thin outside Finance: roughly one question per topic for the other
  six subjects.

## Done

- Question bank moved off Supabase into typed TypeScript; the site can no longer
  be taken down by a paused database.
- Seeded question engine — prompt and answer always come from the same draw.
- Tolerance-based grading with units; German number input parses correctly.
- Subject and topic taxonomy with per-topic filters.
- Rebrand to finance-bro plus search and social metadata.
- Dark-mode contrast bug fixed, with a smoke-test guard.
