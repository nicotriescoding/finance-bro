# AdSense + consent dialog + PostHog - go-live steps (Nico)

Code is done (2026-09-06). Everything below is account work; each step
flips on by itself once its env var / id exists.

## 1. PostHog - DONE in code (2026-09-06)

Project token from the PostHog Cloud EU project is baked into
`src/lib/analytics.ts`; nothing to set in Vercel. Left for Nico: PostHog ->
Project settings -> data retention <= 24 months (policy promise), and
keep session replay OFF in the project (the code disables it too).

## 2. AdSense (account, ~30 min + Google's review, days to weeks)

1. https://adsense.google.com -> sign in with the gmx account -> add site
   `finance-bro.de`. Country Germany, payment name = Impressum name.
2. Publisher id `ca-pub-6951760347839431` is baked into `src/lib/ads.ts`
   (2026-09-06) - the AdSense tag is on every page after the next push,
   which is what the site review needs. Striped placeholders stay until
   step 5. Until step 4 is published, the site's own cookie banner shows
   as a fallback (6 s after load, only if Google's dialog never appears).
3. AdSense -> Sites -> "Request review". Google checks content, Impressum,
   privacy page (all in place). Wait for "Ready".
4. **Privacy & messaging -> European regulations -> Create message**
   (this is the certified TCF 2.2 consent dialog; it becomes the only cookie
   banner). Settings: consent options = **Consent / Do not consent / Manage
   options** (all three, so decline is one click). Then edit the text - the
   copy below keeps the site's voice; body text must keep the sentence about
   PostHog because the dialog also covers analytics:
   - Title: `We'd like to steal your cookies 🍪`
   - Body: `Translation for the lawyers: with your OK, Google and its
     partners show ads picked for you and store identifiers for that, and
     we run PostHog analytics (EU servers) to see which questions make
     people rage-quit. Decline and you get plain ads, no tracking - the site
     works exactly the same. Change your mind anytime via "Cookie settings"
     in the footer. Details in the privacy policy.`
   - Consent button: `Yes, sure 🍪`
   - Do-not-consent button: `Never. I love my cookies.`
   - Manage options: `Pick and choose`
   - Styling: primary colour `#1f6f47` (brand green), font Manrope if
     offered, otherwise default; add the site logo if you want.
   Publish. (The site's own banner switches itself off as soon as
   `NEXT_PUBLIC_ADSENSE_CLIENT` exists - `src/components/consent`.)
5. Ads -> By ad unit -> Display ads -> **Fixed** size, one per row of
   `AD_SLOTS` in `src/lib/ads.ts`: 160x600, 200x200, 728x90, 320x100,
   468x60, 320x50. Paste each `data-ad-slot` id (digits) into that map,
   commit, push. Units go live per id - the rest keep their placeholder.
6. Payments: address verification PIN comes by post at 10 EUR earned;
   bank + tax info (Steuer-ID) before the first payout at 70 EUR.
   AdSense income is gewerblich - Gewerbeanmeldung / Kleinunternehmer
   question for the Steuerberater, not for the code.

## 3. Amazon PartnerNet

partnernet.amazon.de -> sign up -> paste the tag into `AMAZON_TAG` in
`src/lib/affiliate.ts`. Approval finalises after 3 qualifying sales in
180 days.

## What the code does once the ids exist

- One banner: Google's dialog. `ConsentBridge` reads its TCF signal;
  purposes 1 + 8 granted = PostHog on, otherwise off (and reset).
- "Cookie settings" (footer, privacy page) reopens Google's dialog.
- Quiz in-flow units (728x90 / 320x100) request a new ad when the student
  moves to the next posting; the sticky rails never refresh (AdSense
  placement policy: no refresh without a user action).
- `/privacy` section 6 switches to the AdSense text in the same deploy.
