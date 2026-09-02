/**
 * The Lobby Durable Object - one instance per room code.
 *
 * Holds the room state, relays via WebSockets (hibernation API, so an idle
 * lobby costs nothing), grades every answer server-side with the shared
 * question engine, runs the "Inflation" bot on alarms, and books every human's
 * winnings per subject into the D1 semester scoreboard at the closing bell.
 */

import { ALL_QUESTIONS, questionsFor, questionsForSubject } from "@/content/questions";
import { getSubject } from "@/content/subjects";
import { buildInstance } from "@/lib/questions/engine";
import { formatAnswer, isWithinTolerance } from "@/lib/questions/grading";
import { maxPoints } from "@/lib/scoring";
import type { Question } from "@/lib/questions/types";
import {
    BOT_NAME,
    DEFAULT_CONFIG,
    FRONTRUN_DEADLINE_MS,
    RAPID_DEADLINE_MS,
    RAPID_DIFFICULTIES,
    WIN_BONUS,
    MAX_PLAYERS,
    POSTING_COUNTS,
    WRONG_COOLDOWN_MS,
    sanitizeName,
    type C2S,
    type MpConfig,
    type MpPhase,
    type MpPlayerPub,
    type MpRanking,
    type S2C,
} from "@/lib/multiplayer/protocol";
import type { Env } from "./index";
import { bookEarnings, type Booking } from "./scoreboard";

const BOT_ID = "bot";
/** an empty lobby self-destructs after this long without a connection */
const EMPTY_TTL_MS = 30 * 60 * 1000;
/**
 * Grace period before an empty room is reaped. Long enough for the client's
 * auto-reconnect (and a locked phone) to come back, short enough that stale
 * rooms do not linger.
 */
const EMPTY_GRACE_MS = 5 * 60 * 1000;

const QUESTION_BY_ID: Map<string, Question> = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

// Bot tuning per difficulty: [answer delay min ms, max ms, p(correct)]
const BOT_TUNING: Record<string, [number, number, number]> = {
    very_easy: [8_000, 16_000, 0.9],
    easy: [12_000, 24_000, 0.8],
    medium: [20_000, 40_000, 0.65],
    hard: [30_000, 60_000, 0.5],
    very_hard: [40_000, 75_000, 0.4],
};

type Dealt = { qid: string; seed: number };

type PlayerState = {
    id: string;
    name: string;
    bot: boolean;
    connected: boolean;
    /** bullrun: settled count · frontrun: postings won */
    progress: number;
    writeoffs: number;
    /** BroDollars earned this game */
    earned: number;
    /** the same, split by subject - what the semester scoreboard books */
    bySubject: Record<string, { amount: number; postings: number }>;
    rank: number | null;
    /** bullrun: remaining postings, head is current */
    queue: Dealt[];
    cooldownUntil: number;
};

type GameState = {
    deck: Dealt[];
    /** frontrun: current posting index + reveal deadline */
    index: number;
    deadline: number;
    /** frontrun: the bot's next attempt time; bullrun: same, per its own queue */
    botNextAt: number;
    startedAt: number;
    nextRank: number;
};

type RoomState = {
    code: string;
    hostId: string | null;
    phase: MpPhase;
    config: MpConfig;
    players: Record<string, PlayerState>;
    game: GameState | null;
    lastActive: number;
};

function newSeed(): number {
    return Math.floor(Math.random() * 2_147_483_646) + 1;
}

function shuffleInPlace<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}

/** union of the selected banks; empty topicIds = the whole subject */
function poolFor(config: MpConfig): Question[] {
    const seen = new Set<string>();
    const out: Question[] = [];
    const rapidOk = new Set<string>(RAPID_DIFFICULTIES);
    for (const sel of config.selections) {
        const qs =
            sel.topicIds.length === 0
                ? questionsForSubject(sel.subject)
                : questionsFor(sel.subject, sel.topicIds);
        for (const q of qs) {
            if (config.rapid && !rapidOk.has(q.difficulty)) continue;
            if (!seen.has(q.id)) {
                seen.add(q.id);
                out.push(q);
            }
        }
    }
    return out;
}

/** what the settled reveal shows */
function answerTextFor(dealt: Dealt): string {
    const q = QUESTION_BY_ID.get(dealt.qid);
    if (!q) return "-";
    const inst = buildInstance(q, dealt.seed);
    if (q.kind === "numeric" && inst.answer !== undefined) {
        return formatAnswer(inst.answer, q.unit);
    }
    const correct = (inst.correctIndices ?? []).map((i) => inst.choices?.[i] ?? "");
    return correct.join(" · ");
}

function grade(dealt: Dealt, value: number | number[]): boolean {
    const q = QUESTION_BY_ID.get(dealt.qid);
    if (!q) return false;
    const inst = buildInstance(q, dealt.seed);
    if (q.kind === "numeric") {
        return (
            typeof value === "number" &&
            Number.isFinite(value) &&
            inst.answer !== undefined &&
            isWithinTolerance(value, inst.answer, q.unit, q.tolerance)
        );
    }
    if (!Array.isArray(value)) return false;
    const expected = [...(inst.correctIndices ?? [])].sort().join(",");
    const got = [...value].map(Number).sort().join(",");
    return got === expected && value.length > 0;
}

export class Lobby {
    private ctx: DurableObjectState;
    private env: Env;
    private room: RoomState | null = null;

    constructor(ctx: DurableObjectState, env: Env) {
        this.ctx = ctx;
        this.env = env;
        // Keepalive: answer the client's "ping" frames with "pong" WITHOUT
        // waking the DO. Cloudflare's edge closes WebSockets after ~100s of
        // silence - an idle lobby or a hard question both exceed that.
        this.ctx.setWebSocketAutoResponse(
            new WebSocketRequestResponsePair("ping", "pong")
        );
    }

    // ------------------------------------------------------------------ state

    private async load(): Promise<RoomState | null> {
        if (this.room) return this.room;
        this.room = (await this.ctx.storage.get<RoomState>("room")) ?? null;
        return this.room;
    }

    private async save(): Promise<void> {
        if (this.room) {
            this.room.lastActive = Date.now();
            await this.ctx.storage.put("room", this.room);
        }
    }

    private async destroy(): Promise<void> {
        this.room = null;
        await this.ctx.storage.deleteAll();
        await this.ctx.storage.deleteAlarm();
    }

    // ------------------------------------------------------------------ fetch

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const room = await this.load();

        if (request.method === "POST" && url.pathname === "/reserve") {
            const inUse =
                room !== null &&
                (Object.values(room.players).some((p) => p.connected) ||
                    Date.now() - room.lastActive < EMPTY_TTL_MS);
            if (inUse) return new Response("taken", { status: 409 });
            await this.destroy();
            const code = (await request.text()).toUpperCase();
            this.room = {
                code,
                hostId: null,
                phase: "lobby",
                config: structuredClone(DEFAULT_CONFIG),
                players: {},
                game: null,
                lastActive: Date.now(),
            };
            await this.save();
            return new Response("ok");
        }

        if (url.pathname === "/ws") {
            if (!room) return new Response("no_room", { status: 404 });
            const pid = (url.searchParams.get("pid") ?? "").slice(0, 32);
            const name = sanitizeName(url.searchParams.get("name") ?? "");
            if (!/^[a-f0-9]{8,32}$/.test(pid)) {
                return new Response("bad_pid", { status: 400 });
            }

            const existing = room.players[pid];
            if (!existing) {
                if (room.phase !== "lobby") return new Response("in_progress", { status: 409 });
                const humans = Object.values(room.players).filter((p) => !p.bot).length;
                if (humans >= MAX_PLAYERS) return new Response("full", { status: 409 });
                room.players[pid] = {
                    id: pid,
                    name,
                    bot: false,
                    connected: true,
                    progress: 0,
                    writeoffs: 0,
                    earned: 0,
                    bySubject: {},
                    rank: null,
                    queue: [],
                    cooldownUntil: 0,
                };
                if (!room.hostId) room.hostId = pid;
            } else {
                existing.connected = true;
                existing.name = name || existing.name;
            }

            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);
            this.ctx.acceptWebSocket(server, [pid]);
            server.serializeAttachment({ pid });
            await this.save();

            // snapshot to the newcomer + roster update for everyone
            this.sendTo(server, this.roomMsg(pid));
            this.broadcastRoom(pid);
            if (room.phase === "play") {
                const deal = this.dealFor(pid);
                if (deal) this.sendTo(server, deal);
                this.sendTo(server, this.scoreMsg());
            }

            return new Response(null, { status: 101, webSocket: client });
        }

        return new Response("not_found", { status: 404 });
    }

    // ------------------------------------------------------------- websockets

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
        const room = await this.load();
        if (!room || typeof message !== "string") return;
        const pid = (ws.deserializeAttachment() as { pid?: string } | null)?.pid;
        if (!pid || !room.players[pid]) return;

        let msg: C2S;
        try {
            msg = JSON.parse(message) as C2S;
        } catch {
            return;
        }

        const isHost = pid === room.hostId;

        switch (msg.t) {
            case "config": {
                if (!isHost || room.phase !== "lobby") return;
                const cfg = this.validateConfig(msg.config);
                if (!cfg) {
                    this.sendTo(ws, { t: "error", code: "bad_config", msg: "Invalid setup." });
                    return;
                }
                room.config = cfg;
                await this.save();
                this.broadcastRoom();
                return;
            }
            case "bot": {
                if (!isHost || room.phase !== "lobby") return;
                if (msg.on && !room.players[BOT_ID]) {
                    room.players[BOT_ID] = {
                        id: BOT_ID,
                        name: BOT_NAME,
                        bot: true,
                        connected: true,
                        progress: 0,
                        writeoffs: 0,
                        earned: 0,
                        bySubject: {},
                        rank: null,
                        queue: [],
                        cooldownUntil: 0,
                    };
                } else if (!msg.on) {
                    delete room.players[BOT_ID];
                }
                await this.save();
                this.broadcastRoom();
                return;
            }
            case "start": {
                if (!isHost || room.phase !== "lobby") return;
                await this.startGame();
                return;
            }
            case "answer": {
                await this.handleAnswer(pid, msg.value);
                return;
            }
            case "leave": {
                // deliberate exit: drop the player from the roster entirely
                // (a mid-game leaver stays in the ranking math as a ghost only
                // if the game is running - lobby and end just forget them)
                if (room.phase !== "play") {
                    delete room.players[pid];
                } else {
                    room.players[pid].connected = false;
                }
                const humansLeft = Object.values(room.players).filter(
                    (p) => !p.bot && (room.phase === "play" ? true : p.connected)
                );
                if (room.hostId === pid) room.hostId = humansLeft[0]?.id ?? null;
                for (const sock of this.ctx.getWebSockets(pid)) {
                    try {
                        sock.close(1000, "left");
                    } catch {
                        /* already gone */
                    }
                }
                await this.save();
                this.broadcastRoom();
                return;
            }
            case "rematch": {
                if (!isHost || room.phase !== "end") return;
                room.phase = "lobby";
                room.game = null;
                for (const p of Object.values(room.players)) {
                    p.progress = 0;
                    p.writeoffs = 0;
                    p.earned = 0;
                    p.bySubject = {};
                    p.rank = null;
                    p.queue = [];
                    p.cooldownUntil = 0;
                }
                await this.save();
                this.broadcastRoom();
                return;
            }
        }
    }

    async webSocketClose(ws: WebSocket): Promise<void> {
        const room = await this.load();
        const pid = (ws.deserializeAttachment() as { pid?: string } | null)?.pid;
        if (!room || !pid) return;
        const player = room.players[pid];
        if (!player) return;

        // still another tab open for the same player?
        const remaining = this.ctx.getWebSockets(pid).filter((s) => s !== ws);
        if (remaining.length > 0) return;

        player.connected = false;

        const humansLeft = Object.values(room.players).filter((p) => !p.bot && p.connected);
        if (humansLeft.length === 0 && room.phase !== "play") {
            // keep the room so auto-reconnect (or a locked phone) can return;
            // the alarm reaps it after the grace period
            await this.ctx.storage.setAlarm(Date.now() + EMPTY_GRACE_MS + 1000);
        }
        if (room.hostId === pid && humansLeft.length > 0) {
            room.hostId = humansLeft[0].id;
        }
        await this.save();
        this.broadcastRoom();
    }

    async webSocketError(ws: WebSocket): Promise<void> {
        await this.webSocketClose(ws);
    }

    // ------------------------------------------------------------------- game

    private validateConfig(raw: MpConfig): MpConfig | null {
        if (!raw || (raw.mode !== "frontrun" && raw.mode !== "bullrun")) return null;
        if (!POSTING_COUNTS.includes(raw.count as (typeof POSTING_COUNTS)[number])) return null;
        if (!Array.isArray(raw.selections) || raw.selections.length === 0) return null;
        const selections = [];
        for (const sel of raw.selections.slice(0, 7)) {
            const subject = getSubject(String(sel.subject));
            if (!subject) return null;
            const valid = new Set(subject.topics.map((t) => t.id));
            const topicIds = Array.isArray(sel.topicIds)
                ? sel.topicIds.filter((t: string) => valid.has(t)).slice(0, 50)
                : [];
            selections.push({ subject: subject.id, topicIds });
        }
        return { mode: raw.mode, count: raw.count, selections, rapid: raw.rapid === true };
    }

    private async startGame(): Promise<void> {
        const room = this.room!;
        const pool = poolFor(room.config);
        if (pool.length === 0) {
            this.broadcast({
                t: "error",
                code: "empty_pool",
                msg: "No questions in this selection yet - pick another subject.",
            });
            return;
        }

        // deal `count` postings; if the pool is smaller, repeat with fresh
        // seeds (fine - the numbers reroll, same as the solo engine)
        const count = room.config.count;
        const deck: Dealt[] = [];
        let bag: Question[] = [];
        for (let i = 0; i < count; i++) {
            if (bag.length === 0) bag = shuffleInPlace([...pool]);
            deck.push({ qid: bag.pop()!.id, seed: newSeed() });
        }

        const now = Date.now();
        const deadlineMs = room.config.rapid ? RAPID_DEADLINE_MS : FRONTRUN_DEADLINE_MS;
        room.game = {
            deck,
            index: 0,
            deadline: now + deadlineMs,
            botNextAt: this.botDelayFor(deck[0]) + now,
            startedAt: now,
            nextRank: 1,
        };
        room.phase = "play";
        for (const p of Object.values(room.players)) {
            p.progress = 0;
            p.writeoffs = 0;
            p.earned = 0;
            p.bySubject = {};
            p.rank = null;
            p.cooldownUntil = 0;
            p.queue = room.config.mode === "bullrun" ? deck.map((d) => ({ ...d })) : [];
        }

        await this.save();
        this.broadcast({ t: "begin", mode: room.config.mode, count });
        this.broadcastRoom();
        for (const p of Object.values(room.players)) {
            if (p.bot) continue;
            const deal = this.dealFor(p.id);
            if (deal) this.sendToPlayer(p.id, deal);
        }
        this.broadcast(this.scoreMsg());
        await this.scheduleAlarm();
    }

    /** the posting a given player currently sees */
    private dealFor(pid: string): S2C | null {
        const room = this.room!;
        const game = room.game;
        if (!game || room.phase !== "play") return null;
        if (room.config.mode === "frontrun") {
            const d = game.deck[game.index];
            if (!d) return null;
            return { t: "deal", index: game.index, total: game.deck.length, qid: d.qid, seed: d.seed };
        }
        const player = room.players[pid];
        const head = player?.queue[0];
        if (!head) return null;
        return {
            t: "deal",
            index: player.progress,
            total: game.deck.length,
            qid: head.qid,
            seed: head.seed,
        };
    }

    private async handleAnswer(pid: string, value: number | number[]): Promise<void> {
        const room = this.room!;
        const game = room.game;
        const player = room.players[pid];
        if (!game || !player || room.phase !== "play" || player.rank !== null) return;
        const now = Date.now();
        if (player.cooldownUntil > now) return;

        if (room.config.mode === "frontrun") {
            const dealt = game.deck[game.index];
            if (!dealt) return;
            if (grade(dealt, value)) {
                player.progress += 1;
                this.credit(player, dealt);
                await this.settleFrontrun(pid);
            } else {
                player.writeoffs += 1;
                player.cooldownUntil = now + WRONG_COOLDOWN_MS;
                this.sendToPlayer(pid, {
                    t: "graded",
                    correct: false,
                    cooldownMs: WRONG_COOLDOWN_MS,
                });
                this.broadcast(this.scoreMsg());
                await this.save();
            }
            return;
        }

        // bullrun
        const head = player.queue[0];
        if (!head) return;
        if (grade(head, value)) {
            player.queue.shift();
            player.progress += 1;
            this.credit(player, head);
            this.sendToPlayer(pid, { t: "graded", correct: true });
            if (player.queue.length === 0) {
                player.rank = game.nextRank++;
                await this.save();
                await this.endGame();
                return;
            }
            const deal = this.dealFor(pid);
            if (deal) this.sendToPlayer(pid, deal);
        } else {
            // write-off: back of the queue with fresh numbers
            player.queue.shift();
            player.queue.push({ qid: head.qid, seed: newSeed() });
            player.writeoffs += 1;
            this.sendToPlayer(pid, { t: "graded", correct: false });
            const deal = this.dealFor(pid);
            if (deal) this.sendToPlayer(pid, deal);
        }
        this.broadcast(this.scoreMsg());
        await this.save();
    }

    /** frontrun: posting settled (by = null on timeout), advance or end */
    private async settleFrontrun(by: string | null): Promise<void> {
        const room = this.room!;
        const game = room.game!;
        const dealt = game.deck[game.index];
        this.broadcast({
            t: "settled",
            index: game.index,
            by,
            answerText: answerTextFor(dealt),
        });

        game.index += 1;
        if (game.index >= game.deck.length) {
            await this.save();
            await this.endGame();
            return;
        }
        const now = Date.now();
        game.deadline =
            now + (room.config.rapid ? RAPID_DEADLINE_MS : FRONTRUN_DEADLINE_MS);
        game.botNextAt = now + this.botDelayFor(game.deck[game.index]);
        for (const p of Object.values(room.players)) p.cooldownUntil = 0;
        this.broadcast(this.scoreMsg());
        const deal = this.dealFor("");
        if (deal) this.broadcast(deal);
        await this.save();
        await this.scheduleAlarm();
    }

    private async endGame(): Promise<void> {
        const room = this.room!;
        room.phase = "end";

        const players = Object.values(room.players);
        const sorted = [...players].sort((a, b) => {
            if (room.config.mode === "bullrun") {
                const ar = a.rank ?? Number.MAX_SAFE_INTEGER;
                const br = b.rank ?? Number.MAX_SAFE_INTEGER;
                if (ar !== br) return ar - br;
            }
            if (a.progress !== b.progress) return b.progress - a.progress;
            return a.writeoffs - b.writeoffs;
        });
        // the closing bell pays the winner a flat bonus on top - booked to the
        // subject that paid the winner most this game (first pick as fallback)
        const winner = sorted[0];
        if (winner) {
            winner.earned += WIN_BONUS;
            const subject = this.bonusSubjectFor(winner);
            const cell = (winner.bySubject[subject] ??= { amount: 0, postings: 0 });
            cell.amount += WIN_BONUS;
        }
        const ranking: MpRanking[] = sorted.map((p, i) => ({
            ...this.pub(p),
            winner: i === 0,
        }));

        // book every human's winnings into the semester scoreboard
        let leaderboard: "ok" | "failed" | "skipped" = "skipped";
        const bookings: Booking[] = players
            .filter((p) => !p.bot && p.earned > 0)
            .map((p) => ({ pid: p.id, name: p.name, bySubject: p.bySubject }));
        if (bookings.length > 0) {
            leaderboard = (await bookEarnings(this.env.DB, bookings)) ? "ok" : "failed";
        }

        await this.ctx.storage.deleteAlarm();
        await this.save();
        this.broadcast({ t: "end", ranking, leaderboard });
        this.broadcastRoom();
    }

    private bonusSubjectFor(p: PlayerState): string {
        let best: string | null = null;
        let bestAmount = -1;
        for (const [subject, v] of Object.entries(p.bySubject)) {
            if (v.amount > bestAmount) {
                best = subject;
                bestAmount = v.amount;
            }
        }
        return best ?? this.room!.config.selections[0]?.subject ?? "finance";
    }

    // -------------------------------------------------------------- bot + alarm

    /** BroDollars a settled/won posting pays: the difficulty's base points. */
    private payoutFor(dealt: Dealt): number {
        const q = QUESTION_BY_ID.get(dealt.qid);
        return q ? maxPoints(q.difficulty) : 0;
    }

    /** pay a settled/won posting, and remember which subject it came from */
    private credit(p: PlayerState, dealt: Dealt): void {
        const q = QUESTION_BY_ID.get(dealt.qid);
        const amount = q ? maxPoints(q.difficulty) : 0;
        p.earned += amount;
        if (!q) return;
        // rooms persisted before the per-subject split come back without it
        p.bySubject ??= {};
        const cell = (p.bySubject[q.subject] ??= { amount: 0, postings: 0 });
        cell.amount += amount;
        cell.postings += 1;
    }

    private botDelayFor(dealt: Dealt): number {
        const q = QUESTION_BY_ID.get(dealt.qid);
        const [min, max] = BOT_TUNING[q?.difficulty ?? "medium"] ?? BOT_TUNING.medium;
        return min + Math.random() * (max - min);
    }

    private botAccuracyFor(dealt: Dealt): number {
        const q = QUESTION_BY_ID.get(dealt.qid);
        return (BOT_TUNING[q?.difficulty ?? "medium"] ?? BOT_TUNING.medium)[2];
    }

    private async scheduleAlarm(): Promise<void> {
        const room = this.room;
        if (!room || room.phase !== "play" || !room.game) return;
        const times: number[] = [];
        if (room.config.mode === "frontrun") times.push(room.game.deadline);
        if (room.players[BOT_ID]) times.push(room.game.botNextAt);
        if (times.length === 0) return;
        await this.ctx.storage.setAlarm(Math.min(...times));
    }

    async alarm(): Promise<void> {
        const room = await this.load();
        if (!room) return;
        const game = room.game;
        if (room.phase !== "play" || !game) {
            // stale room reaper: nobody connected and quiet past the grace
            const anyConnected = Object.values(room.players).some(
                (p) => !p.bot && p.connected
            );
            const idleMs = Date.now() - room.lastActive;
            if (!anyConnected && idleMs > EMPTY_GRACE_MS) await this.destroy();
            else if (idleMs > EMPTY_TTL_MS) await this.destroy();
            return;
        }
        const now = Date.now();
        const bot = room.players[BOT_ID];

        if (room.config.mode === "frontrun") {
            if (bot && now >= game.botNextAt) {
                const dealt = game.deck[game.index];
                if (Math.random() < this.botAccuracyFor(dealt)) {
                    bot.progress += 1;
                    this.credit(bot, dealt);
                    await this.settleFrontrun(BOT_ID);
                    return;
                }
                bot.writeoffs += 1;
                game.botNextAt = now + 8_000 + Math.random() * 12_000;
                this.broadcast(this.scoreMsg());
            }
            if (now >= game.deadline) {
                await this.settleFrontrun(null);
                return;
            }
        } else if (bot && bot.rank === null && now >= game.botNextAt) {
            const head = bot.queue[0];
            if (head) {
                if (Math.random() < this.botAccuracyFor(head)) {
                    bot.queue.shift();
                    bot.progress += 1;
                    this.credit(bot, head);
                    if (bot.queue.length === 0) {
                        bot.rank = game.nextRank++;
                        await this.save();
                        await this.endGame();
                        return;
                    }
                } else {
                    bot.queue.shift();
                    bot.queue.push({ qid: head.qid, seed: newSeed() });
                    bot.writeoffs += 1;
                }
                game.botNextAt = now + this.botDelayFor(bot.queue[0]);
                this.broadcast(this.scoreMsg());
            }
        }

        await this.save();
        await this.scheduleAlarm();
    }

    // ------------------------------------------------------------------ wire

    private pub(p: PlayerState): MpPlayerPub {
        return {
            id: p.id,
            name: p.name,
            bot: p.bot,
            connected: p.connected,
            progress: p.progress,
            writeoffs: p.writeoffs,
            earned: p.earned,
            rank: p.rank,
        };
    }

    private roomMsg(you: string): S2C {
        const room = this.room!;
        return {
            t: "room",
            you,
            code: room.code,
            host: room.hostId ?? "",
            phase: room.phase,
            players: Object.values(room.players).map((p) => this.pub(p)),
            config: room.config,
            poolSize: poolFor(room.config).length,
        };
    }

    private scoreMsg(): S2C {
        const room = this.room!;
        return {
            t: "score",
            players: Object.values(room.players).map((p) => this.pub(p)),
        };
    }

    private sendTo(ws: WebSocket, msg: S2C): void {
        try {
            ws.send(JSON.stringify(msg));
        } catch {
            /* socket already gone */
        }
    }

    private sendToPlayer(pid: string, msg: S2C): void {
        for (const ws of this.ctx.getWebSockets(pid)) this.sendTo(ws, msg);
    }

    private broadcast(msg: S2C): void {
        const data = JSON.stringify(msg);
        for (const ws of this.ctx.getWebSockets()) {
            try {
                ws.send(data);
            } catch {
                /* socket already gone */
            }
        }
    }

    /** room snapshot to everyone - `you` differs per socket */
    private broadcastRoom(skipPid?: string): void {
        for (const ws of this.ctx.getWebSockets()) {
            const pid = (ws.deserializeAttachment() as { pid?: string } | null)?.pid ?? "";
            if (pid === skipPid) continue;
            this.sendTo(ws, this.roomMsg(pid));
        }
    }
}
