---
paths:
  - "src/content/questions/**/*.ts"
  - "src/content/subjects.ts"
  - "src/lib/questions/**/*.ts"
---

# Authoring questions

Loaded automatically when you touch a question bank. Everything here is a rule,
not a suggestion — `npm run verify` enforces most of it.

## Shape

`topic` must be a topic id from `src/content/subjects.ts`. `id` must be globally
unique across all banks. Add `source` whenever the question comes from a real
exam, e.g. `source: "TUM Endterm WS24/25, A3"`.

Multiple choice:

```ts
{
    id: "fa-rueckstellung-ansatz",
    subject: "financial_accounting",
    topic: "provisions",
    difficulty: "medium",
    kind: "choice",
    source: "TUM Endterm WS24/25, A3",
    prompt: "…",
    choices: ["correct", "wrong A", "wrong B", "wrong C"],
    correct: 0,              // or [0, 2] for multi-select
    explanation: "…",
}
```

Options are shuffled at runtime, so the correct answer may sit at index 0.
Distractors must be plausible — the classic wrong-formula or inverted-sign trap,
not filler. Four options unless the source exam used a different count.

Numeric:

```ts
{
    id: "ca-…",
    subject: "cost_accounting",
    topic: "contribution_margin",
    difficulty: "easy",
    kind: "numeric",
    unit: "EUR",             // EUR | percent | ratio | years | number | units
    build: (rng) => {
        const fix = rng.int(20, 300) * 1000;
        const db = rng.int(10, 90);
        return {
            prompt: `Fixkosten ${eur(fix)}, Stückdeckungsbeitrag ${eur(db)}. …`,
            given: { Fixkosten: eur(fix), db: eur(db) },
            answer: fix / db,
            explanation: `x = K_fix/db = ${n2(fix / db)}`,
        };
    },
}
```

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
4. **Explanations show the worked path**, with the drawn numbers substituted, so
   a student who got it wrong can see where they diverged.
5. **English throughout** — prompts, given labels, choices, explanations. Use
   `eur`, `pct`, `n`, `n2` from `_helpers.ts` for every number that reaches the
   screen; never interpolate a raw float, and never hand-format a numeral, or the
   German edition cannot switch locale in one place. Keep a German statutory term
   (`HGB`, `§ 253 HGB`, `GmbH`, `beizulegender Wert`) verbatim when the question
   turns on it, with an English gloss in parentheses on first use.
6. **Verify after every change**: `npm run verify`. It builds each numeric
   question against 200 seeds and fails on NaN, Infinity, unfilled `{placeholder}`
   text, unknown topics, duplicate ids, and choice sets that lose their correct
   option in the shuffle.

## Grading

Tolerance is derived from `unit` in `src/lib/questions/grading.ts` — relative,
with an absolute floor, so a student who rounded intermediate steps still passes.
Only set `tolerance` explicitly when a question genuinely needs a tighter or
looser band, and say why in a comment.
