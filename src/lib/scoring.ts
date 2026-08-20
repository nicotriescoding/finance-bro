// src/lib/scoring.ts

// Time limit per difficulty, in seconds
export const difficultyTimes = {
  very_easy: 60,     // 1 min
  easy: 120,         // 2 min
  medium: 210,       // 3.5 min
  hard: 300,         // 5 min
  very_hard: 420,    // 7 min
} as const;

// Base points per difficulty
const basePoints = {
  very_easy: 50,
  easy: 100,
  medium: 200,
  hard: 400,
  very_hard: 600,
} as const;

export type Difficulty = keyof typeof difficultyTimes;

/**
 * Points for one question, scaled by difficulty and how long it took.
 *
 * @param difficulty difficulty of the question
 * @param timeSpent seconds actually spent
 * @param timeLimit seconds allowed
 * @returns points awarded for this question
 */
export function calculateScore(
    difficulty: Difficulty,
    timeSpent: number,
    timeLimit: number
): number {
  const maxPoints = basePoints[difficulty] ?? 100;

  // over the limit -> floor at 10% of base
  if (timeSpent >= timeLimit) {
    return Math.floor(maxPoints * 0.1);
  }

  // Linear decay: the faster, the more points
  const ratio = 1 - timeSpent / timeLimit; // 1 = instant, 0 = just made it
  const score = maxPoints * (0.3 + 0.7 * ratio); // never below 30% of base

  return Math.round(score);
}