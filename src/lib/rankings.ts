// src/lib/rankings.ts

export type Rank = {
    minLevel: number;
    title: string;
    emoji: string;
};

// Level → rank
export const ranks: Rank[] = [
    { minLevel: 1, title: "Unemployed", emoji: "🛋️" },
    { minLevel: 2, title: "Low Earner", emoji: "🥲" },
    { minLevel: 3, title: "Minimum Wage Grunt", emoji: "🛠️" },
    { minLevel: 4, title: "Working Student", emoji: "📚" },
    { minLevel: 5, title: "Junior Consultant", emoji: "🧑‍💼" },
    { minLevel: 6, title: "Consultant", emoji: "💼" },
    { minLevel: 7, title: "Investmentbanker", emoji: "🏦" },
    { minLevel: 8, title: "VC Guy", emoji: "🚀" },
    { minLevel: 9, title: "Managing Director", emoji: "📈" },
    { minLevel: 10, title: "Unicorn Founder", emoji: "🦄" },
    { minLevel: 11, title: "Jeff Bezzo’s", emoji: "🚀🛸" },
    { minLevel: 12, title: "FinanceBro", emoji: "💸💪" },
];

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