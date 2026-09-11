import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import AdRail from "@/components/AdRail";
import ScoreboardClient from "@/components/scoreboard/ScoreboardClient";
import { countForSubject } from "@/content/questions";
import { SUBJECTS } from "@/content/subjects";

export const metadata: Metadata = pageMeta({
    title: "Leaderboard 🏆",
    description:
        "The semester leaderboard - who earned the most BroDollars this semester, overall and per subject. Resets every semester, trauma does not.",
    path: "/leaderboard",
});

/**
 * The semester scoreboard (2026-09-02): BroDollars earned this semester,
 * overall and per subject, fed by the solo quiz (every settled posting is
 * re-graded by the worker) and by multiplayer games (booked at the closing
 * bell). Optional extra per hard rule 1 - without NEXT_PUBLIC_MP_URL the
 * page shows its own "desk not staffed" state, nothing else waits for it.
 *
 * Only subjects that actually have questions get a tab (2026-09-05, Nico):
 * the empty banks would show a permanently empty board. The list is computed
 * here on the server so the client bundle never imports the question banks;
 * a subject appears on the board the moment its first questions land.
 */
export default function LeaderboardPage() {
    const subjects = SUBJECTS.filter((s) => countForSubject(s.id) > 0).map((s) => ({
        id: s.id,
        short: s.short,
        emoji: s.emoji,
    }));
    return (
        <div className="mx-auto flex max-w-[1440px] gap-[18px] lg:px-[22px]">
            <AdRail />
            <div className="min-w-0 flex-1">
                <ScoreboardClient subjects={subjects} />
            </div>
            <AdRail />
        </div>
    );
}
