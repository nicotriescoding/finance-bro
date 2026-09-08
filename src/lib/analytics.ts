/**
 * Consent-gated PostHog bootstrap - prepared before the key even exists.
 *
 * Analytics loads only when the visitor accepted the consent dialog. The
 * project token is the public client token from PostHog Cloud EU (project
 * "finance-bro", 2026-09-06) - baked in as the default so no env var is
 * needed; `NEXT_PUBLIC_POSTHOG_KEY` still overrides it (dev/staging).
 * PostHog's own HTML snippet is NOT used: it would start capturing before
 * consent. posthog-js (npm) does the same thing, behind the gate below.
 *
 * That order is the legally load-bearing part: § 25 (1) TDDDG and
 * Art. 6 (1) (a) GDPR require consent BEFORE any tracking, so posthog-js is
 * only dynamically imported after an accept - no capture, no cookie, no
 * network call happens for visitors who declined or never chose.
 *
 * The EU endpoint (Frankfurt) is the default host on purpose; the privacy
 * policy promises EU hosting, so do not point this at the US cloud.
 */

export type CookieConsent = {
    /** the visitor's choice for analytics cookies (PostHog) */
    analytics: boolean;
    /** the visitor's choice for advertising cookies (Google AdSense) */
    ads: boolean;
    /** epoch ms of the decision - lets us re-ask after a policy change */
    decidedAt: number;
};

/** What the visitor is asked to decide. */
export type ConsentChoice = Pick<CookieConsent, "analytics" | "ads">;

const CONSENT_KEY = "fb-cookie-consent";

/** PostHog Cloud EU project token - a public client key, not a secret. */
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_pRVMDQsyuWhSqWKwJr4LAd3p8gZ57NxW7yLw8bmA4t8x";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

/** Window event that re-opens the banner ("Cookie settings" in the footer). */
export const CONSENT_EVENT = "fb:cookie-settings";

/**
 * Fired after a consent decision is stored (accept or decline). Listeners
 * that share the bottom edge with the banner (the mobile anchor ad) use it to
 * know the banner is gone.
 */
export const CONSENT_DECIDED_EVENT = "fb:cookie-consent-decided";

import { applyAdConsent } from "./ads";

let posthogRef: import("posthog-js").PostHog | null = null;

/**
 * True once Google's consent dialog (TCF) has proven it is really serving on
 * this page: it either showed its UI or delivered a consent decision. The
 * mere existence of `window.__tcfapi` is NOT enough - adsbygoogle.js installs
 * that stub even when no GDPR message is published in the AdSense account,
 * and then nobody would ever be asked (2026-09-06: exactly that happened and
 * PostHog never started for new visitors).
 */
let googleDialogActive = false;
export function markGoogleConsentDialogActive(): void {
    googleDialogActive = true;
}
export function isGoogleConsentDialogActive(): boolean {
    return googleDialogActive;
}

export function getStoredConsent(): CookieConsent | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(CONSENT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<CookieConsent>;
        // A decision without the `ads` flag predates 2026-09-08, when the
        // banner only asked about PostHog - it does not cover advertising,
        // so the visitor is asked again (null = undecided).
        if (typeof parsed.analytics !== "boolean" || typeof parsed.ads !== "boolean") return null;
        return { analytics: parsed.analytics, ads: parsed.ads, decidedAt: parsed.decidedAt ?? 0 };
    } catch {
        return null;
    }
}

function storeConsent(choice: ConsentChoice) {
    try {
        window.localStorage.setItem(
            CONSENT_KEY,
            JSON.stringify({ ...choice, decidedAt: Date.now() } satisfies CookieConsent)
        );
    } catch {
        /* storage unavailable (private mode) - the banner simply re-appears */
    }
    window.dispatchEvent(new Event(CONSENT_DECIDED_EVENT));
}

/** Boot PostHog if (and only if) the key exists and consent was given. */
export async function initAnalyticsIfConsented(): Promise<void> {
    if (posthogRef || !getStoredConsent()?.analytics) return;
    const { default: posthog } = await import("posthog-js");
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // PostHog's current snippet defaults (2026-05-30): history-based
        // pageviews for the App Router, pageleave, web vitals off by default.
        defaults: "2026-05-30",
        // No person profiles for anonymous visitors - nobody is identified on
        // this site, so every event stays an anonymous event (cheaper, and
        // less personal data to explain in the policy).
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        // No session replay: not disclosed in the privacy policy.
        disable_session_recording: true,
        // The policy promises "pages viewed, interactions, device/browser".
        // Everything posthog-js would additionally fetch on demand stays off
        // (2026-09-08 audit: the dead-clicks, surveys and web-vitals bundles
        // were still loading): no surveys, no dead-click heatmaps, no web
        // vitals, no heatmaps, no exception capture, and no lazy bundles at
        // all - anything not in the core script is not loaded.
        disable_surveys: true,
        capture_dead_clicks: false,
        capture_performance: { web_vitals: false },
        capture_heatmaps: false,
        capture_exceptions: false,
        disable_external_dependency_loading: true,
    });
    posthogRef = posthog;
}

/**
 * Persist a decision and act on it: PostHog starts or stops, AdSense is
 * released (with or without cookies). This is the ONE path every consent UI
 * goes through - the own banner's buttons, and ConsentBridge translating
 * Google's TCF dialog.
 */
export async function saveConsent(choice: ConsentChoice): Promise<void> {
    storeConsent(choice);
    applyAdConsent(choice.ads);
    if (choice.analytics) {
        await initAnalyticsIfConsented();
        return;
    }
    // Withdrawal must be as effective as consent: if an earlier visit was
    // tracked, stop capturing and drop PostHog's stored identifiers.
    if (posthogRef) {
        posthogRef.opt_out_capturing();
        posthogRef.reset();
        posthogRef = null;
    }
}

/** Returning visitor: re-apply what was decided earlier (no UI). */
export async function applyStoredConsent(): Promise<void> {
    const stored = getStoredConsent();
    if (!stored) return;
    applyAdConsent(stored.ads);
    if (stored.analytics) await initAnalyticsIfConsented();
}

export const acceptAll = () => saveConsent({ analytics: true, ads: true });
export const declineAll = () => saveConsent({ analytics: false, ads: false });

/** Re-open the consent banner from anywhere (footer, privacy page). */
export function openCookieSettings(): void {
    window.dispatchEvent(new Event(CONSENT_EVENT));
}
