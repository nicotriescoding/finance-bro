"use client";
import { usePersistentState } from "./usePersistentState";
import { calculateScore, Difficulty } from "@/lib/scoring";
import { bonusForScore } from "@/lib/rankings";

export function useScore() {
    const [score, setScore] = usePersistentState<number>("bwr_score_v1", 0);

    /** `multiplier` scales the payout - 0.5 when the formula hint was used. */
    function addScore(
        difficulty: Difficulty,
        timeSpent: number,
        timeLimit: number,
        multiplier = 1
    ) {
        // seniority bonus: a small flat top-up per settled posting, set by the
        // current rank. Not scaled by hint/time - completion pay, not merit pay.
        const bonus = bonusForScore(score);
        const points =
            Math.round(calculateScore(difficulty, timeSpent, timeLimit) * multiplier) +
            bonus;
        setScore((prev) => prev + points);
        return points;
    }

    const resetScore = () => setScore(0);

    return { score, addScore, resetScore, setScore };
}
