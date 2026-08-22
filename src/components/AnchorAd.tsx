"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_DECIDED_EVENT, CONSENT_EVENT, getStoredConsent } from "@/lib/analytics";

/**
 * Phone-only anchor ad: 320 × 50 (the IAB mobile anchor standard, and the
 * format AdSense anchor ads use), fixed like the chrome, sitting directly on
 * top of the bottom tab bar on every page except the ad-free Library.
 *
 * Two rules keep it from interfering with anything:
 *   1. It never fights the cookie banner for the bottom edge - hidden until
 *      the visitor has made a consent choice, and hidden again while the
 *      banner is reopened via "Cookie settings".
 *   2. Content never hides behind it - an in-flow spacer of the same height
 *      is rendered at the end of the page whenever the bar is shown.
 *
 * Nothing renders on the server, so the ad-free Library check in the smoke
 * test ("Sponsored" never in the HTML) holds for every route.
 */

const BAR_HEIGHT = 58; // 50px unit + 4px breathing room top and bottom

export default function AnchorAd() {
    const pathname = usePathname();
    const [decided, setDecided] = useState(false);
    const [bannerOpen, setBannerOpen] = useState(false);

    useEffect(() => {
        setDecided(getStoredConsent() !== null);
        const onSettings = () => setBannerOpen(true);
        const onDecided = () => {
            setDecided(true);
            setBannerOpen(false);
        };
        window.addEventListener(CONSENT_EVENT, onSettings);
        window.addEventListener(CONSENT_DECIDED_EVENT, onDecided);
        return () => {
            window.removeEventListener(CONSENT_EVENT, onSettings);
            window.removeEventListener(CONSENT_DECIDED_EVENT, onDecided);
        };
    }, []);

    if (pathname.startsWith("/library")) return null; // the Library stays ad-free
    if (!decided || bannerOpen) return null;

    return (
        <>
            {/* in-flow spacer so the last content line can always scroll clear */}
            <div aria-hidden className="md:hidden" style={{ height: BAR_HEIGHT }} />
            <div
                className="fixed inset-x-0 bottom-[62px] z-40 border-t border-hairline bg-surface md:hidden"
                style={{ height: BAR_HEIGHT }}
            >
                <div className="mx-auto flex h-full max-w-[352px] items-center justify-center px-2">
                    <div className="bg-ad-stripes flex h-[50px] w-full max-w-[320px] items-center justify-center rounded-md border border-hairline">
                        <span className="font-mono text-[10px] text-slot-text">
                            AD · 320 × 50 · mobile anchor
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
