/**
 * Google AdSense wiring (2026-09-06). The publisher id is baked in (it is a
 * public id, printed in the page source anyway); `NEXT_PUBLIC_ADSENSE_CLIENT`
 * overrides it, and setting it to `off` turns the whole thing off for a
 * build (own cookie banner, striped placeholders).
 *
 * With AdSense on:
 *   - `layout.tsx` loads adsbygoogle.js, which also delivers Google's
 *     certified consent dialog (AdSense -> Privacy & messaging, TCF 2.2).
 *     That dialog is THE cookie banner then - `CookieBanner` stays off and
 *     `ConsentBridge` maps its TCF signal onto our analytics consent, so
 *     PostHog still only starts after an accept.
 *   - `AdSlot` / `AnchorAd` render real `<ins class="adsbygoogle">` units of
 *     the same fixed size, one per entry in `AD_SLOTS`. A slot with an empty
 *     id keeps its placeholder, so units can go live one at a time.
 *
 * Refresh policy (AdSense placement policy: no refresh without a user
 * request): the in-flow quiz units re-request an ad only when the visitor
 * moves to the next posting (`refreshKey` on `AdSlot`). Never on a timer,
 * never the sticky rails.
 *
 * Units created 2026-09-06 in AdSense (Ads -> By ad unit, "Display ads",
 * fixed size, named fb-<slot>); the ids below are theirs.
 */
const configured = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-6951760347839431";

export const ADSENSE_CLIENT = configured === "off" ? "" : configured;

/** True unless the env var says `off` (build-time constant). */
export const adsEnabled = ADSENSE_CLIENT.length > 0;

export type AdSlotName =
    | "skyscraper"
    | "square"
    | "leaderboard"
    | "feed"
    | "sponsored-career"
    | "rectangle"
    | "anchor";

/** Pixel size of every unit - must match the "fixed size" entered in AdSense. */
export const AD_SIZES: Record<AdSlotName, { width: number; height: number }> = {
    skyscraper: { width: 160, height: 600 },
    square: { width: 200, height: 200 },
    leaderboard: { width: 728, height: 90 },
    feed: { width: 320, height: 100 },
    "sponsored-career": { width: 468, height: 60 },
    rectangle: { width: 300, height: 250 },
    anchor: { width: 320, height: 50 },
};

/** data-ad-slot ids from AdSense -> Ads -> By ad unit. Empty = placeholder. */
export const AD_SLOTS: Record<AdSlotName, string> = {
    skyscraper: "3992721442",
    square: "4497435120",
    leaderboard: "9829652850",
    feed: "7203489515",
    "sponsored-career": "5116277029",
    // 300 x 250 medium rectangle at the foot of the quiz's account rail
    // (2026-09-12). Create it in AdSense (Display, fixed 300x250, name
    // fb-rectangle) and paste the id; until then the slot renders nothing.
    rectangle: "",
    anchor: "4978500057",
};

/** A unit renders live only when AdSense is on AND its slot id is filled in. */
export function slotLive(name: AdSlotName): boolean {
    return adsEnabled && AD_SLOTS[name].length > 0;
}

/**
 * Inline script that runs in `<head>` BEFORE adsbygoogle.js (2026-09-08,
 * legal audit): nothing ad-related may touch the visitor's device before a
 * consent decision (§ 25 (1) TDDDG, Art. 6 (1) (a) GDPR).
 *
 *   1. Consent Mode v2 defaults - every advertising signal starts DENIED, so
 *      Google's tag neither sets nor reads ad cookies until `applyAdConsent`
 *      (or Google's own TCF dialog) grants them.
 *   2. `pauseAdRequests = 1` - no ad request leaves the page until a decision
 *      exists (Google's documented pause hook for consent solutions).
 *
 * Both are per-page globals, which is why this lives in the static head and
 * not in a React effect: the AdSense loader would otherwise race it.
 */
export const AD_CONSENT_BOOTSTRAP = [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments)}",
    "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});",
    "(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;",
].join("");

/**
 * Release the ad requests once the visitor has decided (client only).
 *
 * Granted: Consent Mode signals flip to `granted`, requests resume, Google
 * may use its cookies. Declined: the signals stay DENIED and the request is
 * flagged non-personalized - Google's tag then serves only limited ads that
 * neither read nor write ad cookies (Nico's choice 2026-09-08: try limited
 * ads rather than no ads for decliners). Idempotent, safe to call again.
 *
 * With Google's certified TCF dialog active, `ConsentBridge` calls this with
 * the dialog's purpose-1 decision; the TCF string itself is what Google's tag
 * ultimately honours, this only lifts the pause.
 */
export function applyAdConsent(granted: boolean): void {
    if (!adsEnabled || typeof window === "undefined") return;
    const state = granted ? "granted" : "denied";
    window.gtag?.("consent", "update", {
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
    });
    const queue = (window.adsbygoogle = window.adsbygoogle ?? []) as AdsByGoogle;
    queue.requestNonPersonalizedAds = granted ? 0 : 1;
    queue.pauseAdRequests = 0;
}

type AdsByGoogle = unknown[] & { pauseAdRequests?: 0 | 1; requestNonPersonalizedAds?: 0 | 1 };
