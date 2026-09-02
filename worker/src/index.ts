/**
 * finance-bro multiplayer worker.
 *
 * Routes:
 *   POST /api/rooms                 -> create a lobby, returns { code }
 *   GET  /api/rooms/:code/ws        -> WebSocket upgrade, forwarded to the Lobby DO
 *   GET  /api/leaderboard?subject=all|<id>&pid=  -> semester scoreboard (BroDollars)
 *   POST /api/earnings              -> one settled solo posting, re-graded here
 *   POST /api/players/name          -> claim / change the desk name
 *
 * One Durable Object per lobby (id = idFromName(code)). The DO grades every
 * answer server-side with the same engine the client renders with, so the
 * scoreboard cannot be faked from the browser console. Solo postings are
 * re-graded the same way before they count.
 */

import { ALL_QUESTIONS } from "@/content/questions";
import { getSubject } from "@/content/subjects";
import { buildInstance } from "@/lib/questions/engine";
import { isWithinTolerance } from "@/lib/questions/grading";
import type { Question } from "@/lib/questions/types";
import {
    CODE_ALPHABET,
    CODE_LENGTH,
    isValidCode,
} from "@/lib/multiplayer/protocol";
import { payoutCap, type EarningReport, type ScoreboardScope } from "@/lib/scoreboard/shared";
import { Lobby } from "./lobby";
import {
    PID_RE,
    bookEarnings,
    claimPosting,
    displayName,
    readScoreboard,
    renamePlayer,
} from "./scoreboard";

const QUESTION_BY_ID: Map<string, Question> = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

/** same grading as the Lobby DO - a solo posting only counts if it was right */
function gradeSolo(q: Question, seed: number, value: unknown): boolean {
    const inst = buildInstance(q, seed);
    if (q.kind === "numeric") {
        return (
            typeof value === "number" &&
            Number.isFinite(value) &&
            inst.answer !== undefined &&
            isWithinTolerance(value, inst.answer, q.unit, q.tolerance)
        );
    }
    if (!Array.isArray(value) || value.length === 0) return false;
    const expected = [...(inst.correctIndices ?? [])].sort().join(",");
    const got = [...value].map(Number).sort().join(",");
    return got === expected;
}

async function readJson<T>(request: Request): Promise<T | null> {
    try {
        return (await request.json()) as T;
    } catch {
        return null;
    }
}

export { Lobby };

export type Env = {
    LOBBY: DurableObjectNamespace;
    DB: D1Database;
};

const CORS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...CORS },
    });
}

function randomCode(): string {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
        code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return code;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS });
        }

        // ------------------------------------------------------------------
        // create a room: find a code whose DO is not currently in use
        if (request.method === "POST" && path === "/api/rooms") {
            for (let attempt = 0; attempt < 5; attempt++) {
                const code = randomCode();
                const stub = env.LOBBY.get(env.LOBBY.idFromName(code));
                const res = await stub.fetch("https://do/reserve", {
                    method: "POST",
                    body: code,
                });
                if (res.ok) return json({ code });
            }
            return json({ error: "no_code" }, 503);
        }

        // ------------------------------------------------------------------
        // join a room over WebSocket
        const wsMatch = path.match(/^\/api\/rooms\/([A-Za-z0-9]+)\/ws$/);
        if (request.method === "GET" && wsMatch) {
            const code = wsMatch[1].toUpperCase();
            if (!isValidCode(code)) return json({ error: "bad_code" }, 400);
            if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
                return json({ error: "expected_websocket" }, 426);
            }
            const stub = env.LOBBY.get(env.LOBBY.idFromName(code));
            const target = new URL(request.url);
            target.pathname = "/ws";
            target.searchParams.set("code", code);
            return stub.fetch(new Request(target.toString(), request));
        }

        // ------------------------------------------------------------------
        // scoreboard: top 50 of the running semester, overall or per subject
        if (request.method === "GET" && path === "/api/leaderboard") {
            const raw = url.searchParams.get("subject") ?? "all";
            if (raw !== "all" && !getSubject(raw)) return json({ error: "bad_subject" }, 400);
            const scope = raw as ScoreboardScope;
            const pid = url.searchParams.get("pid");
            try {
                return json(await readScoreboard(env.DB, scope, pid));
            } catch {
                return json({ error: "leaderboard_unavailable" }, 503);
            }
        }

        // ------------------------------------------------------------------
        // solo quiz: one settled posting. Re-graded here with the shared
        // engine, paid at most the difficulty's cap, and only once per seed.
        if (request.method === "POST" && path === "/api/earnings") {
            const body = await readJson<Partial<EarningReport>>(request);
            if (!body || typeof body.pid !== "string" || !PID_RE.test(body.pid)) {
                return json({ error: "bad_pid" }, 400);
            }
            const q = typeof body.qid === "string" ? QUESTION_BY_ID.get(body.qid) : undefined;
            const seed = Number(body.seed);
            if (!q || !Number.isInteger(seed) || seed < 1 || seed > 2_147_483_646) {
                return json({ error: "bad_posting" }, 400);
            }
            const amount = Math.min(Math.max(0, Math.round(Number(body.amount) || 0)), payoutCap(q.difficulty));
            if (!gradeSolo(q, seed, body.value)) return json({ ok: false, reason: "wrong" });
            if (amount <= 0) return json({ ok: false, reason: "nothing_to_book" });
            try {
                const fresh = await claimPosting(env.DB, body.pid, q.id, seed);
                if (!fresh) return json({ ok: false, reason: "duplicate" });
                const ok = await bookEarnings(env.DB, [
                    {
                        pid: body.pid,
                        name: typeof body.name === "string" ? body.name : "",
                        bySubject: { [q.subject]: { amount, postings: 1 } },
                    },
                ]);
                if (!ok) return json({ error: "leaderboard_unavailable" }, 503);
                return json({ ok: true, amount, name: displayName(body.pid, body.name ?? "") });
            } catch {
                return json({ error: "leaderboard_unavailable" }, 503);
            }
        }

        // ------------------------------------------------------------------
        // claim / change the desk name on every row of this semester
        if (request.method === "POST" && path === "/api/players/name") {
            const body = await readJson<{ pid?: string; name?: string }>(request);
            if (!body || typeof body.pid !== "string" || !PID_RE.test(body.pid)) {
                return json({ error: "bad_pid" }, 400);
            }
            const name = displayName(body.pid, typeof body.name === "string" ? body.name : "");
            const ok = await renamePlayer(env.DB, body.pid, name);
            if (!ok) return json({ error: "leaderboard_unavailable" }, 503);
            return json({ ok: true, name });
        }

        return json({ error: "not_found" }, 404);
    },
};
