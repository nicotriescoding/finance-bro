"use client";

/**
 * Multiplayer 🥋 - duels against other FinanceBros (or Inflation).
 *
 * Talks to the Cloudflare worker (NEXT_PUBLIC_MP_URL) over a WebSocket. The
 * server deals (qid, seed) pairs; the browser builds the posting locally with
 * the same engine the solo quiz uses, and every answer is graded server-side.
 *
 * Hard rule 1: this page is an optional extra. No worker URL configured, or
 * the worker unreachable -> the canon placeholder copy below. The rest of the
 * site never waits for any of this.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_QUESTIONS, countForSubject } from "@/content/questions";
import { SUBJECTS } from "@/content/subjects";
import { buildInstance } from "@/lib/questions/engine";
import type { Question } from "@/lib/questions/types";
import {
    DEFAULT_CONFIG,
    MODES,
    POSTING_COUNTS,
    isValidCode,
    sanitizeName,
    type C2S,
    type LeaderboardRow,
    type MpConfig,
    type MpMode,
    type MpPlayerPub,
    type MpRanking,
    type S2C,
} from "@/lib/multiplayer/protocol";
import {
    MP_URL,
    createRoom,
    getPlayerId,
    getStoredName,
    inviteLink,
    mpEnabled,
    socketUrl,
    storeName,
} from "@/lib/multiplayer/client";
import { usePersistentState } from "@/hooks/usePersistentState";
import { formatMoney, MONEY } from "@/lib/money";
import MpQuestionCard from "./MpQuestionCard";

const QUESTION_BY_ID: Map<string, Question> = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

type Deal = { index: number; total: number; qid: string; seed: number };
type Settled = { index: number; by: string | null; answerText: string };

type RoomSnapshot = Extract<S2C, { t: "room" }>;

// ---------------------------------------------------------------------------

/** Placeholder copy - original finance-bro canon, do not touch. */
function CanonPlaceholder() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
            <div className="flex max-w-xl flex-col items-center gap-4 rounded-[14px] border border-hairline bg-surface px-6 py-10 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:px-10">
                <span className="caps-label text-[10px] text-muted-light">
                    Service notice · desk not staffed
                </span>
                <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Multiplayer 🥋</h1>
                <p className="max-w-lg text-lg leading-relaxed text-muted">
                    You are currently <span className="font-extrabold text-warn">unemployed</span> 🫠.
                    <br />
                    Raise your <span className="font-bold text-ink">Corporate Rank</span> first,
                    before a <span className="font-bold text-warn-bright">Manager</span> dominates you.
                </p>
                <div className="text-sm italic text-muted-light">
                    (Feature in development - soon you can go head to head with other FinanceBros 💪)
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------

export default function MultiplayerClient() {
    const [name, setName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    const [room, setRoom] = useState<RoomSnapshot | null>(null);
    const [players, setPlayers] = useState<MpPlayerPub[]>([]);
    const [deal, setDeal] = useState<Deal | null>(null);
    const [settled, setSettled] = useState<Settled | null>(null);
    const [lastWrong, setLastWrong] = useState(false);
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [ranking, setRanking] = useState<MpRanking[] | null>(null);
    const [lbStatus, setLbStatus] = useState<"ok" | "failed" | "skipped">("skipped");
    const [copied, setCopied] = useState(false);

    // the real account balance - duel winnings are credited here at game end
    const [, setBalance] = usePersistentState<number>("bwr_score_v1", 0);

    const wsRef = useRef<WebSocket | null>(null);
    const quickRef = useRef(false);
    const quickStartedRef = useRef(false);
    const leaveRef = useRef(false);

    useEffect(() => {
        setName(getStoredName());
        const params = new URLSearchParams(window.location.search);
        const code = (params.get("room") ?? "").toUpperCase();
        if (isValidCode(code)) setJoinCode(code);
    }, []);

    const send = useCallback((msg: C2S) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    }, []);

    const handleMessage = useCallback(
        (msg: S2C) => {
            switch (msg.t) {
                case "room":
                    setRoom(msg);
                    setPlayers(msg.players);
                    if (msg.phase === "lobby") {
                        setDeal(null);
                        setSettled(null);
                        setRanking(null);
                        setLastWrong(false);
                        setCooldownUntil(0);
                    }
                    // quick match: the creator boots the bot and starts at once
                    if (
                        quickRef.current &&
                        !quickStartedRef.current &&
                        msg.phase === "lobby" &&
                        msg.you === msg.host
                    ) {
                        quickStartedRef.current = true;
                        send({ t: "bot", on: true });
                        send({ t: "start" });
                    }
                    break;
                case "begin":
                    setSettled(null);
                    setRanking(null);
                    setLastWrong(false);
                    setCooldownUntil(0);
                    break;
                case "deal":
                    setDeal(msg);
                    setLastWrong(false);
                    setCooldownUntil(0);
                    break;
                case "graded":
                    if (!msg.correct) {
                        setLastWrong(true);
                        if (msg.cooldownMs) setCooldownUntil(Date.now() + msg.cooldownMs);
                    } else {
                        setLastWrong(false);
                    }
                    break;
                case "settled":
                    setSettled(msg);
                    setLastWrong(false);
                    setCooldownUntil(0);
                    break;
                case "score":
                    setPlayers(msg.players);
                    break;
                case "end": {
                    setRanking(msg.ranking);
                    setLbStatus(msg.leaderboard);
                    // credit this game's BroDollars to the account balance
                    const mine = msg.ranking.find((r) => r.id === getPlayerId());
                    if (mine && mine.earned > 0) {
                        setBalance((prev) => prev + mine.earned);
                    }
                    break;
                }
                case "error":
                    setError(msg.msg);
                    break;
            }
        },
        [send, setBalance]
    );

    const connect = useCallback(
        (code: string, playerName: string) => {
            setError(null);
            setConnecting(true);
            leaveRef.current = false;
            const pid = getPlayerId();
            const ws = new WebSocket(socketUrl(code, pid, playerName));
            wsRef.current = ws;
            ws.onopen = () => setConnecting(false);
            ws.onmessage = (e) => {
                try {
                    handleMessage(JSON.parse(String(e.data)) as S2C);
                } catch {
                    /* ignore malformed frames */
                }
            };
            ws.onclose = () => {
                if (leaveRef.current) return;
                setConnecting(false);
                setRoom((prev) => {
                    if (prev) {
                        setError("Connection lost. The trading floor went dark - rejoin with the room code.");
                    }
                    return null;
                });
            };
            ws.onerror = () => {
                setConnecting(false);
                setError("Could not reach the multiplayer desk. Room full, game running, or wrong code.");
            };
        },
        [handleMessage]
    );

    const leaveRoom = useCallback(() => {
        leaveRef.current = true;
        quickRef.current = false;
        quickStartedRef.current = false;
        wsRef.current?.close();
        wsRef.current = null;
        setRoom(null);
        setDeal(null);
        setSettled(null);
        setRanking(null);
        setError(null);
    }, []);

    useEffect(() => () => wsRef.current?.close(), []);

    const commitName = (): string | null => {
        const clean = sanitizeName(name);
        if (!name.trim()) {
            setError("Pick a name first - HR insists.");
            return null;
        }
        storeName(clean);
        setName(clean);
        return clean;
    };

    const onCreate = async (quick: boolean) => {
        const clean = commitName();
        if (!clean) return;
        setError(null);
        setConnecting(true);
        quickRef.current = quick;
        quickStartedRef.current = false;
        try {
            const code = await createRoom();
            connect(code, clean);
        } catch {
            setConnecting(false);
            setError("Could not open a room. The multiplayer desk seems unreachable.");
        }
    };

    const onJoin = () => {
        const clean = commitName();
        if (!clean) return;
        const code = joinCode.toUpperCase().trim();
        if (!isValidCode(code)) {
            setError("Room codes are 5 characters, e.g. XK7PQ.");
            return;
        }
        quickRef.current = false;
        connect(code, clean);
    };

    if (!mpEnabled) return <CanonPlaceholder />;

    // ------------------------------------------------------------------ views

    if (!room) {
        return (
            <HomeView
                name={name}
                setName={setName}
                joinCode={joinCode}
                setJoinCode={setJoinCode}
                onCreate={onCreate}
                onJoin={onJoin}
                connecting={connecting}
                error={error}
            />
        );
    }

    if (room.phase === "lobby" || (room.phase === "play" && !deal)) {
        return (
            <LobbyView
                room={room}
                players={players}
                send={send}
                onLeave={leaveRoom}
                error={error}
                copied={copied}
                onCopy={async () => {
                    try {
                        await navigator.clipboard.writeText(inviteLink(room.code));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    } catch {
                        /* clipboard blocked - the code is on screen anyway */
                    }
                }}
            />
        );
    }

    if (ranking) {
        return (
            <EndView
                room={room}
                ranking={ranking}
                lbStatus={lbStatus}
                isHost={room.you === room.host}
                send={send}
                onLeave={leaveRoom}
            />
        );
    }

    return (
        <GameView
            room={room}
            players={players}
            deal={deal!}
            settled={settled}
            lastWrong={lastWrong}
            cooldownUntil={cooldownUntil}
            send={send}
            onLeave={leaveRoom}
        />
    );
}

// ---------------------------------------------------------------------------
// home

function HomeView(props: {
    name: string;
    setName: (v: string) => void;
    joinCode: string;
    setJoinCode: (v: string) => void;
    onCreate: (quick: boolean) => void;
    onJoin: () => void;
    connecting: boolean;
    error: string | null;
}) {
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
            <header className="flex flex-col gap-1">
                <span className="caps-label text-[10px] text-muted-light">
                    Trading floor · duels desk
                </span>
                <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Multiplayer 🥋</h1>
                <p className="text-[15px] text-muted">
                    Same postings, same numbers, live scoreboard. Nobody around? Inflation 📈 is
                    always up for a fight.
                </p>
            </header>

            {props.error && (
                <div className="rounded-[10px] border border-warn-border bg-warn-tint px-4 py-3 text-sm font-bold text-warn">
                    {props.error}
                </div>
            )}

            <div className="flex flex-col gap-3 rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-6">
                <label className="caps-label text-[11px] text-muted" htmlFor="mp-name">
                    Your trading name
                </label>
                <input
                    id="mp-name"
                    type="text"
                    value={props.name}
                    maxLength={20}
                    onChange={(e) => props.setName(e.target.value)}
                    placeholder="e.g. WolfOfGarching"
                    className="rounded-[10px] border-2 border-brand bg-brand-input px-4 py-3 text-lg font-extrabold outline-none placeholder:text-sm placeholder:font-medium placeholder:text-muted"
                />

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        disabled={props.connecting}
                        onClick={() => props.onCreate(false)}
                        className="rounded-[10px] bg-brand px-5 py-3.5 text-[15px] font-extrabold text-white transition hover:bg-[#175a3a] disabled:opacity-60"
                    >
                        Open a room 🔑
                    </button>
                    <button
                        type="button"
                        disabled={props.connecting}
                        onClick={() => props.onCreate(true)}
                        className="rounded-[10px] bg-ink-raised px-5 py-3.5 text-[15px] font-extrabold text-white transition hover:bg-ink disabled:opacity-60"
                    >
                        Quick duel vs. Inflation 📈
                    </button>
                </div>

                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={props.joinCode}
                        maxLength={5}
                        onChange={(e) => props.setJoinCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") props.onJoin();
                        }}
                        placeholder="Room code"
                        className="flex-1 rounded-[10px] border border-hairline bg-surface px-4 py-3 text-lg font-extrabold uppercase tracking-[.2em] outline-none placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-muted"
                    />
                    <button
                        type="button"
                        disabled={props.connecting}
                        onClick={props.onJoin}
                        className="rounded-[10px] border border-hairline bg-surface px-5 py-3 text-[15px] font-extrabold text-ink transition hover:border-[#c8d3de] disabled:opacity-60"
                    >
                        Join room →
                    </button>
                </div>
                {props.connecting && (
                    <p className="text-sm text-muted">Connecting to the trading floor…</p>
                )}
            </div>

            <LeaderboardPanel />
        </div>
    );
}

// ---------------------------------------------------------------------------
// leaderboard

function LeaderboardPanel() {
    const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
    const [semester, setSemester] = useState("");
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let alive = true;
        fetch(`${MP_URL}/api/leaderboard`)
            .then((r) => r.json())
            .then((data: { semester?: string; rows?: LeaderboardRow[]; error?: string }) => {
                if (!alive) return;
                setSemester(data.semester ?? "");
                if (data.error || !data.rows) setFailed(true);
                else setRows(data.rows);
            })
            .catch(() => alive && setFailed(true));
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="flex flex-col gap-3 rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-6">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-[-0.01em]">
                    Semester leaderboard 🏆
                </h2>
                {semester && (
                    <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-muted">
                        {semester}
                    </span>
                )}
                <span className="caps-label ml-auto text-[10px] text-muted-light">
                    resets every semester
                </span>
            </div>
            {failed && (
                <p className="text-sm text-muted">
                    The leaderboard desk is not staffed right now. Duels still work.
                </p>
            )}
            {rows && rows.length === 0 && (
                <p className="text-sm text-muted">
                    Nobody on the board yet. First win takes the corner office.
                </p>
            )}
            {rows && rows.length > 0 && (
                <div className="flex flex-col">
                    {rows.slice(0, 10).map((r, i) => (
                        <div
                            key={`${r.playerId}-${i}`}
                            className="flex items-center gap-3 border-t border-hairline-soft py-2 text-sm first:border-t-0"
                        >
                            <span className="w-6 text-right font-extrabold tabular-nums text-muted">
                                {i + 1}.
                            </span>
                            <span className="font-bold">{r.name}</span>
                            <span className="caps-label text-[10px] text-muted-light">
                                #{r.playerId}
                            </span>
                            <span className="ml-auto tabular-nums text-muted">
                                {r.wins} {r.wins === 1 ? "win" : "wins"} · {r.settled} settled
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {rows === null && !failed && <p className="text-sm text-muted">Loading…</p>}
        </div>
    );
}

// ---------------------------------------------------------------------------
// lobby

function LobbyView(props: {
    room: RoomSnapshot;
    players: MpPlayerPub[];
    send: (msg: C2S) => void;
    onLeave: () => void;
    onCopy: () => void;
    copied: boolean;
    error: string | null;
}) {
    const { room, players, send } = props;
    const isHost = room.you === room.host;
    const config = room.config;
    const hasBot = players.some((p) => p.bot);

    const updateConfig = (partial: Partial<MpConfig>) =>
        send({ t: "config", config: { ...config, ...partial } });

    const toggleSubject = (subjectId: string) => {
        const exists = config.selections.some((s) => s.subject === subjectId);
        const selections = exists
            ? config.selections.filter((s) => s.subject !== subjectId)
            : [...config.selections, { subject: subjectId as MpConfig["selections"][number]["subject"], topicIds: [] }];
        if (selections.length === 0) return;
        updateConfig({ selections });
    };

    const toggleTopic = (subjectId: string, topicId: string) => {
        const selections = config.selections.map((s) => {
            if (s.subject !== subjectId) return s;
            const has = s.topicIds.includes(topicId);
            return {
                ...s,
                topicIds: has ? s.topicIds.filter((t) => t !== topicId) : [...s.topicIds, topicId],
            };
        });
        updateConfig({ selections });
    };

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
            <header className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col">
                    <span className="caps-label text-[10px] text-muted-light">Room</span>
                    <h1 className="text-3xl font-extrabold tracking-[.15em]">{room.code}</h1>
                </div>
                <button
                    type="button"
                    onClick={props.onCopy}
                    className="rounded-[10px] border border-hairline bg-surface px-4 py-2 text-[13px] font-bold text-muted transition hover:border-[#c8d3de] hover:text-ink"
                >
                    {props.copied ? "Link copied ✓" : "Copy invite link 🔗"}
                </button>
                <button
                    type="button"
                    onClick={props.onLeave}
                    className="ml-auto rounded-[10px] border border-hairline bg-surface px-4 py-2 text-[13px] font-bold text-muted transition hover:border-[#c8d3de] hover:text-ink"
                >
                    Leave
                </button>
            </header>

            {props.error && (
                <div className="rounded-[10px] border border-warn-border bg-warn-tint px-4 py-3 text-sm font-bold text-warn">
                    {props.error}
                </div>
            )}

            {/* players */}
            <div className="flex flex-col gap-2 rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <span className="caps-label text-[11px] text-muted">
                    On the floor · {players.length}
                </span>
                <div className="flex flex-wrap gap-2">
                    {players.map((p) => (
                        <span
                            key={p.id}
                            className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                                p.id === room.you
                                    ? "bg-brand-chip text-brand"
                                    : "bg-chip text-ink"
                            } ${p.connected ? "" : "opacity-50"}`}
                        >
                            {p.name}
                            {p.id === room.host && " 👑"}
                            {p.id === room.you && " (you)"}
                        </span>
                    ))}
                </div>
                {isHost && (
                    <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm font-bold text-muted">
                        <input
                            type="checkbox"
                            checked={hasBot}
                            onChange={(e) => send({ t: "bot", on: e.target.checked })}
                        />
                        Let Inflation 📈 play too
                    </label>
                )}
            </div>

            {/* config */}
            <div className="flex flex-col gap-4 rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <span className="caps-label text-[11px] text-muted">
                    Game setup {isHost ? "· you hold the pen" : "· the host holds the pen"}
                </span>

                <div className="grid gap-2 sm:grid-cols-2">
                    {(Object.keys(MODES) as MpMode[]).map((mode) => {
                        const m = MODES[mode];
                        const active = config.mode === mode;
                        return (
                            <button
                                key={mode}
                                type="button"
                                disabled={!isHost}
                                onClick={() => updateConfig({ mode })}
                                className={`flex flex-col gap-1 rounded-[10px] border p-3.5 text-left transition ${
                                    active
                                        ? "border-brand-border bg-brand-tint"
                                        : "border-hairline bg-surface hover:border-[#c8d3de]"
                                } disabled:cursor-default`}
                            >
                                <span className="text-[15px] font-extrabold">
                                    {m.name} {m.emoji}
                                </span>
                                <span className="text-[13px] leading-snug text-muted">
                                    {m.tagline}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="caps-label text-[11px] text-muted">Postings</span>
                    {POSTING_COUNTS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            disabled={!isHost}
                            onClick={() => updateConfig({ count: c })}
                            className={`rounded-full px-3.5 py-1.5 text-sm font-extrabold transition ${
                                config.count === c
                                    ? "bg-brand text-white"
                                    : "bg-chip text-muted hover:text-ink"
                            } disabled:cursor-default`}
                        >
                            {c}
                        </button>
                    ))}
                    <span className="ml-auto rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-muted">
                        POOL {room.poolSize}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="caps-label text-[11px] text-muted">
                        Subjects · mix and match
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {SUBJECTS.map((s) => {
                            const available = countForSubject(s.id) > 0;
                            const selected = config.selections.some((sel) => sel.subject === s.id);
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    disabled={!isHost || !available}
                                    title={available ? s.label : "Being rebuilt from real TUM exams"}
                                    onClick={() => toggleSubject(s.id)}
                                    className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                                        selected
                                            ? "bg-brand text-white"
                                            : "bg-chip text-muted hover:text-ink"
                                    } disabled:cursor-default disabled:opacity-40`}
                                >
                                    {s.emoji} {s.short}
                                </button>
                            );
                        })}
                    </div>
                    {config.selections.map((sel) => {
                        const subject = SUBJECTS.find((s) => s.id === sel.subject);
                        if (!subject || subject.topics.length === 0) return null;
                        return (
                            <div key={sel.subject} className="flex flex-col gap-1.5">
                                <span className="caps-label text-[10px] text-muted-light">
                                    {subject.short} topics · nothing ticked = the whole bank
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {subject.topics.map((t) => {
                                        const on = sel.topicIds.includes(t.id);
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                disabled={!isHost}
                                                onClick={() => toggleTopic(sel.subject, t.id)}
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                                                    on
                                                        ? "bg-brand-chip text-brand"
                                                        : "bg-chip text-muted hover:text-ink"
                                                } disabled:cursor-default`}
                                            >
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isHost ? (
                    <button
                        type="button"
                        disabled={room.poolSize === 0}
                        onClick={() => send({ t: "start" })}
                        className="h-[54px] rounded-[10px] bg-brand px-6 text-base font-extrabold text-white transition hover:bg-[#175a3a] disabled:opacity-60"
                    >
                        Open the market 🔔
                    </button>
                ) : (
                    <p className="text-sm text-muted">
                        Waiting for the host to open the market 🔔
                    </p>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// game

function GameView(props: {
    room: RoomSnapshot;
    players: MpPlayerPub[];
    deal: Deal;
    settled: Settled | null;
    lastWrong: boolean;
    cooldownUntil: number;
    send: (msg: C2S) => void;
    onLeave: () => void;
}) {
    const { room, players, deal, settled } = props;

    const instance = useMemo(() => {
        const q = QUESTION_BY_ID.get(deal.qid);
        return q ? buildInstance(q, deal.seed) : null;
    }, [deal.qid, deal.seed]);

    const mode = MODES[room.config.mode];
    const settledByName =
        settled?.by == null ? null : players.find((p) => p.id === settled.by)?.name ?? "someone";

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-chip px-3 py-1 text-xs font-extrabold text-muted">
                        {mode.name.toUpperCase()} {mode.emoji}
                    </span>
                    <span className="caps-label text-[10px] text-muted-light">
                        Room {room.code}
                    </span>
                    <button
                        type="button"
                        onClick={props.onLeave}
                        className="ml-auto rounded-[10px] border border-hairline bg-surface px-3 py-1.5 text-xs font-bold text-muted transition hover:border-[#c8d3de] hover:text-ink"
                    >
                        Leave
                    </button>
                </div>

                {settled && (
                    <div
                        className={`rounded-[10px] border px-4 py-3 text-sm font-bold ${
                            settled.by
                                ? "border-brand-border bg-brand-tint text-brand"
                                : "border-warn-border bg-warn-tint text-warn"
                        }`}
                    >
                        {settled.by
                            ? `Posting ${settled.index + 1} settled by ${settledByName} · ${settled.answerText}`
                            : `Posting ${settled.index + 1} expired unanswered · ${settled.answerText}`}
                    </div>
                )}

                {instance ? (
                    <MpQuestionCard
                        instance={instance}
                        postingNo={deal.index + 1}
                        total={deal.total}
                        cooldownUntil={props.cooldownUntil}
                        lastWrong={props.lastWrong}
                        onSubmit={(value) => props.send({ t: "answer", value })}
                    />
                ) : (
                    <div className="rounded-[14px] border border-hairline bg-surface p-6 text-sm text-muted">
                        This posting is missing from your build - refresh the page.
                    </div>
                )}
            </div>

            <MpScoreboard
                players={players}
                total={room.config.count}
                you={room.you}
                mode={room.config.mode}
            />
        </div>
    );
}

function MpScoreboard(props: {
    players: MpPlayerPub[];
    total: number;
    you: string;
    mode: MpMode;
}) {
    const sorted = [...props.players].sort((a, b) => {
        const ar = a.rank ?? Number.MAX_SAFE_INTEGER;
        const br = b.rank ?? Number.MAX_SAFE_INTEGER;
        if (ar !== br) return ar - br;
        return b.progress - a.progress;
    });
    return (
        <aside className="flex w-full flex-col gap-2 rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] lg:w-72 lg:shrink-0">
            <span className="caps-label text-[11px] text-muted">
                Live scoreboard · {props.mode === "frontrun" ? "postings won" : "postings settled"}
            </span>
            {sorted.map((p) => {
                const pctDone = Math.min(100, (p.progress / Math.max(1, props.total)) * 100);
                return (
                    <div key={p.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                            <span className={`font-bold ${p.id === props.you ? "text-brand" : ""}`}>
                                {p.name}
                                {p.id === props.you && " (you)"}
                            </span>
                            {p.rank !== null && <span>🏁</span>}
                            {!p.connected && !p.bot && (
                                <span className="caps-label text-[9px] text-muted-light">away</span>
                            )}
                            <span className="ml-auto tabular-nums text-muted">
                                {p.progress}/{props.total}
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-chip">
                            <div
                                className="h-full rounded-full bg-brand transition-[width]"
                                style={{ width: `${pctDone}%` }}
                            />
                        </div>
                        <span className="caps-label text-[9px] text-muted-light">
                            {formatMoney(p.earned)} {MONEY}
                            {p.writeoffs > 0 &&
                                ` · ${p.writeoffs} write-off${p.writeoffs === 1 ? "" : "s"}`}
                        </span>
                    </div>
                );
            })}
        </aside>
    );
}

// ---------------------------------------------------------------------------
// end

function EndView(props: {
    room: RoomSnapshot;
    ranking: MpRanking[];
    lbStatus: "ok" | "failed" | "skipped";
    isHost: boolean;
    send: (msg: C2S) => void;
    onLeave: () => void;
}) {
    const winner = props.ranking[0];
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
            <header className="flex flex-col items-center gap-2 rounded-[14px] border border-hairline bg-surface p-6 text-center shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <span className="caps-label text-[10px] text-muted-light">Closing bell</span>
                <h1 className="text-3xl font-extrabold tracking-[-0.02em]">
                    {winner ? `${winner.name} takes the floor 🏆` : "Market closed"}
                </h1>
                {winner?.id === props.room.you && (
                    <p className="text-[15px] font-bold text-brand">
                        Promotion pending. HR will be in touch.
                    </p>
                )}
                {(() => {
                    const mine = props.ranking.find((r) => r.id === props.room.you);
                    return mine && mine.earned > 0 ? (
                        <p className="text-[15px] font-extrabold text-brand">
                            +{formatMoney(mine.earned)} {MONEY} credited to your account
                        </p>
                    ) : null;
                })()}
                {winner && winner.bot && (
                    <p className="text-[15px] text-muted">
                        Beaten by Inflation. Painfully realistic.
                    </p>
                )}
            </header>

            <div className="flex flex-col rounded-[14px] border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(15,33,55,.05)] sm:p-6">
                {props.ranking.map((p, i) => (
                    <div
                        key={p.id}
                        className="flex items-center gap-3 border-t border-hairline-soft py-2.5 text-sm first:border-t-0"
                    >
                        <span className="w-6 text-right font-extrabold tabular-nums text-muted">
                            {i + 1}.
                        </span>
                        <span className={`font-bold ${p.id === props.room.you ? "text-brand" : ""}`}>
                            {p.name}
                            {p.id === props.room.you && " (you)"}
                        </span>
                        {p.winner && <span>🏆</span>}
                        <span className="ml-auto tabular-nums text-muted">
                            {p.progress} settled · {p.writeoffs} write-off
                            {p.writeoffs === 1 ? "" : "s"} · {formatMoney(p.earned)} {MONEY}
                        </span>
                    </div>
                ))}
                <p className="mt-3 text-xs text-muted">
                    {props.lbStatus === "ok" &&
                        "Reported to the semester leaderboard 🏆 - check the duels desk."}
                    {props.lbStatus === "failed" &&
                        "The leaderboard desk was unreachable - this result went unrecorded."}
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                {props.isHost && (
                    <button
                        type="button"
                        onClick={() => props.send({ t: "rematch" })}
                        className="rounded-[10px] bg-brand px-6 py-3 text-[15px] font-extrabold text-white transition hover:bg-[#175a3a]"
                    >
                        Rematch 🔁
                    </button>
                )}
                {!props.isHost && (
                    <p className="self-center text-sm text-muted">
                        The host can call a rematch - stay seated.
                    </p>
                )}
                <button
                    type="button"
                    onClick={props.onLeave}
                    className="rounded-[10px] border border-hairline bg-surface px-6 py-3 text-[15px] font-bold text-muted transition hover:border-[#c8d3de] hover:text-ink"
                >
                    Back to the desk
                </button>
            </div>
        </div>
    );
}
