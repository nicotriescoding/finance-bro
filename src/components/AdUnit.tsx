"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT, AD_SIZES, AD_SLOTS, type AdSlotName } from "@/lib/ads";

/**
 * One live AdSense unit. The `<ins>` is keyed on `refreshKey`, so a changed
 * key unmounts the filled element and mounts a fresh one, and the effect
 * asks adsbygoogle for a new ad exactly once per key. Callers pass a key only
 * for user-driven content changes (next posting in the quiz) - that is what
 * the AdSense policy allows; timers are not.
 *
 * Consent is not checked here on purpose: adsbygoogle.js itself waits for
 * the decision from Google's consent dialog (TCF) before serving anything.
 */
export default function AdUnit({
    name,
    refreshKey = 0,
    className,
}: {
    name: AdSlotName;
    refreshKey?: string | number;
    className?: string;
}) {
    const { width, height } = AD_SIZES[name];

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle ?? []).push({});
        } catch {
            /* blocked or not loaded yet - the slot simply stays empty */
        }
    }, [refreshKey]);

    return (
        <ins
            key={String(refreshKey)}
            className={`adsbygoogle block ${className ?? ""}`}
            style={{ display: "block", width: "100%", maxWidth: width, height }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={AD_SLOTS[name]}
        />
    );
}
