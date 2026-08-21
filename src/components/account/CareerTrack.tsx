"use client";

import { useLevel } from "@/hooks/useLevel";
import { getNextRank, getRank } from "@/lib/rankings";
import { formatMoney, MONEY } from "@/lib/money";

/**
 * CAREER TRACK - the original rank ladder rendered as a private-bank career
 * plan: current position, then the next one greyed out and priced.
 */
export default function CareerTrack({ score }: { score: number }) {
    const { level, progress, nextRequired } = useLevel(score);
    const rank = getRank(level);
    const next = getNextRank(level);
    const remaining = Math.max(0, nextRequired - Math.floor(progress * nextRequired));

    return (
        <div className="flex flex-col gap-2.5 rounded-[14px] border border-hairline bg-surface p-3.5">
            <span className="caps-label text-[10px] text-muted">Career track</span>
            <div className="flex items-center gap-2.5">
                <span className="text-xl">{rank.emoji}</span>
                <div className="flex flex-col">
                    <span className="text-sm font-extrabold">{rank.title}</span>
                    <span className="text-xs text-muted">{rank.perk}</span>
                </div>
            </div>
            <span className="h-px bg-hairline-soft" />
            {next ? (
                <div className="flex items-center gap-2.5 opacity-55">
                    <span className="text-xl">{next.emoji}</span>
                    <div className="flex flex-col">
                        <span className="text-sm font-extrabold">{next.title}</span>
                        <span className="text-xs text-muted">
                            Locked · {formatMoney(remaining)} {MONEY} · {next.perk}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2.5 opacity-55">
                    <span className="text-xl">🪦</span>
                    <div className="flex flex-col">
                        <span className="text-sm font-extrabold">Top of the ladder</span>
                        <span className="text-xs text-muted">HR has nothing left for you.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
