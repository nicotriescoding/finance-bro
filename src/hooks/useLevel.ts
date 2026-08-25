import { levelFromScore } from "@/lib/rankings";

/**
 * Level from cumulative score. The per-level costs are hand-tuned in
 * `src/lib/rankings.ts` (LEVEL_COSTS) so ranks are evenly spaced in
 * BroDollars - this hook is just the React-friendly wrapper.
 */
export function useLevel(score: number) {
    return levelFromScore(score);
}
