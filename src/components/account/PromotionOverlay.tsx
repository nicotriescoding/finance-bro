"use client";

import { useEffect, useMemo, useState } from "react";
import { useScore } from "@/hooks/useScore";
import { useRank } from "@/hooks/useRank";
import { usePrevious } from "@/hooks/usePrevious";
import type { Rank } from "@/lib/rankings";
import { MONEY } from "@/lib/money";

const BILLS = ["💵", "💸", "🤑", "💰", "💶", "🪙"];
const DURATION_MS = 5200;

type Promotion = { from: Rank; to: Rank; id: number; caption: string };

type Bill = {
    id: number;
    glyph: string;
    left: number; // vw
    delay: number; // s
    duration: number; // s
    size: number; // px
    spin: number; // deg
};

function makeBills(count: number): Bill[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        glyph: BILLS[i % BILLS.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.6,
        duration: 2.4 + Math.random() * 1.8,
        size: 22 + Math.random() * 26,
        spin: (Math.random() - 0.5) * 720,
    }));
}

/**
 * PROMOTED - the one place finance-bro breaks its own "nothing confettis"
 * rule, on purpose. Mounted once in the root layout; watches the balance and
 * fires whenever the rank index climbs (quiz, multiplayer, wherever the
 * BroDollars come from) - and, past FinanceBro, whenever the player moves
 * up the semester leaderboard. Nothing fires on page load: the comparison
 * is against the previous render, never against storage, and a position
 * that was simply unknown before does not count as a climb.
 */
export default function PromotionOverlay() {
    const { score } = useScore();
    const { rank, ladderIndex, position } = useRank(score);
    const prev = usePrevious({ rank, ladderIndex, position });
    const [promo, setPromo] = useState<Promotion | null>(null);

    useEffect(() => {
        if (!prev) return;
        if (ladderIndex > prev.ladderIndex) {
            setPromo({ from: prev.rank, to: rank, id: Date.now(), caption: `Tier ${rank.minLevel}` });
        } else if (
            position !== null &&
            prev.position !== null &&
            position < prev.position &&
            rank.title !== prev.rank.title
        ) {
            setPromo({ from: prev.rank, to: rank, id: Date.now(), caption: `Leaderboard #${position}` });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rank.title, ladderIndex, position]);

    useEffect(() => {
        if (!promo) return;
        const t = window.setTimeout(() => setPromo(null), DURATION_MS);
        return () => window.clearTimeout(t);
    }, [promo]);

    if (!promo) return null;
    return <PromotionFlash key={promo.id} promo={promo} onDone={() => setPromo(null)} />;
}

function PromotionFlash({ promo, onDone }: { promo: Promotion; onDone: () => void }) {
    const { from, to } = promo;
    const bills = useMemo(() => makeBills(48), []);

    return (
        <div
            role="status"
            aria-live="polite"
            onClick={onDone}
            className="animate-promo-veil fixed inset-0 z-[120] flex cursor-pointer items-center justify-center overflow-hidden bg-ink/95 px-6 backdrop-blur-sm text-center text-[#e8eef5] select-none"
        >
            {/* mint flash + radial burst behind everything */}
            <div className="animate-promo-flash pointer-events-none absolute inset-0 bg-mint" />
            <div className="animate-promo-burst pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(127,214,163,0.55),transparent_60%)]" />

            {/* the money rain */}
            <div className="pointer-events-none absolute inset-0 motion-reduce:hidden" aria-hidden>
                {bills.map((b) => (
                    <span
                        key={b.id}
                        className="animate-bill absolute -top-16 leading-none"
                        style={{
                            left: `${b.left}vw`,
                            fontSize: `${b.size}px`,
                            animationDelay: `${b.delay}s`,
                            animationDuration: `${b.duration}s`,
                            ["--spin" as string]: `${b.spin}deg`,
                        }}
                    >
                        {b.glyph}
                    </span>
                ))}
            </div>

            {/* the promotion itself */}
            <div className="animate-promo-card relative flex max-w-md flex-col items-center gap-4">
                <span className="caps-label animate-promo-blink text-sm text-mint sm:text-base">
                    📣 Promoted 📣
                </span>

                <div className="flex items-center gap-4 sm:gap-6">
                    <span className="text-4xl opacity-45 grayscale sm:text-5xl">{from.emoji}</span>
                    <span className="text-2xl text-mint sm:text-3xl">➡️</span>
                    <span className="animate-promo-pop text-6xl drop-shadow-[0_0_24px_rgba(127,214,163,0.6)] sm:text-8xl">
                        {to.emoji}
                    </span>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="caps-label text-[10px] text-muted-light">
                        {promo.caption} · was {from.title}
                    </span>
                    <span className="animate-promo-title text-3xl leading-tight font-extrabold text-white sm:text-4xl">
                        {to.title}
                    </span>
                    <span className="text-sm text-[#b7c8d9] sm:text-base">{to.perk}</span>
                </div>

                <span className="mt-1 rounded-full bg-ink-raised px-4 py-1.5 text-xs font-extrabold text-mint">
                    🤝 +{to.bonus} {MONEY} on every settled posting
                </span>
                <span className="caps-label text-[9px] text-muted-light/70">Tap to sign the contract</span>
            </div>
        </div>
    );
}
