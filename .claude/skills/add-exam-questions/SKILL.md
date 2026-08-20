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

**The exams are German, the app is English — translate as you go.** Keep the
wording as close to the original as English allows: same facts, same thing being
asked, nothing added or dropped. A German statutory term the question actually
tests (`HGB`, `§ 253 HGB`, `GmbH`, `beizulegender Wert`) stays verbatim with an
English gloss in parentheses on first use. Rephrase only to remove references the
app can't show (a diagram, an attached balance sheet, "siehe Aufgabe 2").
If a question depends on an exhibit, either inline the data into `given` or skip
it and list it as skipped.

Prefer `kind: "numeric"` with a `build` function when the task is a calculation —
that turns one exam question into unlimited practice. Keep it `kind: "choice"`
when the exam question tests a concept or when the distractors are the point.

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

Commit with a message naming the exam. Nico pushes.
