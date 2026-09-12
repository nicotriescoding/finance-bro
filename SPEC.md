# finance-bro - product spec & feature list

The structured artifact that carries context between working sessions (per
[Anthropic's harness-design write-up](https://www.anthropic.com/engineering/harness-design-long-running-apps)):
a session reads this file to know what the product is, what exists, and what is
next - without re-deriving it from the code. Update the status column in the
same commit as the change. Decisions and open questions live in `BACKLOG.md`;
this file holds the durable product shape.

## Product

Exam trainer for TUM business-administration students, live at
[finance-bro.de](https://www.finance-bro.de), branded **FinanceBro**. Students
pick a subject and topics, then solve exam-style questions against the clock
(the site copy says: against inflation), with instant grading, a worked
solution in lecture notation, and a joke ranking system (BroDollars,
Unemployed → FinanceBro, each rank with a satirical monthly `salary`).

**Content policy - the one rule that shapes everything:** every question must be
traceable to real TUM course material. Questions derived from actual past exams
carry a `source` field (`"TUM Endterm WS24/25, A3"`) - internal provenance
only, never rendered. The Finance bank is built
from Nico's own course material (the TUM IVF formula catalogue and the original
app's data). Nothing gets invented from a syllabus.

## The loop (how sessions work)

Roles are separated, GAN-style - the agent that writes questions never grades
its own work:

1. **Generator** - the working session. Builds features, ingests exams
   (`add-exam-questions` skill), writes questions under
   `.claude/rules/questions.md`.
2. **Gate** - `npm run check`: typecheck, 200-seed question verification
   (NaN/∞/placeholders/duplicate ids/unknown topics/KaTeX validity/grading
   round-trip), production build, route smoke test incl. no-stray-German and
   dark-mode guards. Runs in CI on every push.
3. **Evaluators** - three subagents, picked by what the diff touches:
   `question-reviewer` for question diffs (skeptical by design: recomputes
   answers independently, checks against the source exam, PASS/FAIL per
   question), `functionality-reviewer` for any code change (behaviour and
   regression review: routes, state, hard rules, error states, smoke
   coverage), `design-reviewer` for anything visible (visual, UX and
   accessibility review against the 3a design language, dark mode, phone).
   Generator fixes findings before reporting done.
4. **Handoff** - commit (Nico pushes), update SPEC.md status + BACKLOG.md so
   the next session starts warm.

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Subject/topic taxonomy with per-topic filters | done |
| 2 | Seeded question engine - prompt and answer from one draw | done |
| 3 | Tolerance grading with units; en-US and German number input both parse | done |
| 4 | Multiple-choice questions (`kind: "choice"`, runtime shuffle, multi-select) | engine support only, unused - numeric-only decision 2026-08-28 |
| 5 | Score, level and rank system (localStorage) - 21-rank ladder Pupil → FinanceBro (1,000,000 💸, geometric `LEVEL_COSTS`); past FinanceBro the title is the overall leaderboard position (The Richest Person … Almost Made It … FinanceBro #N), flat per-rank completion bonus on every settled posting; full-screen PROMOTED flash (money rain, old → new emoji) whenever the rank climbs | done |
| 6 | Finance bank: 159 numeric questions - TUM IVF formula catalogue + original app data, expanded 2026-09-02 from the actual IVF course material (financial-markets tutorials 1-7 with solutions + corporate-finance chapters 1-6 + exercise catalogue Sep23); new `capital_structure` topic; every topic ≥3 scenario variants | done |
| 7 | Formulas rendered with KaTeX in lecture notation (prompts, given, explanations, choices) | done |
| 8 | Empty-bank state for subjects awaiting exam ingest | done |
| 9 | Verification gate (`npm run check`) + CI | done |
| 10 | English end to end; German only for glossed statutory terms | done |
| 11 | Ingest TUM MC past exams for Econ 1, Econ 2, Financial Accounting, Cost Accounting, Entrepreneurship, Marketing | **calculation modules done for Econ 1 (107 q - WT22/23 exercise exam + problem sets, exam WS19/20, eTest W20/21, Principles WS17/18 = WS20/21 blocks 1-5, expanded 2026-09-02, new topics `price_controls` + `public_goods`), Econ 2 (90 q - SS17/18/19 exams + lecture units, expanded 2026-09-02, new topics `labor_stats` + `money_banking`), Cost Accounting (91 q - all seven exam papers fully covered, expanded 2026-09-02)** - from real exam PDFs + official course material, redesigned per the copyright policy (own scenarios, seeded numbers, real countries); **numeric-only by decision 2026-08-28**; every topic ≥3 phrasing variants per Nico 2026-09-02; since 2026-09-08 every story-based question (281 of 447 across all four banks) rotates a seed-picked story line so the pattern is not obvious; Financial Accounting, Entrepreneurship, Marketing wait on their exams |
| 12 | Finance: add `source` links for questions matching actual exam tasks | planned |
| 13 | Redesign - direction 3a "The Statement" (the design language): private-bank shell, ad + question + account on one screen, phone tab bar | done |
| 13a | Career setup page (`/career`): subject grid + topic ticks + single Semester-Marathon mode; `/quiz` resumes the stored run | done |
| 13b | Unlimited session: whole selected pool dealt once, write-offs re-queue with fresh numbers until every posting settles | done |
| 14 | German edition as a second locale (`/de/…` + hreflang) | planned |
| 15 | Highscores/multiplayer backend - optional extra, never on the read path | done - see #26 and #27 |
| 16 | `/products` page v2 "the bundles": eight joke bundles since 2026-09-06 (FinanceBro Starter Pack 6 - Birkin card shows a real orange ostrich Birkin; Aurafarm yellow glasses added 2026-09-08, BWL Marie 10 - pink matcha, vintage notebook, thin yellow glasses added 2026-09-08, Undercover Broke Student 6, Excel Monkey 4, Doomsday Bunker 6 - flip clock + the exam-legal calculator, LinkedIn Thought Leader 6 - engraved name plate + bookends, Boring Index Fund 4, After-Exam Party Kit 7: Aperol tower, beer pong, shot roulette, spritz glasses, party speaker, decanter, whiskey smoker, the Insider Position - beer mortar opener dropped 2026-09-08) in a 2-col card grid; images are Adobe Stock (free tier, licensed on Nico's account, committed under `public/products/`, scouted 5+ candidates each) plus four Wikimedia Commons CC BY-SA photos (Birkin, Red Bull can, JBL PartyBox, beer tower) credited in the footer, object-contain so nothing crops; every product links one specific amazon.de listing (ASIN via `amzProduct`, no search links; PartnerNet tag `financebro0a-21` live since 2026-09-11; party speaker = JBL Flip 7 since 2026-09-11, suit card renamed "The Suspiciously Cheap Interview Suit", no price), calculator card = Casio FX-85MS (TUM calculator policy), Birkin sold-out gag, compact § 5a UWG disclosure; ketchup + cigarettes removed 2026-08-29 per Nico; **2026-09-12:** the Party Kit's eighth card is the secret "?" Insider Position (`MysteryCard` - Rickroll, worker-side click counter `/api/counters/mystery` shown in the copy, fallback line without the worker), and "The Burn Rate Desk" below the bundles carries the Amazon subscription bounties (Prime Student first as the student special - 6 months free then half price -, Audible, Music Unlimited, Kindle Unlimited) via `amzPage`, each labelled as advertising | done |
| 17 | Library (`/library`) v2 "portfolio statement": 2-col book grid, fund-overview chips (positions/avg ROI/top holding), 8 read books with **generated typographic covers** (`CoverCard`; the publisher covers came down 2026-09-08 - no licence for cover art on an ad-financed affiliate page, real covers return via Amazon's API images), ROI-multiplier ratings (Lean Startup ×67 per Nico), small print merged into one compact card; every book links one specific amazon.de listing (ISBN via `amzProduct`, 2026-09-11); ad-free by rule | done |
| 18 | Legal pages: `/impressum` (§ 5 DDG, private operator) + `/privacy` (GDPR/TDDDG) + `/terms` (DSA: name rules, moderation, report-a-name mailto, point of contact - 2026-09-08), site-wide footer (legal links only - Library lives in the nav); Art. 13 notice under every name field; `docs/gdpr-records.md` | done |
| 19 | Consent-gated PostHog (EU cloud): token baked into `src/lib/analytics.ts`; Google's TCF consent dialog is the cookie banner, the site's own banner is a fallback that only appears when Google's dialog never shows - since 2026-09-08 that fallback asks about ads AND analytics, and AdSense is paused + Consent Mode denied until either dialog answers | live since 2026-09-06 |
| 20 | Landing page v2: joke hero + "Start your career" CTA, teaser cards (Munich Matcha Alert still coming soon; duels and leaderboard are live links to `/multiplayer` and `/leaderboard`), compact subject strip for SEO | done |
| 21 | Career setup v2: stepped flow (Step 1/2), topics start **unselected**, "Select all" tick row, phone auto-scroll + tap-again-to-start | done |
| 22 | Ads: all slots on IAB-standard sizes (160×600, 200×200, 728×90, 320×100, 468×60) + fixed 320×50 mobile anchor on every page except `/library`, consent-banner-aware; since 2026-08-29 the sticky 160×600 skyscraper rail (`AdRail`) rides alongside the whole page on desktop on every page except `/`, `/library` and `/career` (quiz + multiplayer game rails made sticky, products/multiplayer desk gained rails). AdSense wired 2026-09-06: client id + six slot ids in `src/lib/ads.ts`, tag in `<head>`, units render live per slot id; 2026-09-12 audit: the fixed 728×90 only serves from 1320px viewport (the centre column is narrower below - the 320×100 serves there), the rail cards hand their 2 border pixels back to the unit (`-mx-px`), and a seventh slot `rectangle` (300×250, id set, foot of the quiz account rail) | done - site review + GDPR message publish still owed, see `docs/adsense-setup.md` |
| 23 | Copy rule: no em dashes in shipped text (`-` instead), smoke-guarded on `/` and `/career` | done |
| 24 | Quiz: 💡 hint button (reveals the question's authored `hint` - definition / rule the exam would not print - plus the lecture formula, the first `$…$` segment of the worked solution; leak-checked in `verify`; payout −50%; since 2026-09-09 prompts may not coach - `verify` fails on definitions and decision rules in prompts) + Skip button (posting leaves the run, 0 💸, "forwarded to the tax advisor" in ledger/statement); since 2026-09-02 the given-values table is **folded by default** and advice is tiered: 📋 Table reveals the given-values table for −30% of the payout, 💡 Hint reveals table + lecture formula for −50% (discounts never stack past 50%; table free once settled) - every prompt carries all numbers in prose, exam-style; multiplayer keeps a free fold (payouts are server-side) | done |
| 25 | Landing v3 "the banking app": navy account card (real balance, position + its last payroll - `salary` per rank), fake € statement with declined finance-bro expenses, CTA "Make some money 🤑"; brand recased **FinanceBro**; balance pill shows the rank name instead of TIER n; supersedes the v2 hero (#20) | done |
| 26 | Multiplayer v1 "duels desk" (`/multiplayer` + `worker/`): lobby rooms with code + invite link, two modes (Front Running 🏃 shared-posting race, Bull Run 🐂 own-pace race), Inflation 📈 bot, live scoreboard, self-chosen names with slur filter, D1 semester leaderboard, server-side grading in a Durable Object with the shared engine, BroDollar payouts credited to the account balance (base points per settled/won posting + 250 💸 win bonus). Optional extra per hard rule 1: without `NEXT_PUBLIC_MP_URL` the page shows the canon placeholder. v1.1: WS keepalive + auto-reconnect, ⚡ Rapid mode, Challenge-Inflation lobby, corporate-ladder scoreboard, ads on desk + game, phone race strip. v1.2 (2026-09-02): the closing bell shows a **payroll ranking by BroDollars earned this round** (winner keeps 🏆 + bell bonus); games no longer feed a wins table - winnings are booked per subject into #27 | **live** at finance-bro.de/multiplayer |
| 27 | **Semester leaderboard** (`/leaderboard`, 2026-09-02): BroDollars earned this semester, one board Overall + one per subject (tabs), top 50 + your own rank even outside the top. Fed by the solo quiz (every settled posting is POSTed as (qid, seed, answer, amount) and **re-graded by the worker** with the shared engine, capped at base points + max rank bonus, paid once per seed) and by multiplayer games (booked per subject at the closing bell). Identity = the multiplayer player id; unnamed players appear as numbered intern names (`Brainrot Intern #4127` etc., derived from the id), get nudged to claim a desk name once they are on the board, and the claimed name auto-loads at the duels desk. The name field (duels desk + board) starts empty, cycles the intern names as placeholder, 🎲 adopts the shown one, and an empty submit uses it. Replay guard = exact (player, question, seed) only - fresh seeds per run mean repeated practice keeps paying. D1 tables `earnings` + `settled_postings` (old `leaderboard` table unused). Optional extra per hard rule 1: fire-and-forget reports, own "desk not staffed" state | **live** - the worker creates the D1 schema itself (`ensureSchema`) |
| 28 | **Corporate ladder + rich list** (2026-09-08, Nico): `/leaderboard` renders every rung Pupil → FinanceBro from the local balance (`CorporateLadder`, current rung highlighted, rungs below ticked, cumulative unlock price + decorative payroll; the endgame titles sit on top as rungs of their own, payroll classified) and a **Net worth · top 10** card (`NetWorthTop`, overall board, ladder title estimated from booked BroDollars, own position with the gap when outside the ten). The landing statement has **one transaction list per rung** (`src/content/statements.ts`, 21 lists aligned with `ranks`, running gags: LinkedIn Premium from declined to acquired, matcha, vest, gym, 0DTE SPY calls closing every statement) | done |
| 29 | **Search metadata, scenario A** (2026-09-11): `src/lib/seo.ts` - per-route canonical + Open Graph via `pageMeta()`, geo terms (München, Garching, Arcisstraße, Straubing, Heilbronn, Ottobrunn) and German search terms in the root/subject descriptions + meta keywords, JSON-LD `@graph` (Organization with `areaServed`, WebSite, WebApplication with EducationalAudience); TUM named in metadata only on `/`, `/career`, `/quiz?subject=` (smoke-guarded). | done |
| 30 | **Course + city entrance pages, scenario C** (2026-09-11): static routes `/finance`, `/econ-1`, `/econ-2`, `/financial-accounting`, `/cost-accounting`, `/entrepreneurship`, `/marketing` (`src/app/[subject]/page.tsx`, `dynamicParams = false`, unknown slugs 404) with intro, topic chips + live count, three survival notes and a campus line each (`src/content/course-pages.ts`), LearningResource + BreadcrumbList JSON-LD, above-the-fold not-affiliated line (`NotAffiliated`); `/bwl-muenchen` city page (all five places, links every course, CollectionPage JSON-LD, TUM-free metadata); linked only from the footer's discreet course line + sitemap (0.8; `/quiz?subject=` 0.7) - no nav item by decision | done |

## Non-goals (deliberate)

- No database on the read path (hard rule 1 in `CLAUDE.md`).
- No syllabus-derived seed questions - removed 2026-08-21; exam ingest is the
  only way content enters the three banks still waiting (Financial Accounting,
  Entrepreneurship, Marketing).
- No further harness machinery (init rituals, session scripts) while sessions
  are interactive - the gate + evaluator + this file are the load-bearing
  pieces. Revisit only for unattended runs.
