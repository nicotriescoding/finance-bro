/**
 * End-to-end test against a locally running worker (`npm run dev` in worker/).
 * Run from the REPO ROOT so tsx picks up the "@/*" alias:
 *
 *   npx tsx worker/test/e2e.ts
 *
 * Plays a full Bull Run (two humans, one deliberately failing first) and a
 * full Front Running game (vs. the bot), then checks the semester scoreboard
 * (BroDollars, overall + per subject) and the solo reporting endpoint.
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
        config: {
            mode: "bullrun",
            count: 5,
            selections: [{ subject: "finance", topicIds: [] }],
            rapid: false,
        },
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
        config: {
            mode: "frontrun",
            count: 5,
            selections: [{ subject: "finance", topicIds: [] }],
            rapid: false,
        },
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

async function rapidGame() {
    const code = await createRoom();
    const dave = await connect(code, "dddddddddddddddd", "Dave");
    const dealtDifficulties: string[] = [];

    const end = new Promise<Extract<S2C, { t: "end" }>>((resolve) => {
        dave.on("end", (m) => resolve(m as Extract<S2C, { t: "end" }>));
    });
    dave.on("deal", (m) => {
        const d = m as Extract<S2C, { t: "deal" }>;
        dealtDifficulties.push(QMAP.get(d.qid)!.difficulty);
        dave.send({ t: "answer", value: correctValueFor(d.qid, d.seed) });
    });

    await new Promise((r) => setTimeout(r, 300));
    dave.send({
        t: "config",
        config: {
            mode: "bullrun",
            count: 5,
            selections: [{ subject: "finance", topicIds: [] }],
            rapid: true,
        },
    });
    await new Promise((r) => setTimeout(r, 300));
    dave.send({ t: "start" });

    await withinDeadline(end, 15000, "rapid end");
    check(
        "rapid: only quick/easy postings dealt",
        dealtDifficulties.length === 5 &&
            dealtDifficulties.every((d) => d === "very_easy" || d === "easy"),
        dealtDifficulties.join(",")
    );
    dave.ws.close();
}

async function leaderboard() {
    type Board = {
        semester: string;
        scope: string;
        rows: { name: string; playerId: string; amount: number; postings: number }[];
        you: { rank: number; amount: number } | null;
    };
    const res = await fetch(`${BASE}/api/leaderboard?subject=all&pid=aaaaaaaaaaaaaaaa`);
    const data = (await res.json()) as Board;
    check("scoreboard: reachable", res.ok, String(res.status));
    check("scoreboard: has rows", (data.rows?.length ?? 0) >= 2, JSON.stringify(data));
    const alice = data.rows?.find((r) => r.name === "Alice");
    check(
        "scoreboard: Alice banked her Bull Run (5 postings + bell bonus)",
        (alice?.amount ?? 0) >= 250 + 5 * 50 && (alice?.postings ?? 0) >= 5,
        JSON.stringify(alice)
    );
    check("scoreboard: Alice sees her own rank", data.you !== null && data.you.rank >= 1, JSON.stringify(data.you));
    check("scoreboard: the bot never gets a payslip", !data.rows.some((r) => r.name.includes("Inflation")));
    const fin = (await (await fetch(`${BASE}/api/leaderboard?subject=finance`)).json()) as Board;
    check("scoreboard: finance board carries the same games", fin.scope === "finance" && fin.rows.some((r) => r.name === "Alice"));
    const empty = (await (await fetch(`${BASE}/api/leaderboard?subject=marketing`)).json()) as Board;
    check("scoreboard: untouched subject is empty", empty.rows.length === 0);
    const bad = await fetch(`${BASE}/api/leaderboard?subject=nope`);
    check("scoreboard: unknown subject is a 400", bad.status === 400);

    // a solo posting: re-graded, capped, paid once
    const q = ALL_QUESTIONS.find((x) => x.subject === "econ1" && x.kind === "numeric")!;
    // fresh identity + seed per run: the local D1 persists between runs
    const solo = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, "0")).join("");
    const seed = Math.floor(Math.random() * 2_000_000_000) + 1;
    const value = correctValueFor(q.id, seed);
    const body = { pid: solo, name: "", qid: q.id, seed, value, amount: 99999 };
    const post = (b: unknown) =>
        fetch(`${BASE}/api/earnings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(b),
        }).then((r) => r.json() as Promise<{ ok?: boolean; amount?: number; reason?: string; name?: string }>);
    const first = await post(body);
    check("solo: correct posting booked", first.ok === true, JSON.stringify(first));
    check("solo: payout capped at the difficulty's ceiling", (first.amount ?? 0) < 99999, String(first.amount));
    check("solo: unnamed player gets an intern name", /Intern #\d{4}$/.test(first.name ?? ""), first.name);
    const again = await post(body);
    check("solo: replay is refused", again.ok === false && again.reason === "duplicate", JSON.stringify(again));
    // practising the same question again is a new run with a fresh seed -
    // that pays every time, only the exact same (question, seed) is a replay
    const seed2 = seed % 2_000_000_000 + 1;
    const practice = await post({ ...body, seed: seed2, value: correctValueFor(q.id, seed2) });
    check("solo: same question, fresh seed pays again", practice.ok === true, JSON.stringify(practice));
    const wrong = await post({ ...body, seed: seed + 1, value: -424242 });
    check("solo: wrong answer books nothing", wrong.ok === false && wrong.reason === "wrong", JSON.stringify(wrong));
    const econ = (await (await fetch(`${BASE}/api/leaderboard?subject=econ1`)).json()) as Board;
    check(
        "solo: both postings land on the subject board",
        econ.rows.some((r) => r.playerId === solo.slice(0, 6) && r.amount === (first.amount ?? 0) + (practice.amount ?? 0) && r.postings === 2),
        JSON.stringify(econ.rows)
    );
    console.log(`scoreboard semester: ${data.semester}`);
}

const t0 = Date.now();
await bullRunGame();
await frontRunGame();
await rapidGame();
await leaderboard();
console.log(`\n${failures === 0 ? "ALL GREEN" : `${failures} FAILURE(S)`} in ${Date.now() - t0}ms`);
process.exit(failures === 0 ? 0 : 1);
