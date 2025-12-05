// src/lib/rankings.ts

export type Rank = {
    minLevel: number;
    title: string;
    emoji: string;
};

// Einfaches Mapping von Level → Rang
export const ranks: Rank[] = [
    { minLevel: 1, title: "Arbeitslos", emoji: "🛋️" },
    { minLevel: 2, title: "Geringverdiener", emoji: "🥲" },
    { minLevel: 3, title: "Mindestlohnknecht", emoji: "🛠️" },
    { minLevel: 4, title: "Werkstudent", emoji: "📚" },
    { minLevel: 5, title: "Junior Consultant", emoji: "🧑‍💼" },
    { minLevel: 6, title: "Consultant", emoji: "💼" },
    { minLevel: 7, title: "Investmentbanker", emoji: "🏦" },
    { minLevel: 8, title: "VC Guy", emoji: "🚀" },
    { minLevel: 9, title: "Managing Director", emoji: "📈" },
    { minLevel: 10, title: "Unicorn Founder", emoji: "🦄" },
    { minLevel: 11, title: "Jeff Bezzo’s", emoji: "🚀🛸" },
    { minLevel: 12, title: "FinanceBro", emoji: "💸💪" },
];

// Helper: finde den aktuellen Rang für ein Level
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