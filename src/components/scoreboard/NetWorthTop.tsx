"use client";

/**
 * Net worth - the ten richest desks of the semester (overall board, every
 * subject summed) with the ladder position their earnings put them on, and
 * where this browser's player ranks among them (2026-09-08, Nico).
 *
 * "Net worth" is what the desk has booked for a player this semester: the
 * balance in the navy card is local and may differ (older semesters,
 * unrecorded postings). The titles are estimated from that number with the
 * same ladder the balance uses.
 *
 * Hard rule 1: optional extra - no worker, a 503 or no network shows the
 * desk-not-staffed line inside the card, nothing else waits for it.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoney, MONEY } from "@/lib/money";
import { rankForScore } from "@/lib/rankings";
import { fetchScoreboard, myPlayerId, scoreboardEnabled } from "@/lib/scoreboard/client";
import type { ScoreboardResponse } from "@/lib/scoreboard/shared";

const CARD =
    "rounded-[14px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(15,33,55,.05)]";

const TOP = 10;

export default function NetWorthTop({ reloadKey = 0 }: { reloadKey?: number }) {
    const [data, setData] = useState<ScoreboardResponse | null>(null);
    const [failed, setFailed] = useState(!scoreboardEnabled);
    const [loading, setLoading] = useState(scoreboardEnabled);
    const [me, setMe] = useState("");

    useEffect(() => {
        setMe(myPlayerId().slice(0, 6));
    }, []);

    useEffect(() => {
        if (!scoreboardEnabled) return;
        let alive = true;
        setLoading(true);
        setFailed(false);
        fetchScoreboard("all")
            .then((d) => {
                if (!alive) return;
                setData(d);
                setLoading(false);
            })
            .catch(() => {
                if (!alive) return;
                setFailed(true);
                setLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [reloadKey]);

    const rows = data?.rows.slice(0, TOP) ?? [];
    const you = data?.you ?? null;
    const youInTop = you !== null && you.rank <= rows.length;

    return (
        <div className={`${CARD} flex flex-col gap-3 p-4 sm:p-6`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-lg font-extrabold tracking-[-0.01em]">💎 Net worth · top {TOP}</h2>
                {data?.semester && (
                    <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-bold text-muted">
                        {data.semester}
                    </span>
                )}
                <span className="caps-label ml-auto text-[10px] text-muted-light">
                    all subjects · by {MONEY} booked
                </span>
            </div>

            {loading && <p className="text-sm text-muted">Counting other people&apos;s money…</p>}
            {failed && !loading && (
                <p className="text-sm text-muted">
                    The leaderboard desk is not staffed right now, so the rich list stays
                    sealed. Your ladder position above needs no desk.
                </p>
            )}
            {!loading && !failed && rows.length === 0 && (
                <p className="text-sm text-muted">
                    Nobody has a net worth yet. The first settled posting is the whole rich list -{" "}
                    <Link href="/career" className="font-bold text-brand hover:underline">
                        start a run
                    </Link>
                    .
                </p>
            )}
            {!loading && !failed && rows.length > 0 && (
                <ol className="flex flex-col" aria-label="Richest desks this semester">
                    {rows.map((r, i) => (
                        <Row
                            key={`${r.playerId}-${i}`}
                            position={i + 1}
                            name={r.name}
                            playerId={r.playerId}
                            amount={r.amount}
                            mine={r.playerId === me}
                        />
                    ))}
                    {you !== null && !youInTop && (
                        <>
                            {you.rank > rows.length + 1 && (
                                <li className="caps-label border-t border-hairline-soft py-1.5 text-center text-[10px] text-muted-light">
                                    · · · {formatMoney(you.rank - rows.length - 1)}{" "}
                                    {you.rank - rows.length - 1 === 1 ? "desk" : "desks"} in between · · ·
                                </li>
                            )}
                            <Row
                                position={you.rank}
                                name={you.name}
                                playerId={me}
                                amount={you.amount}
                                mine
                            />
                        </>
                    )}
                </ol>
            )}
            {!loading && !failed && rows.length > 0 && you === null && (
                <p className="text-sm text-muted">
                    You are not on the rich list yet. Net worth starts with the first settled
                    posting the desk books for you.
                </p>
            )}

            <p className="text-xs text-muted">
                Net worth = BroDollars the desk has booked this semester; the position is
                the ladder rung that amount unlocks. Your local balance may be richer - the
                desk only counts what it saw.
            </p>
        </div>
    );
}

function Row({
    position,
    name,
    playerId,
    amount,
    mine,
}: {
    position: number;
    name: string;
    playerId: string;
    amount: number;
    mine: boolean;
}) {
    const rank = rankForScore(amount);
    return (
        <li
            className={`flex items-center gap-3 border-t border-hairline-soft py-2 text-sm first:border-t-0 ${
                mine ? "-mx-2 rounded-[8px] bg-brand-tint px-2" : ""
            }`}
        >
            <span className="w-6 text-right font-extrabold tabular-nums text-muted">{position}.</span>
            <span className="w-9 shrink-0 whitespace-nowrap text-center text-base leading-none" title={rank.title}>
                {rank.emoji}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
                <span className={`truncate font-bold ${mine ? "text-brand" : ""}`}>
                    {name}
                    {mine && " (you)"}
                </span>
                <span className="truncate text-xs text-muted">
                    {rank.title}
                    <span className="hidden sm:inline"> · #{playerId}</span>
                </span>
            </div>
            <span className="shrink-0 font-extrabold tabular-nums text-ink">
                {formatMoney(amount)} {MONEY}
            </span>
        </li>
    );
}
