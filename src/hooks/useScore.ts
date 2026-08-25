"use client";
import { usePersistentState } from "./usePersistentState";
import { calculateScore, Difficulty } from "@/lib/scoring";

export function useScore() {
    const [score, setScore] = usePersistentState<number>("bwr_score_v1", 0);

    /** `multiplier` scales the payout - 0.5 when the formula hint was used. */
    function addScore(
        difficulty: Difficulty,
        timeSpent: number,
        timeLimit: number,
        multiplier = 1
    ) {
        const points = Math.round(calculateScore(difficulty, timeSpent, timeLimit) * multiplier);
        setScore((prev) => prev + points);
        return points;
    }

    const resetScore = () => setScore(0);

    return { score, addScore, resetScore, setScore };
}