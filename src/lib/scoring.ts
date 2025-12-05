// src/lib/scoring.ts

// Zeitlimits pro Schwierigkeit in Sekunden
export const difficultyTimes = {
  very_easy: 60,     // 1 Min
  easy: 120,         // 2 Min
  medium: 210,       // 3.5 Min
  hard: 300,         // 5 Min
  very_hard: 420,    // 7 Min
} as const;

// Basis-Punkte pro Schwierigkeit
const basePoints = {
  very_easy: 50,
  easy: 100,
  medium: 200,
  hard: 400,
  very_hard: 600,
} as const;

export type Difficulty = keyof typeof difficultyTimes;

/**
 * Berechnet Punkte abhängig von Schwierigkeit und benötigter Zeit.
 *
 * @param difficulty Schwierigkeit der Aufgabe
 * @param timeSpent benötigte Zeit in Sekunden
 * @param timeLimit maximal erlaubte Zeit in Sekunden
 * @returns Punkte für diese Aufgabe
 */
export function calculateScore(
    difficulty: Difficulty,
    timeSpent: number,
    timeLimit: number
): number {
  const maxPoints = basePoints[difficulty] ?? 100;

  // falls mehr Zeit als timeLimit gebraucht → minimale Punkte (10% der Basis)
  if (timeSpent >= timeLimit) {
    return Math.floor(maxPoints * 0.1);
  }

  // Linearer Abzug: je schneller, desto mehr Punkte
  const ratio = 1 - timeSpent / timeLimit; // 1 = perfekt, 0 = knapp geschafft
  const score = maxPoints * (0.3 + 0.7 * ratio); // mind. 30% der Punkte

  return Math.round(score);
}