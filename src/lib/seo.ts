import type { Metadata } from "next";
import type { SubjectId } from "@/lib/questions/types";

/**
 * Search metadata (scenario A of the 2026-09-11 SEO decision: metadata and
 * structured data only, nothing visible changes).
 *
 * Why this file exists: the root layout used to set `alternates.canonical: "/"`
 * and one TUM-naming Open Graph block, and Next merges both into every page
 * that does not override them - so /library, /products, /career all told
 * search engines "the canonical page is /", and the TUM description rode
 * along onto the shop and the bookshelf. `pageMeta()` gives every route its
 * own canonical, description and Open Graph block.
 *
 * Nico's TUM rules (he is a TUM student; the site is not a TUM product):
 *   - "TUM" in metadata only on /, /career, the /quiz subject pages and the
 *     static course pages (/finance, /econ-1, ...) - never on /products,
 *     /library, the bare /quiz, /bwl-muenchen or anything else (the smoke
 *     test asserts it per route). Descriptive use of the
 *     word mark (naming the course the questions train for, § 23 MarkenG);
 *     never "official", "approved", "in cooperation with", never a professor
 *     or chair name, no TUM logo, wordmark or corporate blue anywhere.
 *   - Geo terms carry the traffic instead: München, Garching, Arcisstraße,
 *     BWL München - plus the other TUM campus towns (Straubing, Heilbronn,
 *     Ottobrunn). No LocalBusiness schema and no Google Business Profile:
 *     the site has no premises, and Arcisstraße 21 is TUM's address, not
 *     ours - `areaServed` on the Organization is the honest equivalent.
 *   - German search terms are welcome in metadata (students google
 *     "Klausur", "Kostenrechnung", "Altklausur") while the UI stays English;
 *     the German locale is planned as a second locale, not by translating
 *     metadata back.
 */

export const SITE_URL = "https://www.finance-bro.de";
export const SITE_NAME = "FinanceBro";
export const OG_IMAGE_ALT = "FinanceBro - exam training for business administration";

/** Places the trainer is built for - the geo terms, in the order they matter. */
export const PLACES = ["München", "Garching", "Straubing", "Heilbronn", "Ottobrunn"] as const;

/** Search terms (German first - that is how the audience googles). Meta
 *  keywords are ignored by Google but read by smaller engines and LLM crawlers.
 *  Rendered on EVERY page via the root layout, so no "TUM" in here (rule above). */
export const KEYWORDS = [
    "BWL Klausur üben",
    "Klausurtrainer BWL München",
    "BWL Bachelor Klausurvorbereitung München",
    "Investition und Finanzierung Klausur üben",
    "Kostenrechnung Klausur üben",
    "Mikroökonomie Klausur Aufgaben",
    "Makroökonomie Klausur Aufgaben",
    "Buchführung Klausur üben",
    "exam trainer business administration Munich",
    "BWL Garching Arcisstraße",
    "Klausur üben Garching",
    "BWL Studenten Straubing Heilbronn Ottobrunn",
];

/** German course names, for the subject descriptions (what the audience types). */
export const SUBJECT_DE: Record<SubjectId, string> = {
    finance: "Investition und Finanzierung",
    econ1: "Mikroökonomie / VWL 1",
    econ2: "Makroökonomie / VWL 2",
    financial_accounting: "Buchführung und Bilanzierung",
    cost_accounting: "Kostenrechnung / Kosten- und Leistungsrechnung",
    entrepreneurship: "Entrepreneurship",
    marketing: "Marketing",
};

/** Static course-page slugs (scenario C, 2026-09-11): `/finance`, `/econ-1`,
 *  ... - real routes for the subject pages, because `/quiz?subject=x` is a
 *  query-string URL that search engines rank poorly. Reachable from the
 *  footer's course line and the sitemap only - no nav item, on purpose. */
export const SUBJECT_SLUG: Record<SubjectId, string> = {
    finance: "finance",
    econ1: "econ-1",
    econ2: "econ-2",
    financial_accounting: "financial-accounting",
    cost_accounting: "cost-accounting",
    entrepreneurship: "entrepreneurship",
    marketing: "marketing",
};

export const SLUG_TO_SUBJECT: Record<string, SubjectId> = Object.fromEntries(
    (Object.entries(SUBJECT_SLUG) as [SubjectId, string][]).map(([id, slug]) => [slug, id])
);

/** The city entrance page. */
export const CITY_PATH = "/bwl-muenchen";

/** Per-page metadata with its own canonical and Open Graph block. `path` is
 *  the canonical route including any query string that identifies the page. */
export function pageMeta({
    title,
    description,
    path,
    ogTitle,
}: {
    title: string;
    description: string;
    path: string;
    /** Open Graph title, when the tab title alone reads odd on a share card. */
    ogTitle?: string;
}): Metadata {
    const url = new URL(path, SITE_URL).toString();
    const og = ogTitle ?? `${title} · ${SITE_NAME}`;
    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            locale: "en_US",
            siteName: SITE_NAME,
            url,
            title: og,
            description,
            // Next replaces the root openGraph block wholesale when a page sets
            // its own, and the file-based src/app/opengraph-image.tsx is only
            // attached in the root segment - so re-attach it here.
            images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: OG_IMAGE_ALT }],
        },
        twitter: { card: "summary_large_image", title: og, description },
    };
}
