"use client";

import { useEffect, useState } from "react";
import { useScore } from "@/hooks/useScore";
import { useRank } from "@/hooks/useRank";
import { usePrevious } from "@/hooks/usePrevious";
import { useCountUp } from "@/hooks/useCountUp";
import { formatMoney, MONEY } from "@/lib/money";

/**
 * The balance pill in the navy chrome - the only element that ever animates
 * there (design 3a): the balance counts up and a "+180" floats out of the
 * pill on a credit.
 */
export default function BalancePill() {
    const { score } = useScore();
    const { rank } = useRank(score);
    const display = useCountUp(score);
    const prev = usePrevious(score);
    const [credit, setCredit] = useState<{ amount: number; id: number } | null>(null);

    useEffect(() => {
        if (prev !== undefined && score > prev) {
            setCredit({ amount: score - prev, id: Date.now() });
        }
    }, [score, prev]);

    return (
        <div className="relative flex min-w-0 items-center gap-2 rounded-full bg-ink-raised px-3.5 py-1.5 sm:gap-2.5 sm:px-4 sm:py-2">
            <span className="text-[15px] sm:text-[17px]">{MONEY}</span>
            <span className="text-[15px] font-extrabold tabular-nums text-white sm:text-lg">
                {formatMoney(display)}
            </span>
            <span className="hidden h-[15px] w-px shrink-0 bg-ink-line sm:block" />
            <span className="hidden max-w-[150px] truncate text-[13px] font-bold whitespace-nowrap text-mint sm:block lg:max-w-[210px] xl:max-w-none">
                {rank.title.toUpperCase()} {rank.emoji}
            </span>
            {credit && (
                <span
                    key={credit.id}
                    className="animate-bdpop pointer-events-none absolute -top-[18px] -right-1.5 text-[15px] font-extrabold text-mint"
                >
                    +{formatMoney(credit.amount)}
                </span>
            )}
        </div>
    );
}
