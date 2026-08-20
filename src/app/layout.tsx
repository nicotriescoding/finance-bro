import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://www.finance-bro.de";
const TITLE = "finance-bro";
const DESCRIPTION =
    "Kostenloser Klausurtrainer für BWL: Übungsaufgaben zu Finance, Econ 1 & 2, Financial Accounting, Cost Accounting, Entrepreneurship und Marketing — mit Sofort-Feedback.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: TITLE,
        template: "%s · finance-bro",
    },
    description: DESCRIPTION,
    applicationName: TITLE,
    keywords: [
        "BWL Klausur üben",
        "TUM BWL",
        "Finance Übungsaufgaben",
        "VWL Klausurtraining",
        "Financial Accounting Aufgaben",
        "Kostenrechnung üben",
        "Marketing Klausur",
        "Entrepreneurship Klausur",
    ],
    authors: [{ name: "finance-bro" }],
    creator: "finance-bro",
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "de_DE",
        url: SITE_URL,
        siteName: TITLE,
        title: "finance-bro — Klausurtraining für BWL",
        description: DESCRIPTION,
    },
    twitter: {
        card: "summary_large_image",
        title: "finance-bro — Klausurtraining für BWL",
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
    themeColor: "#0f172a",
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
    inLanguage: "de-DE",
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
                <Navbar />
                <main>{children}</main>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </body>
        </html>
    );
}
