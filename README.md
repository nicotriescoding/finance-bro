# finance-bro

Exam trainer for TUM business-administration students — [finance-bro.de](https://www.finance-bro.de)

Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript · KaTeX. **No database, no backend.**

Working on this repo? Read [CLAUDE.md](./CLAUDE.md) for the hard rules and commands,
[SPEC.md](./SPEC.md) for the feature list and the working loop, and
[BACKLOG.md](./BACKLOG.md) for what is open. This file explains the domain: how
questions are written and how answers are graded.

**Content policy:** every question is based on real TUM course material — past
exams (carrying a `source` field) or the course's own formula catalogue. Nothing
is invented from a syllabus.

## Language

Everything is English — UI, questions, explanations, subject and topic names,
metadata, code and commits. Numbers are en-US (`1,234.56`), set by one constant:
`LOCALE` in `src/content/questions/_helpers.ts`.

Two things stay German on purpose: statutory terms a question actually tests
(`HGB`, `§ 253 HGB`, `GmbH`, `beizulegender Wert`), always with an English gloss,
and `source` values naming a real exam. Anything else German is a regression and
`npm run smoke` fails on it.

A German edition is planned as a **second locale**, not as a revert of these files.
Every number on screen goes through the `_helpers.ts` formatters so that switch
stays a one-line change.

## Why no database

The questions used to live in a Supabase table (`ivfall`) and were fetched client-side
on page load. As soon as the Supabase project paused — the free tier pauses after 7 days
of inactivity — the API returned 503 and the page sat on `Loading...` forever. The whole
question pool is now typed TypeScript in the bundle, so the site cannot be taken down by
a sleeping backend.

## Layout

```
src/
  content/
    subjects.ts              Subjects + topics (the quiz filters are generated from this)
    questions/
      index.ts               Registry + filter helpers
      finance.ts             Investment & Financial Management
      econ1.ts econ2.ts      Economics
      financial_accounting.ts
      cost_accounting.ts
      entrepreneurship.ts
      marketing.ts
      _helpers.ts            en-US number formatting, normal CDF, NPV, IRR, duration
  lib/questions/
    types.ts                 Question types (numeric | choice)
    rng.ts                   Seeded RNG (mulberry32)
    engine.ts                Seed -> concrete question
    grading.ts               Tolerance check, units, locale-agnostic number input
  components/quiz/           TopicSelector, QuestionCard, QuizClient, RichText (KaTeX + bold)
scripts/
  verify-questions.ts        Builds every question against 200 seeds
  smoke.mjs                  Boots the production build and asserts every route
```

## Adding questions

A question is an object in the bank for its subject. `topic` must be a topic id from
`content/subjects.ts`. The full rules live in `.claude/rules/questions.md`; past
exams are ingested with the `add-exam-questions` skill.

**Multiple choice** (the TUM exam format):

```ts
{
    id: "fa-provision-recognition",     // globally unique
    subject: "financial_accounting",
    topic: "provisions",
    difficulty: "medium",
    kind: "choice",
    source: "TUM Endterm WS24/25, A3",  // rendered as a badge
    prompt: "Question …",
    choices: ["correct", "wrong A", "wrong B", "wrong C"],
    correct: 0,                         // index, or [0, 2] for multi-select
    explanation: "Reasoning …",
}
```

Choices are shuffled at runtime, so the correct answer may sit at index 0.

**Calculation** (numbers are redrawn every run):

```ts
{
    id: "fin-annuity-pv",
    subject: "finance",
    topic: "annuities",
    difficulty: "easy",
    kind: "numeric",
    unit: "EUR",                        // EUR | percent | ratio | years | number | units
    build: (rng) => {
        const C = rng.int(2, 15) * 100;
        const r = rng.int(2, 8);
        const N = rng.int(4, 14);
        const q = 1 + r / 100;
        const pf = (q ** N - 1) / (q ** N * (q - 1));
        return {
            prompt: `An annuity of ${eur(C)} is paid for ${N} years at ${pct(r)} …`,
            given: { "Payment C": eur(C), "Interest rate r": pct(r) },
            answer: C * pf,
            explanation: String.raw`$PV = C \cdot \frac{q^N - 1}{q^N (q - 1)}$ with $q = ${n(q)}$: the factor is ${n2(pf)}, so PV = ${eur(C)} · ${n2(pf)} = ${eur(C * pf)}`,
        };
    },
}
```

`prompt` and `answer` come from the same draw of the seeded RNG, so the numbers on
screen and the graded solution cannot drift apart.

**Formulas** are inline KaTeX: `$…$` segments in prompts, given labels, choices
and explanations render as real math in the lecture's notation. Template
literals containing backslashes must use `String.raw`; `npm run verify` compiles
every segment and fails the build on invalid TeX.

## Grading

`unit` sets the tolerance. Rounded intermediate steps still count as correct:

| Unit | Relative | Absolute floor |
|---------|---------|-----------------|
| EUR     | 0.5 %   | 0.02 €          |
| percent | 1 %     | 0.05 pp         |
| ratio   | 1 %     | 0.005           |
| years   | 1 %     | 0.02            |
| units   | 0.5 %   | 0.5 units       |

Input parsing is locale-agnostic — whichever separator comes last is the decimal
one, so `1,234.56`, `1.234,56`, `1234.56`, `1234,56`, `12.5 %` and `€1,200` all
work. A German student typing the format they are used to still passes.

## Commands

```bash
npm run dev        # dev server on :3000
npm run check      # the gate: typecheck + verify + build + route smoke test
npm run verify     # builds every question against 200 seeds
npm run smoke      # boots the production build and asserts every route
```

Run `npm run check` before every commit.
