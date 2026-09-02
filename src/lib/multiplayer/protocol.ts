/**
 * Multiplayer wire protocol + shared constants.
 *
 * This file is imported by BOTH sides:
 *   - the Next.js client (src/components/multiplayer/*)
 *   - the Cloudflare worker (worker/src/*, via the "@/*" path alias)
 * so it must stay pure TypeScript: no React, no DOM, no worker APIs.
 *
 * Hard rule 1 applies: multiplayer is an optional extra. Nothing in the main
 * app may await this backend - the /multiplayer page has its own error state.
 */

import type { SubjectId } from "@/lib/questions/types";

// ---------------------------------------------------------------------------
// modes

export type MpMode = "frontrun" | "bullrun";

export const MODES: Record<
    MpMode,
    { name: string; emoji: string; tagline: string }
> = {
    frontrun: {
        name: "Front Running",
        emoji: "🏃",
        tagline:
            "Everyone gets the same posting. First correct answer settles it - for everybody. Most postings won takes the game.",
    },
    bullrun: {
        name: "Bull Run",
        emoji: "🐂",
        tagline:
            "Same postings, your own pace. Write-offs re-queue with fresh numbers. First to settle the whole statement wins.",
    },
};

/** The house bot. Loses to anyone who studied; beats everyone who did not. */
export const BOT_NAME = "Inflation 📈";

export const POSTING_COUNTS = [5, 10, 15] as const;
export const DEFAULT_COUNT = 10;

/** Front Running: per-posting deadline before the answer is revealed. */
export const FRONTRUN_DEADLINE_MS = 120_000;
/** Front Running with rapid on: the bell rings much sooner. */
export const RAPID_DEADLINE_MS = 45_000;
/** Rapid mode deals only these difficulties. */
export const RAPID_DIFFICULTIES = ["very_easy", "easy"] as const;
/**
 * Keepalive: Cloudflare's edge drops a WebSocket after ~100s of silence, and
 * a hard question takes longer than that to solve. The client sends a raw
 * "ping" frame on this interval; the Durable Object answers "pong" via
 * setWebSocketAutoResponse without even waking up.
 */
export const PING_INTERVAL_MS = 25_000;
/** Front Running: lockout after a wrong answer (anti button-mash). */
export const WRONG_COOLDOWN_MS = 3_000;
/**
 * Flat BroDollar bonus for taking the game - the closing bell pays the desk
 * that closed it. Settled/won postings additionally pay their difficulty's
 * base points (`maxPoints`), computed server-side and credited to the local
 * account balance at game end.
 */
export const WIN_BONUS = 250;

// ---------------------------------------------------------------------------
// room + player basics

/** What the host picked to study. Multiple subjects at once are allowed. */
export type MpSelection = {
    subject: SubjectId;
    /** empty array = the subject's whole bank */
    topicIds: string[];
};

export type MpConfig = {
    mode: MpMode;
    count: number;
    selections: MpSelection[];
    /** rapid ⚡: only quick/easy postings, and a 45s bell in Front Running */
    rapid: boolean;
};

export const DEFAULT_CONFIG: MpConfig = {
    mode: "bullrun",
    count: DEFAULT_COUNT,
    selections: [{ subject: "finance", topicIds: [] }],
    rapid: false,
};

export type MpPhase = "lobby" | "play" | "end";

/** Public player row, broadcast to everyone in the room. */
export type MpPlayerPub = {
    id: string;
    name: string;
    bot: boolean;
    connected: boolean;
    /** bullrun: settled postings · frontrun: postings won */
    progress: number;
    /** write-off events this game */
    writeoffs: number;
    /** BroDollars earned this game (base points per posting + win bonus) */
    earned: number;
    /** finish rank (1-based) once done, bullrun only */
    rank: number | null;
};

export type MpRanking = MpPlayerPub & { winner: boolean };

// ---------------------------------------------------------------------------
// messages: client -> server

export type C2S =
    | { t: "config"; config: MpConfig }
    | { t: "bot"; on: boolean }
    | { t: "start" }
    | { t: "answer"; value: number | number[] }
    | { t: "rematch" }
    /** deliberate exit - distinguishes "left the desk" from a dropped line */
    | { t: "leave" };

// ---------------------------------------------------------------------------
// messages: server -> client

export type S2C =
    /** full room snapshot - sent on join, config change, phase change */
    | {
          t: "room";
          you: string;
          code: string;
          host: string;
          phase: MpPhase;
          players: MpPlayerPub[];
          config: MpConfig;
          /** questions available for the current selection */
          poolSize: number;
      }
    /** the game begins */
    | { t: "begin"; mode: MpMode; count: number }
    /** YOUR current posting: build it locally from (qid, seed) */
    | { t: "deal"; index: number; total: number; qid: string; seed: number }
    /** your answer was graded (frontrun wrong: cooldown; bullrun: re-queue) */
    | { t: "graded"; correct: boolean; cooldownMs?: number }
    /**
     * frontrun only: the posting is settled for everyone.
     * by = null means nobody got it before the deadline.
     */
    | { t: "settled"; index: number; by: string | null; answerText: string }
    /** live scoreboard */
    | { t: "score"; players: MpPlayerPub[] }
    /**
     * game over. `leaderboard` says whether the humans' winnings were booked
     * to the semester scoreboard (per subject) - "skipped" when nobody earned.
     */
    | { t: "end"; ranking: MpRanking[]; leaderboard: "ok" | "failed" | "skipped" }
    | { t: "error"; code: string; msg: string };

// ---------------------------------------------------------------------------
// semester (the scoreboard's period - types live in src/lib/scoreboard/shared.ts)

/** "SS26" (Apr-Sep) or "WS26/27" (Oct-Mar). TUM semesters, roughly. */
export function currentSemester(now = new Date()): string {
    const m = now.getUTCMonth() + 1; // 1..12
    const y = now.getUTCFullYear() % 100;
    if (m >= 4 && m <= 9) return `SS${y}`;
    // Oct-Dec belongs to WS y/y+1, Jan-Mar to WS y-1/y
    return m >= 10 ? `WS${y}/${y + 1}` : `WS${y - 1}/${y}`;
}

// ---------------------------------------------------------------------------
// room codes + names

/** No 0/O/1/I - codes get read out loud across the library table. */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 5;

export function isValidCode(code: string): boolean {
    if (code.length !== CODE_LENGTH) return false;
    return [...code].every((c) => CODE_ALPHABET.includes(c));
}

export const MAX_NAME_LENGTH = 20;
export const MAX_PLAYERS = 8;

/**
 * Minimal decency filter for self-chosen names. Not a moderation system -
 * just the obvious slurs. Substring match, case-insensitive.
 */
const BLOCKED = [
    "nigg",
    "hitler",
    "faggot",
    "kanak",
    "retard",
    "hurensohn",
];

export function sanitizeName(raw: string): string {
    const trimmed = raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmed) return "Intern";
    const lower = trimmed.toLowerCase();
    if (BLOCKED.some((b) => lower.includes(b))) return "Intern";
    return trimmed;
}
