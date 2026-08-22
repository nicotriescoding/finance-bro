"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CONSENT_EVENT,
    acceptAnalytics,
    declineAnalytics,
    getStoredConsent,
    initAnalyticsIfConsented,
} from "@/lib/analytics";

/**
 * Cookie consent banner (§ 25 TDDDG / Art. 6 (1) (a) GDPR).
 *
 * The gag is the headline; the paragraph under it is the legally load-bearing
 * part - it states in plain words what is stored (PostHog analytics), links
 * the privacy policy, and says how to change the choice later. Both buttons
 * have identical size and prominence: declining may not be harder than
 * accepting. Nothing tracks before a choice - posthog-js is only imported
 * inside the consent-gated helpers in `lib/analytics`.
 */
export default function CookieBanner() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // After hydration: show the banner if the visitor never chose; boot
        // analytics for returning visitors who accepted earlier (no-op until
        // the PostHog key exists).
        if (getStoredConsent() === null) setOpen(true);
        else void initAnalyticsIfConsented();

        const reopen = () => setOpen(true);
        window.addEventListener(CONSENT_EVENT, reopen);
        return () => window.removeEventListener(CONSENT_EVENT, reopen);
    }, []);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            className="fixed inset-x-3 bottom-[74px] z-40 mx-auto max-w-xl rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_12px_32px_rgba(15,33,55,.18)] sm:p-5 md:bottom-5"
        >
            <p className="caps-label text-[10px] text-muted-light">
                Cookie heist · consent required
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em]">
                We&apos;d like to steal your cookies 🍪
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Translation for the lawyers: with your OK we use PostHog analytics
                (cookies / local storage) to see which pages get used and which
                questions make people rage-quit. Decline and nothing is tracked -
                the site works exactly the same. Change your mind anytime via
                &quot;Cookie settings&quot; in the footer. Details in the{" "}
                <Link
                    href="/privacy"
                    className="font-bold text-brand underline underline-offset-2"
                >
                    privacy policy
                </Link>
                .
            </p>
            <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => {
                        setOpen(false);
                        void acceptAnalytics();
                    }}
                    className="rounded-[9px] bg-brand px-4 py-2.5 text-[15px] font-extrabold text-white transition hover:bg-[#175a3a]"
                >
                    Yes, sure 🍪
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setOpen(false);
                        declineAnalytics();
                    }}
                    className="rounded-[9px] bg-ink px-4 py-2.5 text-[15px] font-extrabold text-white transition hover:bg-[#16304b]"
                >
                    Never. I love my cookies.
                </button>
            </div>
        </div>
    );
}
