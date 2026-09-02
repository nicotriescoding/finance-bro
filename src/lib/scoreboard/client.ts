/**
 * Browser side of the semester scoreboard.
 *
 * Identity is the multiplayer one (`fb_mp_id` / `fb_mp_name` in
 * localStorage), so a desk name claimed here is the name the duels desk
 * greets you with, and vice versa. Until a name is claimed the player shows
 * up under a numbered intern name derived from the id.
 *
 * Hard rule 1: everything here is fire-and-forget. No worker URL, no
 * network, a 503 - the quiz never notices, the posting just goes unrecorded.
 */

import { MP_URL, getPlayerId, getStoredName, mpEnabled, storeName } from "@/lib/multiplayer/client";
import { sanitizeName } from "@/lib/multiplayer/protocol";
import type { SubjectId } from "@/lib/questions/types";
import {
    internName,
    internSuggestions,
    isInternName,
    type EarningReport,
    type ScoreboardResponse,
    type ScoreboardScope,
} from "@/lib/scoreboard/shared";

export const scoreboardEnabled = mpEnabled;

/** the stored desk name, or "" when nothing was ever picked */
export function claimedName(): string {
    return getStoredName();
}

/** true once the player picked a real name - an intern name kept by choice does not count */
export function hasRealName(): boolean {
    const n = getStoredName();
    return n.length > 0 && !isInternName(n);
}

/** the name the board shows for this browser right now */
export function deskName(): string {
    return getStoredName() || internName(getPlayerId());
}

/** intern names to cycle through while the field is empty, own one first */
export function nameSuggestions(): string[] {
    return internSuggestions(getPlayerId());
}

export function myPlayerId(): string {
    return getPlayerId();
}

/**
 * Report one settled solo posting. The worker re-grades (qid, seed, value)
 * with the shared engine and caps the amount, so the number sent here is
 * only what the client believes it credited.
 */
export function reportEarning(input: {
    qid: string;
    seed: number;
    value: number | number[];
    amount: number;
}): void {
    if (!scoreboardEnabled || input.amount <= 0) return;
    const body: EarningReport = {
        pid: getPlayerId(),
        name: getStoredName(),
        qid: input.qid,
        seed: input.seed,
        value: input.value,
        amount: Math.round(input.amount),
    };
    try {
        void fetch(`${MP_URL}/api/earnings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            keepalive: true,
        }).catch(() => {
            /* unrecorded - by design */
        });
    } catch {
        /* ignore */
    }
}

export async function fetchScoreboard(scope: ScoreboardScope | SubjectId): Promise<ScoreboardResponse> {
    const params = new URLSearchParams({ subject: scope, pid: getPlayerId() });
    const res = await fetch(`${MP_URL}/api/leaderboard?${params.toString()}`);
    const data = (await res.json()) as Partial<ScoreboardResponse> & { error?: string };
    if (!res.ok || data.error || !Array.isArray(data.rows)) throw new Error(data.error ?? "unavailable");
    return {
        semester: data.semester ?? "",
        scope: (data.scope ?? scope) as ScoreboardScope,
        rows: data.rows,
        you: data.you ?? null,
    };
}

/**
 * Claim or change the desk name: stored locally (shared with multiplayer)
 * and pushed to every scoreboard row of this semester. Returns the name as
 * the board will show it.
 */
export async function claimDeskName(raw: string): Promise<string> {
    // a name the decency filter rejects is not a claim - back to intern
    const sanitized = raw.trim() ? sanitizeName(raw) : "";
    const clean = sanitized === "Intern" ? "" : sanitized;
    storeName(clean);
    const shown = clean || internName(getPlayerId());
    if (!scoreboardEnabled) return shown;
    try {
        await fetch(`${MP_URL}/api/players/name`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pid: getPlayerId(), name: clean }),
        });
    } catch {
        /* the next report carries the name anyway */
    }
    return shown;
}
