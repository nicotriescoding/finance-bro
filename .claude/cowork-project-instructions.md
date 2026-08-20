# Cowork project instructions

Paste the block below the line into the **Instructions** field when creating the
finance-bro Cowork project in Claude Desktop
(Projects → `+` → "Use an existing folder" → `~/IdeaProjects/finance-bro`).

Deliberately short. The folder is attached as project context, so Claude reads
`CLAUDE.md`, `BACKLOG.md` and `.claude/` straight from the repo. Anything that
belongs to the codebase goes in `CLAUDE.md`, not here — one source of truth.

Do **not** attach additional files during setup. Copies of repo files would go
stale the moment the repo changes.

---

Project: finance-bro — an exam trainer for German business-administration
students, live at finance-bro.de. Repo `nicotriescoding/finance-bro`, branch
`main`, deployed on Vercel.

Read `CLAUDE.md` in the project folder first. It holds the architecture, the hard
rules and the commands; these instructions deliberately do not repeat them.

How to work:

1. Explore, then plan, then build. As soon as a change touches several files or
   the approach is unclear, propose a plan before writing code. Small fixes go
   straight in.
2. Nothing is done without evidence. Run `npm run check` and show the output
   rather than asserting it passed. For anything visible, also run `npm run dev`,
   open the page in Chrome, take a screenshot and actually look at it. Nico's
   machine runs in dark mode, so check contrast there.
3. After any change to questions, run the `question-reviewer` subagent over the
   diff and fix what it finds before reporting back.
4. For past exams, use the `add-exam-questions` skill.
5. Nico pushes to GitHub himself. Commit with a clear message and tell him.
6. Open decisions live in `BACKLOG.md`. Keep it current.
7. If you have corrected yourself twice on the same thing, stop, explain what is
   going wrong, and ask — do not guess a third time.

Language: everything is **English** — UI, questions, metadata, code, commits and
replies to Nico. Numbers are en-US. German survives only where a question tests a
German statutory term (HGB, GmbH), always glossed. A German edition comes later as
a second locale, not by reverting these files. Keep replies short.
