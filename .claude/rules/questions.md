---
paths:
  - "src/content/questions/**/*.ts"
  - "src/content/subjects.ts"
  - "src/lib/questions/**/*.ts"
---

# Authoring questions

Loaded automatically when you touch a question bank. Everything here is a rule,
not a suggestion — `npm run verify` enforces most of it.

## Provenance

**Every question must come from real TUM course material.** Questions from past
exams carry `source: "TUM <exam> <term>, A<n>"` and are written with the
`add-exam-questions` skill. Never write questions from a syllabus or from
general knowledge — the syllabus-derived seed banks were deliberately removed
on 2026-08-21 and must not come back.

**Exam-derived ≠ exam-copied.** Every exam-derived question is a redesign:
own wording, new scenario and names, changed numbers (seeded `build` for
numeric). Only the tested concept, standard formulas, and statutory terms carry
over — the exam author's expression never does. Details in the
`add-exam-questions` skill. Source exam files never enter the repo.

## Shape

`topic` must be a topic id from `src/content/subjects.ts` (add the topic there
first if the exam introduces a new area). `id` must be globally unique across
all banks.

Multiple choice (the TUM exam format — the default for exam-derived questions):

```ts
{
    id: "fa-provision-recognition",
    subject: "financial_accounting",
    topic: "provisions",
    difficulty: "medium",
    kind: "choice",
    source: "TUM Endterm WS24/25, A3",
    prompt: "…",
    choices: ["correct", "wrong A", "wrong B", "wrong C"],
    correct: 0,              // or [0, 2] for multi-select
    explanation: String.raw`Why the right one is right — formulas as $…$ TeX.`,
}
```

Options are shuffled at runtime, so the correct answer may sit at index 0.
Distractors must be plausible — the classic wrong-formula or inverted-sign
trap, not filler. Four options unless the source exam used a different count.

Numeric — use when the exam task is a calculation, so one exam question becomes
unlimited practice:

```ts
{
    id: "fin-annuity-pv",
    subject: "finance",
    topic: "annuities",
    difficulty: "easy",
    kind: "numeric",
    unit: "EUR",             // EUR | percent | ratio | years | number | units
    source: "TUM Endterm WS23/24, A2",
    build: (rng) => {
        const C = rng.int(2, 15) * 100;
        const r = rng.int(2, 8);
        const N = rng.int(4, 14);
        const q = 1 + r / 100;
        const pf = (q ** N - 1) / (q ** N * (q - 1));
        return {
            prompt: `An annuity of ${eur(C)} is paid for ${N} years …`,
            given: { "Payment C": eur(C), "Interest rate r": pct(r) },
            answer: C * pf,
            explanation: String.raw`$PV = C \cdot \frac{q^N - 1}{q^N (q - 1)}$ with $q = ${n(q)}$: the factor is ${n2(pf)}, so PV = ${eur(C)} · ${n2(pf)} = ${eur(C * pf)}`,
        };
    },
}
```

## Formulas — KaTeX, lecture notation

`$…$` segments render as KaTeX (see `src/components/quiz/RichText.tsx`) in
prompts, `given` keys and values, choices and explanations. Rules:

1. Write formulas **exactly as the lecture writes them** — `q = 1 + i`, named
   factors (annuity factor, capital-recovery factor), `\frac`, `\cdot`,
   subscripts. Never ship a plain-text dump like `C·((g/q)^N−1)/(g−q)`.
2. Any template literal containing a backslash **must use `String.raw`** —
   otherwise `\frac` silently corrupts (`\f` is an escape).
3. In double-quoted object keys, either escape backslashes (`"$\\sigma_A$"`)
   or use the Unicode Greek letter directly (`"$σ_A$"`) — KaTeX accepts both.
4. Keep currency out of math mode: symbolic formula in `$…$`, then the numeric
   substitution in plain text with `eur(...)` (KaTeX's fonts have no €).
5. Explanation pattern: symbolic formula → substituted values → result, so a
   student sees where they diverged.
6. `npm run verify` compiles every `$…$` segment and fails on invalid TeX or an
   unbalanced `$`. It also rejects `$` used any other way in question text.

## Non-negotiables

1. **One draw feeds both.** Every number in `prompt`, `given`, `answer` and
   `explanation` comes from the same `rng` call sequence. Never compute the
   prompt from one set of numbers and the answer from another.
2. **`build` must be pure and total.** Same seed, same output. No `Math.random`,
   no `Date`, no reads outside `rng`. Guard the ranges so the formula can never
   divide by zero or produce `NaN`/`Infinity` — e.g. for a growing perpetuity
   draw `g` first, then `r = g + rng.int(2, 6)` so `r > g` always holds.
3. **Units are literal.** `unit: "percent"` means `answer` is `8.24`, not
   `0.0824`. `unit: "EUR"` means euros, not cents.
4. **Explanations show the worked path**, with the drawn numbers substituted.
5. **English throughout** — prompts, given labels, choices, explanations. Use
   `eur`, `pct`, `n`, `n2` from `_helpers.ts` for every number that reaches the
   screen; never interpolate a raw float, and never hand-format a numeral, or
   the German edition cannot switch locale in one place. Keep a German
   statutory term (`HGB`, `§ 253 HGB`, `GmbH`, `beizulegender Wert`) verbatim
   when the question turns on it, with an English gloss in parentheses on
   first use.
6. **Verify after every change**: `npm run verify`. Then run the
   `question-reviewer` subagent over the diff — it grades PASS/FAIL per
   question and its findings get fixed before you report done.

## Grading

Tolerance is derived from `unit` in `src/lib/questions/grading.ts` — relative,
with an absolute floor, so a student who rounded intermediate steps still
passes. Only set `tolerance` explicitly when a question genuinely needs a
tighter or looser band, and say why in a comment.
