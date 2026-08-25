import "./globals.css";
import "katex/dist/katex.min.css";
import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import TabBar from "@/components/layout/TabBar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/consent/CookieBanner";
import AnchorAd from "@/components/AnchorAd";

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

const SITE_URL = "https://www.finance-bro.de";
const TITLE = "FinanceBro";
const DESCRIPTION =
    "Free exam trainer for business administration: practice questions on Finance, Econ 1 & 2, Financial Accounting, Cost Accounting, Entrepreneurship and Marketing - with instant feedback.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: TITLE,
        template: "%s · FinanceBro",
    },
    description: DESCRIPTION,
    applicationName: TITLE,
    keywords: [
        "business administration exam practice",
        "TUM business exam",
        "finance practice questions",
        "economics exam training",
        "financial accounting exercises",
        "cost accounting practice",
        "marketing exam",
        "entrepreneurship exam",
    ],
    authors: [{ name: "FinanceBro" }],
    creator: "FinanceBro",
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: SITE_URL,
        siteName: TITLE,
        title: "FinanceBro - exam training for business administration",
        description: DESCRIPTION,
    },
    twitter: {
        card: "summary_large_image",
        title: "FinanceBro - exam training for business administration",
        description: DESCRIPTION,
    },
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

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: TITLE,
    url: SITE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "en",
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
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
                <CookieBanner />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </body>
        </html>
    );
}
