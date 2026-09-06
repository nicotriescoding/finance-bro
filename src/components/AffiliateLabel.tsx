/**
 * Per-link advertising label for affiliate links (§ 5a (4) UWG, § 6 (1) DDG,
 * Amazon PartnerNet operating agreement).
 *
 * German courts expect the commercial nature of an affiliate link to be
 * recognisable at the link itself, before the click - a disclosure paragraph
 * elsewhere on the page or in the Impressum does not cure a bare "Buy" button.
 * So every affiliate button on /products and /library carries this chip
 * directly above it. Keep it readable: normal chip size, muted (not
 * muted-light) text, the word "advertising" spelled out.
 */
export default function AffiliateLabel() {
    return (
        <span className="caps-label inline-flex items-center gap-1.5 rounded-full border border-hairline bg-chip px-2.5 py-1 text-[10px] tracking-[.14em] text-muted">
            <span aria-hidden="true">💸</span>
            Advertising · affiliate link (Amazon)
        </span>
    );
}
