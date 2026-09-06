/**
 * Google AdSense wiring (2026-09-06). OFF until `NEXT_PUBLIC_ADSENSE_CLIENT`
 * exists in Vercel - until then every slot keeps rendering the striped
 * placeholder and the site shows its own cookie banner.
 *
 * With the client id set:
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
 * TODO(Nico): after AdSense approval create one "Display ad, fixed size"
 * unit per row below and paste its data-ad-slot id (digits only).
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

/** True once the AdSense client id is configured (build-time constant). */
export const adsEnabled = ADSENSE_CLIENT.length > 0;

export type AdSlotName =
    | "skyscraper"
    | "square"
    | "leaderboard"
    | "feed"
    | "sponsored-career"
    | "anchor";

/** Pixel size of every unit - must match the "fixed size" entered in AdSense. */
export const AD_SIZES: Record<AdSlotName, { width: number; height: number }> = {
    skyscraper: { width: 160, height: 600 },
    square: { width: 200, height: 200 },
    leaderboard: { width: 728, height: 90 },
    feed: { width: 320, height: 100 },
    "sponsored-career": { width: 468, height: 60 },
    anchor: { width: 320, height: 50 },
};

/** data-ad-slot ids from AdSense -> Ads -> By ad unit. Empty = placeholder. */
export const AD_SLOTS: Record<AdSlotName, string> = {
    skyscraper: "",
    square: "",
    leaderboard: "",
    feed: "",
    "sponsored-career": "",
    anchor: "",
};

/** A unit renders live only when AdSense is on AND its slot id is filled in. */
export function slotLive(name: AdSlotName): boolean {
    return adsEnabled && AD_SLOTS[name].length > 0;
}
