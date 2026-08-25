// src/lib/rankings.ts

export type Rank = {
    minLevel: number;
    title: string;
    emoji: string;
    /** one-line career perk, shown on the CAREER TRACK card (design 3a) */
    perk: string;
    /**
     * Last monthly payroll of the position in € - decorative satire for the
     * landing statement ("Salary · Unemployed +0.00 €"), NOT BroDollars.
     */
    salary: number;
    /**
     * Flat BroDollar bonus added to every correctly settled posting at this
     * rank. Small and static on purpose - seniority pays a little better,
     * it does not multiply.
     */
    bonus: number;
};

// Level → rank. The ladder (titles + emoji) is original finance-bro canon -
// do not rename or reorder it. The perk lines are 3a microcopy.
export const ranks: Rank[] = [
    { minLevel: 1, title: "Unemployed", emoji: "🛋️", perk: "Overdraft approved. Nothing else is.", salary: 0, bonus: 0 },
    { minLevel: 2, title: "Low Earner", emoji: "🥲", perk: "Paid monthly, spent weekly.", salary: 1204, bonus: 5 },
    { minLevel: 3, title: "Minimum Wage Grunt", emoji: "🛠️", perk: "Every hour documented, none of them yours.", salary: 1872, bonus: 10 },
    { minLevel: 4, title: "Working Student", emoji: "📚", perk: "12 €/h, printer access.", salary: 1038, bonus: 15 },
    { minLevel: 5, title: "Junior Consultant", emoji: "🧑‍💼", perk: "Slide decks at 02:00.", salary: 3741, bonus: 25 },
    { minLevel: 6, title: "Consultant", emoji: "💼", perk: "Same decks, higher day rate.", salary: 5983, bonus: 35 },
    { minLevel: 7, title: "Investmentbanker", emoji: "🏦", perk: "The desk has a cot now.", salary: 11250, bonus: 50 },
    { minLevel: 8, title: "VC Guy", emoji: "🚀", perk: "Loses other people's money, confidently.", salary: 14801, bonus: 65 },
    { minLevel: 9, title: "Managing Director", emoji: "📈", perk: "Reads one number per meeting.", salary: 33333, bonus: 80 },
    { minLevel: 10, title: "Unicorn Founder", emoji: "🦄", perk: "Profitable at some point, allegedly.", salary: 1, bonus: 100 },
    { minLevel: 11, title: "Jeff Bezzo’s", emoji: "🚀🛸", perk: "Owns the warehouse. And the weekend.", salary: 12700416, bonus: 120 },
    { minLevel: 12, title: "FinanceBro", emoji: "💸💪", perk: "The market fears you. So does HR.", salary: 2147483647, bonus: 150 },
];

/**
 * BroDollars needed to get FROM level i+1 TO level i+2 (`LEVEL_COSTS[0]` is
 * the cost of level 1 → 2). Hand-tuned so the ladder is evenly spaced in
 * BroDollars: each step costs ~1.3-1.4× the previous one, ~12,300 total from
 * Unemployed to FinanceBro. Levels past the top of the ladder repeat the
 * final cost - the rank stays FinanceBro, the grind never ends.
 */
export const LEVEL_COSTS = [
    100, 175, 275, 400, 575, 800, 1100, 1450, 1900, 2450, 3100,
] as const;

const COST_PAST_LADDER = 3500;

export function levelCost(level: number): number {
    return LEVEL_COSTS[level - 1] ?? COST_PAST_LADDER;
}

/** Pure level math: cumulative score → level, progress to next, cost of next. */
export function levelFromScore(score: number): {
    level: number;
    progress: number;
    nextRequired: number;
} {
    let level = 1;
    let remaining = Math.max(0, score);
    let required = levelCost(level);

    while (remaining >= required) {
        remaining -= required;
        level++;
        required = levelCost(level);
    }

    return {
        level,
        progress: remaining / required, // 0..1, drives the progress bar
        nextRequired: required,
    };
}

// Helper: find the current rank for a level
export function getRank(level: number): Rank {
    let current = ranks[0];
    for (const r of ranks) {
        if (level >= r.minLevel) {
            current = r;
        } else {
            break;
        }
    }
    return current;
}

/** The rank after the current one, or null at the top of the ladder. */
export function getNextRank(level: number): Rank | null {
    const current = getRank(level);
    const i = ranks.indexOf(current);
    return i >= 0 && i + 1 < ranks.length ? ranks[i + 1] : null;
}

/** Flat completion bonus for the rank a given score has reached. */
export function bonusForScore(score: number): number {
    return getRank(levelFromScore(score).level).bonus;
}
