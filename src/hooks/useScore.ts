"use client";
import { usePersistentState } from "./usePersistentState";
import { calculateScore, Difficulty } from "@/lib/scoring";

export function useScore() {
    const [score, setScore] = usePersistentState<number>("bwr_score_v1", 0);

    function addScore(difficulty: Difficulty, timeSpent: number, timeLimit: number) {
        const points = calculateScore(difficulty, timeSpent, timeLimit);
        setScore((prev) => prev + points);
        return points;
    }

    const resetScore = () => setScore(0);

    return { score, addScore, resetScore, setScore };
}