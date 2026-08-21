"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { useLevel } from "@/hooks/useLevel";
import { getNextRank, getRank } from "@/lib/rankings";
import { formatMoney, MONEY } from "@/lib/money";

type Props = {
    score: number;
    /** most recent credit in this run, shown mint next to the balance */
    recentCredit?: number;
};

/** Navy account card: available balance + the long-game tier bar. */
export default function BalanceCard({ score, recentCredit }: Props) {
    const display = useCountUp(score);
    const { level, progress, nextRequired } = useLevel(score);
    const rank = getRank(level);
    const next = getNextRank(level);
    const pct = Math.round(progress * 100);
    const remaining = Math.max(0, nextRequired - Math.floor(progress * nextRequired));

    return (
        <div className="flex flex-col gap-3 rounded-[14px] bg-ink p-[18px] text-[#e8eef5]">
            <span className="caps-label text-[10px] tracking-[.16em] text-muted-light">
                Available balance
            </span>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tabular-nums">{formatMoney(display)}</span>
                <span className="text-lg">{MONEY}</span>
                {recentCredit !== undefined && recentCredit > 0 && (
                    <span className="text-[13px] font-extrabold text-mint">
                        +{formatMoney(recentCredit)}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-[#b7c8d9]">
                    <span>
                        TIER {level} · {rank.title.toUpperCase()} {rank.emoji}
                    </span>
                    <span className="tabular-nums">{pct} %</span>
                </div>
                <span className="block h-1.5 overflow-hidden rounded-[3px] bg-ink-track">
                    <span
                        className="block h-full bg-mint transition-[width] duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </span>
                <span className="text-xs text-muted-light">
                    {next
                        ? `${formatMoney(remaining)} ${MONEY} to ${next.title} ${next.emoji}`
                        : "Top tier reached."}
                </span>
            </div>
        </div>
    );
}
