"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLevel } from "./useLevel";
import { endgameRank, getRank, isEndgame, rankIndex, type Rank } from "@/lib/rankings";
import { fetchScoreboard, scoreboardEnabled } from "@/lib/scoreboard/client";

/**
 * Leaderboard position of this browser's player, shared by every component
 * that shows a rank. Only fetched once the player is a FinanceBro - below
 * that the ladder alone decides the title. Hard rule 1: a missing worker,
 * a 503 or no network just leaves the position unknown and the title at
 * the plain "FinanceBro".
 */
let position: number | null = null;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;
let retimer: number | undefined;
const listeners = new Set<() => void>();

const FRESH_MS = 60_000;
/** the earnings report is fire-and-forget; give the worker a moment to book it */
const SETTLE_DELAY_MS = 4_000;

function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
}
const getSnapshot = () => position;
const getServerSnapshot = () => null;

function setPosition(next: number | null) {
    if (next === position) return;
    position = next;
    listeners.forEach((cb) => cb());
}

export function refreshStanding(force = false): Promise<void> {
    if (!scoreboardEnabled) return Promise.resolve();
    if (inflight) return inflight;
    if (!force && Date.now() - fetchedAt < FRESH_MS) return Promise.resolve();
    inflight = fetchScoreboard("all")
        .then((data) => setPosition(data.you?.rank ?? null))
        .catch(() => {
            /* unknown position - by design */
        })
        .finally(() => {
            fetchedAt = Date.now();
            inflight = null;
        });
    return inflight;
}

export type Standing = {
    level: number;
    progress: number;
    nextRequired: number;
    /** the rank to show - ladder rank, or the leaderboard title past FinanceBro */
    rank: Rank;
    /** position on the ladder (0 = Pupil, 20 = FinanceBro) */
    ladderIndex: number;
    endgame: boolean;
    /** overall leaderboard position, null while unknown or below FinanceBro */
    position: number | null;
};

/** Level, rank and - for FinanceBros - the leaderboard title, from the balance. */
export function useRank(score: number): Standing {
    const { level, progress, nextRequired } = useLevel(score);
    const endgame = isEndgame(level);
    const pos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    useEffect(() => {
        if (!endgame) return;
        void refreshStanding();
    }, [endgame]);

    // a fresh credit may have moved the player on the board - re-check shortly
    useEffect(() => {
        if (!endgame) return;
        window.clearTimeout(retimer);
        retimer = window.setTimeout(() => void refreshStanding(true), SETTLE_DELAY_MS);
        return () => window.clearTimeout(retimer);
    }, [endgame, score]);

    const position = endgame ? pos : null;
    return {
        level,
        progress,
        nextRequired,
        rank: endgame ? endgameRank(position) : getRank(level),
        ladderIndex: rankIndex(level),
        endgame,
        position,
    };
}
