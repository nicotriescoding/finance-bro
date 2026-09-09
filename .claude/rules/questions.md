---
paths:
  - "src/content/questions/**/*.ts"
  - "src/content/subjects.ts"
  - "src/lib/questions/**/*.ts"
---

# Authoring questions

Loaded automatically when you touch a question bank. Everything here is a rule,
not a suggestion - `npm run verify` enforces most of it.

## Provenance

**Every question must come from real TUM course material.** Questions from past
exams carry `source: "TUM <exam> <term>, A<n>"` (one line, one string
literal - a Turbopack loader strips exactly that line from the bundle, see
`scripts/strip-question-source-loader.mjs`; `npm run smoke` fails if a
source string reaches a chunk) and are written with the
`add-exam-questions` skill. Never write questions from a syllabus or from
general knowledge - the syllabus-derived seed banks were deliberately removed
on 2026-08-21 and must not come back.

**Exam-derived ≠ exam-copied.** Every exam-derived question is a redesign:
own wording, new scenario and names, changed numbers (seeded `build` for
numeric). Only the tested concept, standard formulas, and statutory terms carry
over - the exam author's expression never does. Details in the
`add-exam-questions` skill. Source exam files never enter the repo.

**The exam's numbers never enter the repo either - not in code, not in
comments.** Choose draw ranges and value grids so a source parameter set
simply cannot come out, and say nothing about what was excluded. No
`if (a === 4 && b === 100) ...` guards, no "dropped X because it reproduced
Q23" comments: those quote the exam inside the codebase, which is worse than
the coincidence they prevent. Only `source` names the exam. All banks are
kept clean of such guards - keep it that way.

## Shape

`topic` must be a topic id from `src/content/subjects.ts` (add the topic there
first if the exam introduces a new area). `id` must be globally unique across
all banks.

Every question is numeric (decision 2026-08-28). `kind: "choice"` still exists
in the engine and `verify` still checks it, but no bank uses it and new questions
never do. Numeric turns one exam task into unlimited practice:

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
            hint: String.raw`An annuity in arrears is worth the payment times the annuity present-value factor: $PV = C \cdot \frac{q^N - 1}{q^N (q - 1)}$, $q = 1 + i$.`,
        };
    },
}
```

## Prompt vs. hint - the exam asks, it never coaches

The prompt reads like the exam sheet: scenario, data, the assumptions the exam
would state (no taxes, perfect competition, "use the approximation"), sign
and format conventions, and the question. **Definitions, decision rules,
method steps and formulas never go in the prompt or in a `given` label** -
"a Pareto improvement is …", "the ticket is already paid and does not enter
the comparison", "(sunk)", "use MR = MC", "i.e. the difference between …".
Recognising the concept IS the test.

That knowledge goes into `hint` on the object `build` returns (the 💡
button, payout −50%): 1-3 sentences, definition/rule plus the lecture
formula in `$…$`. Without a `$…$` of its own the hint gets the first `$…$`
segment of the explanation appended automatically (`src/lib/hints.ts`); a
question without `hint` shows that formula alone. A hint must never contain
the answer. `npm run verify` fails on coaching phrases in prompts and
`given` keys (`COACHING` in `scripts/verify-questions.ts`) and on hints
that leak the answer.

## Formulas - KaTeX, lecture notation

`$…$` segments render as KaTeX (see `src/components/quiz/RichText.tsx`) in
prompts, `given` keys and values and explanations. Rules:

1. Write formulas **exactly as the lecture writes them** - `q = 1 + i`, named
   factors (annuity factor, capital-recovery factor), `\frac`, `\cdot`,
   subscripts. Never ship a plain-text dump like `C·((g/q)^N−1)/(g−q)`.
2. Any template literal containing a backslash **must use `String.raw`** -
   otherwise `\frac` silently corrupts (`\f` is an escape).
3. In double-quoted object keys, either escape backslashes (`"$\\sigma_A$"`)
   or use the Unicode Greek letter directly (`"$σ_A$"`) - KaTeX accepts both.
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
   divide by zero or produce `NaN`/`Infinity` - e.g. for a growing perpetuity
   draw `g` first, then `r = g + rng.int(2, 6)` so `r > g` always holds.
3. **Units are literal.** `unit: "percent"` means `answer` is `8.24`, not
   `0.0824`. `unit: "EUR"` means euros, not cents.
4. **Explanations show the worked path**, with the drawn numbers substituted.
5. **English throughout** - prompts, given labels, explanations. Use
   `eur`, `pct`, `n`, `n2` from `_helpers.ts` for every number that reaches the
   screen; never interpolate a raw float, and never hand-format a numeral, or
   the German edition cannot switch locale in one place. Keep a German
   statutory term (`HGB`, `§ 253 HGB`, `GmbH`, `beizulegender Wert`) verbatim
   when the question turns on it, with an English gloss in parentheses on
   first use.
6. **Verify after every change**: `npm run verify`. Then run the
   `question-reviewer` subagent over the diff - it grades PASS/FAIL per
   question and its findings get fixed before you report done.

## Grading

Tolerance is derived from `unit` in `src/lib/questions/grading.ts` - relative,
with an absolute floor, so a student who rounded intermediate steps still
passes. Only set `tolerance` explicitly when a question genuinely needs a
tighter or looser band, and say why in a comment.
