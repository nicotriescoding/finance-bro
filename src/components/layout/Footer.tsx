"use client";

import Link from "next/link";
import { openCookieSettings } from "@/lib/analytics";

/**
 * Site-wide footer. The legally required links live here so the Impressum is
 * "leicht erkennbar, unmittelbar erreichbar und ständig verfügbar" (§ 5 DDG)
 * from every page, and "Cookie settings" is the required path to withdraw
 * consent as easily as it was given. Bottom padding keeps it clear of the
 * phone tab bar.
 */
export default function Footer() {
    return (
        <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 pb-[86px] pt-10 text-center md:pb-8">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted">
                <Link href="/impressum" className="transition hover:text-ink">
                    Impressum
                </Link>
                <span aria-hidden className="text-muted-light">·</span>
                <Link href="/privacy" className="transition hover:text-ink">
                    Privacy
                </Link>
                <span aria-hidden className="text-muted-light">·</span>
                <button
                    type="button"
                    onClick={openCookieSettings}
                    className="font-semibold transition hover:text-ink"
                >
                    Cookie settings
                </button>
            </div>
            <p className="text-[11px] text-muted-light">
                © 2026 FinanceBro · a private project · study material, not financial advice
            </p>
            <p className="max-w-xl text-[11px] leading-relaxed text-muted-light">
                An independent student project. Not affiliated with, endorsed by or
                connected to the Technical University of Munich (TUM) or any brand
                mentioned on this site.
            </p>
        </footer>
    );
}
