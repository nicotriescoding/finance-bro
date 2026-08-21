# finance-bro — product spec & feature list

The structured artifact that carries context between working sessions (per
[Anthropic's harness-design write-up](https://www.anthropic.com/engineering/harness-design-long-running-apps)):
a session reads this file to know what the product is, what exists, and what is
next — without re-deriving it from the code. Update the status column in the
same commit as the change. Decisions and open questions live in `BACKLOG.md`;
this file holds the durable product shape.

## Product

Exam trainer for TUM business-administration students, live at
[finance-bro.de](https://www.finance-bro.de). Students pick a subject and
topics, then solve exam-style questions against the clock, with instant
grading, a worked solution in lecture notation, and a joke ranking system
(BroDollars, Unemployed → FinanceBro).

**Content policy — the one rule that shapes everything:** every question must be
traceable to real TUM course material. Questions derived from actual past exams
carry a `source` field (`"TUM Endterm WS24/25, A3"`). The Finance bank is built
from Nico's own course material (the TUM IVF formula catalogue and the original
app's data). Nothing gets invented from a syllabus.

## The loop (how sessions work)

Roles are separated, GAN-style — the agent that writes questions never grades
its own work:

1. **Generator** — the working session. Builds features, ingests exams
   (`add-exam-questions` skill), writes questions under
   `.claude/rules/questions.md`.
2. **Gate** — `npm run check`: typecheck, 200-seed question verification
   (NaN/∞/placeholders/duplicate ids/unknown topics/KaTeX validity/grading
   round-trip), production build, route smoke test incl. no-stray-German and
   dark-mode guards. Runs in CI on every push.
3. **Evaluator** — the `question-reviewer` subagent, run over every question
   diff. Skeptical by design: recomputes answers independently, checks against
   the source exam, and issues PASS/FAIL per question. Generator fixes findings
   before reporting done.
4. **Handoff** — commit (Nico pushes), update SPEC.md status + BACKLOG.md so
   the next session starts warm.

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Subject/topic taxonomy with per-topic filters | done |
| 2 | Seeded question engine — prompt and answer from one draw | done |
| 3 | Tolerance grading with units; en-US and German number input both parse | done |
| 4 | Multiple-choice questions with runtime shuffle and multi-select | done |
| 5 | Score, level and rank system (localStorage) | done |
| 6 | Finance bank: 97 numeric questions from the TUM IVF formula catalogue + original app data | done |
| 7 | Formulas rendered with KaTeX in lecture notation (prompts, given, explanations, choices) | done |
| 8 | Empty-bank state for subjects awaiting exam ingest | done |
| 9 | Verification gate (`npm run check`) + CI | done |
| 10 | English end to end; German only for glossed statutory terms | done |
| 11 | Ingest TUM MC past exams for Econ 1, Econ 2, Financial Accounting, Cost Accounting, Entrepreneurship, Marketing | **next — Nico supplies the exams** |
| 12 | Finance: add `source` links for questions matching actual exam tasks | planned |
| 13 | Redesign (see `DESIGN-BRIEF.md`) — ad + question + score on one screen, mobile-safe | planned |
| 14 | German edition as a second locale (`/de/…` + hreflang) | planned |
| 15 | Highscores/multiplayer backend — optional extra, never on the read path | icebox |
| 16 | `/products` page: replace placeholder images and dead affiliate links or drop the page | icebox |

## Non-goals (deliberate)

- No database on the read path (hard rule 1 in `CLAUDE.md`).
- No syllabus-derived seed questions — removed 2026-08-21; exam ingest is the
  only way content enters the six non-Finance banks.
- No further harness machinery (init rituals, session scripts) while sessions
  are interactive — the gate + evaluator + this file are the load-bearing
  pieces. Revisit only for unattended runs.
