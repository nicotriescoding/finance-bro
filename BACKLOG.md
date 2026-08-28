# Backlog

Open work and decisions, most useful first. Keep this current — it is how a new
session picks up where the last one stopped. The durable product shape and
feature status live in `SPEC.md`.

## Where things stand

**Shop + Library go real, ladder gets rungs (2026-08-28).** (1) The
multiplayer corporate-ladder scoreboard now draws an actual ladder behind the
climbers - two SVG rails + one rung per posting (capped at 20), aligned to
the same 6..84% climb band as the player chips. (2) **Affiliate decision:
Amazon PartnerNet** - rationale + Nico's tag TODO live in
`src/lib/affiliate.ts`; every link is an amazon.de *search* link (rot-proof,
tag drops in with one constant). Patagonia (AvantLink, 4-6 week manual
review, traffic vetting) judged unrealistic for now. (3) `/products` rebuilt:
Birkin Bag ("something small for forgetting her birthday", SOLD OUT chip),
canon Patagonia Vest copy with a real ellesse search link + "Patagonia would
not return our calls" note, canon Business School Cigarettes copy linking
bubble cigarettes, Hela Curry Gewürz Ketchup, TI-30 calculator, Matcha
starter set (Munich Matcha Alert tie-in). Images hotlinked from Wikimedia
Commons (PD/CC0 where possible; CC-BY images credited in a photo-credits
card - keep it). § 5a UWG disclosure card + Amazon's "earns from qualifying
purchases" sentence added. (4) `/library` rebuilt: sections Startup /
Personal Investing / Social Understanding & Negotiation / Psychology; shelf =
Lean Startup, SPIN Selling, Psychology of Money, What Every BODY Is Saying
(the English "Menschen lesen"), Never Split the Difference, How to Win
Friends, Atomic Habits, The Child in You (the English "Das Kind in dir muss
Heimat finden"); $100M Money Models (Hormozi) sits in "on order" (unread =
unrated). **ROI-multiplier rating system** (ROI ×N per reading hour, legend
card); `roi`+`review` are null until Nico delivers HIS numbers/words
(rendered as "pending audit" - do not invent them; his two one-liners for
Lean Startup and SPIN are in). Covers via Open Library covers API. Amazon
buttons live (untagged until the tag exists). (5) Smoke grew 7 checks
(products 200/amazon/no-dead-links/canon-copy/SOLD OUT, library
amazon + ROI): 73 green, build from the /tmp/fb copy as usual. Visual check
on Nico's machine still owed: /multiplayer ladder, /products, /library.

**Waiting on Nico:** per-book ROI multipliers + personal one-paragraph
reviews (all 8), PartnerNet signup -> tag into `src/lib/affiliate.ts`.


**Multiplayer v1.1 (2026-08-26, night) - live-feedback round.** Nico played on
prod and reported drops + wishes; all shipped: (1) **disconnect fix** - the
edge kills WebSockets silent for ~100s (idle lobby or a hard question both
qualify); client now heartbeats "ping" every 25s, the DO answers via
`setWebSocketAutoResponse` (no wake), plus silent auto-reconnect with backoff
(1-2-4-8-8s) and a "reconnecting to the floor" banner; empty rooms get a 5-min
grace before reaping so reconnects and locked phones survive, and an explicit
`leave` message distinguishes walking out from a dropped line. (2) **Challenge
Inflation** now opens the lobby with the bot pre-seated instead of
auto-starting - mode/subjects/pace stay pickable. (3) **⚡ Rapid mode** toggle:
pool filtered to very_easy+easy (38 in Finance), Front Running bell drops to
45s. (4) **Game view redesign**: MARKET OPEN header chips, xl ad rail
(160×600 + 200×200), 728×90 under the card (md+) / 320×100 feed (phone),
**corporate-ladder scoreboard** - players climb an office tower from Mailroom
to Corner office 🏆, one settled posting per floor, with per-player 💸 and 📉
fine print; phone gets a thin scrollable race strip that never blocks play;
compact semester leaderboard in the desktop game rail; duels desk also got
728×90/320×100. (5) Landing statement jokes now wrap on phones
(`sm:truncate` instead of `truncate`). Verified: root check green (66),
worker tsc green, e2e now 14/14 incl. a rapid-only-deals-easy case,
headless shots desktop+phone (game, lobby with rapid, landing). Deploys on
push: Cloudflare rebuilds the worker, Vercel the site - protocol added
optional-ish `rapid`/`leave`, old clients stay compatible during rollout.

**Multiplayer v1 built (2026-08-26, evening) - awaiting Nico's Cloudflare
setup.** SPEC #26: `/multiplayer` is now the real duels desk, `worker/` holds a
Cloudflare worker (free tier, never paused for inactivity - the anti-Supabase
choice). One Durable Object per lobby: 5-char room codes (no 0/O/1/I) +
copyable invite link (`/multiplayer?room=CODE`), up to 8 humans, self-chosen
names (localStorage, slur filter -> "Intern"), host picks mode / posting count
(5/10/15) / any mix of subjects with per-topic ticks (nothing ticked = whole
bank). Two modes: **Front Running 🏃** (shared posting, first correct settles
it for everyone, 120s deadline then reveal, 3s wrong-answer lockout) and
**Bull Run 🐂** (own pace, write-offs re-queue with fresh seeds, first
finished statement ends the game). **Inflation 📈** bot on DO alarms with
per-difficulty delay/accuracy; "Quick duel" = room + bot + start in one tap.
Server sends only (question id, seed); clients build postings with the shared
engine; the DO grades with `isWithinTolerance` - scoreboards cannot be faked
from devtools. Duels pay real BroDollars: every settled/won posting pays its
difficulty's base points, the winner adds a flat +250 💸 closing-bell bonus
(server-computed, credited to the `bwr_score_v1` balance once on the end
message - the navbar pill picks it up live). Game ends upsert a D1 semester
leaderboard (SS/WS key, top 10
on the duels desk, resets by keying on the semester). Without
`NEXT_PUBLIC_MP_URL` the page renders the canon placeholder verbatim (hard
rule 1; canon copy preserved inside `MultiplayerClient`). Verified: root
`npm run check` green (66 smoke checks, from the /tmp/fb rsync copy as usual),
`worker` tsc green, and a real e2e - wrangler dev + two WebSocket players +
bot played both modes to the closing bell, 12/12 PASS (`worker/test/e2e.ts`,
run from repo root: `npx tsx worker/test/e2e.ts`). Headless-Chromium
screenshots of home/lobby/game (dark-mode OS, page stays light) looked right;
fonts/emoji tofu remain sandbox artifacts. Not built yet (deliberate):
matchmaking queue, rapid mode (needs difficulty curation), friend system,
nickname market, anti-LLM prompt injection (cut - seeded numbers + the
frontrun clock already do the work; injection is lost cat-and-mouse).

**Landing polish + rank economy shipped (2026-08-26).** Nico's punch list:
(1) hero de-emphasized - h1 down to text-2xl/3xl, tagline to 14px, the
account view leads the page; (2) the statement is wider on desktop
(`md:max-w-3xl`, phone unchanged); (3) the fake € expenses now scale with
rank - six tiers, two ranks each, from instant noodles / "Netflix, with ads"
(Unemployed) through Rimowa + minibar (Consultant), vibes-based angel checks
(VC Guy), divorce-lawyer retainers (MD/Founder) up to rocket fuel, a
−44,000,000,000 € social-media impulse buy and the 0DTE SPY calls closing
every tier at ever-sillier size (the top one dies at the int limit);
(4) `/career` CTA is on the first screen everywhere - desktop: Step 2 column
is sticky and "Start earning 💸" moved above the topic list; phone/tablet:
a fixed CTA bar rides above the anchor ad (it mirrors AnchorAd's consent
logic to stack at 120px/62px) and above the tab bar; nothing ticked now
starts the whole bank instead of a disabled button ("Nothing ticked = the
whole bank"); (5) rank economy: `LEVEL_COSTS` in `rankings.ts` replaces the
old base-100 ×1.5 curve - hand-tuned steps 100 → 3,100 (~12,300 total to
FinanceBro, ~1.3-1.4× per step, +3,500/level past the top), and every rank
carries a small flat `bonus` (0 → 150 💸) added to each settled posting -
completion pay, not scaled by time or the hint (hint still halves the base).
The "UP TO" chip includes the bonus so it never understates the payout.
`npm run check` green - 66 smoke checks. Verified via sandbox
headless-Chromium screenshots (landing desktop/phone at rank 1 and at a
seeded 20,000 💸 FinanceBro statement, career desktop + phone first screen
with the CTA above ad + tab bar); build again ran from an rsync copy
(`/sessions/…/fb`) because of the FUSE EPERM-on-delete mount issue - the
committed tree is what was checked.

**Landing v3 "banking app" + quiz hint/skip shipped (2026-08-25).** Per Nico's
punch list: the landing now IS the account view - navy card with the real 💸
balance, current position + its last payroll (`salary` added per rank, 0 € for
Unemployed, 1 € for the Unicorn Founder), an IBAN gag, the CTA renamed
**"Make some money 🤑"**, and a fake € statement underneath (oat-milk flat
whites, the Patagonia vest, a DECLINED Rolex financing rate, P1 bottle
service, "Powder, white · 'for the protein shakes'" UNDER REVIEW, 0DTE SPY
calls) with a 💸/€ exchange-rate footnote so the two currencies never mix.
Removed per Nico: the "97 questions · works fully offline · tuition: 0 €"
chip, the "The exam trainer … at TUM" sentence, and the on-page
"Ad rail · kept away from the maths" label (slots stay); "against the clock"
is now "against inflation"; the brand is recased **FinanceBro** everywhere
(h1, navbar, footer, metadata/OG - domain unchanged); the balance pill says
UNEMPLOYED 🛋️ instead of TIER 1. In the quiz, every open posting has
**💡 Hint · −50%** (numeric: the symbolic lecture formula = first `$…$`
segment of the explanation, `verify` fails the build if it would leak the
answer and warns if missing; MC: half the wrong options get written off) and
**Skip ⏭ · 0 💸** (posting leaves the run - no re-queue, streak untouched,
"SKIPPED" in the ledger, "Forwarded to the tax advisor" row + own joke line
on the session statement, grey segment in the progress strip; session gets an
optional `skipped` array, old stored sessions default it). `npm run check`
green - 66 smoke checks (10 new/changed, incl. brand title, statement
markers, removed-copy guards). Verified via sandbox headless-Chromium
screenshots (landing desktop+phone in dark-mode OS, quiz open/hint/after-skip
desktop + phone); emoji tofu remains a sandbox-font artifact. NOTE: the
sandbox now cannot build under the mount at all (FUSE EPERM on every
delete, even of files the build itself just wrote) - this session ran
`npm run check` from an rsync copy at `/tmp/fb` and re-synced edited files;
the committed tree is identical to what was checked.

**Landing v2 + career v2 + ad standardization shipped (2026-08-22).** The
homepage is now a joke landing that points at `/career` ("Start your career
🪦" CTA, coming-soon teasers incl. the **Munich Matcha Alert**, compact
subject strip kept for SEO/smoke). `/career` is a stepped setup: Step 1 pick
a career, Step 2 topics + session; topics start **unselected** with a
"Select all" tick row (replacing the text toggle); on stacked layouts
(< lg) picking a career auto-scrolls to Step 2 and tapping the selected
career again starts the run immediately (ticked topics, else all - the card
says "TAP AGAIN TO START"). Ad slots moved to IAB-standard sizes (200×200,
728×90, 320×100, 468×60; 160×600 stays) so a network drops in later, and a
new phone-only **320×50 anchor ad** (`AnchorAd`) sits fixed above the tab
bar on every page except the ad-free `/library` - it renders only after a
cookie-consent decision and hides while the banner is open, with an in-flow
spacer so it never covers content. The footer lost its Library link (nav +
tab bar keep it). All em dashes in `src/` + `scripts/` were replaced with
`-` per Nico's rule (question files: punctuation-only diff, `verify`
round-trips green); smoke now guards `/` and `/career` against em dashes.
`npm run check` green - 59 smoke checks (5 new). Verified via sandbox
headless-Chromium screenshots (phone + desktop, incl. the tap-again flow
clicking through to `/quiz`); emoji tofu + fallback font remain
sandbox-only artifacts.

**Legal + Library shipped (2026-08-21, evening).** The nav's Language slot is
now Library 📚 — `/library` has SPIN Selling + The Lean Startup as placeholder
cards ("AD · link coming soon" buttons, advertising-transparency card,
deliberately **no AdSlot**; smoke asserts "Sponsored" never appears there).
`/language` stays alive but unlinked (canon page). A new site-wide footer
links `/impressum` (§ 5 DDG for a private operator; **no** EU-ODR link — the
platform shut down 2025-07-20 and the old mandatory reference must stay gone,
smoke-guarded), `/privacy` (GDPR/TDDDG, English like the site) and "Cookie
settings". The cookie banner ("We'd like to steal your cookies 🍪") has
equal-weight accept/decline buttons and a plain-language consent sentence.
PostHog is fully wired but **inert**: `src/lib/analytics.ts` only imports
posthog-js when `NEXT_PUBLIC_POSTHOG_KEY` exists AND the visitor accepted;
EU endpoint (Frankfurt) is the default. `npm run check` green — 54 smoke
checks (12 new). Verified via sandbox headless Chromium screenshots: banner
above the phone tab bar, footer + privacy-page "Cookie settings" reopen the
banner after a decline; emoji are tofu only in the sandbox's font stack.

**Design 3a shipped (2026-08-21).** The whole site now wears the "Statement"
private-bank shell from Nico's design handoff (`docs/design/3a/`): navy chrome
with balance pill and credit float, Manrope + IBM Plex Mono, three-column quiz
(ad rail | posting card | account rail with ledger + career track), phone
bottom tab bar with the full progress stack, `/career` as the setup page
(subject cards as "dead-end careers", topic tickboxes, one Semester-Marathon
mode), sessions persisted in localStorage so Quiz resumes and Career restarts.
Write-offs re-queue with fresh numbers until every posting settles. Nico's
original jokes (rank ladder incl. "Jeff Bezzo's", Multiplayer/Language/Bro-Shop
copy, BroDollar) are verbatim; the design's German gags were translated by
meaning per the English-only rule. The Bro Shop keeps its own catalogue layout,
restyled only. `npm run check` green (42 smoke checks, incl. new `/career`
assertions).

97 questions, all Finance, all built from Nico's TUM course material (IVF
formula catalogue + the original app's data). The six non-Finance banks are
**intentionally empty** since 2026-08-21: their syllabus-invented seed questions
(78) were removed — per Nico, only content based on real TUM exams may ship.
Their invented topic lists went too; topics come back with the exams. Empty
subjects show a "being rebuilt from real TUM exams" state, guarded by smoke.

Formulas now render as KaTeX in lecture notation everywhere (prompts, given
table, choices, explanations) via `RichText`; `npm run verify` compiles every
`$…$` segment. The plain-text formula dumps (`C·((g/q)^N−1)/(g−q)`) are gone.

`npm run check` is green and runs in CI. **Nico has not pushed yet** — local
`main` is ahead of origin (this session's commit plus `b63216f`, `87fbeb6`,
`9fe74a0`, `9bc1525`).

## Next up

- **Multiplayer go-live (Nico, ~10 min, `worker/README.md` has the details).**
  Cloudflare account exists (nicolas.dumpe@gmx.de). (1) Dashboard -> D1 ->
  create `finance-bro-mp`, paste its Database ID into `worker/wrangler.jsonc`,
  run `schema.sql` in the D1 console; (2) Workers & Pages -> Import repository
  -> `nicotriescoding/finance-bro`, root directory `worker` - every push to
  main then auto-deploys the worker (same flow as Vercel); (3) Vercel env var
  `NEXT_PUBLIC_MP_URL` = the worker URL, redeploy. Then a two-tab test duel
  (`npm run dev` also works: `NEXT_PUBLIC_MP_URL=http://localhost:8787` +
  `cd worker && npm run dev`).
- **Multiplayer visual check on Nico's machine** (sandbox screenshots looked
  right, real Chrome still owed): duels desk, lobby with topic ticks, both
  modes, the settled-by banner in Front Running, closing bell + leaderboard
  row, and the canon placeholder when the env var is absent.
- **Multiplayer icebox:** matchmaking queue (a special always-open room),
  rapid mode (filter on `difficulty` once curated), rematch keeps the room -
  friends/accounts and the BroDollar nickname market stay parked until the
  base sees real use.
- **PostHog go-live** (whenever Nico wants analytics): create the project on
  PostHog Cloud **EU** (eu.posthog.com — the privacy policy promises Frankfurt
  hosting), set `NEXT_PUBLIC_POSTHOG_KEY` in Vercel per `.env.example`,
  redeploy. Consent flow is already live; nothing else to build.
- **Impressum email is temporary.** nicolas.dumpe@gmx.de is public on
  `/impressum` + `/privacy`; swap to a finance-bro.de address once mail
  exists (per Nico: "we will have to change that later").
- **Affiliate go-live (Nico):** sign up at partnernet.amazon.de (site
  qualifies: original content, Impressum, privacy page; approval finalizes
  after 3 sales in 180 days), then set `AMAZON_TAG` in `src/lib/affiliate.ts`
  and push. Decided 2026-08-28 - program is Amazon PartnerNet, links already
  live untagged on `/products` + `/library`.
- **Library content (Nico):** ROI multiplier + one-paragraph personal review
  for each of the 8 read books - drop them into the `SECTIONS` array in
  `src/app/library/page.tsx` (`roi` / `review`, currently null = "pending
  audit").
- **Ingest TUM MC past exams.** Nico has them and uploads them after the
  styling setup. Use the `add-exam-questions` skill (translates as it goes,
  KaTeX per the rules, every question gets `source`). This refills Econ 1,
  Econ 2, Financial Accounting, Cost Accounting, Entrepreneurship, Marketing —
  and can add `source` tags to Finance questions that match real exam tasks.
- **Visual check on Nico's machine.** New since 2026-08-25: the banking-app
  landing (desktop + phone, dark-mode OS - page must stay light; the fake
  statement rows, DECLINED/UNDER REVIEW chips, "Make some money 🤑"), the
  quiz's Hint (formula renders as KaTeX, payout chip halves) and Skip
  (ledger "SKIPPED" row, grey progress segment, statement row) and the
  UNEMPLOYED-style rank pill in the chrome. Older items below still open.
  Sandbox screenshots verified layout,
  palette, KaTeX and all states (write-off, resume banner, empty bank, phone),
  but with a fallback text font — the sandbox's headless Chromium would not
  apply the Manrope webfont even though the woff2 files serve 200. First
  `npm run dev` in real Chrome: confirm Manrope/Plex Mono render, check
  `/quiz` + `/career` in dark-mode OS (page must stay light), and the balance
  count-up + credit float on a correct answer. Add to the tour: `/library`,
  `/impressum`, `/privacy`, the cookie banner (accept once, decline once —
  wiped via localStorage key `fb-cookie-consent`) and the footer. New since
  2026-08-22: the landing page (phone + desktop), the stepped `/career` on a
  real phone (auto-scroll + tap-again-to-start with the ticked-topics
  variants), and the anchor ad (appears only after a cookie choice, gone on
  `/library`, never overlaps the tab bar or cookie banner).
- **Cleanup on Nico's machine** (the sandbox cannot delete files):
  `rm -rf .next_stale_sandbox .next_stale_sandbox2 .next_stale_sandbox3
  .next_stale_sandbox4` (sandbox4 is from 2026-08-25 and contains a dangling
  `.next → /tmp/fb-next` symlink from a failed workaround - after removal a
  fresh `npm run dev`/`build` recreates `.next` normally)
  (stale `.next` dirs renamed aside so builds could run), then
  `rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock .git/objects/maintenance.lock .git/*.lock.stale-* .git/objects/*.lock.stale-* && git reset`
  (the `.stale-*` files are locks the 2026-08-25 session could only rename,
  not delete)
  (this session committed via an alternate index because the sandbox cannot
  delete its own `index.lock`; the reset refreshes the stale on-disk index —
  it does not touch the worktree), and the now-unused legacy components
  `src/components/Scoreboard/` (Scoreboard, RankBadge, LevelUpAnimation) and
  `src/components/ui/` (Button, Card, Input, ProgressBar, StatBadge) — nothing
  imports them since the redesign.
- **Update the Cowork project instructions.** Nico's Claude project settings
  still carry the old German paste; the current English text lives in
  `.claude/cowork-project-instructions.md` and should replace it.

## Open decisions

- **German edition.** Planned as a **second locale**, not a revert. Display
  formatting is one constant (`LOCALE` in `_helpers.ts`); the real work is the
  question text (parallel bank vs. translation layer) plus routing (`/de/…` vs.
  subdomain) and `hreflang`.
- **SEO after the language switch.** finance-bro.de serves English metadata to
  an audience that searches in German. Watch Search Console; the German locale
  above is the fix, not reverting.
- **Where highscores live - resolved 2026-08-26.** Solo balance stays in
  `localStorage`; multiplayer results live in Cloudflare D1 keyed by semester,
  written only by the Durable Object. Off the read path per CLAUDE.md rule 1.

## Known gaps

- KaTeX rendering **has now been seen** (sandbox headless-Chromium
  screenshots, 2026-08-21): prompts, given-table symbols and worked solutions
  render correctly in the new posting card. Still confirm once in real Chrome
  with the production fonts (see Next up).
- `/multiplayer` and `/language` are placeholder joke pages from the original
  build; `/language` is no longer linked anywhere (Library took its nav slot)
  but stays deployed as canon. `/products` still has `via.placeholder.com`
  images and dead affiliate links (SPEC #16).
- `AdSlot` renders striped placeholders on IAB-standard sizes since
  2026-08-22 (160×600 wide skyscraper, 200×200 small square, 728×90
  leaderboard, 320×100 large mobile banner, 468×60 sponsored-career) plus
  the fixed 320×50 mobile anchor in `AnchorAd`; still no ad network wired.
  The standard sizes mean AdSense/etc. can drop in without moving layout —
  keep it that way. Revenue optimization (which slots, which pages, ad
  density) is deliberately deferred per Nico: ads must never interfere with
  functionality.
- **Hint quality varies.** The hint is always the FIRST `$…$` segment of the
  explanation. For most questions that is the pure lecture formula; for a
  handful (the "$g = q = …$" special-case annuities) the first segment is a
  given, not the formula. Never wrong, never leaking (verify guards that),
  just occasionally weak. If it bothers anyone: add an optional explicit
  `hint` field to the question schema and prefer it in `src/lib/hints.ts`.
- `fin-bond-modified-duration` asks for a signed percentage price change, so a
  student typing `7.19` instead of `-7.19` fails. Either reword to "by how much
  does it fall" or say "state the sign".
- No automated visual regression test. A Cowork session **cannot** take the
  screenshot itself (aarch64 sandbox, no Chrome, dev server not reachable from
  Nico's browser). Visual checks happen on Nico's machine.
- The sandbox cannot delete files under the mount; if git refuses to run:
  `rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock`.

## Done

- **TUM-only content policy enforced** (2026-08-21): 78 syllabus-invented
  questions across 6 subjects removed, banks stubbed with provenance comments,
  invented topics stripped, empty-state UI added, policy written into
  CLAUDE.md hard rule 2 and `.claude/rules/questions.md`.
- **KaTeX everywhere** (2026-08-21): `RichText` renders `$…$` + `**bold**`;
  all 97 Finance explanations rewritten to symbolic lecture formula →
  substituted values → result; symbol tokens in prompts/given wrapped as math;
  `verify` compiles every segment and strips math before the placeholder check.
- **Harness alignment** (2026-08-21): `SPEC.md` added as the session-handoff
  artifact (product, loop, feature table); `question-reviewer` sharpened into
  a skeptical PASS/FAIL evaluator; loop documented in CLAUDE.md.
- **Site is English end to end** — UI, questions, subject names, metadata,
  docs, agent context; jokes carried over by meaning (rank ladder, placeholder
  pages). Only glossed statutory terms and `source` values stay German.
  `npm run smoke` fails the build on stray German.
- **Number parsing** accepts both conventions and U+2212; `npm run verify`
  round-trips every displayed answer through the grader.
- **Formula-sheet ingest**: 54 questions seeded from the TUM IVF formula
  catalogue (`ivfall_rows.csv`), including the corrected
  `geom_growing_PV_immediate_neq` row (the sheet's trailing `· q` belongs to
  the annuity-due variant; verified against a brute-force cash-flow sum).
- **CI** runs `npm run check` on every push and PR to `main`.
- Question bank moved off Supabase into typed TypeScript; seeded engine;
  tolerance grading with units; taxonomy with per-topic filters; rebrand plus
  search/social metadata; dark-mode contrast bug fixed with a smoke guard.
