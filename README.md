# finance-bro

Exam trainer for German business-administration students — [finance-bro.de](https://www.finance-bro.de)

Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript. **No database, no backend.**

Working on this repo? Read [CLAUDE.md](./CLAUDE.md) for the hard rules and commands,
and [BACKLOG.md](./BACKLOG.md) for what is open. This file explains the domain: how
questions are written and how answers are graded.

## Language split

| Layer | Language | Why |
| --- | --- | --- |
| UI chrome — nav, buttons, labels, input hints | English | |
| Question prompts, `given` labels, explanations | German | The exams are German |
| Subject and topic names (`src/content/subjects.ts`) | German | They are the course names |
| Metadata, keywords, OG image, `lang="de"` | German | The audience searches in German |
| Number formatting and unit suffixes (`€`, `Jahre`, `Stück`) | German | They sit inside German questions |
| Code, comments, commit messages | English | |

`npm run smoke` asserts both halves so a future full translation can't silently
take the German SEO copy with it.

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
      _helpers.ts            de-DE number formatting, normal CDF, NPV, IRR, duration
  lib/questions/
    types.ts                 Question types (numeric | choice)
    rng.ts                   Seeded RNG (mulberry32)
    engine.ts                Seed -> concrete question
    grading.ts               Tolerance check, units, German number input
  components/quiz/           TopicSelector, QuestionCard, QuizClient
scripts/
  verify-questions.ts        Builds every question against 200 seeds
  smoke.mjs                  Boots the production build and asserts every route
```

## Adding questions

A question is an object in the bank for its subject. `topic` must be a topic id from
`content/subjects.ts`. The full rules live in `.claude/rules/questions.md`.

**Multiple choice** (exam format):

```ts
{
    id: "fa-neue-frage",                // globally unique
    subject: "financial_accounting",
    topic: "bookings",
    difficulty: "medium",
    kind: "choice",
    source: "TUM Endterm WS24/25, A3",  // optional, rendered as a badge
    prompt: "Frage …",
    choices: ["richtig", "falsch A", "falsch B", "falsch C"],
    correct: 0,                         // index, or [0, 2] for multi-select
    explanation: "Begründung …",
}
```

Choices are shuffled at runtime, so the correct answer may sit at index 0.

**Calculation** (numbers are redrawn every run):

```ts
{
    id: "ca-neue-aufgabe",
    subject: "cost_accounting",
    topic: "contribution_margin",
    difficulty: "easy",
    kind: "numeric",
    unit: "EUR",                        // EUR | percent | ratio | years | number | units
    build: (rng) => {
        const fix = rng.int(20, 300) * 1000;
        const db  = rng.int(10, 90);
        return {
            prompt: `Fixkosten ${eur(fix)}, Stückdeckungsbeitrag ${eur(db)}. …`,
            given: { Fixkosten: eur(fix), db: eur(db) },
            answer: fix / db,
            explanation: `x = K_fix/db = ${n2(fix / db)}`,
        };
    },
}
```

`prompt` and `answer` come from the same draw of the seeded RNG, so the numbers on
screen and the graded solution cannot drift apart.

## Grading

`unit` sets the tolerance. Rounded intermediate steps still count as correct:

| Unit | Relative | Absolute floor |
|---------|---------|-----------------|
| EUR     | 0.5 %   | 0.02 €          |
| percent | 1 %     | 0.05 pp         |
| ratio   | 1 %     | 0.005           |
| years   | 1 %     | 0.02            |
| units   | 0.5 %   | 0.5 units       |

Input is parsed as German: `1.234,56`, `1234,56`, `1234.56`, `12,5 %`, `€1.200`.

## Commands

```bash
npm run dev        # dev server on :3000
npm run check      # the gate: typecheck + verify + build + route smoke test
npm run verify     # builds every question against 200 seeds
npm run smoke      # boots the production build and asserts every route
```

Run `npm run check` before every commit.
