/**
 * Amazon PartnerNet affiliate links (decided 2026-08-28).
 *
 * Why Amazon: instant link creation after signup, the site already carries the
 * required Impressum + privacy page, books AND meme products live in one
 * program, and the only ongoing requirement is 3 qualifying sales within 180
 * days. The alternatives were vetted and rejected: Patagonia runs via
 * AvantLink with a 4-6 week manual review and traffic-stats vetting - not
 * realistic for this site yet.
 *
 * Since 2026-09-07 every shop product links a specific amazon.de listing
 * (`amzProduct`, picked per item: 4.5+ stars where the category has one,
 * decent review count, and the listing that looks most like our photo).
 * Since 2026-09-11 /library links one listing per book as well (ISBN-10 of
 * the English paperback). `amz` (search link) is kept as the fallback for
 * items where no listing qualifies. Both carry the tag.
 *
 * Since 2026-09-12 the shop also carries the Amazon subscription bounties
 * (Prime Student, Audible, Music Unlimited, Kindle Unlimited) via `amzPage`:
 * PartnerNet pays a fixed bounty per started trial (Prime 3 EUR, Audible
 * 10 EUR, Music Unlimited 4.50 EUR as of 2026-09-12) - only when the signup
 * runs through the official offer page, so link those pages, not a search.
 *
 * Tag: PartnerNet DE store ID (set 2026-09-11). Every link on /products and
 * /library carries it. A US Associates tag (financebro0f-20) also exists but
 * only earns on amazon.com - not used here.
 */
export const AMAZON_TAG = "financebro0a-21";

/** Build an Amazon.de search link, tagged once AMAZON_TAG is set. */
export function amz(search: string): string {
    const base = `https://www.amazon.de/s?k=${encodeURIComponent(search)}`;
    return AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
}

/** Build an Amazon.de product-page link for one ASIN, tagged once AMAZON_TAG is set. */
export function amzProduct(asin: string): string {
    const base = `https://www.amazon.de/dp/${asin}`;
    return AMAZON_TAG ? `${base}?tag=${AMAZON_TAG}` : base;
}

/**
 * Tag an arbitrary amazon.de page (subscription offer pages, bounties).
 * `path` starts with "/", may already carry a query string.
 */
export function amzPage(path: string): string {
    const base = `https://www.amazon.de${path}`;
    if (!AMAZON_TAG) return base;
    return `${base}${path.includes("?") ? "&" : "?"}tag=${AMAZON_TAG}`;
}
