export const difficultyTimeMap = {
    very_easy: { min: 30, max: 60 }, // Sekunden
    easy: { min: 60, max: 120 },
    medium: { min: 90, max: 210 },
    hard: { min: 120, max: 300 },
    very_hard: { min: 180, max: 420 },
} as const;

export type Difficulty = keyof typeof difficultyTimeMap;
