// src/app/multiplayer/page.tsx
import type { Metadata } from "next";
import MultiplayerClient from "@/components/multiplayer/MultiplayerClient";

export const metadata: Metadata = {
    title: "Multiplayer 🥋 - FinanceBro",
    description:
        "Duel other FinanceBros on real exam-style questions - same postings, live scoreboard, semester leaderboard. Or lose to Inflation.",
};

/**
 * Multiplayer is an optional extra (hard rule 1): without NEXT_PUBLIC_MP_URL
 * the client renders the canon placeholder copy, and a dead worker only ever
 * breaks this page's own error state - never the rest of the site.
 */
export default function MultiplayerPage() {
    return <MultiplayerClient />;
}
