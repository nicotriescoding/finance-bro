"use client";

import { useEffect, useRef, useState } from "react";
import { bumpCounter, readCounter } from "@/lib/counters";
import { MONEY_PATTERN } from "@/components/shop/pattern";

/**
 * The Bro Shop's secret position (2026-09-12, Nico): a card with a big "?"
 * where the photo would be, copy that sells it as the one must-have in the
 * shop, and a button that opens the offer... which is the Rickroll. The
 * click counter lives on the worker (`/api/counters/mystery`) so the
 * number is the same for everybody; the line under the blurb states it and
 * that nobody has forgotten the experience.
 *
 * Not an affiliate link, so no AffiliateLabel and no `sponsored` rel - the
 * transparency line in the header only talks about the Amazon buttons.
 *
 * SSR renders the no-number copy; the count arrives client-side. With no
 * worker URL (or a 503) the fallback line stays - hard rule 1.
 */

const OFFER = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const LOCALE = "en-US";

export default function MysteryCard({ tint }: { tint: [string, string] }) {
    const [clicks, setClicks] = useState<number | null>(null);
    // once a click was counted, a late-arriving initial GET must not roll
    // the number back below the POST's answer
    const bumped = useRef(false);

    useEffect(() => {
        let alive = true;
        readCounter("mystery").then((n) => {
            if (alive && !bumped.current && n !== null) setClicks(n);
        });
        return () => {
            alive = false;
        };
    }, []);

    const onClick = () => {
        bumped.current = true;
        // optimistic +1 so the number moves under the cursor; the worker's
        // value replaces it when the POST returns
        setClicks((n) => (n === null ? 1 : n + 1));
        bumpCounter("mystery").then((n) => {
            if (n !== null) setClicks(n);
        });
    };

    return (
        <div className="flex flex-col overflow-hidden rounded-[14px] border border-hairline bg-surface shadow-[0_1px_2px_rgba(15,33,55,.05)]">
            <div
                className="flex h-56 flex-none items-center justify-center border-b border-hairline-soft px-4 py-4"
                style={{
                    backgroundColor: tint[0],
                    backgroundImage: `${MONEY_PATTERN}, linear-gradient(135deg, ${tint[0]} 0%, ${tint[1]} 100%)`,
                }}
            >
                <div className="flex h-full w-[68%] items-center justify-center rounded-[12px] bg-white p-3 shadow-[0_2px_8px_rgba(15,33,55,.14)]">
                    <span
                        aria-hidden="true"
                        className="select-none text-[128px] font-extrabold leading-none tracking-[-0.06em] text-ink"
                    >
                        ?
                    </span>
                    <span className="sr-only">A question mark instead of a product photo</span>
                </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold">The Insider Position</p>
                    <span className="caps-label inline-flex items-center rounded-full bg-warn-tint px-2 py-0.5 text-[9px] font-extrabold tracking-[.14em] text-warn">
                        Allocation closing
                    </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                    Redacted by compliance. The one item in this shop that every
                    FinanceBro who saw it went for on the spot, the one thing your
                    seniors never told you about, and the single best-performing
                    position on this page. No photo, no price, no due diligence
                    required. Curiosity is the entry fee.
                </p>
                <p className="mb-3 mt-2 flex-1 text-[12px] font-bold leading-relaxed text-ink" data-mystery-count>
                    {clicks === null
                        ? "An undisclosed number of bros have already taken a look. Not one of them has forgotten it."
                        : `${clicks.toLocaleString(LOCALE)} ${clicks === 1 ? "bro has" : "bros have"} already taken a look. Not one of them has forgotten it.`}
                </p>
                <a
                    href={OFFER}
                    target="_blank"
                    rel="noopener"
                    onClick={onClick}
                    className="inline-flex min-h-11 items-center gap-2 self-start rounded-[9px] border border-brand-border bg-brand-input px-3 py-1.5 text-sm font-extrabold text-brand transition hover:bg-brand-tint"
                >
                    Reveal the offer →
                </a>
                <p className="mt-2 text-[11px] italic leading-relaxed text-muted">
                    Opens in a new tab. You will know it when you see it.
                </p>
            </div>
        </div>
    );
}
