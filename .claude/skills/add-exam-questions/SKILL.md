---
name: add-exam-questions
description: Convert a past TUM exam (PDF, photos, or pasted text) into question objects in the right subject bank. Use whenever Nico supplies an Altklausur, old exam, Probeklausur or exam screenshots for any subject.
---

# Turn a past exam into questions

## 1. Read the exam before writing anything

Extract every question, its options, the official answer if the solution sheet is
included, and the exam identifier (term + task number). If the correct answer is
not given, **solve it yourself and say so** — flag those separately at the end so
Nico can confirm before they go live. Never guess silently.

## 2. Map to the taxonomy

Match each question to a `subject` and `topic` from `src/content/subjects.ts`.
If nothing fits, propose a new topic rather than forcing a bad match — say which
subject it belongs under and what to call it, then add it to `subjects.ts`. The
topic checkboxes update automatically.

## 3. Write the objects

Append to the matching `src/content/questions/<subject>.ts`. Follow
`.claude/rules/questions.md` exactly. Every question gets
`source: "TUM <exam> <term>, A<n>"`.

**The exams are German, the app is English — and every question is a
copyright-safe redesign, never a translation-copy.** German law (§ 2 UrhG)
protects the exam author's *expression* — the wording, the invented story, the
specific scenario. It does not protect the method, formula, concept, or the
competency being tested. So work per task like this:

1. Identify what the task actually tests (the competency, formula, concept).
2. Write a **new scenario in your own words**: different company/person names,
   different framing, different narrative. Never carry over a distinctive
   invented story, character, or creative setup from the original.
3. **Change every number.** For `kind: "numeric"` the seeded `build` does this
   for free; for `kind: "choice"` with numbers in the stem, pick fresh values
   and recompute the options.
4. Keep only what is unprotectable: the tested concept, standard lecture
   formulas, statutory terms, standard technical vocabulary.

A German statutory term the question actually tests (`HGB`, `§ 253 HGB`,
`GmbH`, `beizulegender Wert`) stays verbatim with an English gloss in
parentheses on first use. If a task depends on an exhibit, either build an
equivalent (redesigned) dataset into `given` or skip it and list it as skipped.
Never commit the source exam PDF or reproduce it anywhere in the repo — the
`source` field cites provenance (a fact, always fine); the file itself stays
with Nico.

The measure of success: a student who drilled the module is prepared for the
real exam, but no question can be laid next to the original and called a copy.

Prefer `kind: "numeric"` with a `build` function when the task is a calculation —
that turns one exam question into unlimited practice. Keep it `kind: "choice"`
when the exam question tests a concept or when the distractors are the point.
Either way, write every formula as a `$…$` KaTeX segment in lecture notation
(`String.raw` for backslashes) — the conventions are in
`.claude/rules/questions.md`.

## 4. Verify

```bash
npm run verify     # all questions, 200 seeds each
npm run check      # typecheck + verify + build + route smoke test
```

Then have the `question-reviewer` subagent check the new questions against the
source exam. Fix what it flags before reporting done.

## 5. Report

Give Nico:

- how many questions were added, per subject and topic
- which ones you solved yourself because the exam had no solution key
- anything skipped, and why
- the `npm run check` output

Update the feature table in `SPEC.md` (ingest progress) and `BACKLOG.md`.
Commit with a message naming the exam. Nico pushes.
