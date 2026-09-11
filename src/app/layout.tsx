import "./globals.css";
import "katex/dist/katex.min.css";
import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import TabBar from "@/components/layout/TabBar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/consent/CookieBanner";
import ConsentBridge from "@/components/consent/ConsentBridge";
import AnchorAd from "@/components/AnchorAd";
import PromotionOverlay from "@/components/account/PromotionOverlay";
import { AD_CONSENT_BOOTSTRAP, ADSENSE_CLIENT, adsEnabled } from "@/lib/ads";
import { KEYWORDS, PLACES, SITE_NAME, SITE_URL, pageMeta } from "@/lib/seo";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-manrope",
});

const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-plex-mono",
});

const TITLE = SITE_NAME;
// Root description = the / page (and the fallback for routes without their
// own). The smoke test asserts it starts with "Free exam trainer".
const DESCRIPTION =
    "Free exam trainer for the business administration (BWL) bachelor in München - built by a TUM student for TUM students in Garching, on Arcisstraße, in Straubing, Heilbronn and Ottobrunn: exam-style calculation questions (Klausuraufgaben) for Finance, Econ 1 & 2, Financial Accounting, Cost Accounting, Entrepreneurship and Marketing, with instant feedback.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    ...pageMeta({
        title: TITLE,
        description: DESCRIPTION,
        path: "/",
        ogTitle: "FinanceBro - free BWL exam trainer for München",
    }),
    title: {
        default: TITLE,
        template: "%s · FinanceBro",
    },
    applicationName: TITLE,
    authors: [{ name: TITLE }],
    creator: TITLE,
    keywords: KEYWORDS,
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    category: "education",
};

export const viewport: Viewport = {
    themeColor: "#0f2137",
    width: "device-width",
    initialScale: 1,
};

/**
 * Structured data. One graph: the site, its publisher (with the places it is
 * built for - `areaServed`, not an address: no premises, no LocalBusiness,
 * see src/lib/seo.ts) and the app itself with its audience. TUM appears only
 * in the description, as the course the questions train for.
 */
const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": `${SITE_URL}/#org`,
            name: TITLE,
            url: SITE_URL,
            logo: `${SITE_URL}/icon.png`,
            areaServed: PLACES.map((name) => ({ "@type": "City", name })),
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: TITLE,
            url: SITE_URL,
            inLanguage: "en",
            publisher: { "@id": `${SITE_URL}/#org` },
        },
        {
            "@type": "WebApplication",
            "@id": `${SITE_URL}/#app`,
            name: TITLE,
            url: SITE_URL,
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            inLanguage: "en",
            isAccessibleForFree: true,
            description: DESCRIPTION,
            keywords: KEYWORDS.join(", "),
            audience: {
                "@type": "EducationalAudience",
                educationalRole: "student",
                audienceType: "business administration bachelor students in München and Garching",
            },
            about: [
                "Investment and Financial Management",
                "Microeconomics",
                "Macroeconomics",
                "Cost Accounting",
                "Financial Accounting",
            ].map((name) => ({ "@type": "Thing", name })),
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@id": `${SITE_URL}/#org` },
        },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            {adsEnabled && (
                <head>
                    {/* Google's AdSense tag in the static HTML head: the AdSense
                        site-verification crawler looks for this src in the raw
                        HTML (next/script would inject it client-side and the
                        crawler reports "code not found"). The same script
                        delivers Google's consent dialog.

                        The inline script BEFORE it sets Consent Mode v2 to denied
                        and pauses ad requests until a consent decision exists
                        (AD_CONSENT_BOOTSTRAP) - order matters. That is why the
                        tag is `defer`, not Google's default `async`: React 19
                        hoists `<script async src>` to the top of <head>, above
                        the bootstrap (seen 2026-09-08), and an async script may
                        execute the moment it arrives. `defer` keeps it in place,
                        non-blocking, and guarantees it runs after the inline
                        script. Ad requests only start from AdUnit effects after
                        hydration anyway. If AdSense ever reports "code not
                        found" because of the missing `async`, that is the one
                        attribute to revisit - the bootstrap must still win. */}
                    <script dangerouslySetInnerHTML={{ __html: AD_CONSENT_BOOTSTRAP }} />
                    <script
                        defer
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
                        crossOrigin="anonymous"
                    />
                </head>
            )}
            <body
                className={`${manrope.variable} ${plexMono.variable} bg-field font-sans text-ink antialiased`}
            >
                <Navbar />
                <main>{children}</main>
                {/* the footer's bottom padding keeps everything clear of the phone tab bar */}
                <Footer />
                {/* phone-only 320×50 anchor ad, fixed above the tab bar (not on /library) */}
                <AnchorAd />
                <TabBar />
                {/* full-screen PROMOTED flash whenever the rank climbs */}
                <PromotionOverlay />
                <CookieBanner />
                {/* maps Google's consent-dialog decision onto PostHog (the tag
                    itself sits in <head> above) */}
                {adsEnabled && <ConsentBridge />}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </body>
        </html>
    );
}
