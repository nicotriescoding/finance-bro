"use client";

import { openCookieSettings } from "@/lib/analytics";

/**
 * Inline "Cookie settings" trigger for prose (used in the privacy policy).
 * A client island so the server-rendered legal pages stay server components.
 */
export default function CookieSettingsLink() {
    return (
        <button
            type="button"
            onClick={openCookieSettings}
            className="font-bold text-brand underline underline-offset-2"
        >
            Cookie settings
        </button>
    );
}
