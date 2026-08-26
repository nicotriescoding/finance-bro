/**
 * End-to-end test against a locally running worker (`npm run dev` in worker/).
 * Run from the REPO ROOT so tsx picks up the "@/*" alias:
 *
 *   npx tsx worker/test/e2e.ts
 *
 * Plays a full Bull Run (two humans, one deliberately failing first) and a
 * full Front Running game (vs. the bot), then checks the leaderboard.
 */

import { ALL_QUESTIONS } from "@/content/questions";
import { buildInstance } from "@/lib/questions/engine";
import type { Question } from "@/lib/questions/types";
import type { C2S, S2C } from "@/lib/multiplayer/protocol";

const BASE = process.env.MP_TEST_URL ?? "http://127.0.0.1:8787";
const QMAP = new Map<string, Question>(ALL_QUESTIONS.map((q) => [q.id, q]));

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok || !detail ? "" : ` - ${detail}`}`);
    if (!ok) failures++;
}

function correctValueFor(qid: string, seed: number): number | number[] {
    const q = QMAP.get(qid);
    if (!q) throw new Error(`unknown question ${qid}`);
    const inst = buildInstance(q, seed);
    if (q.kind === "numeric") return inst.answer!;
    return inst.correctIndices!;
}

type Player = {
    ws: WebSocket;
    pid: string;
    send: (m: C2S) => void;
    events: S2C[];
    on: (t: S2C["t"], fn: (m: S2C) => void) => void;
};

function connect(code: string, pid: string, name: string): Promise<Player> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(
            `${BASE.replace(/^http/, "ws")}/api/rooms/${code}/ws?pid=${pid}&name=${name}`
        );
        const handlers: Partial<Record<S2C["t"], ((m: S2C) => void)[]>> = {};
        const player: Player = {
            ws,
            pid,
            events: [],
            send: (m) => ws.send(JSON.stringify(m)),
            on: (t, fn) => (handlers[t] = [...(handlers[t] ?? []), fn]),
        };
        ws.onopen = () => resolve(player);
        ws.onerror = () => reject(new Error(`ws error for ${name}`));
        ws.onmessage = (e) => {
            const msg = JSON.parse(String(e.data)) as S2C;
            player.events.push(msg);
            for (const fn of handlers[msg.t] ?? []) fn(msg);
        };
    });
}

async function createRoom(): Promise<string> {
    const res = await fetch(`${BASE}/api/rooms`, { method: "POST" });
    const { code } = (await res.json()) as { code: string };
    return code;
}

function withinDeadline<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        p,
        new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`timeout: ${label}`)), ms)),
    ]);
}

// ---------------------------------------------------------------------------

async function bullRunGame() {
    const code = await createRoom();
    check("bullrun: room created", /^[A-Z2-9]{5}$/.test(code), code);

    const alice = await connect(code, "aaaaaaaaaaaaaaaa", "Alice");
    const bob = await connect(code, "bbbbbbbbbbbbbbbb", "Bob");

    const end = new Promise<Extract<S2C, { t: "end" }>>((resolve) => {
        alice.on("end", (m) => resolve(m as Extract<S2C, { t: "end" }>));
    });

    // Alice answers correctly at once; Bob fails his first three postings.
    let bobWrong = 0;
    alice.on("deal", (m) => {
        const d = m as Extract<S2C, { t: "deal" }>;
        alice.send({ t: "answer", value: correctValueFor(d.qid, d.seed) });
    });
    bob.on("deal", (m) => {
        const d = m as Extract<S2C, { t: "deal" }>;
        const q = QMAP.get(d.qid)!;
        if (bobWrong++ < 3) {
            bob.send({ t: "answer", value: q.kind === "numeric" ? -999999.123 : [].concat(99) });
        } else {
            bob.send({ t: "answer", value: correctValueFor(d.qid, d.seed) });
        }
    });

    await new Promise((r) => setTimeout(r, 300));
    alice.send({
        t: "config",
        config: { mode: "bullrun", count: 5, selections: [{ subject: "finance", topicIds: [] }] },
    });
    await new Promise((r) => setTimeout(r, 300));
    alice.send({ t: "start" });

    const result = await withinDeadline(end, 15000, "bullrun end");
    const ranking = result.ranking;
    check("bullrun: game ended with 2 players ranked", ranking.length === 2);
    check("bullrun: Alice wins", ranking[0]?.name === "Alice", JSON.stringify(ranking));
    check("bullrun: winner settled all 5", ranking[0]?.progress === 5);
    check(
        "bullrun: Bob has write-offs",
        (ranking.find((r) => r.name === "Bob")?.writeoffs ?? 0) >= 1
    );
    check("bullrun: leaderboard reported", result.leaderboard === "ok", result.leaderboard);
    check(
        "bullrun: winner earned BroDollars incl. win bonus",
        (ranking[0]?.earned ?? 0) >= 250 + 5 * 50,
        String(ranking[0]?.earned)
    );

    alice.ws.close();
    bob.ws.close();
}

async function frontRunGame() {
    const code = await createRoom();
    const alice = await connect(code, "cccccccccccccccc", "Carol");

    const end = new Promise<Extract<S2C, { t: "end" }>>((resolve) => {
        alice.on("end", (m) => resolve(m as Extract<S2C, { t: "end" }>));
    });
    const settledIndices: number[] = [];
    alice.on("settled", (m) => settledIndices.push((m as Extract<S2C, { t: "settled" }>).index));
    alice.on("deal", (m) => {
        const d = m as Extract<S2C, { t: "deal" }>;
        // small delay so the settle/deal broadcasts keep their order
        setTimeout(() => alice.send({ t: "answer", value: correctValueFor(d.qid, d.seed) }), 50);
    });

    await new Promise((r) => setTimeout(r, 300));
    alice.send({
        t: "config",
        config: { mode: "frontrun", count: 5, selections: [{ subject: "finance", topicIds: [] }] },
    });
    alice.send({ t: "bot", on: true });
    await new Promise((r) => setTimeout(r, 300));
    alice.send({ t: "start" });

    const result = await withinDeadline(end, 20000, "frontrun end");
    check("frontrun: 5 postings settled", settledIndices.length === 5, String(settledIndices));
    check(
        "frontrun: Carol beats the bot",
        result.ranking[0]?.name === "Carol" && result.ranking[0]?.progress === 5,
        JSON.stringify(result.ranking)
    );
    check("frontrun: bot is in the ranking", result.ranking.some((r) => r.bot));
    alice.ws.close();
}

async function leaderboard() {
    const res = await fetch(`${BASE}/api/leaderboard`);
    const data = (await res.json()) as { semester: string; rows: { name: string; wins: number }[] };
    check("leaderboard: reachable", res.ok, String(res.status));
    check("leaderboard: has rows", (data.rows?.length ?? 0) >= 2, JSON.stringify(data));
    const alice = data.rows?.find((r) => r.name === "Alice");
    check("leaderboard: Alice has a win", (alice?.wins ?? 0) >= 1);
    console.log(`leaderboard semester: ${data.semester}`);
}

const t0 = Date.now();
await bullRunGame();
await frontRunGame();
await leaderboard();
console.log(`\n${failures === 0 ? "ALL GREEN" : `${failures} FAILURE(S)`} in ${Date.now() - t0}ms`);
process.exit(failures === 0 ? 0 : 1);
