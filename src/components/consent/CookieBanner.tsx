"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CONSENT_EVENT,
    acceptAll,
    applyStoredConsent,
    declineAll,
    getStoredConsent,
    isGoogleConsentDialogActive,
    saveConsent,
} from "@/lib/analytics";
import { adsEnabled } from "@/lib/ads";

/**
 * Cookie consent banner (§ 25 TDDDG / Art. 6 (1) (a) GDPR).
 *
 * The gag is the headline; the paragraph under it is the legally load-bearing
 * part - it states in plain words what is stored (PostHog analytics and,
 * with AdSense on, Google's advertising cookies), links the privacy policy,
 * and says how to change the choice later. Both buttons have identical size
 * and prominence: declining may not be harder than accepting. "Pick and
 * choose" opens one switch per purpose, so advertising and analytics can be
 * decided separately (2026-09-08 audit: the banner used to cover PostHog
 * only while the AdSense tag ran regardless). Nothing tracks before a
 * choice - posthog-js is only imported inside the consent-gated helpers in
 * `lib/analytics`, and AdSense requests stay paused by the head bootstrap in
 * `lib/ads` until `saveConsent` releases them.
 */
export default function CookieBanner() {
    const [open, setOpen] = useState(false);
    const [custom, setCustom] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [ads, setAds] = useState(false);

    useEffect(() => {
        // Returning visitors: re-apply the earlier decision (PostHog, ad pause).
        void applyStoredConsent();

        // With AdSense on, Google's certified consent dialog is the banner
        // (see ConsentBridge). This one only steps in as a FALLBACK when that
        // dialog cannot appear - the GDPR message is not published yet in the
        // AdSense account, or an ad blocker stopped adsbygoogle.js - so
        // neither PostHog nor an ad request starts without an explicit yes.
        // "Cannot appear" is judged by what Google's dialog DID (see
        // ConsentBridge), not by whether `__tcfapi` exists: adsbygoogle.js
        // installs that stub even with no message published.
        let timer: number | undefined;
        if (adsEnabled) {
            timer = window.setTimeout(() => {
                if (!isGoogleConsentDialogActive() && getStoredConsent() === null) {
                    setOpen(true);
                }
            }, 6000);
        } else if (getStoredConsent() === null) {
            setOpen(true);
        }

        // "Cookie settings": Google's dialog when it is there, ours otherwise.
        const reopen = () => {
            if (adsEnabled && isGoogleConsentDialogActive()) return;
            const stored = getStoredConsent();
            setAnalytics(stored?.analytics ?? false);
            setAds(stored?.ads ?? false);
            setCustom(stored !== null);
            setOpen(true);
        };
        window.addEventListener(CONSENT_EVENT, reopen);
        return () => {
            window.removeEventListener(CONSENT_EVENT, reopen);
            if (timer !== undefined) window.clearTimeout(timer);
        };
    }, []);

    if (!open) return null;

    const close = () => {
        setOpen(false);
        setCustom(false);
    };

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
                Translation for the lawyers: with your OK,{" "}
                {adsEnabled && (
                    <>
                        Google AdSense shows ads picked for you and stores identifiers (cookies) for
                        that, and{" "}
                    </>
                )}
                we use PostHog analytics (cookies / local storage) to see which pages get used and
                which questions make people rage-quit. Decline and nothing is tracked
                {adsEnabled && ", and you get at most limited ads without cookies"}. The site works
                exactly the same either way. Change your mind anytime via &quot;Cookie
                settings&quot; in the footer. Details in the{" "}
                <Link href="/privacy" className="font-bold text-brand underline underline-offset-2">
                    privacy policy
                </Link>
                .
            </p>

            {custom && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {adsEnabled && (
                        <Toggle
                            id="consent-ads"
                            label="Ads (Google AdSense)"
                            hint="Personalised ads, ad cookies"
                            checked={ads}
                            onChange={setAds}
                        />
                    )}
                    <Toggle
                        id="consent-analytics"
                        label="Analytics (PostHog)"
                        hint="Usage statistics, EU servers"
                        checked={analytics}
                        onChange={setAnalytics}
                    />
                </div>
            )}

            <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {custom ? (
                    <button
                        type="button"
                        onClick={() => {
                            close();
                            void saveConsent({ analytics, ads: adsEnabled && ads });
                        }}
                        className="rounded-[9px] bg-brand px-4 py-2.5 text-[15px] font-extrabold text-white transition hover:bg-[#175a3a]"
                    >
                        Save my picks
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            close();
                            void acceptAll();
                        }}
                        className="rounded-[9px] bg-brand px-4 py-2.5 text-[15px] font-extrabold text-white transition hover:bg-[#175a3a]"
                    >
                        Yes, sure 🍪
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => {
                        close();
                        void declineAll();
                    }}
                    className="rounded-[9px] bg-ink px-4 py-2.5 text-[15px] font-extrabold text-white transition hover:bg-[#16304b]"
                >
                    Never. I love my cookies.
                </button>
            </div>
            {!custom && (
                <button
                    type="button"
                    onClick={() => setCustom(true)}
                    className="mt-1 w-full py-3 text-center text-xs font-bold text-muted underline underline-offset-2 transition hover:text-ink"
                >
                    Pick and choose
                </button>
            )}
        </div>
    );
}

function Toggle({
    id,
    label,
    hint,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    hint: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label
            htmlFor={id}
            className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-hairline bg-field px-3 py-2.5"
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-brand"
            />
            <span className="min-w-0">
                <span className="block text-sm font-extrabold leading-tight">{label}</span>
                <span className="block text-xs text-muted">{hint}</span>
            </span>
        </label>
    );
}
