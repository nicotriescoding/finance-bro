# Backlog

Handoff file for the next session: what is true right now, what is owed on
Nico's machine, what is next, what is undecided, what is known to be weak.
Not a changelog - the session log is `git log`; feature status is the table
in `SPEC.md`. Keep every section short enough to read at session start.

## Current state (2026-09-08)

- **Code:** 447 numeric questions (Finance 159, Econ 1 107, Econ 2 90, Cost
  Accounting 91; Financial Accounting, Entrepreneurship, Marketing empty until
  their exams arrive). Gate = typecheck + verify (447 × 200 seeds) + build +
  104 smoke checks; `worker/test/e2e.ts` 26 checks. `npm run lint` is clean
  (0 errors, 17 warnings from the React Compiler rules - see Known gaps).
- **Live:** multiplayer + semester leaderboard on the Cloudflare worker
  (`finance-bro`, D1 `finance-bro-mp`, schema self-created via
  `ensureSchema()`), AdSense (client id + six slot ids in `src/lib/ads.ts`,
  tag in `<head>`, Google's consent dialog with the own banner as fallback),
  PostHog EU (token baked into `src/lib/analytics.ts`).
- **Harness (2026-09-08 audit):** three evaluator subagents in
  `.claude/agents/` - `question-reviewer` (question diffs),
  `functionality-reviewer` (any other code diff), `design-reviewer`
  (anything visible, wants screenshots). Docs were de-drifted the same day:
  CLAUDE.md, README, SPEC, rules, skill, worker README, adsense doc; the
  stale DESIGN-BRIEF.md, `docs/design/3a/`, `/language`, `useProfile`,
  `buildSession`, `worker/test/shots.mjs`, scaffold SVGs and `.idea/` were
  deleted; the last exam-tuple guards in econ1/econ2 were replaced by
  ranges; `eslint-config-next` bumped to 16 (flat config, no FlatCompat).
- **2026-09-08 features:** `/leaderboard` shows the full corporate ladder
  (`CorporateLadder`, local balance, endgame rungs on top) and the net-worth
  top 10 with your own position (`NetWorthTop`, overall board); the landing
  statement has one transaction list per rung (`src/content/statements.ts`,
  aligned with `ranks`, build fails if the counts differ).

## Owed on Nico's machine (real Chrome, dark mode)

- `/leaderboard`: ladder + net-worth panel with the live worker (sandbox saw
  it with a mocked board only), the 🎲 name suggestions, per-subject tabs.
- `/`: a few statements up the ladder (set `bwr_score_v1` in localStorage to
  e.g. 25000, 120000, 1000000 and reload) - check nothing wraps into the
  amount column.
- `/products`: the pattern tile behind the photos, the Party Kit's lone fifth
  card, the CC BY-SA credit lines.
- The PROMOTED flash once for real (earn ~100 💸 from a fresh balance).
- PostHog: a `$pageview` after accepting consent; AdSense: the site review
  status and whether the GDPR message is published (`docs/adsense-setup.md`).
- Housekeeping: delete `_to_delete/*.tgz` if present; `git rm
  public/products/prosecco.jpg public/products/bottle-opener.jpg` if they
  still exist locally.

## Next up

- **Amazon PartnerNet:** once approved, set `AMAZON_TAG` in
  `src/lib/affiliate.ts`; product images stay stock photos (Associates only
  allows API-served images, which needs 10 sales in 30 days).
- **AdSense:** site review + publish the GDPR consent message
  (`docs/adsense-setup.md`, steps still open). **PostHog:** retention ≤ 24
  months in the project settings (privacy policy promises it).
- **D1 hygiene:** old-semester rows in `earnings` / `settled_postings` must be
  purged within 12 months (privacy policy) - nothing built yet; a scheduled
  worker cron or a manual `DELETE ... WHERE semester <> ?` at semester start.
- **Rate limit `/api/earnings`** - nothing stops a script from posting
  settled seeds in a loop beyond the per-seed replay guard.
- **Exam ingest:** Financial Accounting, Entrepreneurship, Marketing wait on
  their exam files; Finance `source` tags for questions matching real exam
  tasks (SPEC #12).
- **Nav overflow at 1024 px:** the desktop nav pushes the balance pill
  off-screen with a 3-digit balance (seen 2026-09-07).
- **Party Kit sixth card** so the last row is not a lone card, if it bothers
  Nico.
- **Impressum email is temporary.** nicolas.dumpe@gmx.de is public on
  `/impressum` + `/privacy`; swap to a finance-bro.de address once mail exists.
- **Cowork project description** in Claude Desktop still says
  "Oberflaeche und alle Aufgaben auf Deutsch" - Nico confirmed 2026-09-08
  that English is canon; replace it with the text in
  `.claude/cowork-project-instructions.md`.
- **Multiplayer icebox:** matchmaking queue, rematch keeps the room,
  friends/accounts, BroDollar nickname market - parked until real use.

## Open decisions

- **German edition.** Planned as a **second locale**, not a revert. The
  question formatters share `LOCALE` in `_helpers.ts`; `grading.ts`,
  `money.ts`, `AccountStatement.tsx`, `CorporateLadder.tsx` and
  `library/page.tsx` still hardcode en-US and would move to one shared
  formatter first. Then the question text (parallel bank vs. translation
  layer), routing (`/de/…` vs. subdomain) and `hreflang`.
- **SEO after the language switch.** finance-bro.de serves English metadata
  to an audience that searches in German. Watch Search Console; the German
  locale above is the fix, not reverting.

## Known gaps

- **Hint quality varies.** The hint is the FIRST `$…$` segment of the
  explanation; for a handful of special-case annuities that is a given, not
  the formula. Never wrong, never leaking (verify guards that). Fix if it
  bothers anyone: optional explicit `hint` field, preferred in
  `src/lib/hints.ts`.
- `fin-bond-modified-duration` asks for a signed percentage price change, so
  `7.19` instead of `-7.19` fails. Reword to "by how much does it fall" or
  say "state the sign".
- **Net worth ≠ balance.** The rich list ranks BroDollars the worker booked
  this semester; the navy balance is local and lifetime. The ladder titles on
  the rich list are estimated from the booked amount and can sit a rung or
  two below the player's real title. Footnoted on the page; accepted.
- **No visual regression test.** The cloud sandbox takes headless dark-mode
  Chromium screenshots (Playwright at `/opt/pw-browsers`), but not with
  Nico's fonts or his real Chrome - hence the "owed" list above.
- **Lint warnings (17):** `react-hooks/set-state-in-effect` on the
  read-localStorage-in-an-effect pattern and `react-hooks/refs` in
  `useCountUp` / `usePrevious`. Deliberate patterns, downgraded to warnings
  in `eslint.config.mjs`; rewrite the hooks if the React Compiler is ever
  turned on.
- The smoke test's German check is five words on `/`; question text is only
  guarded by the reviewers.
- **Hydration mismatch by design:** `usePersistentState` reads localStorage
  in the `useState` initialiser, so a non-zero balance makes the first
  client render differ from the SSR HTML (pill, navy card, ladder). React
  recovers by re-rendering; no visible flash so far. The clean fix is
  initialising to the default and syncing in an effect (also clears the
  lint warnings above).
- The sandbox cannot delete files under the mount; if git refuses to run:
  `rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock`.

## Last three sessions (kept verbatim, older ones are in `git log`)

**Bro Shop: pattern behind the photo, exam-legal calculator, nine
listings/photos re-picked (2026-09-08, latest session).** Per Nico.
(1) The money pattern was showing *through* the products (multiply blend);
the photo now sits in a white rounded tile (68 % wide) on top of the
pattern - side effect: dark-background photos (matcha, highlighters) are
fine now. (2) Calculator = Casio FX-85MS (B000120516), one of the two
models the TUM Chair of Financial Management names as allowed
(fa.mgt.tum.de/fm/teaching/calculator-policy; the other is the TI-30X
IIS); card renamed "The Exam-Legal Calculator" with a check-your-course
note. (3) Links: shaker → BlenderBottle Classic V2 (B0CN16Y9S5), iPad →
iPad A16 (B0DZ769BMS; Amazon has no iPad+Pencil bundle, note on the
card), Prosecco → Dom Pérignon Vintage 2015 (B0BT7W5T9V, card renamed
Emergency Champagne), mat → Amazon Basics black (B0CJJNSM9V, 4.4 - best
black option), Bialetti → Moka Express 3-cup black (B06ZYYDGYN), tower →
GOODS+GADGETS 5 L column (B0BFBYHYC5, 4.2 - the category has no 4.5),
speaker → JBL PartyBox 310 (B08HBG3M7M). Beer mortar removed (no
listing worth linking), "Beer Pong, Regulation Set" → "Beer Pong Set",
Party Kit chips 5 positions / 5 liters. (4) Photos: Stock free tier for
calculator (165040606), iPad+pencil (437346634), champagne (555201757),
black claw clip (273457849, matches the Lolalet set), black mat
(224311222), black moka (1236907954). Three from Wikimedia Commons, CC
BY-SA 4.0, credited in the footer (license condition): Red Bull can
(Klaas van Buiten, cropped), JBL PartyBox 710 (TaurusEmerald, bg removed
locally with rembg/u2net), beer tower (Pundit, bg removed via the Adobe
connector after an upload - the connector rejects commons.wikimedia.org
URLs directly). `prosecco.jpg` and `bottle-opener.jpg` are `git rm`'d
in the cloud clone; on the mount the sandbox cannot unlink them, so if
they still exist locally: `git rm public/products/prosecco.jpg
public/products/bottle-opener.jpg` before pushing (harmless if left).
Smoke updated: no search links left, four CC BY-SA credits, FX-85MS
linked, no mix-blend-mode. Gate green in the cloud clone (typecheck,
verify, build, 97 smoke); dark-mode Playwright shots of /products
(Starter Pack, BWL Marie, Party Kit, footer) looked right. Open:
real-Chrome look on Nico's Mac; the Party Kit now has 5 cards, so the
last row is a lone card - add a sixth if that bothers him.

**PROMOTED flash + seven new rungs on the ladder (2026-09-07).** Per Nico. (1) `PromotionOverlay` (mounted once in the root
layout) watches the balance and, whenever the rank index climbs - quiz,
multiplayer, anywhere - takes the whole screen: mint flash, 48 💵💸🤑💰💶🪙
raining from the top, old emoji greyed → new emoji popping, blinking
"📣 PROMOTED 📣", title + perk, the new per-posting bonus, auto-dismiss
after 5.2 s or tap. Nothing fires on page load (previous render vs
current, never vs storage); reduced-motion drops the rain and the
pulses. This is the deliberate exception to the "nothing confettis"
rule in `globals.css`. (2) Ladder is now 21 ranks: Pupil 🎒 (the new bottom, below Unemployed), Volunteer 🧡 (one question each, so the first two promotions flash almost immediately), Unpaid Intern 🧃,
Excel Monkey 🐒, Subcontractor 🪪, LinkedIn Thought Leader 🎙️, Crypto
Bro 🪙, Hedge Fund Guy 🦈, Family Office Heir 🎾 (Nico's picks from a
proposed list). `LEVEL_COSTS` retuned per Nico: **FinanceBro at exactly
1,000,000 💸**, payouts unchanged, exponential - 20 steps (two warm-ups,
then ×1.45), 310,550/level past the top. One full Econ 1 marathon ≈ 18,700 💸 +
rank bonus, so: run 1 ends at Junior Consultant, Consultant/LinkedIn on
run 2, Investmentbanker 3, Crypto Bro 4, VC Guy 5, MD 7, Hedge Fund 10,
Unicorn 13, Heir 18, Bezzo 25, FinanceBro 35. (3) **Endgame = the
leaderboard.** Past FinanceBro the level keeps counting but the TITLE
comes from the overall semester leaderboard position (`endgameRank` in
`rankings.ts`, `useRank` hook shared by pill, cards, quiz strip, career
track, overlay): #1 The Richest Person 👑, #2 🥈 / #3 🥉, #4-#10 Nth Richest
Person 💎, #11 Almost Made It 🫠, below that FinanceBro #N 💸💪. Position is
fetched only once the player is a FinanceBro (module-level store, 60 s
freshness, re-checked 4 s after every credit so a climb flashes the
PROMOTED overlay too - "Leaderboard #9 · was FinanceBro #12"). Unknown
position (no worker URL, 503, nothing earned this semester) = plain
FinanceBro; hard rule 1 holds. The pill truncates long titles below xl.
Proof: `npm run check` green in the cloud clone; headless dark-mode
screenshots on /quiz with a mocked leaderboard: title "9th Richest
Person 💎" in the pill, climb 12 → 9 flashes, pill fits at 1280.
Observed, pre-existing: at 1024 px the desktop nav overflows and pushes
the pill off-screen even with a 3-digit balance. `Rank.tier` now maps ranks to the
landing statement's six spending tiers explicitly (was `index / 2`).
Consequence: existing balances map to a different level number and a
title one or two rungs off - joke ladder, accepted. Proof: `npm run
check` green in the cloud clone (95 smoke checks); headless-Chromium
dark-mode screenshot of the flash on `/` (rain, card, dismiss clean).
**Owed on Nico's machine:** see the flash once for real (solve a posting
near a level boundary, e.g. reset the balance and earn ~100 💸).

**Leaderboard was dead on prod - worker now creates its own D1 schema
(2026-09-07).** Nico: BroDollars must count for every
solved question, solo and duels, on the subject board and the overall
board. The code for that has been in since 09-02; what was missing was the
manual `wrangler d1 execute` (owed since then), so `earnings` /
`settled_postings` never existed: the live worker answered every
`/api/leaderboard` with 503 `leaderboard_unavailable` ("desk is not
staffed"), every solo `/api/earnings` report and every closing-bell booking
failed silently. Fix: `ensureSchema()` in `worker/src/scoreboard.ts`
(schema mirrored from `schema.sql`, `CREATE ... IF NOT EXISTS`, memoised
per isolate, retried on failure) runs before every D1 access - read,
book, rename, replay guard. No manual step remains; `schema.sql` stays
as documentation/optional. Proof in the cloud clone: worker typecheck
green; `wrangler dev` against an **empty** local D1 - `GET
/api/leaderboard` 200 with rows [] - and `worker/test/e2e.ts` ALL GREEN
(26 checks: Bull Run/Front Running/Rapid + scoreboard overall/subject/
you/bot-free + solo booked/capped/intern-named/replay-refused/wrong-
refused/fresh-seed-pays). Site code untouched (no `npm run check`
needed). **Nico next (done 2026-09-08 - pushed):** Cloudflare redeploys the worker; then
/leaderboard should show "TOP 0" without the error card and the first
solved posting appears within seconds (solo reports are fire-and-forget).
Note: postings solved before the push are gone - the worker never got to
book them.
