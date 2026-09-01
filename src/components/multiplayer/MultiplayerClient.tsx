"use client";

/**
 * Multiplayer 🥋 - duels against other FinanceBros (or Inflation).
 *
 * Talks to the Cloudflare worker (NEXT_PUBLIC_MP_URL) over a WebSocket. The
 * server deals (qid, seed) pairs; the browser builds the posting locally with
 * the same engine the solo quiz uses, and every answer is graded server-side.
 *
 * Connection care: the edge drops silent WebSockets after ~100s, so the
 * client heartbeats a raw "ping" (the DO answers "pong" without waking) and
 * reconnects automatically with backoff if the floor still goes dark.
 *
 * Hard rule 1: this page is an optional extra. No worker URL configured, or
 * the worker unreachable -> the canon placeholder copy below. The rest of the
 * site never waits for any of this.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ALL_QUESTIONS, countForSubject } from "@/content/questions";
import { SUBJECTS } from "@/content/subjects";
import { buildInstance } from "@/lib/questions/engine";
import type { Question } from "@/lib/questions/types";
import {
    DEFAULT_CONFIG,
    MODES,
    PING_INTERVAL_MS,
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
import AdRail from "@/components/AdRail";

/**
 * Desktop ad rails around the desk/lobby/closing-bell views (2026-08-29):
 * every page except /, /library and /career carries the sticky wide-skyscraper
 * rail alongside the whole page. GameView keeps its own in-layout rail.
 */
function WithRails({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto flex max-w-[1440px] gap-[18px] lg:px-[22px]">
            <AdRail />
            <div className="min-w-0 flex-1">{children}</div>
            <AdRail />
        </div>
    );
}
import { formatMoney, MONEY } from "@/lib/money";
import AdSlot from "@/components/AdSlot";
import MpQuestionCard from "./MpQuestionCard";

const QUESTION_BY_ID: Map<string, Question> = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

/** trader avatars, dealt by seat order - Inflation brings its own chart */
const SUITS = ["🕴️", "💼", "👔", "🧮", "📊", "☕", "🖇️", "🤓"];
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000, 8000];

type Deal = { index: number; total: number; qid: string; seed: number };
type Settled = { index: number; by: string | null; answerText: string };
type RoomSnapshot = Extract<S2C, { t: "room" }>;

function avatarFor(players: MpPlayerPub[], id: string): string {
    const p = players.find((x) => x.id === id);
    if (p?.bot) return "📈";
    const humans = players.filter((x) => !x.bot);
    const i = humans.findIndex((x) => x.id === id);
    return SUITS[Math.max(0, i) % SUITS.length];
}

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
    const [reconnecting, setReconnecting] = useState(false);

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
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const attemptRef = useRef(0);
    const codeRef = useRef<string | null>(null);
    const nameRef = useRef("");
    const hadRoomRef = useRef(false);
    const quickRef = useRef(false);
    const quickDoneRef = useRef(false);
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

    const stopTimers = () => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
    };

    const handleMessage = useCallback(
        (msg: S2C) => {
            switch (msg.t) {
                case "room":
                    hadRoomRef.current = true;
                    setRoom(msg);
                    setPlayers(msg.players);
                    if (msg.phase === "lobby") {
                        setDeal(null);
                        setSettled(null);
                        setRanking(null);
                        setLastWrong(false);
                        setCooldownUntil(0);
                    }
                    // "Challenge Inflation": pre-seat the bot, keep the lobby
                    // open so mode, subjects and rapid stay the host's call
                    if (
                        quickRef.current &&
                        !quickDoneRef.current &&
                        msg.phase === "lobby" &&
                        msg.you === msg.host
                    ) {
                        quickDoneRef.current = true;
                        send({ t: "bot", on: true });
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
            codeRef.current = code;
            nameRef.current = playerName;
            const pid = getPlayerId();
            const ws = new WebSocket(socketUrl(code, pid, playerName));
            wsRef.current = ws;

            ws.onopen = () => {
                setConnecting(false);
                setReconnecting(false);
                attemptRef.current = 0;
                // keepalive against the edge's ~100s idle cutoff
                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                heartbeatRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) ws.send("ping");
                }, PING_INTERVAL_MS);
            };
            ws.onmessage = (e) => {
                const data = String(e.data);
                if (data === "pong") return;
                try {
                    handleMessage(JSON.parse(data) as S2C);
                } catch {
                    /* ignore malformed frames */
                }
            };
            ws.onclose = () => {
                if (wsRef.current !== ws) return; // superseded by a newer socket
                if (heartbeatRef.current) clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
                setConnecting(false);
                if (leaveRef.current) return;

                // never in a room -> a join that failed (bad code, full, running)
                if (!hadRoomRef.current) {
                    setError(
                        "Could not reach that room. Wrong code, floor full, or the game already running."
                    );
                    return;
                }
                // we were in - reconnect quietly with backoff
                const attempt = attemptRef.current;
                if (attempt < RECONNECT_DELAYS_MS.length && codeRef.current) {
                    attemptRef.current = attempt + 1;
                    setReconnecting(true);
                    reconnectTimerRef.current = setTimeout(() => {
                        if (!leaveRef.current && codeRef.current) {
                            connect(codeRef.current, nameRef.current);
                        }
                    }, RECONNECT_DELAYS_MS[attempt]);
                } else {
                    setReconnecting(false);
                    setRoom(null);
                    setError(
                        "Connection lost for good. The trading floor went dark - rejoin with the room code."
                    );
                }
            };
            ws.onerror = () => {
                /* onclose follows and handles it */
            };
        },
        [handleMessage]
    );

    const leaveRoom = useCallback(() => {
        leaveRef.current = true;
        send({ t: "leave" });
        quickRef.current = false;
        quickDoneRef.current = false;
        hadRoomRef.current = false;
        codeRef.current = null;
        attemptRef.current = 0;
        stopTimers();
        wsRef.current?.close();
        wsRef.current = null;
        setRoom(null);
        setDeal(null);
        setSettled(null);
        setRanking(null);
        setReconnecting(false);
        setError(null);
    }, [send]);

    useEffect(
        () => () => {
            stopTimers();
            wsRef.current?.close();
        },
        []
    );

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

    const onCreate = async (withBot: boolean) => {
        const clean = commitName();
        if (!clean) return;
        setError(null);
        setConnecting(true);
        quickRef.current = withBot;
        quickDoneRef.current = false;
        hadRoomRef.current = false;
        attemptRef.current = 0;
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
        hadRoomRef.current = false;
        attemptRef.current = 0;
        connect(code, clean);
    };

    if (!mpEnabled) return <CanonPlaceholder />;

    // ------------------------------------------------------------------ views

    if (!room) {
        return (
            <WithRails>
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
            </WithRails>
        );
    }

    const reconnectBanner = reconnecting ? (
        <div className="rounded-[10px] border border-hairline bg-chip px-4 py-2.5 text-sm font-bold text-muted">
            Rush hour on the line - reconnecting to the floor…
        </div>
    ) : null;

    if (room.phase === "lobby" || (room.phase === "play" && !deal)) {
        return (
            <WithRails>
                <LobbyView
                room={room}
                players={players}
                send={send}
                onLeave={leaveRoom}
                error={error}
                banner={reconnectBanner}
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
            </WithRails>
        );
    }

    if (ranking) {
        return (
            <WithRails>
                <EndView
                    room={room}
                    ranking={ranking}
                    lbStatus={lbStatus}
                    isHost={room.you === room.host}
                    send={send}
                    onLeave={leaveRoom}
                />
            </WithRails>
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
            banner={reconnectBanner}
        />
    );
}

// ---------------------------------------------------------------------------
// home - the duels desk

function HomeView(props: {
    name: string;
    setName: (v: string) => void;
    joinCode: string;
    setJoinCode: (v: string) => void;
    onCreate: (withBot: boolean) => void;
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
                    Same postings, same numbers, live race up the corporate ladder. Nobody
                    around? Inflation 📈 never sleeps.
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
                        Challenge Inflation 📈
                    </button>
                </div>
                <p className="text-xs text-muted">
                    Both open a lobby where you pick mode, subjects and pace - Inflation just
                    takes a seat right away.
                </p>

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

            {/* ads - standard sizes, never between the player and the buttons */}
            <div className="hidden md:block">
                <AdSlot variant="leaderboard" />
            </div>
            <div className="md:hidden">
                <AdSlot variant="feed" />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// leaderboard

function LeaderboardPanel({ compact = false }: { compact?: boolean }) {
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

    const shown = rows?.slice(0, compact ? 5 : 10) ?? null;

    return (
        <div
            className={`flex flex-col gap-2 rounded-[14px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(15,33,55,.05)] ${
                compact ? "p-3.5" : "p-4 sm:p-6"
            }`}
        >
            <div className="flex items-center gap-2">
                <h2
                    className={`font-extrabold tracking-[-0.01em] ${
                        compact ? "text-[13px]" : "text-lg"
                    }`}
                >
                    Semester leaderboard 🏆
                </h2>
                {semester && (
                    <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-bold text-muted">
                        {semester}
                    </span>
                )}
                {!compact && (
                    <span className="caps-label ml-auto text-[10px] text-muted-light">
                        resets every semester
                    </span>
                )}
            </div>
            {failed && (
                <p className={compact ? "text-xs text-muted" : "text-sm text-muted"}>
                    The leaderboard desk is not staffed right now. Duels still work.
                </p>
            )}
            {shown && shown.length === 0 && (
                <p className={compact ? "text-xs text-muted" : "text-sm text-muted"}>
                    Nobody on the board yet. First win takes the corner office.
                </p>
            )}
            {shown && shown.length > 0 && (
                <div className="flex flex-col">
                    {shown.map((r, i) => (
                        <div
                            key={`${r.playerId}-${i}`}
                            className={`flex items-center gap-2 border-t border-hairline-soft py-1.5 first:border-t-0 ${
                                compact ? "text-xs" : "gap-3 py-2 text-sm"
                            }`}
                        >
                            <span className="w-5 text-right font-extrabold tabular-nums text-muted">
                                {i + 1}.
                            </span>
                            <span className="min-w-0 truncate font-bold">{r.name}</span>
                            {!compact && (
                                <span className="caps-label text-[10px] text-muted-light">
                                    #{r.playerId}
                                </span>
                            )}
                            <span className="ml-auto shrink-0 tabular-nums text-muted">
                                {r.wins}W · {r.settled}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {rows === null && !failed && (
                <p className={compact ? "text-xs text-muted" : "text-sm text-muted"}>Loading…</p>
            )}
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
    banner: React.ReactNode;
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
            : [
                  ...config.selections,
                  {
                      subject: subjectId as MpConfig["selections"][number]["subject"],
                      topicIds: [],
                  },
              ];
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
                    <span className="caps-label text-[10px] text-muted-light">Desk</span>
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

            {props.banner}
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
                                p.id === room.you ? "bg-brand-chip text-brand" : "bg-chip text-ink"
                            } ${p.connected ? "" : "opacity-50"}`}
                        >
                            {avatarFor(players, p.id)} {p.name}
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
                    <button
                        type="button"
                        disabled={!isHost}
                        onClick={() => updateConfig({ rapid: !config.rapid })}
                        title="Only quick and easy postings. Front Running bell after 45s."
                        className={`rounded-full px-3.5 py-1.5 text-sm font-extrabold transition ${
                            config.rapid
                                ? "bg-warn text-white"
                                : "bg-chip text-muted hover:text-ink"
                        } disabled:cursor-default`}
                    >
                        ⚡ Rapid
                    </button>
                    <span className="ml-auto rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-muted">
                        POOL {room.poolSize}
                    </span>
                </div>
                {config.rapid && (
                    <p className="-mt-2 text-xs text-muted">
                        ⚡ Rapid: only quick postings{config.mode === "frontrun" ? ", the bell rings after 45s" : ""}. Espresso rules.
                    </p>
                )}

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
                                    title={available ? s.label : "Questions in the works"}
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
                    <p className="text-sm text-muted">Waiting for the host to open the market 🔔</p>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// game - the trading floor

function GameView(props: {
    room: RoomSnapshot;
    players: MpPlayerPub[];
    deal: Deal;
    settled: Settled | null;
    lastWrong: boolean;
    cooldownUntil: number;
    send: (msg: C2S) => void;
    onLeave: () => void;
    banner: React.ReactNode;
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
        <div className="mx-auto max-w-[1440px] px-4 pt-4 lg:px-[22px] lg:pt-[18px]">
            <div className="flex gap-[18px]">
                {/* left rail - ads only, kept away from the maths; sticky so it
                    rides alongside the whole page (2026-08-29) */}
                <aside className="sticky top-20 hidden w-[200px] flex-none flex-col gap-3 self-start xl:flex">
                    <AdSlot variant="skyscraper" />
                    <AdSlot variant="square" />
                </aside>

                {/* centre - the work */}
                <div className="flex min-w-0 flex-1 flex-col gap-3 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-white">
                            MARKET OPEN 🔔
                        </span>
                        <span className="rounded-full bg-chip px-3 py-1 text-xs font-extrabold text-muted">
                            {mode.name.toUpperCase()} {mode.emoji}
                        </span>
                        {room.config.rapid && (
                            <span className="rounded-full bg-warn-tint px-3 py-1 text-xs font-extrabold text-warn">
                                ⚡ RAPID
                            </span>
                        )}
                        <span className="caps-label text-[10px] text-muted-light">
                            Desk {room.code}
                        </span>
                        <button
                            type="button"
                            onClick={props.onLeave}
                            className="ml-auto rounded-[10px] border border-hairline bg-surface px-3 py-1.5 text-xs font-bold text-muted transition hover:border-[#c8d3de] hover:text-ink"
                        >
                            Leave
                        </button>
                    </div>

                    {props.banner}

                    {/* phone: compact race strip - visible, never in the way */}
                    <MpStrip players={players} total={room.config.count} you={room.you} />

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

                    {/* ads below the card, standard sizes, never above the answer */}
                    <div className="hidden md:block">
                        <AdSlot variant="leaderboard" />
                    </div>
                    <div className="md:hidden">
                        <AdSlot variant="feed" />
                    </div>
                </div>

                {/* right rail - the ladder race + the semester board */}
                <aside className="hidden w-[290px] flex-none flex-col gap-3 lg:flex">
                    <MpLadder players={players} total={room.config.count} you={room.you} />
                    <LeaderboardPanel compact />
                </aside>
            </div>
        </div>
    );
}

/**
 * The corporate ladder - the scoreboard as a race up the office tower.
 * Every settled posting is one floor. First to the corner office wins.
 */
function MpLadder(props: { players: MpPlayerPub[]; total: number; you: string }) {
    const { players, total, you } = props;
    const n = Math.max(1, players.length);
    return (
        <div className="flex flex-col gap-2 rounded-[14px] border border-hairline bg-surface p-3.5 shadow-[0_1px_2px_rgba(15,33,55,.05)]">
            <div className="flex items-baseline justify-between">
                <span className="caps-label text-[11px] text-muted">The corporate ladder</span>
                <span className="caps-label text-[9px] text-muted-light">1 posting = 1 floor</span>
            </div>

            <div className="relative h-[340px] overflow-hidden rounded-[10px] border border-hairline-soft bg-field">
                {/* the actual ladder - two rails, one rung per floor */}
                <svg
                    aria-hidden
                    className="absolute inset-0 h-full w-full"
                    style={{ stroke: "var(--color-hairline)" }}
                >
                    <line x1="22%" y1="4%" x2="22%" y2="98%" strokeWidth="5" strokeLinecap="round" />
                    <line x1="78%" y1="4%" x2="78%" y2="98%" strokeWidth="5" strokeLinecap="round" />
                    {Array.from({ length: Math.min(total, 20) + 1 }, (_, i) => {
                        // rung i sits where a player with i settled postings stands
                        const pct = i / Math.max(1, Math.min(total, 20));
                        const y = 100 - (6 + pct * 78) - 2;
                        return (
                            <line
                                key={i}
                                x1="22%"
                                y1={`${y}%`}
                                x2="78%"
                                y2={`${y}%`}
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <span className="caps-label absolute right-2 top-1.5 text-[9px] text-muted-light">
                    Corner office 🏆
                </span>
                <span className="caps-label absolute bottom-1.5 right-2 text-[9px] text-muted-light">
                    Mailroom 📬
                </span>

                {players.map((p, i) => {
                    const pct = Math.min(1, p.progress / Math.max(1, total));
                    // keep chips inside the box: 8%..86% of the height
                    const bottom = 6 + pct * 78;
                    const left = 6 + (i % 4) * 23;
                    return (
                        <div
                            key={p.id}
                            className="absolute flex flex-col items-center gap-0.5 transition-all duration-700 ease-out"
                            style={{ bottom: `${bottom}%`, left: `${left}%` }}
                        >
                            <span className="text-xl leading-none">
                                {p.rank !== null ? "🏆" : avatarFor(players, p.id)}
                            </span>
                            <span
                                className={`max-w-[64px] truncate rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                                    p.id === you
                                        ? "bg-brand text-white"
                                        : p.bot
                                          ? "bg-warn-tint text-warn"
                                          : "bg-chip text-ink"
                                } ${p.connected ? "" : "opacity-50"}`}
                            >
                                {p.name}
                            </span>
                            <span className="text-[9px] font-bold tabular-nums text-muted">
                                {p.progress}/{total}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* the fine print: writeoffs + earnings */}
            <div className="flex flex-col">
                {[...players]
                    .sort((a, b) => b.progress - a.progress)
                    .map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-1.5 border-t border-hairline-soft py-1 text-[11px] first:border-t-0"
                        >
                            <span>{avatarFor(players, p.id)}</span>
                            <span
                                className={`min-w-0 truncate font-bold ${
                                    p.id === you ? "text-brand" : ""
                                }`}
                            >
                                {p.name}
                            </span>
                            <span className="ml-auto shrink-0 tabular-nums text-muted">
                                {formatMoney(p.earned)} {MONEY}
                                {p.writeoffs > 0 && ` · ${p.writeoffs}📉`}
                            </span>
                        </div>
                    ))}
            </div>
            {n === 1 && (
                <p className="text-[11px] text-muted">
                    Alone on the floor. Efficient. Lonely, but efficient.
                </p>
            )}
        </div>
    );
}

/** Phone scoreboard: one thin scrollable strip, playing always comes first. */
function MpStrip(props: { players: MpPlayerPub[]; total: number; you: string }) {
    const sorted = [...props.players].sort((a, b) => b.progress - a.progress);
    return (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
            {sorted.map((p) => (
                <span
                    key={p.id}
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        p.id === props.you
                            ? "bg-brand text-white"
                            : p.bot
                              ? "bg-warn-tint text-warn"
                              : "bg-chip text-ink"
                    }`}
                >
                    {p.rank !== null ? "🏆" : avatarFor(props.players, p.id)}
                    <span className="max-w-[72px] truncate">{p.name}</span>
                    <span className="tabular-nums">
                        {p.progress}/{props.total}
                    </span>
                </span>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// end - the closing bell

function EndView(props: {
    room: RoomSnapshot;
    ranking: MpRanking[];
    lbStatus: "ok" | "failed" | "skipped";
    isHost: boolean;
    send: (msg: C2S) => void;
    onLeave: () => void;
}) {
    const winner = props.ranking[0];
    const mine = props.ranking.find((r) => r.id === props.room.you);
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
            <header className="flex flex-col items-center gap-2 rounded-[14px] border border-hairline bg-surface p-6 text-center shadow-[0_1px_2px_rgba(15,33,55,.05)]">
                <span className="caps-label text-[10px] text-muted-light">Closing bell</span>
                <h1 className="text-3xl font-extrabold tracking-[-0.02em]">
                    {winner ? `${winner.name} takes the corner office 🏆` : "Market closed"}
                </h1>
                {winner?.id === props.room.you && (
                    <p className="text-[15px] font-bold text-brand">
                        Promotion pending. HR will be in touch.
                    </p>
                )}
                {winner && winner.bot && (
                    <p className="text-[15px] text-muted">
                        Beaten by Inflation. Painfully realistic.
                    </p>
                )}
                {mine && mine.earned > 0 && (
                    <p className="text-[15px] font-extrabold text-brand">
                        +{formatMoney(mine.earned)} {MONEY} credited to your account
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
                        <span>{avatarFor(props.ranking, p.id)}</span>
                        <span
                            className={`min-w-0 truncate font-bold ${
                                p.id === props.room.you ? "text-brand" : ""
                            }`}
                        >
                            {p.name}
                            {p.id === props.room.you && " (you)"}
                        </span>
                        {p.winner && <span>🏆</span>}
                        <span className="ml-auto shrink-0 tabular-nums text-muted">
                            {p.progress} settled · {p.writeoffs}📉 · {formatMoney(p.earned)} {MONEY}
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
                {props.isHost ? (
                    <button
                        type="button"
                        onClick={() => props.send({ t: "rematch" })}
                        className="rounded-[10px] bg-brand px-6 py-3 text-[15px] font-extrabold text-white transition hover:bg-[#175a3a]"
                    >
                        Rematch 🔁
                    </button>
                ) : (
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
