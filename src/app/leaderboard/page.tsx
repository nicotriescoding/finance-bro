import type { Metadata } from "next";
import AdRail from "@/components/AdRail";
import ScoreboardClient from "@/components/scoreboard/ScoreboardClient";

export const metadata: Metadata = {
    title: "Leaderboard 🏆",
    description:
        "The semester leaderboard - who earned the most BroDollars this semester, overall and per subject. Resets every semester, trauma does not.",
};

/**
 * The semester scoreboard (2026-09-02): BroDollars earned this semester,
 * overall and per subject, fed by the solo quiz (every settled posting is
 * re-graded by the worker) and by multiplayer games (booked at the closing
 * bell). Optional extra per hard rule 1 - without NEXT_PUBLIC_MP_URL the
 * page shows its own "desk not staffed" state, nothing else waits for it.
 */
export default function LeaderboardPage() {
    return (
        <div className="mx-auto flex max-w-[1440px] gap-[18px] lg:px-[22px]">
            <AdRail />
            <div className="min-w-0 flex-1">
                <ScoreboardClient />
            </div>
            <AdRail />
        </div>
    );
}
