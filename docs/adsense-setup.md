# AdSense + consent dialog + PostHog - go-live steps (Nico)

Code is done (2026-09-06): PostHog token, AdSense client id and slot ids are
all baked in. Still open (account work): AdSense site review (step 2.3), the
GDPR consent message (step 2.4), payments (step 2.6) and the Amazon tag (3).

## 1. PostHog - DONE in code (2026-09-06)

Project token from the PostHog Cloud EU project is baked into
`src/lib/analytics.ts`; nothing to set in Vercel. Left for Nico: PostHog ->
Project settings -> data retention <= 24 months (policy promise), and
keep session replay OFF in the project (the code disables it too).

## 2. AdSense (account, ~30 min + Google's review, days to weeks)

1. https://adsense.google.com -> sign in with the gmx account -> add site
   `finance-bro.de`. Country Germany, payment name = Impressum name.
2. DONE in code (2026-09-06): publisher id `ca-pub-6951760347839431` and
   the six `AD_SLOTS` ids are baked into `src/lib/ads.ts`, the AdSense tag
   is in `<head>` on every page (`layout.tsx`), which is what the site
   review needs. Units render live per slot id; a unit whose id is empty
   would keep its striped placeholder. Until step 4 is published, the
   site's own cookie banner shows as a fallback (6 s after load, only if
   Google's dialog never appears - `adsEnabled && isGoogleConsentDialogActive()`
   in `CookieBanner.tsx` is the gate that keeps ours closed).
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
   Publish. (The site's own banner stays closed whenever Google's dialog is
   active - `src/components/consent/CookieBanner.tsx`. `NEXT_PUBLIC_ADSENSE_CLIENT`
   only overrides the baked-in client id, or set it to `off` to disable
   AdSense and fall back to the own banner for a build.)
5. DONE (2026-09-06): the six ad units (Display ads, **Fixed** size:
   160x600, 200x200, 728x90, 320x100, 468x60, 320x50, named fb-<slot>)
   exist in AdSense and their `data-ad-slot` ids are in `AD_SLOTS` in
   `src/lib/ads.ts`. Only for a new unit: create it the same way and add
   the id to that map.
6. Payments: address verification PIN comes by post at 10 EUR earned;
   bank + tax info (Steuer-ID) before the first payout at 70 EUR.
   AdSense income is gewerblich - Gewerbeanmeldung / Kleinunternehmer
   question for the Steuerberater, not for the code.

## 3. Amazon PartnerNet

partnernet.amazon.de -> sign up -> paste the tag into `AMAZON_TAG` in
`src/lib/affiliate.ts`. Approval finalises after 3 qualifying sales in
180 days.

## Consent before anything (2026-09-08 legal audit)

Verified live that day: the GDPR message was NOT published, so Google's CMP
never served, and the site's own banner asked about PostHog only while
adsbygoogle.js ran regardless. Code now:

- `<head>` runs `AD_CONSENT_BOOTSTRAP` (`src/lib/ads.ts`) BEFORE the AdSense
  tag: Consent Mode v2 defaults all denied + `pauseAdRequests = 1`. The tag
  is `defer` (not `async`) so React cannot hoist it above the bootstrap.
- The own banner asks about advertising AND analytics ("Pick and choose"
  = one switch each). A stored decision without the `ads` flag (pre
  2026-09-08) counts as undecided, so old visitors are asked again once.
- `saveConsent` → `applyAdConsent`: granted = Consent Mode granted +
  requests resume; declined = stays denied, `requestNonPersonalizedAds = 1`,
  requests resume - Google then serves limited ads without cookies (Nico's
  choice) or nothing.
- With Google's TCF dialog active, `ConsentBridge` lifts the pause from the
  TCF decision (purpose 1 = ads, 1 + 8 = analytics); the TCF string governs.

Step 4 (publish the message) is still the real fix - Google's EEA policy
wants a certified CMP. Also accept the Google Ads Data Processing Terms in
the account (`docs/gdpr-records.md`).

## What the code does once the ids exist

- One banner: Google's dialog. `ConsentBridge` reads its TCF signal;
  purposes 1 + 8 granted = PostHog on, otherwise off (and reset); purpose 1
  lifts the ad-request pause.
- "Cookie settings" (footer, privacy page) reopens Google's dialog.
- Quiz in-flow units (728x90 / 320x100) request a new ad when the student
  moves to the next posting; the sticky rails never refresh (AdSense
  placement policy: no refresh without a user action).
- `/privacy` section 6 switches to the AdSense text in the same deploy.
