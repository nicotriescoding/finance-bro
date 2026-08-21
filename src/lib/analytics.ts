/**
 * Consent-gated PostHog bootstrap — prepared before the key even exists.
 *
 * Analytics loads only when BOTH hold:
 *   1. `NEXT_PUBLIC_POSTHOG_KEY` is set (Vercel env var; absent until Nico
 *      creates the PostHog project), and
 *   2. the visitor accepted the cookie banner.
 *
 * That order is the legally load-bearing part: § 25 (1) TDDDG and
 * Art. 6 (1) (a) GDPR require consent BEFORE any tracking, so posthog-js is
 * only dynamically imported after an accept — no capture, no cookie, no
 * network call happens for visitors who declined or never chose.
 *
 * The EU endpoint (Frankfurt) is the default host on purpose; the privacy
 * policy promises EU hosting, so do not point this at the US cloud.
 */

export type CookieConsent = {
    /** the visitor's choice for analytics cookies (PostHog) */
    analytics: boolean;
    /** epoch ms of the decision — lets us re-ask after a policy change */
    decidedAt: number;
};

const CONSENT_KEY = "fb-cookie-consent";

/** Window event that re-opens the banner ("Cookie settings" in the footer). */
export const CONSENT_EVENT = "fb:cookie-settings";

let posthogRef: import("posthog-js").PostHog | null = null;

export function getStoredConsent(): CookieConsent | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(CONSENT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<CookieConsent>;
        if (typeof parsed.analytics !== "boolean") return null;
        return { analytics: parsed.analytics, decidedAt: parsed.decidedAt ?? 0 };
    } catch {
        return null;
    }
}

function storeConsent(analytics: boolean) {
    try {
        window.localStorage.setItem(
            CONSENT_KEY,
            JSON.stringify({ analytics, decidedAt: Date.now() } satisfies CookieConsent)
        );
    } catch {
        /* storage unavailable (private mode) — the banner simply re-appears */
    }
}

/** Boot PostHog if (and only if) the key exists and consent was given. */
export async function initAnalyticsIfConsented(): Promise<void> {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthogRef || !getStoredConsent()?.analytics) return;
    const { default: posthog } = await import("posthog-js");
    posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
        capture_pageview: true,
        capture_pageleave: true,
    });
    posthogRef = posthog;
}

export async function acceptAnalytics(): Promise<void> {
    storeConsent(true);
    await initAnalyticsIfConsented();
}

export function declineAnalytics(): void {
    storeConsent(false);
    // Withdrawal must be as effective as consent: if an earlier visit was
    // tracked, stop capturing and drop PostHog's stored identifiers.
    if (posthogRef) {
        posthogRef.opt_out_capturing();
        posthogRef.reset();
        posthogRef = null;
    }
}

/** Re-open the consent banner from anywhere (footer, privacy page). */
export function openCookieSettings(): void {
    window.dispatchEvent(new Event(CONSENT_EVENT));
}
