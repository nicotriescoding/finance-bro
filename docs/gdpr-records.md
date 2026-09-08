# GDPR records - Art. 30 register + Art. 28 DPA checklist (Nico)

Written 2026-09-08 after the legal audit. Two things a supervisory authority
(BayLDA for a private operator in Neubiberg) can ask for on day one: the
record of processing activities (Art. 30 GDPR - a one-pager is fine at this
size) and proof that each processor is under a data processing agreement
(Art. 28). Keep this file current when a processor or a data flow changes;
the privacy policy (`src/app/privacy/page.tsx`) is the public mirror of the
same facts.

Not legal advice - a checklist written by the code, for the operator.

## 1. Record of processing activities (Art. 30 (1) GDPR)

**Controller:** Nicolas Dumpe, Kiem-Pauli-Weg 41, 85579 Neubiberg, Germany,
nicolas.dumpe@gmx.de (Impressum address; swap when finance-bro.de mail
exists). No representative, no DPO (Art. 37 thresholds not met).

| # | Processing activity | Data subjects | Data categories | Purpose | Legal basis | Recipients / processors | Transfer outside EU | Retention | TOMs (Art. 32) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Serving the website (hosting, server logs) | every visitor | IP address, user agent, requested URL, timestamp, referrer | delivery, security, abuse defence | Art. 6 (1) (f) | Vercel Inc. (hosting, edge logs) | USA - Vercel is EU-US DPF certified; SCCs in the DPA as fallback | Vercel request logs: as per Vercel's log retention (hours to days on the current plan); nothing stored by us | HTTPS only, no server of our own, no accounts |
| 2 | Local game state in the browser | every visitor who plays | balance, run state, consent choice, player id (random) | the trainer works without an account; progress survives reloads | § 25 (2) TDDDG (strictly necessary), Art. 6 (1) (f) | none - stays on the device | none | until the visitor clears browser data | localStorage only, never transmitted except items in #3 |
| 3 | Multiplayer duels + semester leaderboard | visitors who start a duel or solve questions while the worker is configured | random player id, self-chosen display name (or placeholder), question id + seed + answer, BroDollars earned per subject, connection data (IP) for the WebSocket | running the optional game features (score, ranking, re-grading) | Art. 6 (1) (f) - the feature cannot work without showing a name and score; objection = not using it / asking for placeholder or deletion | Cloudflare, Inc. (Workers, Durable Objects, D1) | USA - Cloudflare is EU-US DPF certified; SCCs in the DPA as fallback | room state: duration of the game; leaderboard rows: the semester + max. 12 months (purge job still to build - see BACKLOG) | display-name filter, server-side re-grading, replay guard, no accounts, no e-mail |
| 4 | Web analytics | visitors who accepted analytics in the consent dialog | pseudonymous device id (cookie/localStorage), pageviews, interactions, device/browser info | product analytics (which pages and questions get used) | Art. 6 (1) (a), § 25 (1) TDDDG - consent, withdrawable via "Cookie settings" | PostHog Inc. (EU cloud, Frankfurt) | provider is a US company; data at rest in the EU; SCCs in PostHog's DPA | 24 months max (set in PostHog project settings - owed) | consent gate in code (`src/lib/analytics.ts`), no session replay, no surveys, no person profiles for anonymous visitors, EU host |
| 5 | Advertising | visitors, once they decided in the consent dialog | cookies/identifiers (`__gads`, `__gpi`, `__eoi`, `IDE`), IP, browser details, page context | financing the site through ads; personalised ads only with consent | Art. 6 (1) (a), § 25 (1) TDDDG for personalised ads and identifiers; limited ads without cookies for decliners | Google Ireland Ltd. (AdSense), IAB TCF vendors listed in the dialog | Google LLC, USA - DPF certified; SCCs as fallback (Google Ads Data Processing Terms) | Google cookie lifetimes up to 13 months; consent record (`FCCDCF` / own store) 13 months | Consent Mode v2 default denied + paused ad requests before a decision (`src/lib/ads.ts`); certified CMP (Google's) once published, own banner as fallback |
| 6 | Affiliate links (Amazon PartnerNet) | visitors who click an affiliate link | Amazon sets its cookies after the click, on amazon.de - nothing on our site | commission on qualifying purchases | n/a on our site (Amazon is the controller after the click); disclosure per § 5a UWG + PartnerNet agreement | Amazon EU S.à r.l. | none by us | none by us | outbound links only; no Amazon script or pixel embedded |
| 7 | E-mail contact (inquiries, name reports under the DSA, data-subject requests) | people who write in | name, e-mail address, content of the message | answering the inquiry; DSA notice-and-action | Art. 6 (1) (b) and (f); Art. 16 DSA for reports | gmx (mail provider, 1&1 Mail & Media GmbH, Germany) | none | deleted once the matter is closed, unless a legal duty requires keeping it | mailbox on a German provider; no CRM |

Categories NOT processed: no accounts, no payment data, no special
categories (Art. 9), no children's data knowingly (site is for university
students; under-16 note in the policy).

## 2. Processor agreements (Art. 28) - status checklist

Tick each line once you have actually accepted/downloaded the DPA in the
provider's dashboard and saved a copy (PDF) next to this file or in your
own records. Auditors want the document, not the link.

- [ ] **Vercel** - Data Processing Addendum is part of the Terms of
      Service (vercel.com/legal/dpa). Log in → Settings → Legal, confirm
      the DPA is accepted for the account that owns the project; save the
      PDF. Verify Vercel is still on the EU-US DPF list
      (dataprivacyframework.gov/list).
- [ ] **Cloudflare** - the Customer DPA (cloudflare.com/cloudflare-customer-dpa)
      applies to self-serve accounts automatically; download the PDF from
      the dashboard (Account → Configurations → Legal) and keep it. Check
      the DPF listing too.
- [ ] **PostHog** - accept the DPA in the PostHog app (Organization
      settings → Legal / DPA, generate + sign) and store the countersigned
      copy. Also owed from the policy promise: project data retention ≤ 24
      months.
- [ ] **Google AdSense** - the "Google Ads Data Processing Terms" are
      accepted in the AdSense account (Account → Settings → Account
      information → Google Ads Data Processing Terms → Review and accept).
      Do it before the site goes live for EEA traffic, and keep the
      confirmation.
- [ ] **gmx / 1&1** - consumer mailbox, no DPA offered. Acceptable for a
      private operator at this size; the moment a finance-bro.de mailbox
      exists on a business plan, prefer that and note the DPA here.

Amazon PartnerNet needs no DPA: nothing is processed on our side.

## 3. Owed in the dashboards (not in code)

- AdSense → Privacy & messaging: publish the GDPR (TCF 2.2) message so
  Google's certified CMP serves. Until it does, the site's own banner with
  the advertising switch is the consent mechanism, and AdSense runs in
  Consent Mode "denied" + paused until that banner is answered.
- PostHog: data retention ≤ 24 months; confirm session replay, surveys,
  heatmaps are off in the project (the code disables them too).
- Cloudflare D1: build or schedule the 12-month purge of old-semester rows
  (`earnings`, `settled_postings`) - BACKLOG item.
- Adobe Stock: confirm none of the licensed product photos is
  "editorial use only" (open each asset on stock.adobe.com; the badge is
  on the asset page). Editorial assets may not run on an ad-financed page.

## 4. Data-subject requests - how to answer

All requests come by e-mail (privacy policy section 8). Identify the
person by the data they can name (a leaderboard display name, a player id
from their browser's localStorage key `fb_mp_id`). Access:
export their D1 rows. Erasure: `DELETE` their rows by player id, or rename
to the placeholder if they only want the name gone. PostHog: use the
"delete person" function with the distinct id from their browser. Reply
within one month (Art. 12 (3)).
