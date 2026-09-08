# finance-bro

Exam trainer for TUM business-administration students - [finance-bro.de](https://www.finance-bro.de)

Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript · KaTeX. **No database on
the read path.** The questions ship as TypeScript in the bundle; the only backend is an
optional Cloudflare Worker for multiplayer and the leaderboard (see below).

Working on this repo? Read [CLAUDE.md](./CLAUDE.md) for the hard rules and commands,
[SPEC.md](./SPEC.md) for the feature list and the working loop, and
[BACKLOG.md](./BACKLOG.md) for what is open. This file explains the domain: how
questions are written and how answers are graded.

**Content policy:** every question is based on real TUM course material - past
exams (carrying a `source` field, internal provenance only, never rendered) or the
course's own formula catalogue. Nothing is invented from a syllabus.

## Language

Everything is English - UI, questions, explanations, subject and topic names,
metadata, code and commits. Numbers are en-US (`1,234.56`). The question
formatters (`eur`, `pct`, `n`, `n2` in `src/content/questions/_helpers.ts`) share
one locale constant; a few UI formatters (grading output, BroDollars, the account
statement, the library) still hardcode en-US - see BACKLOG.

Two things stay German on purpose: statutory terms a question actually tests
(`HGB`, `§ 253 HGB`, `GmbH`, `beizulegender Wert`), always with an English gloss,
and `source` values naming a real exam. Anything else German is a regression:
`npm run smoke` checks the landing page for a handful of German words.

A German edition is planned as a **second locale**, not as a revert of these files.
Every number in a question goes through the `_helpers.ts` formatters so that switch
stays a small change.

## Why the questions ship as TypeScript

The questions used to live in a Supabase table (`ivfall`) and were fetched client-side
on page load. As soon as the Supabase project paused - the free tier pauses after 7 days
of inactivity - the API returned 503 and the page sat on `Loading...` forever. The whole
question pool is now typed TypeScript in the bundle, so the site cannot be taken down by
a sleeping backend. Typed questions also give us a seeded `build` per question (fresh
numbers every run) and a verification gate that compiles every question against 200
seeds before a build ships.

## The worker (multiplayer + leaderboard)

`worker/` is a Cloudflare Worker: one Durable Object per multiplayer lobby (WebSockets,
server-side grading with the shared engine, the "Inflation" bot) plus a D1 database for
the semester leaderboard (BroDollars earned, overall and per subject, fed by solo
postings and duels). It bundles the same question banks and grading code as the site.
It is an optional extra: without `NEXT_PUBLIC_MP_URL` the site works exactly the same
and `/multiplayer` and `/leaderboard` show their own placeholder states. Setup and
endpoints are in [worker/README.md](./worker/README.md). Beyond that, the site talks
to PostHog (consent-gated analytics) and Google AdSense - neither is on the read path.

## Layout

```
src/
  app/                       Routes: / career quiz leaderboard multiplayer products
                             library impressum privacy (+ robots, sitemap, OG image)
  content/
    subjects.ts              Subjects + topics (the quiz filters are generated from this)
    subject-intros.ts        Server-rendered intro text per subject on /quiz
    questions/
      index.ts               Registry + filter helpers
      finance.ts             Investment & Financial Management
      econ1.ts econ2.ts      Economics
      financial_accounting.ts
      cost_accounting.ts
      entrepreneurship.ts
      marketing.ts
      _helpers.ts            en-US number formatting, normal CDF, NPV, IRR, duration
  lib/
    questions/
      types.ts               Question types (numeric; choice exists in the engine but is unused)
      rng.ts                 Seeded RNG (mulberry32)
      engine.ts              Seed -> concrete question
      grading.ts             Tolerance check, units, locale-agnostic number input
    session.ts               Semester Marathon run state
    scoring.ts time.ts       Time limits and payouts per difficulty
    rankings.ts money.ts     Rank ladder, BroDollar formatting
    hints.ts                 Formula hint extraction
    ads.ts affiliate.ts      AdSense slot ids, Amazon links
    analytics.ts             Consent-gated PostHog
    multiplayer/ scoreboard/ Protocol + shared code for the worker
  hooks/                     useScore, useRank, useLevel, usePersistentState, ...
  components/
    quiz/                    TopicSelector, QuestionCard, QuizClient, RichText (KaTeX + bold)
    account/ career/ landing/ layout/ multiplayer/ scoreboard/ consent/
    Ad*.tsx                  Ad slots, rails, anchor
scripts/
  verify-questions.ts        Builds every question against 200 seeds
  smoke.mjs                  Boots the production build and asserts every route
worker/                      Cloudflare Worker: lobbies (Durable Objects) + D1 leaderboard
```

## Adding questions

A question is an object in the bank for its subject. `topic` must be a topic id from
`content/subjects.ts`. The full rules live in `.claude/rules/questions.md`; past
exams are ingested with the `add-exam-questions` skill.

All banks are numeric by decision (2026-08-28): every question is a **calculation**
with a seeded `build`, so the numbers are redrawn every run. The engine still
understands `kind: "choice"`, but no bank uses it.

```ts
{
    id: "fin-annuity-pv",
    subject: "finance",
    topic: "annuities",
    difficulty: "easy",
    kind: "numeric",
    unit: "EUR",                        // EUR | percent | ratio | years | number | units
    source: "TUM Endterm WS23/24, A2",  // internal provenance only, never rendered
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

**Formulas** are inline KaTeX: `$…$` segments in prompts, given labels and
explanations render as real math in the lecture's notation. Template
literals containing backslashes must use `String.raw`; `npm run verify` compiles
every segment and fails the build on invalid TeX.

## Grading

`unit` sets the tolerance. Rounded intermediate steps still count as correct:

| Unit    | Relative | Absolute floor |
|---------|---------|-----------------|
| EUR     | 0.5 %   | 0.02 €          |
| percent | 1 %     | 0.05 pp         |
| ratio   | 1 %     | 0.005           |
| years   | 1 %     | 0.02            |
| number  | 1 %     | 0.01            |
| units   | 0.5 %   | 0.5 units       |

Input parsing is locale-agnostic. When both separators appear, whichever comes
last is the decimal one (`1,234.56`, `1.234,56`). A lone comma is read as en-US
thousands only when the digits fit that shape (`1,234`), otherwise as a German
decimal comma (`8,24`); two or more dots are German thousands (`1.234.567`), a
single dot stays decimal. `12.5 %` and `€1,200` work too. A German student typing
the format they are used to still passes, and retyping a number the app just
displayed always grades correct.

## Question counts

447 questions: finance 159, econ1 107, econ2 90, cost_accounting 91.
financial_accounting, entrepreneurship and marketing are empty until their exams
are ingested.

## Commands

```bash
npm run dev        # dev server on :3000
npm run check      # the gate: typecheck + verify + build + route smoke test
npm run verify     # builds every question against 200 seeds
npm run smoke      # boots the production build and asserts every route
```

Run `npm run check` before every commit.
