/**
 * Semester scoreboard - the D1 side.
 *
 * `bookEarnings` is the one write path: the Lobby DO calls it at the closing
 * bell with a game's per-subject payouts, the solo endpoint in index.ts calls
 * it with a single re-graded posting. `readScoreboard` serves the board,
 * overall or per subject, with the caller's own standing attached.
 */

import { getSubject } from "@/content/subjects";
import { currentSemester } from "@/lib/multiplayer/protocol";
import { sanitizeName } from "@/lib/multiplayer/protocol";
import {
    SCOREBOARD_LIMIT,
    internName,
    type ScoreboardResponse,
    type ScoreboardRow,
    type ScoreboardScope,
    type ScoreboardYou,
} from "@/lib/scoreboard/shared";

export type Booking = {
    pid: string;
    /** empty = not claimed; the intern name is assigned on insert */
    name: string;
    /** subject id -> { amount, postings } */
    bySubject: Record<string, { amount: number; postings: number }>;
};

export const PID_RE = /^[a-f0-9]{8,32}$/;

/**
 * The name a report carries, or the player's intern name when unclaimed. A
 * name the decency filter rejected counts as unclaimed too.
 */
export function displayName(pid: string, raw: string): string {
    const clean = raw.trim() ? sanitizeName(raw) : "";
    return clean && clean !== "Intern" ? clean : internName(pid);
}

/**
 * Upsert one player's earnings, per subject, into the running semester. The
 * name is synced across all of the player's rows so per-subject boards never
 * show a stale one. Returns false when D1 refused (the caller reports
 * "failed" - never throws into the game).
 */
export async function bookEarnings(db: D1Database, bookings: Booking[]): Promise<boolean> {
    const semester = currentSemester();
    const now = Date.now();
    const stmts: D1PreparedStatement[] = [];
    for (const b of bookings) {
        if (!PID_RE.test(b.pid)) continue;
        const name = displayName(b.pid, b.name);
        let any = false;
        for (const [subject, v] of Object.entries(b.bySubject)) {
            if (!getSubject(subject) || v.amount <= 0) continue;
            any = true;
            stmts.push(
                db
                    .prepare(
                        `INSERT INTO earnings (semester, player_id, subject, name, amount, postings, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON CONFLICT (semester, player_id, subject) DO UPDATE SET
                            name = excluded.name,
                            amount = amount + excluded.amount,
                            postings = postings + excluded.postings,
                            updated_at = excluded.updated_at`
                    )
                    .bind(semester, b.pid, subject, name, Math.round(v.amount), v.postings, now)
            );
        }
        if (any) {
            stmts.push(
                db
                    .prepare(`UPDATE earnings SET name = ? WHERE semester = ? AND player_id = ?`)
                    .bind(name, semester, b.pid)
            );
        }
    }
    if (stmts.length === 0) return true;
    try {
        await db.batch(stmts);
        return true;
    } catch {
        return false;
    }
}

/** Rename every row of a player in the running semester. */
export async function renamePlayer(db: D1Database, pid: string, name: string): Promise<boolean> {
    try {
        await db
            .prepare(`UPDATE earnings SET name = ? WHERE semester = ? AND player_id = ?`)
            .bind(name, currentSemester(), pid)
            .run();
        return true;
    } catch {
        return false;
    }
}

/**
 * Replay guard for solo reports: true the first time a (player, question,
 * seed) triple shows up, false on a repeat.
 */
export async function claimPosting(
    db: D1Database,
    pid: string,
    qid: string,
    seed: number
): Promise<boolean> {
    const res = await db
        .prepare(
            `INSERT OR IGNORE INTO settled_postings (player_id, qid, seed, created_at)
             VALUES (?, ?, ?, ?)`
        )
        .bind(pid, qid, seed, Date.now())
        .run();
    return (res.meta?.changes ?? 0) > 0;
}

type Agg = { name: string; player_id: string; amount: number; postings: number; updated_at: number };

/**
 * Top rows of the running semester in one scope, plus the caller's own
 * standing (rank among everyone, not just the visible rows) when `pid` is
 * given. Throws on D1 errors - the route turns that into a 503.
 */
export async function readScoreboard(
    db: D1Database,
    scope: ScoreboardScope,
    pid: string | null
): Promise<ScoreboardResponse> {
    const semester = currentSemester();
    // SQLite: a bare column next to MAX() comes from the row holding the max,
    // so `name` is the most recently updated one.
    const base =
        scope === "all"
            ? `SELECT player_id, name, SUM(amount) AS amount, SUM(postings) AS postings,
                      MAX(updated_at) AS updated_at
               FROM earnings WHERE semester = ?1 GROUP BY player_id`
            : `SELECT player_id, name, amount, postings, updated_at
               FROM earnings WHERE semester = ?1 AND subject = ?2`;
    const binds = scope === "all" ? [semester] : [semester, scope];

    const { results } = await db
        .prepare(`${base} ORDER BY amount DESC, updated_at ASC LIMIT ${SCOREBOARD_LIMIT}`)
        .bind(...binds)
        .all<Agg>();
    const rows: ScoreboardRow[] = (results ?? []).map((r) => ({
        name: String(r.name),
        playerId: String(r.player_id).slice(0, 6),
        amount: Number(r.amount),
        postings: Number(r.postings),
    }));

    let you: ScoreboardYou | null = null;
    if (pid && PID_RE.test(pid)) {
        // positional placeholders continue after the scope binds
        const p1 = `?${binds.length + 1}`;
        const p2 = `?${binds.length + 2}`;
        const mine = await db
            .prepare(`SELECT * FROM (${base}) WHERE player_id = ${p1}`)
            .bind(...binds, pid)
            .first<Agg>();
        if (mine && Number(mine.amount) > 0) {
            const ahead = await db
                .prepare(
                    `SELECT COUNT(*) AS n FROM (${base})
                     WHERE amount > ${p1} OR (amount = ${p1} AND updated_at < ${p2})`
                )
                .bind(...binds, Number(mine.amount), Number(mine.updated_at))
                .first<{ n: number }>();
            you = {
                rank: Number(ahead?.n ?? 0) + 1,
                name: String(mine.name),
                amount: Number(mine.amount),
                postings: Number(mine.postings),
            };
        }
    }
    return { semester, scope, rows, you };
}
