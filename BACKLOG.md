# Backlog

Open work and decisions, most useful first. Keep this current — it is how a new
session picks up where the last one stopped. The durable product shape and
feature status live in `SPEC.md`.

## Where things stand

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

- **PostHog go-live** (whenever Nico wants analytics): create the project on
  PostHog Cloud **EU** (eu.posthog.com — the privacy policy promises Frankfurt
  hosting), set `NEXT_PUBLIC_POSTHOG_KEY` in Vercel per `.env.example`,
  redeploy. Consent flow is already live; nothing else to build.
- **Impressum email is temporary.** nicolas.dumpe@gmx.de is public on
  `/impressum` + `/privacy`; swap to a finance-bro.de address once mail
  exists (per Nico: "we will have to change that later").
- **Pick the affiliate program** — Amazon PartnerNet is the hope, possibly
  several, not decided. Then: real links on `/library` (Amazon requires its
  associate-disclosure sentence), and the same program can fix the Bro Shop's
  dead links (SPEC #16). Shelf queue after the two placeholders: Never Split
  the Difference · Atomic Habits · How to Win Friends and Influence People ·
  What Every BODY Is Saying (the English original of "Menschen lesen", Joe
  Navarro) · The Psychology of Money.
- **Ingest TUM MC past exams.** Nico has them and uploads them after the
  styling setup. Use the `add-exam-questions` skill (translates as it goes,
  KaTeX per the rules, every question gets `source`). This refills Econ 1,
  Econ 2, Financial Accounting, Cost Accounting, Entrepreneurship, Marketing —
  and can add `source` tags to Finance questions that match real exam tasks.
- **Visual check on Nico's machine.** Sandbox screenshots verified layout,
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
  `rm -rf .next_stale_sandbox .next_stale_sandbox2 .next_stale_sandbox3`
  (stale `.next` dirs renamed aside so builds could run), then
  `rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock .git/objects/maintenance.lock && git reset`
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
- **Where highscores live.** `localStorage` only; leaderboard and multiplayer
  pages are stubs. Any backend must stay off the read path (CLAUDE.md rule 1).

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
