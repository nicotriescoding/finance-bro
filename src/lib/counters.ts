/**
 * Site-wide click counters on the Cloudflare worker (2026-09-12) - currently
 * one: the Bro Shop's secret "?" position. Same contract as the scoreboard:
 * hard rule 1, everything is optional. No worker URL, no network, a 503 -
 * the card still renders, it just shows its fallback copy instead of a
 * number.
 */

import { MP_URL, mpEnabled } from "@/lib/multiplayer/client";

export type CounterKey = "mystery";

export const countersEnabled = mpEnabled;

/** current value, or null when the worker is off or unreachable */
export async function readCounter(key: CounterKey): Promise<number | null> {
    if (!countersEnabled) return null;
    try {
        const res = await fetch(`${MP_URL}/api/counters/${key}`);
        if (!res.ok) return null;
        const data = (await res.json()) as { value?: unknown };
        return typeof data.value === "number" ? data.value : null;
    } catch {
        return null;
    }
}

/**
 * Count one click. `keepalive` so the request survives the tab navigating
 * away (the click opens a link). Resolves to the new value, or null.
 */
export async function bumpCounter(key: CounterKey): Promise<number | null> {
    if (!countersEnabled) return null;
    try {
        const res = await fetch(`${MP_URL}/api/counters/${key}`, { method: "POST", keepalive: true });
        if (!res.ok) return null;
        const data = (await res.json()) as { value?: unknown };
        return typeof data.value === "number" ? data.value : null;
    } catch {
        return null;
    }
}
