# Backlog

Handoff file for the next session: what is true right now, what is owed on
Nico's machine, what is next, what is undecided, what is known to be weak.
Not a changelog - the session log is `git log`; feature status is the table
in `SPEC.md`. Keep every section short enough to read at session start.

## Current state (2026-09-09)

- **Code:** 447 numeric questions (Finance 159, Econ 1 107, Econ 2 90, Cost
  Accounting 91; since 2026-09-08 281 of them rotate a seed-picked story
  line - see the session note below; Financial Accounting, Entrepreneurship, Marketing empty until
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
- **Legal audit fixes (2026-09-08, latest):** AdSense paused + Consent Mode
  denied until a decision (`AD_CONSENT_BOOTSTRAP`, tag is `defer`), own
  banner asks ads + analytics separately, old consent records re-asked;
  `/terms` (DSA Arts. 11-16), Art. 13 line under every name field, wider
  slur filter; Open Library covers deleted → `CoverCard`; CC BY-SA credits
  with deed links + share-alike sentence; Amazon disclosure bold on
  `/products` + `/library`; `source` stripped from bundles (Turbopack
  loader, smoke-guarded); PostHog lazy bundles off; leaderboard legal basis
  → Art. 6 (1) (f); `docs/gdpr-records.md` (Art. 30 + DPA checklist).
- **2026-09-08 features:** `/leaderboard` shows the full corporate ladder
  (`CorporateLadder`, local balance, endgame rungs on top) and the net-worth
  top 10 with your own position (`NetWorthTop`, overall board); the landing
  statement has one transaction list per rung (`src/content/statements.ts`,
  aligned with `ranks`, build fails if the counts differ).

## Owed on Nico's machine (real Chrome, dark mode)

- **Nico's decisions from the 2026-09-09 exam-fidelity audit** (the
  reviewers kept these; change on his word): (a) "too easy vs exam" -
  `e1-mono-*` (5 q) print "so $MC = c\,q$" next to the cost function;
  `e1-pctl-cap-*` (3 q) say the cap "lies below the market-clearing
  price"; `fin-bond-dmod` / `fin-bond-modified-duration` hand over the
  Macaulay duration; `fin-cs-eps-leverage` gives both new debt and shares
  repurchased; `fin-ratio-diluted-eps-simple` gives the dilution factor;
  `ec2-lm-price-setting` / `ec2-lm-profit-per-worker` give λ and μ
  directly; `ec2-ls-employed-count` gives the rates, not head counts;
  `ca-proc-wa-ending-wip` / `ca-proc-wa-completed-costs` hand over the
  cost per equivalent unit. (b) kept as exam data, arguably coaching:
  `fin-ratio-dupont` / `fin-ratio-book-leverage` / `fin-ratio-nfl` gloss
  their input ratios; `fin-eq-pvgo` / `fin-inv-npv-perpetual` explain what
  a negative answer means; `e1-mkt-total-surplus` "(consumer plus producer
  surplus)"; `e2-rd-subsidy` "to correct the underinvestment"; the
  `ca-alloc-*` "(before any levy)" clauses; `ca-pl-noe-absorption-profit`
  opening-stock valuation clause; `fin-ratio-roa` lost its definition
  (Berk/DeMarzo add-back form assumed).
- A quiz run with the 💡 button on a few authored hints (Pareto, sunk
  cost, quick ratio) - seen only in headless dark-mode Chromium.
- Two runs in a row on the same topic: the second must open with a
  different posting, and re-dealt write-offs with a different story line
  (`fb_variants_v1` in localStorage).

- `/career`: locked careers are now grey dashed cards with a lock, open
  ones white with a shadow (2026-09-09, Nico could not tell them apart in
  real Chrome) - check the difference is obvious on his screen.
- `/products`: the nine new cards (Starter Pack 6, BWL Marie 10, Doomsday
  6 incl. the calculator, LinkedIn kit 6, Party Kit 7) - seen only in headless dark-mode Chromium, where the
  lazy images below the fold had not loaded when the shot was taken. Look
  at the engraved-plate text size and the pink matcha tint in particular.
- A quiz run through Econ 1 / Cost Accounting: read a few rotated
  prompts for grammar the reviewers missed (they rendered ~300 variants
  each, but not every seed).

- **Legal audit follow-ups (dashboards, not code):** AdSense → publish the
  GDPR message AND accept the Google Ads Data Processing Terms; PostHog
  retention ≤ 24 months + DPA; Vercel + Cloudflare DPA PDFs saved; Adobe
  Stock: confirm no product photo is "editorial use only" - all in
  `docs/gdpr-records.md` §§ 2-3. Also: private-window check that the own
  banner now shows the "Pick and choose" switches and that no
  `pagead2`/`doubleclick` cookie exists before answering it (DevTools →
  Application → Cookies); after "Never", check ads (if any) come without
  `__gads`. AdSense site review: if Google ever reports "code not found",
  the `defer` on the tag (layout.tsx) is the thing to look at.
- `/library` cover cards, `/terms`, the name-field notice on `/multiplayer`
  and `/leaderboard`, the `/products` credit block - all seen only in
  headless dark-mode Chromium.

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

- **Amazon PartnerNet:** `AMAZON_TAG = "financebro0a-21"` set 2026-09-11
  (DE store ID, verified with the PartnerNet Link Checker). Still owed:
  3 qualifying sales within 180 days or the account is closed. Product
  images stay stock photos and the Library keeps its generated covers
  (Associates only allows API-served images, which needs 10 sales in 30
  days - that API is also the only clean way to get real book covers back,
  decided 2026-09-08). Owed check: `npm run check` could not run this
  session (cloud npm registry blocked, sandbox must not run npm on the
  mount); only `tsc --noEmit` ran green. Run the gate locally once.
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

- **Hint = authored `hint` + lecture formula** since 2026-09-09 (80 of 447
  questions carry an authored hint; the rest show the first `$…$` of the
  explanation, which for a handful of special-case annuities is a given
  rather than the formula). Never leaking - verify guards that.
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

**Exam-fidelity audit: prompts ask, hints coach (2026-09-09, latest
session).** Per Nico: a prompt may not explain the concept it tests (the
Pareto definition, "the ticket is already paid and does not count"). (1)
`build` may return `hint`; `src/lib/hints.ts` shows it behind 💡 and
appends the explanation's first `$…$` when the hint has no math;
`QuestionInstance.hint`; label now "table + rule + formula". (2) All 447
questions audited by four subagents (one per bank), 80 changed: the
definition / decision rule / method moved into `hint`, prompts and given
labels made exam-neutral (`sunk*` scenario fields renamed, "(sunk)" labels
gone), maths untouched - the question-reviewer diffed answers over 60
seeds: identical. Its two FAILs (arithmetic-degressive depreciation lost
its pinning convention) fixed by putting "the final year's amount equal to
the yearly decrease" back as exam data. (3) `verify` now fails on coaching
phrases in prompts / given keys on every seed (`COACHING` list) and
leak-checks the resolved hint. (4) Variant memory in `src/lib/session.ts`:
`fb_variants_v1` remembers the last seed per question and the last opening
posting; `variantSeed()` re-draws (≤ 3 candidates) when a re-deal would
open with the same story line, `rotateAwayFrom()` never opens two runs with
the same posting; verify covers both. `randomSeed()` never returns 0 (the
worker rejects it). (5) `_helpers.ts` caches its two `Intl.NumberFormat`
instances - a bank builds 10× faster. Rules file + skill document the
prompt-vs-hint rule.

**Story-line rotation in all four banks + nine Bro Shop cards
(2026-09-08, latest session).** Per Nico. (1) Questions: 281 of 447
questions now draw a scenario FIRST in `build` (`const s =
rng.pick(<BANK>_<ID>_SCENARIOS)`, string-only objects in one module-scope
block above each bank's export; `cap()`/`poss()` helpers for sentence
starts and possessives) so the same concept shows up as concert / bungee
jump / cinema / pottery class / football match etc. Pure-formula
questions were left alone: Econ 1 99 of 107 rotate, Econ 2 61 of 90
(Solow + the real-country items already rotate countries), Finance 30 of
159 (bonds/options/CAPM/formula annuities untouched), Cost Accounting 91
of 91. Maths, ranges, ids, units, `source` lines unchanged - the econ1
reviewer diffed answers old vs new over 200 seeds: identical. Drawing the
scenario first shifts every seed's numbers for the touched questions, so
a stored run shows different numbers after deploy (prompt and answer
still one seed - hard rule 3 holds). Four question-reviewer passes (one
per bank) found 9 wording defects, all fixed (a "press presses",
"buys that grapes", "a agent", "a allowance", a perpetual "concession",
firm possessives ending in -s, bare department names needing "the",
"olives movements"). Side effects: ~100 plain-text em dashes in the
banks replaced by `-`; a comment in econ1 that quoted source-exam
parameters was removed (rule). Pre-existing, not fixed: "1 tonnes" /
"1 hours" / "1 workers" when a draw hits 1 in ~10 questions
(`e1-ca-*`, `ca-prog-*`, `ec2-tech-first-mover-rent`) - a `plural(n,
word)` helper in `_helpers.ts` would clear them all. (2) Bro Shop: Pink
Matcha Set, Vintage Notebook, thin-frame yellow glasses -> BWL Marie;
Tony Stark glasses, Decanter, Whiskey Smoker Kit -> Starter Pack;
Engraved Name Plate (five engraving suggestions in the blurb) + Bookends
-> LinkedIn kit; Flip Clock -> Doomsday Bunker. Re-sorted 2026-09-09 per
Nico: decanter + smoker -> Party Kit, calculator -> Doomsday, Tony Stark
glasses renamed "Aurafarm Glasses, Yellow", pink matcha right after the
green one, all nine blurbs rewritten for joke quality. Note: the question
COUNT on /career stays 447 - the variety lives inside each question, not
in new ids (Nico asked why the number did not move). All amazon.de ASINs
checked live in Chrome; Nico's pink matcha (B0H1WCY4GF) is out of stock
on .de, so the card links the ZENS pink set (B0F138W228, 4.8) - swap
back if it restocks. Photos: free-tier Adobe Stock (162932600,
452828545, 340403421, 92710388, 539675490, 526487337, 944423957,
620387923, 355191591), three edited locally because the free tier had
no match: matcha hue-shifted green -> pink, aviator lenses tinted amber,
name plate composited from a brushed-metal texture with our own text.
Gate green in the cloud clone (typecheck, verify 447 x 200, build, 117
smoke). Party Kit still has its lone fifth card.


**Bro Shop: pattern behind the photo, exam-legal calculator, nine
listings/photos re-picked (2026-09-08).** Per Nico.
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
