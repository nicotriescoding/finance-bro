# Handoff: Financbro — "The Statement v2" (direction 3a)

## Overview
Financbro is a German business-school quiz app (Investment & Financial Management, Economics, Accounting, Entrepreneurship, Marketing) dressed as a **private bank**. Direction 3a is the chosen visual/UX direction and covers three surfaces:

1. **Question page (desktop, 1440 × 900)** — three columns: ads left, quiz centre, account rail right.
2. **Question page (phone, 390 × 844)** — elaborate progress stack, bottom tab bar.
3. **"Choose your dead-end career" page (1000 × 844)** — career selection + session-mode dropdown + course tickboxes + Start button.

The product is free and ad-funded, and says so out loud.

## About the design files
`3a-design-reference.html` in this folder is a **design reference created in HTML** — a static prototype showing intended look, structure and micro-animation. It is not production code to copy. The task is to **recreate these designs in the target codebase's environment** (React/Next, Vue, SwiftUI, native — whatever exists) using its established component patterns, routing and styling system. If no environment exists yet, pick the framework that best fits the project and implement there.

Open the file in a browser: all three screens plus a written spec panel render side by side. Fonts load from Google Fonts; there are no other assets.

## Fidelity
**High-fidelity.** Colours, type, spacing, radii, copy and animation intent are final. Recreate pixel-close, but re-express with the codebase's own primitives (Button, Card, ProgressBar, etc.) rather than transcribing inline styles.

---

## Core concept (drives every decision)
Knowledge is **money**. A question is a **posting**. A correct answer is **credited**. Skill level is a **tier**. Your future is a **dead-end career** you buy from a menu.

- The comedy lives in **vocabulary and microcopy only** — never in cartoon graphics or decoration.
- The shell should be able to pass as a real bank. Only the words are allowed to be funny.
- **The maths is never a joke.** Question text, formulas and explanations must be strictly correct.
- Currency is always written as a number followed by 💵 (e.g. `1,340 💵`). Never "BD", never a word, never a custom coin icon.

---

## Design tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| field | `#eef1f5` | page background |
| surface | `#ffffff` | cards |
| hairline | `#dde4ec` | card borders, dividers (`#eef2f7` inside cards, `#e4eaf1` for tables) |
| ink | `#0f2137` | body text **and** navy chrome (nav, headers, balance card) |
| ink-raised | `#16304b` | chips/pills sitting *on* navy |
| ink-line | `#2b4967` / `#22405f` | dividers on navy, empty progress track |
| muted | `#5d7793` | secondary text |
| muted-light | `#8ba3bd` | labels on navy, tertiary text |
| link-on-navy | `#c3d3e3` | inactive nav links |
| green | `#1c6b45` | correct + primary action (single accent) |
| green-tint | `#f4fbf7` bg / `#cfe4d8` border / `#e6f3ec` chip / `#f7fdf9` input | correctness surfaces |
| mint | `#7fd6a3` | green's on-navy sibling only |
| warn | `#c2410c`, `#ff7a3d`, `#ff9d6e`, `#ffb27a` | wrong answers, streak fire — max ~2 uses per screen |
| ad-stripe | `repeating-linear-gradient(135deg,#eaeff5 0 8px,#f3f6fa 8px 16px)` | ad placeholders |

No other hues. No gradients except the scroll fade under the phone's primary button.

### Type
- **Manrope** 400 / 500 / 600 / 700 / 800 for everything.
- **IBM Plex Mono** 700 only for: formulas, ALL-CAPS labels (letter-spacing .14–.18em), ad-slot copy. A formula must never look like prose.
- `font-variant-numeric: tabular-nums` on every number (balance, amounts, given values, counters).
- Scale used: 36/26/22 (display + question), 20/18/17 (headings, balance pill), 15/14/13 (body, labels), 12/11/10/9 (meta, mono labels). Headings carry `letter-spacing:-.02em`; question text `-.01em` and `text-wrap: pretty`.

### Geometry
- Radii: `999px` pills · `14px` cards · `12px` inner cards / nav chips 9–10px · `10px` inputs & tables · `5px` tickboxes.
- Shadows: `0 1px 2px rgba(15,33,55,.05)` on the question card; `0 6px 14px rgba(15,33,55,.08)` on the open dropdown. Nothing else.
- Spacing rhythm: 22px page padding, 18px column gap, 12–16px stack gap inside columns, 9–11px inside cards.

### Motion
Bank-like, never playful:
- Balance counts up over ~500 ms on credit.
- `+180` floats up 14 px out of the balance pill and fades (`bdpop`, 1.8 s) — positioned clear of the digits (above-right of the pill).
- Current progress segment breathes (`tick`, 1.4 s opacity 1 → .25).
- Logo 💵 bobs (`fly`, 2.6 s, 3px/7px translate + slight rotate).
- Tier bar eases on change; the SETTLED chip fades in.
- Nothing bounces, overshoots or confettis.

---

## Screens

### 1. Navigation bar (present on every page)
- Navy `#0f2137`, **64 px** tall desktop (60 px on the narrower career page), 22 px horizontal padding, `display:flex; align-items:center`.
- **Left:** wordmark "Financbro" (800, 20px, -.02em) + bobbing 💵 + mono kicker `PRIVATE CLIENT · SEIT 2026` (10px, .16em, `#8ba3bd`).
- **`flex:1` spacer** — everything after it is **bound to the right**.
- **Links (right):** `Quiz 🧠`, `Bro Shop 💸`, `Multiplayer 🥋`, `Language 🎤`, `Career 🪦`. 15px; active = 800 weight on solid `#1c6b45`, radius 9px, white text; inactive = 600 weight, `#c3d3e3`, transparent.
- 1px × 26px divider `#2b4967`, then the **balance pill**: `#16304b`, radius 999, padding 8/14, contents `💵 · 1,340 (800, tabular) · divider · TIER 4 📚 (mint)`. Position `relative` — the floating `+180` is absolutely positioned to it.
- **Phone:** brand + balance pill + `☰` in the navy header; the five links become a **62 px bottom tab bar** on `#0f2137` with emoji (19px) over 10px labels — active mint `#7fd6a3`, inactive `#8ba3bd`. Labels: Quiz / Shop / Duel / Sprache / Career.

### 2. Question page — desktop (1440 × 900)
Below the nav: `flex; gap:18px; padding:18px 22px`.

**Left column — 200 px, ads only** (`flex:none`)
- Mono caption `AD RAIL · KEPT AWAY FROM THE MATHS`.
- Card: label row (`SPONSORED` / `AD`) + 160×600 striped slot (rendered 520 px tall in the mock so it fits the frame).
- Card: `SPONSORED · AD` + 160×160 slot.
- Nothing but ads may ever live here, so a slow or ugly creative can't touch the reading column.

**Centre column — fluid (~860 px)**
1. **Progress strip** (white card, 10/16 padding): course name (14px/800) · 10 segments (`flex:1`, 8px tall, radius 4 — green answered-right, `#c2410c` answered-wrong, `#dde4ec` upcoming) · `7 / 10` · `🔥 4 streak` in `#c2410c`.
2. **Question card** (white, radius 14, padding 22/24, gap 16):
   - Meta row: mono `POSTING 07 · NUMERIC · TOLERANCE ±0.5 %` + right-aligned chips `SETTLED` (green tint) and `WORTH 180 💵` (grey tint).
   - Question paragraph 22px/1.45, max 60ch.
   - **GIVEN VALUES** table: mono caption on `#f6f9fc`, then a 2-col grid of label/value rows (`First payment C · 2,000.00 €`, `Growth rate w · 2 %`, `Discount rate r · 5 %`, `Payments N · 11`, full-width `Payment timing · annuity-immediate (in arrears)`). Caption states values are **rerolled every run**.
   - **Answer row:** input styled as `2px solid #1c6b45` on `#f7fdf9` with mono `AMOUNT` label, 25px tabular value, `EUR` suffix, trailing ✓; adjacent navy `Checked` button.
   - **Explanation block:** green-tint card — `Correct · credited to your account` + `+180 💵`, the formula in mono 16px, then the worked numeric line. Wrong answers use the warn palette and the same shape.
   - Footer: green `Next posting ⏎` button (padding 14/26, radius 10) + note `Enter advances · 6 of 7 settled correctly`.
3. **970 × 60 leaderboard ad** — fixed height, always *below* the answer field.

**Right column — 300 px, the account** (`flex:none`)
- **Balance card** (navy, radius 14): mono `AVAILABLE BALANCE`, `1,340` at 36px/800 + 💵 + mint `+180`; tier row `TIER 4 · WORKING STUDENT 📚 / 62 %`, 6px bar (`#22405f` track, mint fill), caption `660 💵 to Junior Consultant 🧳`.
- **Recent activity** ledger: mono header, then rows `label / signed amount` (green credits, `#c2410c` write-off, and the punchline row `Monthly account fee — 0 · we sell ads`).
- **Career track** card: current career (emoji 20px + name + perk line) / hairline / next career at `opacity:.55` with `Locked · 660 💵`.

### 3. Question page — phone (390 × 844)
Column flex: 32px status bar · navy header (`flex:none`) · scroll region (`flex:1; overflow:hidden`) · primary button · 62px tab bar.

**Progress is the full version here** — one raised `#16304b` card in the navy header holding four facts, in this order:
- (a) course name + tally `6 ✓` (mint) / `1 ✗` (`#ff9d6e`) / `3 left`;
- (b) one segment per question (green / orange / `#22405f`), with the **current** segment `flex:1.6`, 14 px tall, `2px solid #7fd6a3` on light fill, slowly pulsing;
- (c) streak line `🔥 4 streak · ×1.5` + mono `POSTING 08 OF 10`;
- (d) hairline, then the tier bar `TIER 4 · WORKING STUDENT 📚` → `660 💵 to 🧳`.

Session progress and career progress are two different clocks and are always drawn separately.

Scroll region: question card (`flex:none`, padding 12, gap 8) with meta row, 16px question, **given values as one wrapping chips row** (`C 2,000.00 €`, `w 2 %`, `r 5 %`, `N 11 · arrears`), answer field, and a compact explanation (label + formula-with-result). Then a `flex:none` 300×100 in-feed ad card. Both children must be `flex:none` and their combined height must fit the region — the phone card is deliberately terser than desktop for this reason.

Primary button: full-width 54px, green, radius 12, sitting on a `linear-gradient(rgba(238,241,245,0), #eef1f5 45%)` scroll fade.

### 4. "Choose your dead-end career" (replaces "Open an account")
Two columns under the nav: careers left (fluid), session setup right (330 px).

**Careers** — H3 `Choose your dead-end career 🪦` + sub "Your career decides which questions come first, what the app calls you, and how sad the loading screens are. You can quit any time, unlike in real life." Then a 2-col grid of cards (emoji 22px + name 15/800 + one-line mechanic + price):

| Career | Price | Mechanic (the joke *is* the difficulty setting) |
|---|---|---|
| 🖨️ Unpaid Intern | free, selected | 0 €/mo, "great exposure"; bias: accounting |
| 🐒 Excel Monkey | 500 💵 | every answer typed twice, Ctrl+Z disabled |
| 🧳 Junior Consultant | 2,000 💵 | timer 20 % faster, answers must be in a framework |
| 🥶 IB Analyst | 4,000 💵 | double 💵, no explanation shown |
| 📎 Big 4 Auditor | 1,500 💵 | tolerance drops to ±0.01 % |
| 🪙 Crypto Guy | 300 💵 | rewards ×3 or ×0, at random |
| 🦄 Startup Founder | 1 💵 | earn 0 now, 40,000 💵 "at exit" |
| ☕ Sparkassen-Beamter | 900 💵 | risk-free: +40 💵 flat, no streaks, no fun |

Selected card = `2px solid #1c6b45` + `SELECTED · bias: …`. Last cell (spanning 2 cols) is a dashed **sponsored career** slot, 468×76 — a real employer's card looks identical to the jokes. That is intentional and is the sharpest joke in the product; keep it.

**Session setup** (white card, 330 px):
- Mono `SESSION MODE`, a closed-state trigger (`2px solid #0f2137`, 16px/800 label, ▲) and the **open dropdown**: `Klausur-Panik · 10` (selected, green tint, ✓), `Quickie · 5` (3 min), `Semester-Marathon · ∞` (until you cry), `Speedrun · 60 s` (no explanations), `Boss fight · 1 question` (worth 900 💵). Single-select.
- Mono `COURSES IN THIS MODE`, then **tickbox rows** — 17px rounded-square box (green filled + white ✓ when on, `1.5px solid #c8d3de` when off), course name, question count. Ticked rows get green-tint background + `#cfe4d8` border. Multi-select. Courses: Investment & Fin. Mgmt 97, Financial Accounting 16, Cost Accounting 12, Economics 1 · Micro 18, Economics 2 · Macro 14, Entrepreneurship 9, Marketing 9.
- Live summary `131 questions selected · est. 24 min` (recompute from ticks).
- Green 52px `Start earning 💵` button.
- Footnote: "No email, no account, no upsell. Your balance lives in this browser and dies with your cache."

**Mode is single-select, courses are multi-select — never merge them into one control.**

---

## Interactions & behaviour
- **Answer submit:** validate numeric answer against tolerance (default ±0.5 %, ±0.01 % for Big 4 Auditor) → mark posting settled → credit 💵 → animate balance count-up + `+180` float → reveal explanation → focus `Next posting`. `Enter` both submits and advances.
- **Streak:** consecutive correct answers raise a multiplier (×1.5 at 4). A wrong answer resets it, pays 0, and is logged as a **write-off** in Recent activity.
- **Rewards:** numeric 180 💵, multiple choice 120 💵, boss fight 900 💵; career modifiers apply on top (Crypto Guy ×3/×0 random, IB Analyst ×2 and hides the explanation, Sparkassen-Beamter flat 40 with no streak).
- **Tier:** derived from lifetime 💵; each tier unlocks a career purchase and renames the user in the chrome.
- **Question generation:** given values are re-randomised per run inside sensible ranges; the explanation must recompute from the actual values.
- **Persistence:** localStorage only — no accounts, no email, no server. Losing the cache loses the balance (and the app says so).
- **Responsive:** below ~1200 px the left ad rail is removed entirely (ads become one in-feed card); below ~900 px the account rail folds into the header and the nav links move to the bottom tab bar. **Nothing in the centre column ever reflows because of an ad.**
- **Hover/focus (not shown in the static mock):** nav links lighten to `#e8eef5`; buttons darken ~6 %; cards raise to `0 2px 6px rgba(15,33,55,.08)`; the answer input keeps the 2px green ring and shows a `#5d7793` caret. Focus rings must be visible on navy (use mint).

## State
`balance`, `lifetimeEarned`, `tier`, `career`, `mode`, `selectedCourses[]`, `session { questions[], index, results[] (correct|wrong|pending), streak, multiplier }`, `adSlots` (per-slot fill state, never affecting layout).

## Ad rules (non-negotiable)
Every slot is a card with a hairline border, a caps `SPONSORED` / `AD` label and a **fixed height**. Slots: 160×600 + 160×160 (left rail), 970×60 (under the question card), 300×100 (phone feed), 468×76 (sponsored career). Ads never sit above the answer field, never overlap chrome, never shift layout. In the reference they are diagonal-striped placeholders whose mono copy states the exact pixel size and why the slot exists.

## Voice
Write like a bank statement with a hangover: short, declarative, German-English code-switching where it lands (Klausur-Panik, Sparkassen-Beamter, Sprache). One joke per surface, never two in a row. Punchlines live in microcopy — "one write-off, we do not talk about posting 03", "until you cry", "dies with your cache", "0 · we sell ads". Explanations stay strictly correct.

## Known trade-off
Because the shell is deliberately a credible bank, the parody is quiet: a screenshot without copy reads as fintech, and the ad rail costs real screen width on 1280 laptops. Accept both — or drop the rail first at narrow widths.

## Assets
None. Two Google Fonts (Manrope, IBM Plex Mono) and system emoji (💵 💸 🧠 🥋 🎤 🪦 📚 🧳 🔥 and the career set). If the codebase has an emoji-free icon policy, keep 💵 for currency and replace the rest with icons — but the tone depends on the emoji.

## Files
- `3a-design-reference.html` — the three screens plus the written spec panel (this folder).
- Source design doc with all earlier directions (1a–1e, 2a–2c): `Finance Bro Directions.dc.html` in the design project; 3a is the top section.
