"use client";

/**
 * The corporate ladder (2026-09-08, Nico): every rung from Pupil to
 * FinanceBro, the balance's current position highlighted, the rungs above
 * still locked and priced, the ones below settled. Past FinanceBro the
 * title comes from the semester leaderboard, so the top of the ladder lists
 * those positions as rungs of their own (The Richest Person … Almost Made
 * It … FinanceBro #N).
 *
 * Everything here is local: the balance from localStorage, the ladder from
 * `rankings.ts`. Hard rule 1: the card renders with or without the worker;
 * only the endgame highlight needs the board position.
 */

import { useRank } from "@/hooks/useRank";
import { useScore } from "@/hooks/useScore";
import { formatMoney, MONEY } from "@/lib/money";
import { endgameRank, ranks, scoreForLevel } from "@/lib/rankings";

const CARD =
    "rounded-[14px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(15,33,55,.05)]";

const EUR_FMT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** The leaderboard rungs above FinanceBro, top first. */
const ENDGAME_RUNGS: { rank: ReturnType<typeof endgameRank>; note: string; matches: (p: number) => boolean }[] = [
    { rank: endgameRank(1), note: "board #1", matches: (p) => p === 1 },
    { rank: endgameRank(2), note: "board #2", matches: (p) => p === 2 },
    { rank: endgameRank(3), note: "board #3", matches: (p) => p === 3 },
    {
        rank: { ...endgameRank(4), title: "Nth Richest Person" },
        note: "board #4 to #10",
        matches: (p) => p >= 4 && p <= 10,
    },
    { rank: endgameRank(11), note: "board #11", matches: (p) => p === 11 },
    {
        rank: { ...endgameRank(12), title: "FinanceBro #N", perk: "Below the top 11. Keep posting." },
        note: "board #12 and below",
        matches: (p) => p >= 12,
    },
];

export default function CorporateLadder() {
    const { score } = useScore();
    const { rank, ladderIndex, endgame, position } = useRank(score);
    // a FinanceBro with a known board position sits on one of the endgame rungs
    const onBoard = endgame && position !== null;
    const endgameIdx = onBoard ? ENDGAME_RUNGS.findIndex((r) => r.matches(position)) : -1;

    return (
        <div className={`${CARD} flex flex-col gap-3 p-4 sm:p-6`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-lg font-extrabold tracking-[-0.01em]">🪜 Corporate ladder</h2>
                <span className="caps-label ml-auto text-[10px] text-muted-light">
                    {ranks.length + ENDGAME_RUNGS.length} rungs · you: {rank.emoji} {rank.title}
                </span>
            </div>
            <p className="text-sm text-muted">
                Where your balance of{" "}
                <span className="font-extrabold tabular-nums text-ink">
                    {formatMoney(score)} {MONEY}
                </span>{" "}
                puts you. Every promotion pays a bigger flat bonus per settled posting; past
                FinanceBro the title is your position on the semester board.
            </p>

            <ol className="flex flex-col" aria-label="Corporate ladder, top position first">
                {ENDGAME_RUNGS.map((r, i) => {
                    const current = i === endgameIdx;
                    return (
                        <Rung
                            key={r.rank.title}
                            number={ranks.length + ENDGAME_RUNGS.length - i}
                            emoji={current ? rank.emoji : r.rank.emoji}
                            title={current ? rank.title : r.rank.title}
                            perk={r.rank.perk}
                            price={r.note}
                            payroll={null}
                            state={current ? "current" : endgameIdx >= 0 && i > endgameIdx ? "done" : "locked"}
                        />
                    );
                })}
                {ranks
                    .map((r, i) => ({ r, i }))
                    .reverse()
                    .map(({ r, i }) => {
                        const state = onBoard
                            ? "done"
                            : i === ladderIndex
                              ? "current"
                              : i < ladderIndex
                                ? "done"
                                : "locked";
                        const threshold = scoreForLevel(r.minLevel);
                        return (
                            <Rung
                                key={r.title}
                                number={i + 1}
                                emoji={r.emoji}
                                title={r.title}
                                perk={r.perk}
                                price={
                                    threshold === 0
                                        ? "day one"
                                        : `from ${formatMoney(threshold)} ${MONEY}`
                                }
                                payroll={r.salary}
                                state={state}
                            />
                        );
                    })}
            </ol>

            <p className="text-xs text-muted">
                &quot;From&quot; is the balance the position unlocks at; payroll is the
                position&apos;s last monthly salary in €, decorative like the rest of the
                payslip.
            </p>
        </div>
    );
}

function Rung({
    number,
    emoji,
    title,
    perk,
    price,
    payroll,
    state,
}: {
    number: number;
    emoji: string;
    title: string;
    perk: string;
    price: string;
    /** last monthly salary in €; null = classified (the leaderboard titles) */
    payroll: number | null;
    state: "current" | "done" | "locked";
}) {
    const current = state === "current";
    const locked = state === "locked";
    const pay = payroll === null ? "payroll classified" : `payroll ${EUR_FMT.format(payroll)} €`;
    return (
        <li
            className={`flex items-center gap-3 border-t border-hairline-soft py-2 text-sm first:border-t-0 ${
                current ? "-mx-2 rounded-[8px] border-t-0 bg-brand-tint px-2" : ""
            }`}
            aria-current={current ? "true" : undefined}
        >
            <span className="w-6 text-right font-extrabold tabular-nums text-muted">{number}.</span>
            <span
                className={`w-9 shrink-0 whitespace-nowrap text-center text-base leading-none ${
                    locked ? "opacity-60" : ""
                }`}
            >
                {emoji}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
                <span className={`truncate font-bold ${current ? "text-brand" : locked ? "text-muted" : ""}`}>
                    {title}
                    {current && " (you)"}
                    {state === "done" && !current && (
                        <span className="ml-1.5 text-[11px] font-bold text-muted-light">✓</span>
                    )}
                </span>
                <span className={`hidden truncate text-xs sm:block ${locked ? "text-muted-light" : "text-muted"}`}>
                    {perk}
                </span>
                {/* phone: price + payroll under the title instead of a right column */}
                <span className="text-xs tabular-nums text-muted sm:hidden">
                    <span className={`font-extrabold ${current ? "text-brand" : "text-ink"}`}>{price}</span>
                    {" · "}
                    {pay}
                </span>
            </div>
            <div className="hidden shrink-0 flex-col items-end tabular-nums sm:flex">
                <span className={`text-[13px] font-extrabold ${current ? "text-brand" : "text-ink"}`}>
                    {price}
                </span>
                <span className="caps-label text-[9px] text-muted-light">{pay}</span>
            </div>
        </li>
    );
}
