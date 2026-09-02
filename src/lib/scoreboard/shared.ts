/**
 * Semester scoreboard - shared types + constants.
 *
 * Imported by BOTH the Next.js client and the Cloudflare worker (via the
 * "@/*" alias), so it must stay pure TypeScript: no React, no DOM, no worker
 * APIs.
 *
 * The board ranks players by BroDollars earned in the running semester -
 * once overall, once per subject. Every source of BroDollars reports into
 * it: the solo quiz posts each settled posting (re-graded server-side), the
 * multiplayer Durable Object books a finished game per subject. Hard rule 1
 * applies: the board is an optional extra - nothing on the read path waits
 * for it, and a failed report just goes unrecorded.
 */

import { ranks } from "@/lib/rankings";
import { maxPoints, type Difficulty } from "@/lib/scoring";
import type { SubjectId } from "@/lib/questions/types";

/** "all" = every subject summed up */
export type ScoreboardScope = "all" | SubjectId;

export type ScoreboardRow = {
    name: string;
    /** first 6 hex chars of the player id - enough to spot yourself */
    playerId: string;
    /** BroDollars earned this semester (in this scope) */
    amount: number;
    /** settled postings this semester (in this scope) */
    postings: number;
};

/** your own standing, even when you are not in the visible top rows */
export type ScoreboardYou = {
    rank: number;
    name: string;
    amount: number;
    postings: number;
};

export type ScoreboardResponse = {
    semester: string;
    scope: ScoreboardScope;
    rows: ScoreboardRow[];
    you: ScoreboardYou | null;
};

/** one settled solo posting, re-graded by the worker before it counts */
export type EarningReport = {
    pid: string;
    /** the desk name; empty = not claimed yet, the worker assigns an intern name */
    name: string;
    qid: string;
    seed: number;
    value: number | number[];
    /** what the client credited - capped server-side at `payoutCap` */
    amount: number;
};

export const SCOREBOARD_LIMIT = 50;

/** the largest flat seniority bonus a posting can carry (rank FinanceBro) */
export const MAX_RANK_BONUS = Math.max(...ranks.map((r) => r.bonus));

/** the most a single solo posting can legitimately pay */
export function payoutCap(difficulty: Difficulty): number {
    return maxPoints(difficulty) + MAX_RANK_BONUS;
}

// ---------------------------------------------------------------------------
// intern names - the placeholder identity before a player claims a desk name

export const INTERN_TITLES = [
    "Brainrot Intern",
    "Unpaid Intern",
    "Excel Intern",
    "Oat Milk Intern",
    "PowerPoint Intern",
    "LinkedIn Intern",
    "Overtime Intern",
    "Matcha Intern",
    "Reply-All Intern",
    "Circle-Back Intern",
] as const;

/** small deterministic hash so client and worker agree on the intern name */
function hash32(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}

/** the player's badge number - the same on every suggestion for this id */
export function internNumber(pid: string): number {
    return 1000 + ((hash32(pid) >>> 8) % 9000);
}

/** "Brainrot Intern #4127" - stable per player id, numbered so they stay apart */
export function internName(pid: string): string {
    const h = hash32(pid);
    const title = INTERN_TITLES[h % INTERN_TITLES.length];
    return `${title} #${internNumber(pid)}`;
}

/**
 * Every intern title with this player's badge number, the player's own
 * intern name first - what the name field cycles through while empty.
 */
export function internSuggestions(pid: string): string[] {
    const start = hash32(pid) % INTERN_TITLES.length;
    const no = internNumber(pid);
    return INTERN_TITLES.map((_, i) => `${INTERN_TITLES[(start + i) % INTERN_TITLES.length]} #${no}`);
}

export function isInternName(name: string): boolean {
    return INTERN_TITLES.some((t) => name.startsWith(`${t} #`));
}
