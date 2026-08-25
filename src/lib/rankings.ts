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
};

// Level → rank. The ladder (titles + emoji) is original finance-bro canon -
// do not rename or reorder it. The perk lines are 3a microcopy.
export const ranks: Rank[] = [
    { minLevel: 1, title: "Unemployed", emoji: "🛋️", perk: "Overdraft approved. Nothing else is.", salary: 0 },
    { minLevel: 2, title: "Low Earner", emoji: "🥲", perk: "Paid monthly, spent weekly.", salary: 1204 },
    { minLevel: 3, title: "Minimum Wage Grunt", emoji: "🛠️", perk: "Every hour documented, none of them yours.", salary: 1872 },
    { minLevel: 4, title: "Working Student", emoji: "📚", perk: "12 €/h, printer access.", salary: 1038 },
    { minLevel: 5, title: "Junior Consultant", emoji: "🧑‍💼", perk: "Slide decks at 02:00.", salary: 3741 },
    { minLevel: 6, title: "Consultant", emoji: "💼", perk: "Same decks, higher day rate.", salary: 5983 },
    { minLevel: 7, title: "Investmentbanker", emoji: "🏦", perk: "The desk has a cot now.", salary: 11250 },
    { minLevel: 8, title: "VC Guy", emoji: "🚀", perk: "Loses other people's money, confidently.", salary: 14801 },
    { minLevel: 9, title: "Managing Director", emoji: "📈", perk: "Reads one number per meeting.", salary: 33333 },
    { minLevel: 10, title: "Unicorn Founder", emoji: "🦄", perk: "Profitable at some point, allegedly.", salary: 1 },
    { minLevel: 11, title: "Jeff Bezzo’s", emoji: "🚀🛸", perk: "Owns the warehouse. And the weekend.", salary: 12700416 },
    { minLevel: 12, title: "FinanceBro", emoji: "💸💪", perk: "The market fears you. So does HR.", salary: 2147483647 },
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

/** The rank after the current one, or null at the top of the ladder. */
export function getNextRank(level: number): Rank | null {
    const current = getRank(level);
    const i = ranks.indexOf(current);
    return i >= 0 && i + 1 < ranks.length ? ranks[i + 1] : null;
}
