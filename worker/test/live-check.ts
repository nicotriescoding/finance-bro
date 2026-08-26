/**
 * Non-polluting live check against the deployed worker: create room, join,
 * configure, start, answer two postings correctly, verify grading + score,
 * then leave WITHOUT finishing (no leaderboard write).
 *
 *   MP_TEST_URL=https://finance-bro.<sub>.workers.dev npx tsx worker/test/live-check.ts
 */
import { ALL_QUESTIONS } from "@/content/questions";
import { buildInstance } from "@/lib/questions/engine";
import type { Question } from "@/lib/questions/types";
import type { S2C } from "@/lib/multiplayer/protocol";

const BASE = process.env.MP_TEST_URL!;
const QMAP = new Map<string, Question>(ALL_QUESTIONS.map((q) => [q.id, q]));

const res = await fetch(`${BASE}/api/rooms`, { method: "POST" });
const { code } = (await res.json()) as { code: string };
console.log("room:", code);

const ws = new WebSocket(
    `${BASE.replace(/^http/, "ws")}/api/rooms/${code}/ws?pid=deadbeefdeadbeef&name=LiveCheck`
);
let answered = 0;
const done = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 20000);
    ws.onmessage = (e) => {
        const msg = JSON.parse(String(e.data)) as S2C;
        if (msg.t === "room" && msg.phase === "lobby") {
            ws.send(JSON.stringify({
                t: "config",
                config: {
                    mode: "bullrun",
                    count: 5,
                    selections: [{ subject: "finance", topicIds: [] }],
                    rapid: false,
                },
            }));
            ws.send(JSON.stringify({ t: "start" }));
        }
        if (msg.t === "deal") {
            if (answered >= 2) return; // stop before finishing
            const q = QMAP.get(msg.qid)!;
            const inst = buildInstance(q, msg.seed);
            const value = q.kind === "numeric" ? inst.answer! : inst.correctIndices!;
            ws.send(JSON.stringify({ t: "answer", value }));
        }
        if (msg.t === "graded") {
            console.log("graded:", msg.correct);
            if (!msg.correct) reject(new Error("server graded a correct answer as wrong"));
            answered++;
        }
        if (msg.t === "score") {
            const me = msg.players.find((p) => p.id === "deadbeefdeadbeef");
            console.log("score:", me?.progress, "settled ·", me?.earned, "earned");
            if ((me?.progress ?? 0) >= 2) {
                clearTimeout(timer);
                ws.close();
                resolve();
            }
        }
    };
    ws.onerror = () => reject(new Error("ws error"));
});
await done;
console.log("LIVE CHECK GREEN - server dealt, graded, scored over the real worker");
process.exit(0);
