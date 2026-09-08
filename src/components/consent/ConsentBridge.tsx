"use client";

import { useEffect } from "react";
import {
    CONSENT_EVENT,
    getStoredConsent,
    saveConsent,
    isGoogleConsentDialogActive,
    markGoogleConsentDialogActive,
} from "@/lib/analytics";
import { adsEnabled } from "@/lib/ads";

/**
 * With AdSense on, Google's certified consent dialog (AdSense -> Privacy &
 * messaging, IAB TCF 2.2) is the site's only cookie banner. This bridge makes
 * that one decision drive everything else:
 *
 *   - TCF purpose 1 (store/access information on a device) AND purpose 8
 *     (measure content performance) granted  -> analytics: true:
 *     PostHog may start, the mobile anchor ad may show.
 *   - anything less                          -> analytics: false:
 *     PostHog stays off / is switched off and its identifiers are dropped.
 *   - purpose 1 alone decides `ads` - it lifts the AdSense request pause
 *     set in <head> (see `AD_CONSENT_BOOTSTRAP`); which ads Google then
 *     serves is governed by the TCF string itself.
 *
 * `saveConsent` persists the choice in our own consent store, so the rest
 * of the site (AnchorAd, CookieBanner's "already decided" check) keeps
 * working unchanged. "Cookie settings" in the footer and the privacy policy
 * dispatch CONSENT_EVENT; here that reopens Google's revocation dialog
 * instead of our own banner.
 *
 * Renders nothing. Does nothing at all while AdSense is off - then the
 * site's own CookieBanner is in charge.
 */
export default function ConsentBridge() {
    useEffect(() => {
        if (!adsEnabled) return;

        let cancelled = false;
        let listenerId: number | undefined;

        const apply = (data: TcfData) => {
            // Any real TCF event (UI shown or a decision) proves the dialog is
            // live; until then CookieBanner stays the fallback.
            if (data.eventStatus === "cmpuishown" || data.eventStatus === "tcloaded" || data.eventStatus === "useractioncomplete") {
                markGoogleConsentDialogActive();
            }
            if (data.eventStatus !== "tcloaded" && data.eventStatus !== "useractioncomplete") return;
            if (data.gdprApplies === false) {
                // Outside the GDPR area the dialog never shows; treat as no
                // analytics consent rather than assuming one.
                if (getStoredConsent() === null) void saveConsent({ analytics: false, ads: false });
                return;
            }
            const c = data.purpose?.consents ?? {};
            const ads = c["1"] === true;
            const analytics = ads && c["8"] === true;
            const stored = getStoredConsent();
            if (stored?.analytics !== analytics || stored?.ads !== ads) {
                void saveConsent({ analytics, ads });
            }
        };

        // adsbygoogle.js installs __tcfapi asynchronously; poll briefly.
        const started = Date.now();
        const hook = () => {
            if (cancelled) return;
            if (typeof window.__tcfapi === "function") {
                window.__tcfapi("addEventListener", 2, (data, success) => {
                    if (!success) return;
                    listenerId = data.listenerId;
                    apply(data);
                });
                return;
            }
            if (Date.now() - started < 20_000) window.setTimeout(hook, 250);
        };
        hook();

        const reopen = () => {
            const fc = window.googlefc;
            if (!isGoogleConsentDialogActive() || !fc?.callbackQueue) return;
            fc.callbackQueue.push({
                CONSENT_DATA_READY: () => fc.showRevocationMessage?.(),
            });
        };
        window.addEventListener(CONSENT_EVENT, reopen);

        return () => {
            cancelled = true;
            window.removeEventListener(CONSENT_EVENT, reopen);
            if (listenerId !== undefined && typeof window.__tcfapi === "function") {
                window.__tcfapi("removeEventListener", 2, () => {}, listenerId);
            }
        };
    }, []);

    return null;
}
