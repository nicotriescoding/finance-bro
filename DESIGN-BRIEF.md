# Design brief — prompt for Claude

Copy everything below the line into Claude (Design). It is written to be pasted
as-is. Update the numbers if the bank has grown since.

---

I need five **wildly different** design directions for **finance-bro**
(finance-bro.de), a free exam trainer for business-administration students. I want
to compare genuinely different products, not five palettes of the same layout.

## What it is

Students pick a subject, tick the topics they want, choose a session length
(5 / 10 / 20 / 30 questions) and work through generated exam questions. Every
calculation question redraws its numbers each run, so the same question is
never the same twice. They type an answer, hit Check, and get instant right/wrong
plus a worked solution showing where they went wrong. Correct answers earn
**BroDollars**, which fill a progress bar toward the next **Level**, which maps to
a joke **rank ladder**: Unemployed → Low Earner → Minimum Wage Grunt → Working
Student → Junior Consultant → Consultant → Investment Banker → VC Guy → Managing
Director → Unicorn Founder → FinanceBro.

The tone is the joke in the name: finance-bro culture, self-aware, a bit crass,
Patagonia-vest energy. It is a study tool students use the night before an exam,
so the humour must never get in the way of reading a formula at 2am.

- 7 subjects: Investment & Financial Management (97 questions), Economics 1
  (Micro), Economics 2 (Macro), Financial Accounting, Cost Accounting,
  Entrepreneurship, Marketing. 175 questions total.
- Two question types: **numeric** (type a number, graded with tolerance so rounded
  intermediate steps still pass) and **multiple choice** (options shuffled).
- Everything is English. Money is EUR. The site is free and ad-supported.

## The hard constraint

On a **question page**, three things must be present at the same time:

1. **An advertisement** — this pays for the site, so it cannot be an afterthought
   or hidden below the fold on desktop.
2. **The question itself** — prompt, a "given values" table, the answer input or
   the multiple-choice options, and after answering, the feedback panel with the
   worked solution.
3. **The player's score** — BroDollars, current Level, rank badge, progress bar.

The previous version solved this with a plain three-column grid: ads left, question
centre, scoreboard right, hidden on mobile. That worked but was boring and threw
the ads away on phones. **Solve it better.** The three can be arranged, layered,
docked, collapsed or reinvented however you like — they just all have to be
reachable without hunting.

## Mobile is not optional

Most students will open this on a phone. Design the phone view properly, not as a
squashed desktop.

- **Ads must not interfere with functionality.** No interstitials, no full-screen
  takeovers, nothing covering the answer input, the Check button, or the
  explanation text. No layout shift that moves the input while someone is typing.
  Nothing that has to be dismissed before a student can answer. The ad still has to
  be genuinely visible and worth money — an ad nobody sees is the same as no ad, so
  find a placement that is honest and unobtrusive at once. Say which placement you
  chose and why it survives contact with a real user.
- **The score can shrink.** On a phone, the level, rank badge and progress bar can
  collapse into a single compact indicator, move behind a tap, or drop entirely if
  that is what makes the page work. BroDollars earned should still register somehow
  — a brief animation on a correct answer is enough. Losing the full scoreboard on
  mobile is an acceptable trade; losing readability of the question is not.
- Assume one-handed use. The primary action (Check / Next) should be in thumb reach.

## The five directions

Make them differ on *concept*, not decoration. Some axes worth pulling apart:

- **Density** — a calm, spacious, single-focus study tool vs. a dense terminal-style
  dashboard with everything on screen at once.
- **Metaphor** — a Bloomberg terminal, a mobile game, a banking app, a paper exam
  script, a chat thread, a trading floor, a brutalist document.
- **How progress feels** — an ambient number that ticks up vs. a loud, animated,
  slot-machine reward.
- **Where the ad lives** — a sidebar, a card in the content flow between questions,
  a docked footer strip, a sponsored panel styled as part of the UI.
- **Register** — how hard the finance-bro joke is pushed: from restrained and
  academic to fully unhinged.

At least one should be quiet enough that a student would use it for three hours
straight. At least one should lean all the way into the joke.

## Deliver, per direction

1. A **name** and a one-sentence concept.
2. **Desktop question page** — the full layout with all three elements.
3. **Phone question page** — the same, with your ad placement and your decision
   about the score. Call out explicitly what you dropped and why.
4. **Home page** — the seven subject cards and the entry point.
5. **Colour, type and motion** in one short paragraph.
6. One line on **what this direction is worse at** than the others. Every honest
   design trades something away; name it.

## Build constraints

- Next.js 16 App Router, React 19, **Tailwind 4**, TypeScript. Stay within
  Tailwind's standard utilities — no bespoke CSS build steps, no component library.
- **No backend and no database.** Score lives in localStorage. Nothing may block
  first paint on a network call.
- The site currently pins itself to a light theme because a dark-mode bug once made
  it unreadable. If a direction wants dark, make it a deliberate, complete theme
  rather than a media query flipped on top of light styles.
- Accessibility is part of the design, not a pass afterwards: real contrast ratios,
  a visible focus ring, touch targets ≥ 44px, and the whole quiz usable from the
  keyboard (Enter to check, Enter to advance).

## Use real content, not lorem ipsum

Sample numeric question:

> A payment stream runs for 11 years, **at the end of each year** (ordinary
> annuity). The first payment is 2,000.00 € and every following payment is 2 %
> higher than the one before. The discount rate is 5 %. What is the present value?
>
> Given — First payment C: 2,000.00 € · Growth rate w: 2 % · Discount rate r: 5 % ·
> Number of payments N: 11 · Payment timing: annuity-immediate (in arrears)
>
> Answer: 18,201.65 € — PV = C · ((g/q)^N − 1)/(g − q)

Sample multiple choice:

> Which statement about the GmbH (private limited company) is correct?
> A) Liability is in principle limited to the company's assets; the minimum share
> capital is 25,000 €. B) The shareholders are always liable without limitation
> with their private assets. C) No share capital is required. D) A GmbH can only be
> founded by at least three people.

Show a real state, not an empty one: a student mid-session, question 7 of 10,
Level 4 (Working Student 📚), 1,340 BroDollars, having just answered correctly.
