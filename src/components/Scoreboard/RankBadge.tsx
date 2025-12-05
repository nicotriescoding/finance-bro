"use client";
import { getRank } from "@/lib/rankings";

type RankBadgeProps = {
    level: number;
};

export default function RankBadge({ level }: RankBadgeProps) {
    const rank = getRank(level);

    return (
        <div className="mt-1 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-md shadow-sm text-sm font-medium">
                <span>{rank.emoji}</span>
                <span>{rank.title}</span>
            </div>
        </div>
    );
}