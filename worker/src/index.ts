/**
 * finance-bro multiplayer worker.
 *
 * Routes:
 *   POST /api/rooms                 -> create a lobby, returns { code }
 *   GET  /api/rooms/:code/ws        -> WebSocket upgrade, forwarded to the Lobby DO
 *   GET  /api/leaderboard           -> current-semester top 50 from D1
 *
 * One Durable Object per lobby (id = idFromName(code)). The DO grades every
 * answer server-side with the same engine the client renders with, so the
 * scoreboard cannot be faked from the browser console.
 */

import {
    CODE_ALPHABET,
    CODE_LENGTH,
    currentSemester,
    isValidCode,
    type LeaderboardRow,
} from "@/lib/multiplayer/protocol";
import { Lobby } from "./lobby";

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
        // leaderboard: top 50 of the running semester
        if (request.method === "GET" && path === "/api/leaderboard") {
            const semester = currentSemester();
            try {
                const { results } = await env.DB.prepare(
                    `SELECT name, player_id, wins, games, settled
                     FROM leaderboard WHERE semester = ?
                     ORDER BY wins DESC, settled DESC, updated_at ASC LIMIT 50`
                )
                    .bind(semester)
                    .all();
                const rows: LeaderboardRow[] = (results ?? []).map((r) => ({
                    name: String(r.name),
                    playerId: String(r.player_id).slice(0, 6),
                    wins: Number(r.wins),
                    games: Number(r.games),
                    settled: Number(r.settled),
                }));
                return json({ semester, rows });
            } catch {
                return json({ error: "leaderboard_unavailable", semester }, 503);
            }
        }

        return json({ error: "not_found" }, 404);
    },
};
