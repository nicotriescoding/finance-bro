/**
 * Ad slots, per the non-negotiable rules of design 3a: every slot is a card
 * with a hairline border, a caps SPONSORED/AD label and a FIXED height. Ads
 * never sit above the answer field, never overlap chrome, never shift layout.
 * Until a network is wired they render as diagonal-striped placeholders whose
 * mono copy states the exact pixel size and why the slot exists.
 */

type Variant = "skyscraper" | "square" | "leaderboard" | "feed" | "sponsored-career";

const SPEC: Record<
    Variant,
    { height: number; lines: string[] }
> = {
    skyscraper: {
        height: 600,
        lines: ["160 × 600", "skyscraper", "", "named after the", "building your", "ad money bought"],
    },
    square: {
        height: 160,
        lines: ["160 × 160", "square", "below the fold,", "seen by nobody"],
    },
    leaderboard: {
        height: 60,
        lines: ["970 × 60 · leaderboard, fixed height, never above the answer field"],
    },
    feed: {
        height: 100,
        lines: ["300 × 100 · next card in the feed"],
    },
    "sponsored-career": {
        height: 76,
        lines: [
            "SPONSORED CAREER · AD · 468 × 76",
            "a real employer can buy a card here and it will look exactly like the jokes",
        ],
    },
};

type Props = {
    variant: Variant;
    /** optional first line replacing the default slot copy (e.g. a slot name) */
    note?: string;
};

export default function AdSlot({ variant, note }: Props) {
    const spec = SPEC[variant];
    const lines = note ? [note, ...spec.lines] : spec.lines;

    if (variant === "sponsored-career") {
        return (
            <div
                className="bg-ad-stripes flex items-center justify-center rounded-xl border border-dashed border-[#c8d3de] p-3"
                style={{ height: spec.height }}
            >
                <span className="text-center font-mono text-[10px] leading-[1.7] text-slot-text">
                    {lines.map((l, i) => (
                        <span key={i}>
                            {l}
                            {i < lines.length - 1 && <br />}
                        </span>
                    ))}
                </span>
            </div>
        );
    }

    return (
        <div className="flex-none overflow-hidden rounded-xl border border-hairline bg-surface">
            <div className="caps-label flex justify-between border-b border-hairline-soft px-3 py-2 text-[9px] tracking-[.16em] text-muted-light">
                <span>Sponsored</span>
                <span>AD</span>
            </div>
            <div
                className="bg-ad-stripes flex items-center justify-center p-2.5 text-center"
                style={{ height: spec.height }}
            >
                <span className="font-mono text-[10px] leading-[1.8] text-slot-text">
                    {lines.map((l, i) => (
                        <span key={i}>
                            {l}
                            {i < lines.length - 1 && <br />}
                        </span>
                    ))}
                </span>
            </div>
        </div>
    );
}
