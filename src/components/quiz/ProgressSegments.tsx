import type { SegmentState } from "@/lib/session";

type Props = {
    states: SegmentState[];
    /** "light" for the white desktop strip, "navy" for the phone header stack */
    variant?: "light" | "navy";
};

const COLORS = {
    light: {
        settled: "bg-brand",
        missed: "bg-warn",
        open: "bg-hairline",
        currentRing: "border-brand bg-brand-tint",
        track: "bg-hairline",
        fill: "bg-brand",
    },
    navy: {
        settled: "bg-mint",
        missed: "bg-warn-bright",
        open: "bg-ink-track",
        currentRing: "border-mint bg-[#e8eef5]",
        track: "bg-ink-track",
        fill: "bg-mint",
    },
} as const;

/**
 * One segment per posting in dealt order - green settled, orange written off
 * and still open, the current one taller, outlined and slowly breathing.
 * Long runs (the Semester Marathon over a full bank) collapse into one
 * continuous bar so the strip stays readable.
 */
export default function ProgressSegments({ states, variant = "light" }: Props) {
    const c = COLORS[variant];

    if (states.length > 24) {
        const settled = states.filter((s) => s === "settled").length;
        const pct = states.length ? Math.round((settled / states.length) * 100) : 0;
        return (
            <span className={`block h-2 flex-1 overflow-hidden rounded-[4px] ${c.track}`}>
                <span
                    className={`block h-full ${c.fill} transition-[width] duration-500 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </span>
        );
    }

    return (
        <div className="flex flex-1 items-end gap-[3px]">
            {states.map((s, i) =>
                s === "current" ? (
                    <span
                        key={i}
                        className={`animate-tick h-3.5 flex-[1.6] rounded-[4px] border-2 ${c.currentRing}`}
                    />
                ) : (
                    <span
                        key={i}
                        className={`h-2 flex-1 rounded-[4px] ${
                            s === "settled" ? c.settled : s === "missed" ? c.missed : c.open
                        }`}
                    />
                )
            )}
        </div>
    );
}
