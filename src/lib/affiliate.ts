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
 * Links are Amazon search links, not ASIN links: they cannot rot when a
 * listing is delisted, and they carry the tag just the same.
 *
 * TODO(Nico): after PartnerNet signup, put your tag here (e.g. "financebro-21")
 * and every link on /products and /library is tagged. Until then the links
 * work untagged.
 */
export const AMAZON_TAG = "";

/** Build an Amazon.de search link, tagged once AMAZON_TAG is set. */
export function amz(search: string): string {
    const base = `https://www.amazon.de/s?k=${encodeURIComponent(search)}`;
    return AMAZON_TAG ? `${base}&tag=${AMAZON_TAG}` : base;
}
